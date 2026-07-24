from .models import (
    Interview,
    InterviewQuestion,
    InterviewAnswer,
    EmotionAnalysis,
)
from collections import Counter
from pprint import pprint
from django.shortcuts import render
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import (
    SignUpSerializer,
    LoginSerializer,
    ResumeSerializer,
    InterviewSerializer,
    InterviewQuestionSerializer, 
    InterviewAnswerSerializer,
    EmotionAnalysisSerializer,
    ResumeAnalysisSerializer
)
from .models import Resume, Interview, InterviewQuestion, InterviewAnswer, EmotionAnalysis, ResumeAnalysis
from . import utils
import os

# Create your views here.

# * Signup view
@api_view(['POST'])
def signup(request):
    try:
        serializer = SignUpSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({
                'message': 'User created successfully',
                'data': serializer.data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# * Login view
@api_view(['POST'])
def login(request):
    try:
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            print(serializer.validated_data)
            return Response({
                'message': 'Login successful',
                'data': serializer.validated_data
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# * Logout view
@api_view(['POST'])
def logout(request):
    try:
        refresh = request.data.get('refresh')
        token = RefreshToken(refresh)
        token.blacklist()
        return Response({
            'message': 'Logout Successful',
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# * Upload resume view
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_resume(request):
    try:
        serializer = ResumeSerializer(data=request.data)
        if serializer.is_valid():
            resume = request.FILES.get('file')
            text = utils.extract_text(resume)

            serializer.save(
                user=request.user,
                text=text
            )
            return Response({
                'message': 'Resume uploaded successfully',
                'data': serializer.data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({
            'error': str(e),
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# * Get resumes view
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_resumes(request):
    try:
        resumes = Resume.objects.filter(user=request.user)
        serializer = ResumeSerializer(resumes, many=True)
        return Response({
            'message': 'Resumes fetched successfully',
            'data': serializer.data
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({
            'error': str(e),
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# * Get Resume
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_resume(request, pk):
    
    try:
        resume = Resume.objects.get(pk=pk)
        serializer = ResumeSerializer(resume)
        return Response({
            'message': 'Resume fetched successfully',
            'resume_data': serializer.data,
        })
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# * Get resume analysis
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_resume_analysis(request, role, pk):
    
    try:
        resume = Resume.objects.get(pk=pk)
        get_analysis = ResumeAnalysis.objects.filter(resume=resume, job_role=role).first()
        print("Existing Analysis:", get_analysis)
        if get_analysis is None:
            analysis = utils.analyze_resume(resume.text, role)
            print("AI Response:")
            pprint(analysis)
            serializer = ResumeAnalysisSerializer(data=analysis)
            if serializer.is_valid():
                serializer.save(resume=resume, job_role=role, user=request.user)
                return Response({
                    'message': 'Resume analysis fetched successfully',
                    'data': serializer.data
                }, status=status.HTTP_200_OK)
            print("Serializer Errors:")
            print(serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        serializer = ResumeAnalysisSerializer(get_analysis)
        return Response({
            'message': 'Resume analysis fetched successfully',
            'data': serializer.data
        }, status=status.HTTP_200_OK)
    except Exception as e:
        import traceback
        traceback.print_exc()
        return Response({
            'error': str(e)
        })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_all_resume_analysis(request):
    try:

        resume_analysis = ResumeAnalysis.objects.filter(user=request.user)
        serializer = ResumeAnalysisSerializer(resume_analysis, many=True)
        return Response({
            'message': 'Resume analysis fetched successfully',
            'data': serializer.data
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({
            'error': str(e)
        })

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_resume_analysis(request, pk):
    try:
        resume_analysis = ResumeAnalysis.objects.get(pk=pk)
        resume_analysis.delete()
        return Response({
            'message': 'Resume analysis deleted successfully',
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_single_resume_analysis(request, pk):
    try:
        resume_analysis = ResumeAnalysis.objects.get(pk=pk)
        serializer = ResumeAnalysisSerializer(resume_analysis)
        return Response({
            'message': 'Resume analysis fetched successfully',
            'data': serializer.data
        }, status=status.HTTP_200_OK)
    except Exception as e:    
        return Response({
            'error': str(e)
    })

# * Delete resume view
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_resume(request, pk):
    try:
        resume = Resume.objects.get(pk=pk)
        if resume.file and os.path.exists(resume.file.path):
            os.remove(resume.file.path)
        resume.delete()
        return Response({
            'message': 'Resume deleted successfully',
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# * Fetch the all interviews
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_interviews(request):
    try:
        interviews = Interview.objects.filter(
            user=request.user).order_by('-started_at')
        serializer = InterviewSerializer(interviews, many=True)
        return Response({
            'message': 'Interviews fetched successfully',
            'data': serializer.data
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
# * Get one interview
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_interview(request, pk):
    try:
        interview = Interview.objects.get(pk=pk)
        serializer = InterviewSerializer(interview)
        return Response({
            'message': 'Interview fetched successfully',
            'data': serializer.data
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# * Interview start view


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def start_interview(request):
    print("Authenticated:", request.user.is_authenticated)
    print("User:", request.user)
    try:
        serializer = InterviewSerializer(
            data=request.data, context={'request': request})
        if serializer.is_valid():

            # --- THE FIX IS HERE ---
            # Explicitly pass the authenticated user into the save method
            serializer.save(user=request.user)
            # -----------------------

            return Response({
                'message': 'Interview started successfully',
                'data': InterviewSerializer(serializer.instance).data
            }, status=status.HTTP_200_OK)

        print(serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        print(e)
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# * Interview question
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_interview_questions(request, pk):
    try:
        interview = Interview.objects.get(pk=pk)
        questions = InterviewQuestion.objects.filter(interview=interview)
        serializer = InterviewQuestionSerializer(questions, many=True)
        return Response({
            'message': 'Interview questions fetched successfully',
            'data': serializer.data
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# * Interview question one
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_interview_question_first(request, pk):
    try:
        # question = InterviewQuestion.objects.filter(interview=pk).first()
        # answer = InterviewAnswer.objects.filter(interview_question=question)
        # if answer is None:
        #     serializer = InterviewQuestionSerializer(question)
        #     return Response({
        #         'message': 'Interview question fetched successfully',
        #         'data': serializer.data
        #     }, status=status.HTTP_200_OK)
        # else:
        #     questions = InterviewQuestion.objects.filter(interview=pk, id__gt=question.id)
        #     for q in questions:
        #         answer = InterviewAnswer.objects.filter(interview_question=q)
        #         if answer is None:
        #             serializer = InterviewQuestionSerializer(q)
        #             return Response({
        #                 'message': 'Interview question fetched successfully',
        #                 'data': serializer.data
        #             }, status=status.HTTP_200_OK)

        questions = InterviewQuestion.objects.filter(interview=pk)
        
        if not questions.exists():
            return Response({
                'message': 'There is no question is generated for this interview'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        for q in questions:
            if not InterviewAnswer.objects.filter(interview_question=q).exists():
                serializer = InterviewQuestionSerializer(q)
                return Response({
                    'message': 'Interview question fetched successfully',
                    'data': serializer.data
                }, status=status.HTTP_200_OK)
            
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# * Delete Interview
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_interview(request, pk):
    try:
        interview = Interview.objects.get(pk=pk)
        interview.delete()
        return Response({
            'message': 'Interview deleted successfully',
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# * Delete pending Interview
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_pending_interview(request):
    try:
        interviews = Interview.objects.filter(status='pending')
        interviews.delete()
        return Response({
            'message': 'Interview deleted successfully',
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# * Interview answer submit
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_answer(request):
    try:
        question_id = request.data.get('question_id')
        answer = request.data.get('answer')
        emotion = request.data.get('emotion')
        confidence = request.data.get('confidence')
        eye_contact = request.data.get('eye_contact')
        face_presence = request.data.get('face_presence')
        video_file = request.data.get('video_file')
        
        question = InterviewQuestion.objects.get(pk=question_id)
        score = utils.get_score(answer, question.keywords)

        # * save emotion
        EmotionAnalysis.objects.create(
            interview_question=question,
            emotion=emotion,
            confidence=confidence,
            eye_contact=eye_contact,
            face_presence=face_presence
        )

        # * save answer
        InterviewAnswer.objects.create(
            interview_question=question,
            answer_text=answer,
            answer_score=score,
            video_file=video_file
        )

        # * for next Question
        next_question = InterviewQuestion.objects.filter(
            interview=question.interview,
            id__gt=question.id
        ).first()

        if not next_question:
            Interview.objects.filter(pk=question.interview.id).update(status='completed')
            return Response({
                'complete': True
            })
        return Response({
            'next_question': InterviewQuestionSerializer(next_question).data,
            'complete': False
        })
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# * Interview Answer fetch
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_interview_answer(request, pk):
    try:
        interview = Interview.objects.get(pk=pk)
        questions = InterviewQuestion.objects.filter(interview=interview)
        answers = InterviewAnswer.objects.filter(question__in=questions)
        serializer = InterviewAnswerSerializer(answers, many=True)
        return Response({
            'message': 'Interview answers fetched successfully',
            'data': serializer.data
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# * Emotion analysis
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_emotion_analysis(request, pk):
    try:
        interview = Interview.objects.get(pk=pk)
        questions = InterviewQuestion.objects.filter(interview=interview)
        emotions = EmotionAnalysis.objects.filter(interview_question__in=questions)
        serializer = EmotionAnalysisSerializer(emotions, many=True)
        return Response({
            'message': 'Emotion analysis fetched successfully',
            'data': serializer.data
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({
            'error': str(e)
        })


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def interview_analysis(request, pk):
    try:
        interview = Interview.objects.get(pk=pk)
    except Interview.DoesNotExist:
        return Response(
            {
                "message": "Interview not found."
            },
            status=404,
        )

    questions = InterviewQuestion.objects.filter(interview=interview)

    results = []

    total_score = 0
    answered_questions = 0

    confidence_sum = 0
    eye_contact_sum = 0
    face_presence_sum = 0

    emotions = []

    for question in questions:

        answer = InterviewAnswer.objects.filter(
            interview_question=question
        ).first()

        emotion = EmotionAnalysis.objects.filter(
            interview_question=question
        ).first()

        answer_score = answer.answer_score if answer else 0
        answer_text = answer.answer_text if answer else ""

        # --- NEW CODE: Extract Video URL ---
        video_url = None
        if answer and answer.video_file:
            # build_absolute_uri creates a full URL (e.g., http://yourdomain.com/media/file.mp4)
            video_url = request.build_absolute_uri(answer.video_file.url)
        # -----------------------------------

        detected_emotion = (
            emotion.emotion if emotion else "Unknown"
        )

        confidence = float(
            emotion.confidence if emotion else 0
        )

        eye_contact = float(
            emotion.eye_contact if emotion else 0
        )

        face_presence = float(
            emotion.face_presence if emotion else 0
        )

        if answer:
            answered_questions += 1
            total_score += answer_score

        confidence_sum += confidence
        eye_contact_sum += eye_contact
        face_presence_sum += face_presence

        emotions.append(detected_emotion)

        results.append(
            {
                "question": question.question_text,
                "keywords": question.keywords,
                "answer": answer_text,
                "video_url": video_url,  # --- Added video_url to the response payload ---
                "answer_score": answer_score,
                "emotion": detected_emotion,
                "confidence": round(confidence, 2),
                "eye_contact": round(eye_contact, 2),
                "face_presence": round(face_presence, 2),
            }
        )

    total_questions = questions.count()

    if total_questions > 0:
        average_score = round(total_score / total_questions, 2)
        average_confidence = round(confidence_sum / total_questions, 2)
        average_eye_contact = round(eye_contact_sum / total_questions, 2)
        average_face_presence = round(face_presence_sum / total_questions, 2)
    else:
        average_score = 0
        average_confidence = 0
        average_eye_contact = 0
        average_face_presence = 0

    score_percentage = round(average_score, 2)

    dominant_emotion = (
        Counter(emotions).most_common(1)[0][0]
        if emotions
        else "Unknown"
    )

    if score_percentage >= 85:
        performance = "Excellent"
    elif score_percentage >= 70:
        performance = "Good"
    elif score_percentage >= 50:
        performance = "Average"
    else:
        performance = "Needs Improvement"

    return Response(
        {
            "interview_id": interview.id,
            "job_role": interview.job_role,
            "status": interview.status,

            # Summary
            "performance": performance,
            "total_questions": total_questions,
            "answered_questions": answered_questions,

            # Scores
            "total_score": total_score,
            "average_score": average_score,
            "score_percentage": score_percentage,

            # AI Metrics
            "average_confidence": average_confidence,
            "average_eye_contact": average_eye_contact,
            "average_face_presence": average_face_presence,
            "dominant_emotion": dominant_emotion,

            # Question-wise analysis
            "results": results,
        }
    )
