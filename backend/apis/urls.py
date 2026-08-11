from django.conf import settings
from django.conf.urls.static import static
from django.urls import path
from . import views
from rest_framework_simplejwt.views import (
    TokenRefreshView,
    TokenVerifyView,
)

urlpatterns = [
    # Auth Endpoints
    path('auth/signup/', views.signup, name='signup'),
    path('auth/login/', views.login, name='login'),
    path('auth/logout/', views.logout, name='logout'),

    # Token Endpoints
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/token/verify/', TokenVerifyView.as_view(), name='token_verify'),

    # Resume Endpoints (Uses Resume model files)
    path('resumes/upload/', views.upload_resume, name='upload_resume'),
    path('resumes/', views.get_resumes, name='get_resumes'),
    path('resumes/<int:pk>/', views.get_resume, name='get_resume'),
    path('resumes/<int:pk>/delete/', views.delete_resume, name='delete_resume'),
    path('resumes/analysis/<str:role>/<int:pk>/',
         views.get_resume_analysis, name='get_resume_analysis'),
    path('resumes/analysis/<int:pk>/',
         views.get_single_resume_analysis, name='get_single_resume_analysis'),
    path('resumes/analysis/<int:pk>/delete/',
         views.delete_resume_analysis, name='delete_resume_analysis'),
    path('resumes/analysis/', views.get_all_resume_analysis,
         name='get_all_resume_analysis'),


    # Interview Process Endpoints
    path('interviews/start/', views.start_interview, name='start_interview'),
    path('interviews/<int:pk>/questions/',
         views.get_interview_questions, name='get_interview_questions'),
    path('interviews/<int:pk>/questions/first/',
         views.get_interview_question_first, name='get_interview_question_first'),
    path('interviews/<int:pk>/delete/',
         views.delete_interview, name='delete_interview'),

    # Answers Endpoint (Saves video files)
    path('interviews/answers/submit/', views.submit_answer, name='submit_answer'),
    path('interviews/', views.get_interviews, name='get_interviews'),
    path('interview/<int:pk>/', views.get_interview, name='get_interview'),

    # Analytics & Summary Endpoints
    path(
        'interviews/<int:pk>/analysis/',
        views.interview_analysis
    ),
    path('interviews/<int:pk>/answers/',
         views.get_interview_answer, name='get_interview_answer'),
    path('interviews/<int:pk>/emotions/',
         views.get_emotion_analysis, name='get_emotion_analysis'),

    path("profile/", views.get_user_profile, name="get_user_profile"),
    path(
        "profile/update/",
        views.update_user_profile,
        name="update_user_profile",
    ),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# CRITICAL: Serving file uploads (media) during development
# if settings.DEBUG:
#     urlpatterns += static(settings.MEDIA_URL,
#                           document_root=settings.MEDIA_ROOT)
