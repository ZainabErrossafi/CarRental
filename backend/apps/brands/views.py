from rest_framework import viewsets
from .models import Brand
from .serializers import BrandSerializer
from .permissions import IsAdminOrReadOnly


class BrandViewSet(viewsets.ModelViewSet):
    queryset = Brand.objects.order_by("id")
    serializer_class = BrandSerializer
    permission_classes = [IsAdminOrReadOnly]
