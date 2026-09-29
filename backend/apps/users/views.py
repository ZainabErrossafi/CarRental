from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from .permissions import IsAdmin, IsAdminOrOwner
from .models import User
from .serializers import UserSerializer


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    def get_permissions(self):
        if self.action in ['retrieve', 'update', 'partial_update']:
            return [IsAdminOrOwner()]
        elif self.action == 'me':
            return [IsAuthenticated()]
        else:
            return [IsAdmin()]

    @action(detail=False, methods=['get'])
    def me(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)