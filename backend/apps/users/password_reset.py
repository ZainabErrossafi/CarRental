import secrets
from datetime import timedelta
from smtplib import SMTPException

from django.conf import settings
from django.contrib.auth.hashers import check_password, make_password
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.db import transaction
from django.utils import timezone
from rest_framework import serializers
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle
from rest_framework.views import APIView

from .models import PasswordResetChallenge, User, VerificationEmailUnavailable


class PasswordResetThrottle(AnonRateThrottle):
    rate = '10/min'


class RequestPasswordResetSerializer(serializers.Serializer):
    email = serializers.EmailField()


class VerifyPasswordResetSerializer(serializers.Serializer):
    email = serializers.EmailField()
    code = serializers.RegexField(r'^[0-9]{6}$', min_length=6, max_length=6)


class ConfirmPasswordResetSerializer(VerifyPasswordResetSerializer):
    new_password = serializers.CharField(trim_whitespace=False, max_length=128)


class PublicPasswordResetView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]
    throttle_classes = [PasswordResetThrottle]

    def validate_code(self, email, code):
        # Both callers hold a transaction so checks and failed attempts are atomic.
        matches = list(User.objects.select_for_update().filter(
            email__iexact=email, is_active=True, email_verified=True,
        ).order_by('pk')[:2])
        if len(matches) != 1:
            return None
        user = matches[0]
        pending = PasswordResetChallenge.objects.select_for_update().filter(user=user).first()
        if (not pending or pending.attempts >= 5
                or pending.original_password != user.password
                or not timedelta(0) <= timezone.now() - pending.created_at < timedelta(minutes=10)):
            return None
        if not check_password(code, pending.code_hash):
            pending.attempts += 1
            pending.save(update_fields=['attempts'])
            return None
        return user, pending


class PasswordResetRequestView(PublicPasswordResetView):
    def post(self, request):
        serializer = RequestPasswordResetSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email'].strip()
        generic_response = {
            'detail': 'If an active account exists for that email, a verification code has been sent.'
        }

        with transaction.atomic():
            matches = list(User.objects.select_for_update().filter(
                email__iexact=email, is_active=True, email_verified=True,
            ).order_by('pk')[:2])
            if len(matches) != 1:
                return Response(generic_response)
            user = matches[0]
            pending = PasswordResetChallenge.objects.select_for_update().filter(user=user).first()
            if pending and timezone.now() - pending.created_at < timedelta(seconds=60):
                return Response(generic_response)

            code = f'{secrets.randbelow(1000000):06d}'
            PasswordResetChallenge.objects.update_or_create(user=user, defaults={
                'code_hash': make_password(code),
                'original_password': user.password,
                'created_at': timezone.now(),
                'attempts': 0,
            })
            try:
                delivered = send_mail(
                    'Your Rently password reset code',
                    f'Your password reset verification code is {code}. It expires in 10 minutes. '
                    'If you did not request this, you can ignore this email.',
                    settings.DEFAULT_FROM_EMAIL,
                    [user.email],
                    fail_silently=False,
                    html_message=render_to_string('users/password_reset_email.html', {
                        'code': code,
                        'username': user.get_username(),
                    }),
                )
                if delivered != 1:
                    raise VerificationEmailUnavailable()
            except (SMTPException, OSError) as error:
                raise VerificationEmailUnavailable() from error

        return Response(generic_response)


class PasswordResetVerifyView(PublicPasswordResetView):
    def post(self, request):
        serializer = VerifyPasswordResetSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        with transaction.atomic():
            challenge = self.validate_code(
                serializer.validated_data['email'].strip(),
                serializer.validated_data['code'],
            )
            if challenge is None:
                return Response({'detail': 'Invalid or expired verification code.'}, status=400)
        # Keep the challenge for confirmation, which checks the code again.
        return Response({'detail': 'Verification code verified.'})


class PasswordResetConfirmView(PublicPasswordResetView):
    def post(self, request):
        serializer = ConfirmPasswordResetSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email'].strip()
        code = serializer.validated_data['code']
        new_password = serializer.validated_data['new_password']
        invalid = Response({'detail': 'Invalid or expired verification code.'}, status=400)

        with transaction.atomic():
            challenge = self.validate_code(email, code)
            if challenge is None:
                return invalid
            user, pending = challenge

            if user.check_password(new_password):
                return Response({'new_password': ['Choose a different password.']}, status=400)
            try:
                validate_password(new_password, user=user)
            except ValidationError as error:
                return Response({'new_password': error.messages}, status=400)

            user.set_password(new_password)
            user.save(update_fields=['password'])
            pending.delete()

        return Response({'detail': 'Password updated.'})
