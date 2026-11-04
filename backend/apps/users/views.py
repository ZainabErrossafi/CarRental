from rest_framework import viewsets
# ####oussama: Public sign-up endpoint imports.
from rest_framework.generics import CreateAPIView
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated  # ####oussama: Allow public sign-up.
from rest_framework.response import Response

from .models import User
from .permissions import IsAdmin, IsAdminOrOwner
from .serializers import SignupSerializer, UserSerializer  # ####oussama: Sign-up validation.
from .views_2fa import TwoFactorThrottle  # ####oussama: Public sign-up rate limit.
from rest_framework_simplejwt.tokens import RefreshToken
from django.shortcuts import redirect
from urllib.parse import urlencode

def google_callback_redirect(request):
    user = request.user
    if not user.is_authenticated:
        return redirect("/login?error=auth_failed")

    if not user.is_active:
        return redirect('/login?error=auth_failed')
    if user.two_factor_enabled:
        from .two_factor import start_email_challenge
        challenge = start_email_challenge(user)
        return redirect('/verify-email#' + urlencode({
            'google_2fa': challenge['ephemeral_token'],
            'email': challenge['email'],
        }))

    refresh = RefreshToken.for_user(user)
    refresh['role'] = user.role
    refresh['email'] = user.email

    access_token = str(refresh.access_token)
    refresh_token = str(refresh)

    # The frontend consumes the fragment before requesting the user profile.
    # Fragments are not sent to the web server in the subsequent request.
    return redirect('/#' + urlencode({'access': access_token, 'refresh': refresh_token}))


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    http_method_names = ['get', 'post', 'put', 'patch', 'delete', 'head', 'options']

    filterset_fields = ['role', 'is_active']
    search_fields = ['username', 'email', 'first_name', 'last_name']
    ordering_fields = ['username', 'date_joined']
    ordering = ['-date_joined']

    def get_permissions(self):
        if self.action in ['retrieve', 'update', 'partial_update']:
            return [IsAdminOrOwner()]
        elif self.action in ['me', 'change_password', 'confirm_password', 'api_key']:
            return [IsAuthenticated()]
        else:
            return [IsAdmin()]

    @action(detail=False, methods=['get'])
    def me(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

    @action(detail=False, methods=['get', 'post', 'delete'], url_path='api-key')
    def api_key(self, request):
        from apps.public_api.models import PublicAPIKey
        from django.utils import timezone

        headers = {'Cache-Control': 'no-store'}
        if request.method == 'DELETE':
            PublicAPIKey.objects.filter(user=request.user).update(is_active=False)
            return Response(status=204, headers=headers)
        if request.method == 'POST':
            key, raw_key = PublicAPIKey.issue(request.user)
        else:
            key = PublicAPIKey.objects.filter(user=request.user).first()
            raw_key = None
        if key is None:
            return Response({'detail': 'No API key. Use POST to generate one.'}, status=404, headers=headers)
        data = {
            'prefix': key.prefix, 'is_active': key.is_active,
            'created_at': key.created_at, 'expires_at': key.expires_at,
            'is_expired': key.expires_at <= timezone.now(),
        }
        if raw_key is not None:
            data['key'] = raw_key
        return Response(data, status=201 if raw_key else 200, headers=headers)

    @action(detail=False, methods=['post'], url_path='change-password')
    def change_password(self, request):
        from .password_change import request_change
        return request_change(request)

    @action(detail=False, methods=['post'], url_path='confirm-password')
    def confirm_password(self, request):
        from .password_change import confirm_change
        return confirm_change(request)

    @action(detail=True, methods=['post'])
    def deactivate(self, request, pk=None):
        user = self.get_object()
        if user == request.user:
            return Response({'detail': 'You cannot deactivate your own account.'}, status=400)
        user.is_active = False
        user.save()
        serializer = self.get_serializer(user)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        user = self.get_object()
        user.is_active = True
        user.save()
        serializer = self.get_serializer(user)
        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        user = self.get_object()
        if user == request.user:
            return Response({'detail': 'You cannot delete your own account.'}, status=400)
        if user.reservations.exists():
            return Response(
                {'detail': 'This user has reservations. Deactivate the account instead.'},
                status=409,
            )
        return super().destroy(request, *args, **kwargs)


# ####oussama: Create a pending account and send its email verification challenge.
class SignupView(CreateAPIView):
    serializer_class = SignupSerializer
    permission_classes = [AllowAny]
    authentication_classes = []
    # ####oussama: Rate-limit public sign-up requests.
    throttle_classes = [TwoFactorThrottle]

    def create(self, request, *args, **kwargs):
        from .two_factor import start_email_challenge  # ####oussama: No session before verification.

        # ####oussama: Resume an unfinished sign-up only when all original credentials match.
        username = request.data.get('username')
        email = request.data.get('email')
        password = request.data.get('password')
        if all(isinstance(value, str) for value in (username, email, password)):
            pending = User.objects.filter(
                username=username.strip(), email__iexact=email.strip(),
                is_active=False, email_verified=False, two_factor_enabled=True,
            ).first()
            if pending is not None and pending.check_password(password):
                return Response(start_email_challenge(pending, purpose='signup'), status=200)

        # ####oussama: Validate against real accounts, then store only a temporary request.
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        from .registration import start_registration
        data, created = start_registration(serializer.validated_data)
        return Response(data, status=201 if created else 200)
