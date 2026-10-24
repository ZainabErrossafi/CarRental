from datetime import timedelta
from django.db import transaction
from django.utils import timezone
from django.utils.crypto import salted_hmac
from rest_framework.exceptions import Throttled
from rest_framework_simplejwt.tokens import Token, RefreshToken

from .models import User


class EmailPendingToken(Token):
    token_type = 'email_2fa'
    lifetime = timedelta(minutes=10)


def credential_version(user):
    return salted_hmac('email-2fa-credentials', user.password + user.email).hexdigest()


def session_tokens(user):
    refresh = RefreshToken.for_user(user)
    refresh['role'] = user.role
    return {'access': str(refresh.access_token), 'refresh': str(refresh), 'role': user.role}


# ####oussama: Purpose-bound challenges also protect inactive sign-up accounts.
def start_email_challenge(user, purpose='login'):
    with transaction.atomic():
        user = User.objects.select_for_update().get(pk=user.pk)
        # ####oussama: Recheck pending status under the lock before resuming sign-up.
        if purpose == 'signup' and (user.email_verified or user.is_active or not user.two_factor_enabled):
            from rest_framework.exceptions import AuthenticationFailed
            raise AuthenticationFailed('This account is no longer awaiting email verification.')
        if (user.two_factor_code_created_at and
                timezone.now() - user.two_factor_code_created_at < timedelta(seconds=60)):
            raise Throttled(wait=60, detail='Wait before requesting another email.')
        token = EmailPendingToken()
        token['purpose'] = purpose
        token['user_id'] = str(user.pk)
        token['is_2fa_pending'] = True
        token['credential_version'] = credential_version(user)
        user.two_factor_challenge = token['jti']
        user.two_factor_attempts = 0
        user.save(update_fields=['two_factor_challenge', 'two_factor_attempts'])
        user.generate_and_send_2fa_code()
    return {
        'two_factor_required': True,
        'email_verification_required': purpose == 'signup',
        'email': user.email,
        'ephemeral_token': str(token),
        'message': 'Verification code sent to email',
    }
