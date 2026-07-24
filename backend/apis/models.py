from django.db import models
from django.contrib.auth.models import User

# Create your models here.
class Resume(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    file = models.FileField(upload_to='resumes/')
    text = models.TextField()
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

class ResumeAnalysis(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    resume = models.ForeignKey(Resume, on_delete=models.CASCADE)
    job_role = models.CharField(max_length=255)
    ats_score = models.FloatField()
    resume_score = models.FloatField()
    skills_found = models.JSONField()
    missing_skills = models.JSONField()
    strengths = models.JSONField()
    weaknesses = models.JSONField()
    analysis_date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Analysis for {self.resume.title}"

# class JobRole(models.Model):
#     role_name = models.CharField(max_length=255)
#     description = models.TextField()
#     required_skills = models.TextField()
#     difficulty_level = models.CharField(max_length=255)

#     def __str__(self):
#         return self.role_name


class Interview(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    resume = models.ForeignKey(Resume, on_delete=models.CASCADE)

    job_role = models.CharField(max_length=255)

    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    status = models.CharField(
        max_length=255,
        default="pending",
        blank=True
    )

    total_score = models.FloatField(default=0)

    feedback = models.TextField(
        blank=True,
        default=""
    )

    def __str__(self):
        return f"Interview for {self.resume.title}"

class InterviewQuestion(models.Model):
    interview = models.ForeignKey(Interview, on_delete=models.CASCADE)
    question_text = models.TextField()
    keywords = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.question_text

class InterviewAnswer(models.Model):
    interview_question = models.ForeignKey(InterviewQuestion, on_delete=models.CASCADE, related_name='answer')
    answer_text = models.TextField()
    video_file = models.FileField(upload_to='media/', null=True, blank=True)
    answer_score = models.FloatField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.answer_text

class EmotionAnalysis(models.Model):
    interview_question = models.ForeignKey(InterviewQuestion, on_delete=models.CASCADE, related_name='emotion_analysis')
    emotion = models.CharField(max_length=255)
    confidence = models.FloatField()
    face_presence = models.FloatField()
    eye_contact = models.FloatField()