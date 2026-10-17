from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from .models import Brand
from .serializers import BrandSerializer


class BrandViewSet(viewsets.ModelViewSet):
    queryset = Brand.objects.order_by("id")
    serializer_class = BrandSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
