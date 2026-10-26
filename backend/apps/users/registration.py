# ####oussama: Store sign-up requests separately and create users only after email verification.
from datetime import timedelta
from django.contrib.auth.hashers import make_password
from django.db import IntegrityError, transaction
from django.db.models import Q
from django.utils import timezone
from rest_framework import serializers
from rest_framework.exceptions import Throttled
from .models import PendingSignup
from .two_factor import EmailPendingToken, credential_version


def start_registration(data):
    try:
        with transaction.atomic():
            PendingSignup.objects.filter(expires_at__lte=timezone.now()).delete()
            pending = PendingSignup.objects.select_for_update().filter(
                Q(email=data['email']) | Q(username=data['username'])
            ).first()
            if pending:
                if (pending.email != data['email'] or pending.username != data['username'] or
                        not pending.check_password(data['password'])):
                    raise serializers.ValidationError({'detail': 'Registration is already pending. Use the original details or wait 10 minutes.'})
                if (pending.two_factor_code_created_at and timezone.now() - pending.two_factor_code_created_at < timedelta(seconds=60)):
                    raise Throttled(wait=60, detail='Wait before requesting another email.')
                created = False
            else:
                pending = PendingSignup.objects.create(
                    username=data['username'], email=data['email'], password=make_password(data['password']),
                    expires_at=timezone.now() + timedelta(minutes=10),
                )
                created = True
            token = EmailPendingToken()
            token['purpose'] = 'registration'
            token['user_id'] = str(pending.pk)
            token['is_2fa_pending'] = True
            token['credential_version'] = credential_version(pending)
            pending.two_factor_challenge = token['jti']
            pending.two_factor_attempts = 0
            pending.expires_at = timezone.now() + timedelta(minutes=10)
            pending.save(update_fields=['two_factor_challenge', 'two_factor_attempts', 'expires_at'])
            pending.generate_and_send_2fa_code()
            return {
                'two_factor_required': True, 'email_verification_required': True,
                'email': pending.email, 'ephemeral_token': str(token),
                'message': 'Verification code sent to email',
            }, created
    except IntegrityError as error:
        raise serializers.ValidationError({'detail': 'Registration is already pending. Please try again.'}) from error


# ####oussama: Atomically create the verified user and consume the temporary request.
def complete_registration(pending):
    from .models import User
    try:
        with transaction.atomic():
            if User.objects.filter(email__iexact=pending.email).exists():
                raise serializers.ValidationError({'email': 'This email is already registered.'})
            user = User.objects.create(
                username=pending.username, email=pending.email, password=pending.password,
                is_active=True, email_verified=True, two_factor_enabled=False,
            )
            pending.delete()
            return user
    except IntegrityError as error:
        raise serializers.ValidationError({'detail': 'This username or email is already registered.'}) from error
