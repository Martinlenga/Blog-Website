from django.apps import AppConfig

class BlogConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'blog'

    def ready(self):
        # Implicitly connect signal handlers decorated with @receiver
        # This guarantees the paywall unlock fires on payment success!
        import blog.signals