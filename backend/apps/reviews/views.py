from rest_framework import viewsets
from apps.users.permissions import IsAdmin, IsAdminOrOwner
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Review
from .serializers import ReviewSerializer


class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer

    filterset_fields = ['vehicle', 'user', 'rating']
    search_fields = ['title', 'comment']
    ordering_fields = ['rating', 'created_at']
    ordering = ['-created_at']

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        elif self.action == 'create':
            return [IsAuthenticated()]
        else:
            return [IsAdminOrOwner()]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)