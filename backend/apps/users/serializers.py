from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
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


class AdminTokenObtainPairSerializer(TokenObtainPairSerializer):
    email = serializers.EmailField(write_only=True)

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields.pop(self.username_field, None)

    def validate(self, attrs):
        from rest_framework.exceptions import AuthenticationFailed

        matches = User.objects.filter(email__iexact=attrs['email'].strip())
        if matches.count() != 1:
            raise AuthenticationFailed('Invalid email or password.')
        user = matches.first()
        data = super().validate({self.username_field: user.username, 'password': attrs['password']})
        if user.role != 'admin':
            raise AuthenticationFailed('An administrator account is required.')
        return data
