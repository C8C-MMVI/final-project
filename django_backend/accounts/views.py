from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

@api_view(['POST'])
@permission_classes([AllowAny])
def get_or_create_token(request):
    username = request.data.get('username')
    role = request.data.get('role', 'customer')
    secret = request.data.get('secret')

    if secret != 'technologs-internal-secret':
        return Response({'error': 'Forbidden'}, status=403)

    if not username:
        return Response({'error': 'Username required'}, status=400)

    user, _ = User.objects.get_or_create(username=username)
    user.is_staff = role in ['admin']
    user.save()

    token, _ = Token.objects.get_or_create(user=user)
    return Response({'token': token.key})