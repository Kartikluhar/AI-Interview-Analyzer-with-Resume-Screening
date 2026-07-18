import os
from django.dispatch import receiver
from django.db.models.signals import post_save
from django.contrib.auth.models import User
from django.conf import settings

from .models import InterviewAnswer

@receiver(post_save, sender=InterviewAnswer)
def delete_video_file(sender, instance, **kwargs):
    if instance.video_file:
        if os.path.exists(instance.video_file.path):
            os.remove(instance.video_file.path)