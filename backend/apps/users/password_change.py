import secrets
from datetime import timedelta
from smtplib import SMTPException

from django.conf import settings
from django.contrib.auth.hashers import check_password, make_password
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.core.mail import send_mail
from django.db import transaction
from django.utils import timezone
from rest_framework import serializers
from rest_framework.exceptions import Throttled
from rest_framework.response import Response

from .models import PasswordChange, User, VerificationEmailUnavailable


class ChangeSerializer(serializers.Serializer):
    old_password = serializers.CharField(trim_whitespace=False)
    new_password = serializers.CharField(trim_whitespace=False)


class CodeSerializer(serializers.Serializer):
    code = serializers.RegexField(r'^[0-9]{6}$')


def request_change(request):
    serializer = ChangeSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    old = serializer.validated_data['old_password']
    new = serializer.validated_data['new_password']
    with transaction.atomic():
        user = User.objects.select_for_update().get(pk=request.user.pk)
        if not user.check_password(old):
            return Response({'detail': 'Old password is incorrect.'}, status=400)
        if old == new:
            return Response({'detail': 'Choose a different password.'}, status=400)
        try:
            validate_password(new, user=user)
        except ValidationError as error:
            return Response({'new_password': error.messages}, status=400)
        if not user.email:
            return Response({'detail': 'An email address is required.'}, status=400)
        pending = PasswordChange.objects.filter(user=user).first()
        if pending and timezone.now() - pending.created_at < timedelta(seconds=60):
            raise Throttled(wait=60, detail='Wait before requesting another code.')
        code = f'{secrets.randbelow(1000000):06d}'
        PasswordChange.objects.update_or_create(user=user, defaults={
            'code_hash': make_password(code), 'password_hash': make_password(new),
            'original_password': user.password, 'created_at': timezone.now(), 'attempts': 0,
        })
        try:
            delivered = send_mail(
                'Confirm your Rently password change',
                f'Your password change verification code is {code}. It expires in 10 minutes. '
                'Your password will change only after you enter this code.',
                settings.DEFAULT_FROM_EMAIL, [user.email], fail_silently=False,
            )
            if delivered != 1:
                raise VerificationEmailUnavailable()
        except (SMTPException, OSError) as error:
            raise VerificationEmailUnavailable() from error
    return Response({'detail': 'Verification code sent to your email.', 'verification_required': True})


def confirm_change(request):
    serializer = CodeSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    with transaction.atomic():
        user = User.objects.select_for_update().get(pk=request.user.pk)
        pending = PasswordChange.objects.filter(user=user).first()
        if (not pending or pending.attempts >= 5 or pending.original_password != user.password
                or not timedelta(0) <= timezone.now() - pending.created_at < timedelta(minutes=10)):
            return Response({'detail': 'Verification expired. Request a new code.'}, status=400)
        if not check_password(serializer.validated_data['code'], pending.code_hash):
            pending.attempts += 1
            pending.save(update_fields=['attempts'])
            return Response({'detail': 'Invalid verification code.'}, status=400)
        user.password = pending.password_hash
        user.save(update_fields=['password'])
        pending.delete()
    return Response({'detail': 'Password updated.'})
