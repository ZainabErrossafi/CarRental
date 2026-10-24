from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
# ####oussama: Convert sign-up password validation errors into API responses.
from django.core.exceptions import ValidationError as DjangoValidationError
from django.contrib.auth.password_validation import validate_password as django_validate_password
from rest_framework import serializers
from .models import User


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'phone', 'role', 'is_active', 'password']

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

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        if not password:
            raise serializers.ValidationError({'password': 'This field is required.'})
        return User.objects.create_user(**validated_data, password=password)

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        if password:
            instance.set_password(password)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance


# ####oussama: Merge username login and user response with email login and mandatory 2FA.
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
        # ####oussama: Preserve main's user payload only after authentication and 2FA checks.
        return {
            **session_tokens(self.user),
            'user': {
                'id': self.user.id, 'username': self.user.username,
                'email': self.user.email, 'role': self.user.role,
            },
        }


# Preserve the existing import used by the token endpoint.
AdminTokenObtainPairSerializer = EmailTokenObtainPairSerializer


from dj_rest_auth.serializers import LoginSerializer


class TwoFactorAwareLoginSerializer(LoginSerializer):
    def validate(self, attrs):
        from rest_framework.exceptions import AuthenticationFailed
        data = super().validate(attrs)
        if data['user'].two_factor_enabled:
            raise AuthenticationFailed('Use /api/token/ and complete email verification.')
        return data


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
