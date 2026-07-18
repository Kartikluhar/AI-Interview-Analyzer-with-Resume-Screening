from django.contrib import admin
from .models import Resume, Interview, InterviewQuestion, InterviewAnswer, EmotionAnalysis, ResumeAnalysis
# Register your models here.

admin.site.register(Resume)
admin.site.register(Interview)
admin.site.register(InterviewQuestion)
admin.site.register(InterviewAnswer)
admin.site.register(EmotionAnalysis)
admin.site.register(ResumeAnalysis)