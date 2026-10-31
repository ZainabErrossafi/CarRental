from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
import logging
from smtplib import SMTPException

from django.conf import settings
from django.core.mail import send_mail
from django.db import transaction
from django.template.loader import render_to_string
# ####oussama: Convert sign-up password validation errors into API responses.
from django.core.exceptions import ValidationError as DjangoValidationError
from django.contrib.auth.password_validation import validate_password as django_validate_password
from rest_framework import serializers
from .models import Role, User


logger = logging.getLogger(__name__)


def send_account_created_email(details):
    try:
        delivered = send_mail(
            'Welcome to Rently — your account details',
            render_to_string('users/account_created_email.txt', details),
            settings.DEFAULT_FROM_EMAIL,
            [details['email']],
            fail_silently=False,
            html_message=render_to_string('users/account_created_email.html', details),
        )
        if delivered != 1:
            logger.error('Account creation email backend reported no delivery.')
    except (SMTPException, OSError):
        logger.exception('Account creation email could not be sent.')


def send_admin_promotion_email(email, username):
    try:
        delivered = send_mail(
            'Your Rently account is now an admin',
            f'Hello {username},\n\nYour Rently account has been changed to admin. '
            'You can now sign in with your existing credentials to access the admin dashboard.',
            settings.DEFAULT_FROM_EMAIL,
            [email],
            fail_silently=False,
            html_message=render_to_string('users/admin_promotion_email.html', {
                'username': username,
            }),
        )
        if delivered != 1:
            logger.error('Admin promotion email backend reported no delivery.')
    except (SMTPException, OSError):
        logger.exception('Admin promotion email could not be sent.')


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False, trim_whitespace=False)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'phone', 'role', 'is_active', 'password', 'two_factor_enabled']
        read_only_fields = ['two_factor_enabled']

    def validate_email(self, value):
        value = value.strip().lower()
        users = User.objects.filter(email__iexact=value)
        if self.instance:
            users = users.exclude(pk=self.instance.pk)
        if users.exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def validate_password(self, value):
        django_validate_password(value)
        return value

    def validate(self, data):
        request = self.context.get('request')
        if request is None:
            return data
        actor = request.user
        is_admin = actor.is_authenticated and actor.is_admin()

        if not is_admin:
            data.pop('role', None)
            data.pop('is_active', None)
            if self.instance is not None:
                data.pop('password', None)
        elif self.instance and self.instance == actor:
            if 'role' in data and data['role'] != actor.role:
                raise serializers.ValidationError({'role': 'You cannot change your own role.'})
            if data.get('is_active') is False:
                raise serializers.ValidationError({'is_active': 'You cannot deactivate your own account.'})
        return data

    @transaction.atomic
    def create(self, validated_data):
        password = validated_data.pop('password', None)
        if not password:
            raise serializers.ValidationError({'password': 'This field is required.'})
        user = User.objects.create_user(**validated_data, password=password)
        details = {
            'name': user.get_full_name() or user.username,
            'username': user.username,
            'email': user.email,
            'password': password,
            'role': user.get_role_display(),
        }
        transaction.on_commit(lambda: send_account_created_email(details))
        return user

    @transaction.atomic
    def update(self, instance, validated_data):
        instance = User.objects.select_for_update().get(pk=instance.pk)
        previous_role = instance.role
        password = validated_data.pop('password', None)
        if password:
            instance.set_password(password)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if previous_role == Role.CLIENT and instance.role == Role.ADMIN:
            email, username = instance.email, instance.username
            transaction.on_commit(lambda: send_admin_promotion_email(email, username))
        return instance


# ####oussama: Merge username login and user response with email login and optional 2FA.
class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    email = serializers.EmailField(write_only=True, required=False)

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields[self.username_field].required = False

    def validate(self, attrs):
        from rest_framework.exceptions import AuthenticationFailed

        # ####oussama: Preserve main's username login while accepting email-based login.
        email = attrs.get('email')
        username = attrs.get(self.username_field)
        if email:
            lookup = {'email__iexact': email.strip()}
        elif username:
            lookup = {'username': username}
        else:
            raise serializers.ValidationError({'non_field_errors': ['An email or username is required.']})
        matches = User.objects.filter(**lookup)
        # ####oussama: Resume a temporary registration without creating an account on login.
        if not matches.exists():
            from .models import PendingSignup
            from .registration import start_registration
            from django.utils import timezone
            pending = PendingSignup.objects.filter(**lookup, expires_at__gt=timezone.now()).first()
            if pending and pending.check_password(attrs['password']):
                data, _ = start_registration({'username': pending.username, 'email': pending.email, 'password': attrs['password']})
                return data
        if matches.count() != 1:
            raise AuthenticationFailed('Invalid email or password.')
        user = matches.first()
        from django.contrib.auth import authenticate
        from .two_factor import session_tokens, start_email_challenge

        # ####oussama: Resume pending sign-up with the correct password, without issuing a session.
        if not user.email_verified and user.check_password(attrs['password']):
            return start_email_challenge(user, purpose='signup')

        self.user = authenticate(request=self.context.get('request'), username=user.username,
                                 password=attrs['password'])
        if self.user is None or not self.user.is_active:
            raise AuthenticationFailed('Invalid email or password.')
        if self.user.two_factor_enabled:
            return start_email_challenge(self.user)
        return {**session_tokens(self.user), 'user': UserSerializer(self.user).data}


# Preserve the existing import used by the token endpoint.
AdminTokenObtainPairSerializer = EmailTokenObtainPairSerializer


from dj_rest_auth.serializers import LoginSerializer


class TwoFactorAwareLoginSerializer(LoginSerializer):
    def validate(self, attrs):
        from rest_framework.exceptions import AuthenticationFailed
        data = super().validate(attrs)
        raise AuthenticationFailed('Use /api/token/ and complete email verification.')


# ####oussama: Public sign-up validation and customer account creation.
class SignupSerializer(UserSerializer):
    password = serializers.CharField(write_only=True, required=True, trim_whitespace=False)

    class Meta(UserSerializer.Meta):
        fields = ['id', 'username', 'email', 'password']
        extra_kwargs = {'email': {'required': True, 'allow_blank': False}}

    def validate_password(self, value):
        return value

    def validate(self, data):
        data = super().validate(data)
        try:
            django_validate_password(data['password'], user=User(
                username=data.get('username', ''), email=data.get('email', ''),
            ))
        except DjangoValidationError as error:
            raise serializers.ValidationError({'password': error.messages}) from error
        return data
