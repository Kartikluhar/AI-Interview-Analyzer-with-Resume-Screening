from rest_framework import serializers
from django.contrib.auth.models import User
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .models import Resume, Interview, InterviewQuestion, InterviewAnswer, EmotionAnalysis, ResumeAnalysis
from .utils import generate_questions


import re

# * SignUp 
class SignUpSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'email', 'first_name', 'last_name', 'password']
        extra_kwargs = {
            'password': {'write_only': True}
        }
    def validate_password(self, value):
        if len(value) < 8:
            raise serializers.ValidationError("Password must be at least 8 characters long.")
        return value
    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already exists.")
        return value
    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError('Username already exists.')
        return value
    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            password=validated_data['password']
        )
        return user

# * Login
class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        username = data.get('username')
        password = data.get('password')

        user = authenticate(username=username, password=password)

        if user is None:
            raise serializers.ValidationError('Invalid username or password.')

        refresh = RefreshToken.for_user(user)

        return {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'username': user.username,
            'email': user.email
        }

# * Document serializer
class ResumeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Resume
        fields = '__all__'
        read_only_fields = ["user", "text"]
    
    def validate_file(self, value):
        if not value:
            raise serializers.ValidationError("File is required.")

        allowed_extensions = ['.pdf', '.docx', '.doc']

        if not any(value.name.lower().endswith(ext) for ext in allowed_extensions):
            raise serializers.ValidationError(
                "Only PDF, DOCX and DOC files are allowed."
            )

        return value

# * Resume Analysis
class ResumeAnalysisSerializer(serializers.ModelSerializer):
    resume_title = serializers.CharField(source='resume.title', read_only=True)
    class Meta:
        model = ResumeAnalysis
        fields = ['id', 'user','resume', 'resume_title','ats_score', 'resume_score', 'skills_found', 'missing_skills', 'strengths', 'weaknesses','job_role' ,'analysis_date']
        read_only_fields = [
            'resume',
            'job_role',
            'analysis_date',
            'user'
        ]

# * Interview Question
class InterviewQuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = InterviewQuestion
        fields = ['id', 'question_text', 'keywords', 'created_at']

# * Interview


class InterviewSerializer(serializers.ModelSerializer):
    total_questions = serializers.SerializerMethodField()
    answered_questions = serializers.SerializerMethodField()

    created_at = serializers.DateTimeField(
        format="%d %b %Y, %I:%M %p",
        read_only=True
    )

    class Meta:
        model = Interview
        fields = [
            "id",
            "resume",
            "job_role",
            "status",
            "total_score",
            "created_at",
            "started_at",
            "completed_at",
            "total_questions",
            "answered_questions",
        ]

        read_only_fields = [
            "id",
            "status",
            "total_score",
            "created_at",
            "started_at",
            "completed_at",
            "total_questions",
            "answered_questions",
        ]

    def get_total_questions(self, obj):
        return obj.interviewquestion_set.count()

    def get_answered_questions(self, obj):
        return obj.interviewquestion_set.filter(
            answer__isnull=False
        ).count()

    def create(self, validated_data):
        user = self.context["request"].user

        resume_instance = validated_data.pop("resume")
        job_role = validated_data.pop("job_role")

        resume_text = resume_instance.text

        # Generate questions
        questions_dict = generate_questions(resume_text, job_role)

        # Create interview
        interview = Interview.objects.create(
            user=user,
            resume=resume_instance,
            job_role=job_role,
            total_score=0,
            feedback="",
            status="started",
        )

        # Create interview questions
        question_objects = [
            InterviewQuestion(
                interview=interview,
                question_text=question_text,
                keywords=keywords,
            )
            for question_text, keywords in questions_dict.items()
        ]

        InterviewQuestion.objects.bulk_create(question_objects)

        return interview

# * Emotion Analysis
class EmotionAnalysisSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmotionAnalysis
        fields = ['id', 'interview_question', 'emotion', 'confidence', 'face_presentions', 'eye_contact']

# * Interview Answer
class InterviewAnswerSerializer(serializers.ModelSerializer):
    class Meta:
        fields = ['id', 'interview_question', 'video_file', 'answer_text', 'answer_score', 'created_at']