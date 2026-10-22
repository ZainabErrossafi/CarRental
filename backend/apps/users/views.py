from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from .permissions import IsAdmin, IsAdminOrOwner
from .models import User
from .serializers import UserSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from django.shortcuts import redirect

#//////////////////////////////oussama
from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from allauth.socialaccount.providers.oauth2.client import OAuth2Client
from dj_rest_auth.registration.views import SocialLoginView

def google_callback_redirect(request):
    user = request.user
    if not user.is_authenticated:
        return redirect("https://localhost:8443/login?error=auth_failed")

    refresh = RefreshToken.for_user(user)
    refresh['role'] = user.role
    refresh['email'] = user.email

    access_token = str(refresh.access_token)
    refresh_token = str(refresh)

    # Kat-sift kolchi f-l-URL l-Frontend (/)
    return redirect(f"https://localhost:8443/?access={access_token}&refresh={refresh_token}&role={user.role}")
#////////////////////////////////////////////


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
        elif self.action == 'me':
            return [IsAuthenticated()]
        else:
            return [IsAdmin()]

    @action(detail=False, methods=['get'])
    def me(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

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
