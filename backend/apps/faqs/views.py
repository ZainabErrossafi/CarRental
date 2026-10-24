# ####oussama: Public published FAQs with admin-only editing and atomic reordering.
from django.db import transaction
from django.db.models import Max
from rest_framework import serializers, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from apps.users.permissions import IsAdmin
from .models import FAQ
from .serializers import FAQSerializer


class SwapSerializer(serializers.Serializer):
    id_a = serializers.IntegerField(min_value=1)
    id_b = serializers.IntegerField(min_value=1)


class FAQViewSet(viewsets.ModelViewSet):
    queryset = FAQ.objects.all()
    serializer_class = FAQSerializer

    def get_permissions(self):
        return [AllowAny()] if self.action in ['list', 'retrieve'] else [IsAdmin()]

    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user
        if not (user.is_authenticated and user.is_admin()):
            queryset = queryset.filter(active=True)
        return queryset

    def perform_create(self, serializer):
        with transaction.atomic():
            # Serialize ordering changes using the admin account as a shared lock.
            from apps.users.models import User
            list(User.objects.select_for_update().filter(role='admin').order_by('pk'))
            last_order = FAQ.objects.aggregate(value=Max('order'))['value']
            serializer.save(order=(last_order or 0) + 1)

    @action(detail=False, methods=['post'])
    def swap(self, request):
        payload = SwapSerializer(data=request.data)
        payload.is_valid(raise_exception=True)
        first_id, second_id = payload.validated_data['id_a'], payload.validated_data['id_b']
        if first_id == second_id:
            raise serializers.ValidationError({'detail': 'Choose two different FAQs.'})
        with transaction.atomic():
            items = list(FAQ.objects.select_for_update().order_by('pk'))
            by_id = {item.pk: item for item in items}
            if first_id not in by_id or second_id not in by_id:
                raise serializers.ValidationError({'detail': 'One of these FAQs no longer exists.'})
            first, second = by_id[first_id], by_id[second_id]
            first.order, second.order = second.order, first.order
            FAQ.objects.bulk_update([first, second], ['order'])
            return Response(self.get_serializer(FAQ.objects.all(), many=True).data)
