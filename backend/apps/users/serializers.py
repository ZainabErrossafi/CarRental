from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import User


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'phone', 'role', 'is_active', 'password']

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User.objects.create_user(**validated_data, password=password)
        return user

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
