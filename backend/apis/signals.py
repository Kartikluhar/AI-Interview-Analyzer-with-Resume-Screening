import os
from django.dispatch import receiver
from django.db.models.signals import post_save, post_delete
from django.contrib.auth.models import User
from django.conf import settings

from .models import InterviewAnswer

@receiver(post_delete, sender=InterviewAnswer)
def delete_video_file(sender, instance, **kwargs):
    if instance.video_file:
        if os.path.exists(instance.video_file.path):
            os.remove(instance.video_file.path)