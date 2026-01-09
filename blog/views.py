from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import Post
from .serializers import PostSerializer

@api_view(['GET'])
def post_list(request):
    featured_post = Post.objects.filter(featured=True).order_by('-created_at').first()
    normal_posts = Post.objects.filter(featured=False).order_by('-created_at')

    data = {
        "featured": PostSerializer(
            featured_post, context={'request': request}
        ).data if featured_post else None,

        "posts": PostSerializer(
            normal_posts, many=True, context={'request': request}
        ).data
    }

    return Response(data, status=status.HTTP_200_OK)


@api_view(['GET'])
def post_detail(request, pk):
    try:
        post = Post.objects.get(pk=pk)
    except Post.DoesNotExist:
        return Response({"error": "Post not found"}, status=status.HTTP_404_NOT_FOUND)

    serializer = PostSerializer(post, context={'request': request})
    return Response(serializer.data)

@api_view(['GET'])
def post_detail_by_slug(request, slug):
    try:
        post = Post.objects.get(slug=slug)
    except Post.DoesNotExist:
        return Response({"error": "Post not found"}, status=status.HTTP_404_NOT_FOUND)

    serializer = PostSerializer(post, context={'request': request})
    return Response(serializer.data)
