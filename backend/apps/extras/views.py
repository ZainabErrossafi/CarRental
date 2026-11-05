from rest_framework import viewsets
from .permissions import IsAdminOrReadOnly
from .models import Extra
from .serializers import ExtraSerializer


class ExtraViewSet(viewsets.ModelViewSet):
    queryset = Extra.objects.order_by("id")
    serializer_class = ExtraSerializer
    permission_classes = [IsAdminOrReadOnly]
