from rest_framework import viewsets
from .permissions import IsAdminOrReadOnly
from .models import Feature
from .serializers import FeatureSerializer


class FeatureViewSet(viewsets.ModelViewSet):
    queryset = Feature.objects.all()
    serializer_class = FeatureSerializer
    permission_classes = [IsAdminOrReadOnly]
