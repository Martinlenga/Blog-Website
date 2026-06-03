import logging
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.models import User
from django.db import transaction

from .models import AdminProfile, PaymentTransaction, PostAccess

logger = logging.getLogger(__name__)

# ==========================================
# 1. ADMIN PROFILE AUTOMATION
# ==========================================
@receiver(post_save, sender=User)
def manage_admin_profile(sender, instance, **kwargs):
    """
    Ensures that any user marked as staff automatically gets an AdminProfile.
    Handles both new user creation and existing users being promoted.
    """
    if instance.is_staff:
        AdminProfile.objects.get_or_create(user=instance)


# ==========================================
# 2. PAYWALL UNLOCK AUTOMATION (CRITICAL)
# ==========================================
@receiver(post_save, sender=PaymentTransaction)
def grant_post_access_on_payment_success(sender, instance, **kwargs):
    """
    Listens for any database save on a PaymentTransaction. 
    Whether updated by the M-Pesa webhook callback, or manually overridden
    by an admin in the dashboard, this guarantees the user gets access.
    """
    if instance.status == "SUCCESS":
        # Wrap in an atomic transaction to prevent database lockups 
        # or race conditions if webhooks fire rapidly
        with transaction.atomic():
            access, created = PostAccess.objects.get_or_create(
                post=instance.post,
                user=instance.user
            )
            
            if created:
                # Log the successful unlock for your backend terminal
                logger.info(f"Paywall unlocked: {instance.user.email} -> {instance.post.title}")
                
                # NOTE: If you ever want to send an automatic "Thank you for purchasing!" 
                # email or SMS, right here inside this 'if created:' block is the exact 
                # spot to trigger that function.