import random
import re
from allauth.socialaccount.adapter import DefaultSocialAccountAdapter
from allauth.account.adapter import DefaultAccountAdapter
from django.http import JsonResponse
from apps.users.models import User


def account_inactive_response(request):
    return JsonResponse({'detail': 'This account is inactive.'}, status=403)


class CustomAccountAdapter(DefaultAccountAdapter):
    def respond_user_inactive(self, request, user):
        return account_inactive_response(request)


class CustomSocialAccountAdapter(DefaultSocialAccountAdapter):
    def populate_user(self, request, sociallogin, data):
        user = super().populate_user(request, sociallogin, data)

        # 1. Recuperer first_name w last_name
        first_name = (data.get('first_name') or user.first_name or '').strip()
        last_name = (data.get('last_name') or user.last_name or '').strip()

        # 2. Construire l-base username
        if first_name and last_name:
            base_username = f"{first_name}_{last_name}"
        elif first_name:
            base_username = first_name
        else:
            email = data.get('email') or user.email or ''
            base_username = email.split('@')[0] if email else 'user'

        # 3. Nettoyer l-username (lowercase w rdd ghir letters/numbers/underscores)
        base_username = re.sub(r'[^a-zA-Z0-9_]', '', base_username).lower()

        # 4. Check uniqueness wla zid random 4 digits
        candidate_username = base_username
        while User.objects.filter(username=candidate_username).exists():
            random_suffix = random.randint(1000, 9999)
            candidate_username = f"{base_username}_{random_suffix}"

        user.username = candidate_username
        return user
