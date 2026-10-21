from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from .models import Extra
from .serializers import ExtraSerializer


class ExtraViewSet(viewsets.ModelViewSet):
    queryset = Extra.objects.order_by("id")
    serializer_class = ExtraSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
