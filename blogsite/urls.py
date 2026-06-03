from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    
    path('api/', include('blog.urls')),
    
    path("api/admin/", include("blog.admin_urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    
    # Optionally serve static files locally during development edge-cases
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)