from django.urls import path
from .views import post_list, post_detail,post_detail_by_slug

urlpatterns = [
    path('posts/', post_list),
    path('posts/<int:pk>/', post_detail),
    path('posts/slug/<slug:slug>/', post_detail_by_slug),  
]
