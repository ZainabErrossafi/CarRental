from django.contrib.auth.models import AbstractUser, UserManager
from django.db import models
from django.conf import settings
from django.core.mail import send_mail
from django.template.loader import render_to_string  # ####oussama: Render the branded HTML email.
from django.utils import timezone
from django.utils.crypto import constant_time_compare
from datetime import timedelta
from smtplib import SMTPException
import secrets
import logging
from rest_framework.exceptions import APIException


logger = logging.getLogger(__name__)


class VerificationEmailUnavailable(APIException):
    status_code = 503
    default_detail = 'Verification email could not be sent. Please try again later.'


class Role(models.TextChoices):
    ADMIN = 'admin', 'Admin'
    CLIENT = 'client', 'Client'


class CustomUserManager(UserManager):
    def create_superuser(self, username, email=None, password=None, **extra_fields):
        extra_fields.setdefault('role', Role.ADMIN)
        return super().create_superuser(username, email, password, **extra_fields)


# ####oussama: Share email code delivery and one-time verification with temporary registrations.
class EmailCodeMixin:
    def generate_and_send_2fa_code(self):
        self.two_factor_code = f'{secrets.randbelow(1000000):06d}'
        self.two_factor_code_created_at = timezone.now()
        self.save(update_fields=['two_factor_code', 'two_factor_code_created_at'])
        # ####oussama: Send a branded HTML email with a plain-text fallback for all email clients.
        html_message = render_to_string('users/verification_email.html', {
            'username': self.username,
            'code': self.two_factor_code,
        })
        try:
            delivered = send_mail(
                'Your Rently email verification code',  # ####oussama: Shared sign-up and sign-in email.
                f'Your verification code is {self.two_factor_code}. It expires in 10 minutes.',
                settings.DEFAULT_FROM_EMAIL, [self.email], fail_silently=False,
                html_message=html_message,
            )
            if delivered != 1:
                logger.error("Verification email backend reported no delivery (backend=%s).",
                             settings.EMAIL_BACKEND)
                raise VerificationEmailUnavailable()
        except (SMTPException, OSError) as error:
            logger.exception(
                "Verification email delivery failed (host=%s, port=%s, TLS=%s, SSL=%s).",
                settings.EMAIL_HOST, settings.EMAIL_PORT,
                settings.EMAIL_USE_TLS, settings.EMAIL_USE_SSL,
            )
            raise VerificationEmailUnavailable() from error

    def verify_email_code(self, code):
        # Callers must hold a row lock when verifying to prevent concurrent reuse.
        if not self.two_factor_code or not self.two_factor_code_created_at:
            return False
        age = timezone.now() - self.two_factor_code_created_at
        if not timedelta(0) <= age < timedelta(minutes=10):
            return False
        if not isinstance(code, str) or not constant_time_compare(self.two_factor_code, code):
            return False
        self.two_factor_code = None
        self.two_factor_code_created_at = None
        self.two_factor_challenge = ''
        self.two_factor_attempts = 0
        self.save(update_fields=['two_factor_code', 'two_factor_code_created_at',
                                 'two_factor_challenge', 'two_factor_attempts'])
        return True



class User(EmailCodeMixin, AbstractUser):
    email = models.EmailField('email address', unique=True)
    phone = models.CharField(max_length=20, blank=True)
    role = models.CharField(max_length=10, choices=Role.choices, default=Role.CLIENT)
    # ####oussama: Existing accounts stay verified; new sign-ups explicitly start unverified.
    email_verified = models.BooleanField(default=True)
    two_factor_enabled = models.BooleanField(default=False)
    two_factor_code = models.CharField(max_length=6, blank=True, null=True)
    two_factor_code_created_at = models.DateTimeField(blank=True, null=True)
    two_factor_challenge = models.CharField(max_length=32, blank=True, default='')
    two_factor_attempts = models.PositiveSmallIntegerField(default=0)

    objects = CustomUserManager()

    def full_name(self):
        return f"{self.first_name} {self.last_name}"

    def is_admin(self):
        return self.role == Role.ADMIN

    def __str__(self):
        return self.email or self.username


# ####oussama: Temporary registration data; never exposed as a user or allowed to authenticate.
class PendingSignup(EmailCodeMixin, models.Model):
    username = models.CharField(max_length=150, unique=True)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=128)
    two_factor_code = models.CharField(max_length=6, blank=True, null=True)
    two_factor_code_created_at = models.DateTimeField(blank=True, null=True)
    two_factor_challenge = models.CharField(max_length=32, blank=True, default='')
    two_factor_attempts = models.PositiveSmallIntegerField(default=0)
    expires_at = models.DateTimeField()

    def check_password(self, password):
        from django.contrib.auth.hashers import check_password
        return check_password(password, self.password)


class PasswordChange(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    code_hash = models.CharField(max_length=128)
    password_hash = models.CharField(max_length=128)
    original_password = models.CharField(max_length=128)
    created_at = models.DateTimeField()
    attempts = models.PositiveSmallIntegerField(default=0)


class PasswordResetChallenge(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    code_hash = models.CharField(max_length=128)
    original_password = models.CharField(max_length=128)
    created_at = models.DateTimeField()
    attempts = models.PositiveSmallIntegerField(default=0)
