from datetime import timedelta
from django.db import transaction
from django.utils import timezone
from django.utils.crypto import constant_time_compare
from rest_framework import serializers
from rest_framework.exceptions import AuthenticationFailed, Throttled
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle, UserRateThrottle
from rest_framework.views import APIView
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import User, PendingSignup  # ####oussama: Temporary requests are separate from users.
from .two_factor import EmailPendingToken, credential_version, session_tokens


class TwoFactorThrottle(AnonRateThrottle):
    rate = '10/min'


class ToggleThrottle(UserRateThrottle):
    rate = '10/min'


class EmailLoginView(TokenObtainPairView):
    throttle_classes = [TwoFactorThrottle]


class PendingSerializer(serializers.Serializer):
    ephemeral_token = serializers.CharField(max_length=4096)


class VerifySerializer(PendingSerializer):
    code = serializers.RegexField(r'^[0-9]{6}$', min_length=6, max_length=6)


class ToggleSerializer(serializers.Serializer):
    enabled = serializers.BooleanField()
    password = serializers.CharField(write_only=True, trim_whitespace=False)


def pending_user(encoded):
    # Called inside a transaction; custom token type cannot authenticate API calls
    # or be exchanged at SimpleJWT's refresh endpoint.
    try:
        token = EmailPendingToken(encoded)
        if token.get('is_2fa_pending') is not True:
            raise ValueError
        # ####oussama: Registration tokens address temporary requests, never a real user.
        registration = token.get('purpose') == 'registration'
        model = PendingSignup if registration else User
        user = model.objects.select_for_update().get(pk=token['user_id'])
        # ####oussama: Inactive accounts may only complete their sign-up challenge.
        signup = token.get('purpose') == 'signup'
        if registration:
            eligible = user.expires_at > timezone.now()
        else:
            eligible = (not user.email_verified and not user.is_active) if signup else (user.is_active and user.email_verified)
        if (not eligible or (signup and not user.two_factor_enabled) or
                not user.two_factor_challenge or
                not constant_time_compare(user.two_factor_challenge, token['jti']) or
                not constant_time_compare(credential_version(user), token.get('credential_version', '')) or
                user.two_factor_attempts >= 5):
            raise ValueError
        return user
    except (TokenError, User.DoesNotExist, PendingSignup.DoesNotExist, KeyError, ValueError, TypeError):
        raise AuthenticationFailed('Invalid or expired verification session.')


class PendingView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]
    throttle_classes = [TwoFactorThrottle]

    def get_authenticate_header(self, request):
        return 'EmailOTP'


class TwoFactorVerifyView(PendingView):
    def post(self, request):
        serializer = VerifySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        with transaction.atomic():
            user = pending_user(serializer.validated_data['ephemeral_token'])
            valid = user.verify_email_code(serializer.validated_data['code'])
            if valid:
                # ####oussama: Only a valid email code may turn a temporary registration into a user.
                if isinstance(user, PendingSignup):
                    from .registration import complete_registration
                    user = complete_registration(user)
                # ####oussama: Preserve verification links for pending accounts from the previous flow.
                if not user.email_verified:
                    user.email_verified = True
                    user.is_active = True
                    user.save(update_fields=['email_verified', 'is_active'])
                result = session_tokens(user)
            else:
                user.two_factor_attempts += 1
                user.save(update_fields=['two_factor_attempts'])
        # Raise outside the transaction so failed attempts are committed.
        if not valid:
            raise AuthenticationFailed('Invalid or expired verification code.')
        return Response(result)


class TwoFactorResendView(PendingView):
    def post(self, request):
        serializer = PendingSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        with transaction.atomic():
            user = pending_user(serializer.validated_data['ephemeral_token'])
            if (user.two_factor_code_created_at and
                    timezone.now() - user.two_factor_code_created_at < timedelta(seconds=60)):
                raise Throttled(wait=60, detail='Wait before requesting another email.')
            user.generate_and_send_2fa_code()
        return Response({'message': 'Verification code sent to email'})


class TwoFactorToggleView(APIView):
    permission_classes = [IsAuthenticated]
    throttle_classes = [ToggleThrottle]

    def post(self, request):
        serializer = ToggleSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        with transaction.atomic():
            user = User.objects.select_for_update().get(pk=request.user.pk)
            if not user.check_password(serializer.validated_data['password']):
                raise AuthenticationFailed('Invalid password.')
            if not user.email:
                raise serializers.ValidationError({'email': 'An email address is required.'})
            user.two_factor_enabled = serializer.validated_data['enabled']
            user.two_factor_code = None
            user.two_factor_code_created_at = None
            user.two_factor_challenge = ''
            user.two_factor_attempts = 0
            user.save(update_fields=['two_factor_enabled', 'two_factor_code',
                                     'two_factor_code_created_at', 'two_factor_challenge',
                                     'two_factor_attempts'])
        return Response({'two_factor_enabled': user.two_factor_enabled})
