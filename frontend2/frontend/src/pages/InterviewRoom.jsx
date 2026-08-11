import API from "../services/api";
import React, { useRef, useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { useParams, useNavigate } from "react-router-dom";
import Webcam from "react-webcam";
import * as faceapi from "face-api.js";
import { FiVolume2, FiMic, FiCpu, FiVideo, FiActivity } from "react-icons/fi";

const InterviewRoom = () => {
  const { interview_id } = useParams();
  const webcamRef = useRef(null);
  const [imgSrc, setImgSrc] = useState(null);

  const [question, setQuestion] = useState(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [isModelsLoaded, setIsModelsLoaded] = useState(false);

  const [isWebcamReady, setIsWebcamReady] = useState(false);

  // Refs for tracking and recording
  const metricsRef = useRef([]);
  const trackingIntervalRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);

  // Refs for managing Speech Recognition safely
  const recognitionRef = useRef(null);
  const silenceTimerRef = useRef(null);
  const ignoreNextEndRef = useRef(false);

  const spokenQuestionIdRef = useRef(null);

  // NEW REF: Track the current speech to prevent early onend triggers
  const currentSpeechRef = useRef(null);

  const videoConstraints = {
    width: 1280,
    height: 720,
    facingMode: "user",
  };

  // 1. Initialize Face-API Models & Fetch Question
  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = "/models";
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
      ]);
      setIsModelsLoaded(true);
    };

    loadModels();
    fetch_first_question();
  }, []);

  const fetch_first_question = async () => {
    try {
      const response = await API.get(
        `/interviews/${interview_id}/questions/first/`,
      );
      setQuestion(response.data.data);
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to fetch questions",
      );
    }
  };

  // 2. Start Video Recording & Face Tracking, then Speak
  const question_speak = useCallback(() => {
    if (!question || !webcamRef.current) return;

    const stream = webcamRef.current.video.srcObject;
    if (!stream) {
      console.error("Media stream is not available.");
      return;
    }

    // FIX: Remove the onend listener from the previous speech so cancel() doesn't trigger speech_to_text
    if (currentSpeechRef.current) {
      currentSpeechRef.current.onend = null;
    }
    window.speechSynthesis.cancel(); // Stop any ongoing TTS

    if (recognitionRef.current) {
      ignoreNextEndRef.current = true;
      // FIX: Use abort() instead of stop() to instantly kill recognition and drop any buffered audio
      recognitionRef.current.abort();
    }

    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
    }

    // Safely stop the old media recorder before overwriting it
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.onstop = null; // prevent it from submitting
      mediaRecorderRef.current.stop();
    }

    // Clear out any half-listened answer
    setUserAnswer("");
    metricsRef.current = [];
    recordedChunksRef.current = [];

    // Setup Video Recording
    mediaRecorderRef.current = new MediaRecorder(stream, {
      mimeType: "video/webm",
    });

    mediaRecorderRef.current.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunksRef.current.push(event.data);
      }
    };

    if (mediaRecorderRef.current.state === "inactive") {
      mediaRecorderRef.current.start();
    }

    // Start tracking faces every 500ms
    startFaceTracking();

    // Speak the question
    const speech = new SpeechSynthesisUtterance(question.question_text);
    currentSpeechRef.current = speech; // Save to ref
    speech.lang = "en-US";
    window.speechSynthesis.speak(speech);

    speech.onend = () => {
      speech_to_text(); // User's turn to speak ONLY after laptop is completely done
    };
  }, [question]);

  useEffect(() => {
    if (
      isModelsLoaded &&
      isWebcamReady &&
      question &&
      spokenQuestionIdRef.current !== question.id
    ) {
      spokenQuestionIdRef.current = question.id;
      question_speak();
    }
  }, [isModelsLoaded, isWebcamReady, question, question_speak]);

  // 3. Track Face Metrics Every 500ms
  const startFaceTracking = () => {
    if (trackingIntervalRef.current) clearInterval(trackingIntervalRef.current);

    trackingIntervalRef.current = setInterval(async () => {
      if (!webcamRef.current || !webcamRef.current.video) return;

      const videoElement = webcamRef.current.video;
      const detections = await faceapi
        .detectAllFaces(videoElement, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceExpressions();

      if (detections.length > 0) {
        const face = detections[0];
        const expressions = face.expressions;
        const dominantEmotion = Object.keys(expressions).reduce((a, b) =>
          expressions[a] > expressions[b] ? a : b,
        );

        const landmarks = face.landmarks;
        const nose = landmarks.getNose()[0];
        const leftEye = landmarks.getLeftEye()[0];
        const rightEye = landmarks.getRightEye()[3];
        const leftDist = Math.abs(nose.x - leftEye.x);
        const rightDist = Math.abs(rightEye.x - nose.x);
        const ratio = leftDist / rightDist;
        const isLookingForward = ratio > 0.8 && ratio < 1.2;

        metricsRef.current.push({
          presence: true,
          confidence: face.detection.score,
          emotion: dominantEmotion,
          eyeContact: isLookingForward,
        });
      } else {
        metricsRef.current.push({
          presence: false,
          confidence: 0,
          emotion: "no_face_detected",
          eyeContact: false,
        });
      }
    }, 500);
  };

  // 4. Listen to User
  const speech_to_text = async () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      const recognitionInstance = recognitionRef.current;

      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = "en-US";

      let finalTranscript = "";
      ignoreNextEndRef.current = false; // Reset the ignore flag

      recognitionInstance.start();

      recognitionInstance.onresult = (event) => {
        clearTimeout(silenceTimerRef.current);
        finalTranscript = "";

        for (let i = 0; i < event.results.length; i++) {
          finalTranscript += event.results[i][0].transcript + " ";
        }

        setUserAnswer(finalTranscript);

        silenceTimerRef.current = setTimeout(() => {
          if (!ignoreNextEndRef.current) {
            recognitionInstance.stop();
            finalizeAnswerAndSubmit(finalTranscript.trim());
          }
        }, 5000);
      };

      recognitionInstance.onend = () => {
        // Prevent submission if stopped by the "Repeat Question" button
        if (ignoreNextEndRef.current) {
          ignoreNextEndRef.current = false;
          return;
        }
        recognitionInstance.stop();
        finalizeAnswerAndSubmit(finalTranscript);
      };

      recognitionInstance.onerror = () => {
        if (ignoreNextEndRef.current) return;
        recognitionInstance.stop();
        finalizeAnswerAndSubmit(finalTranscript);
      };
    }
  };

  // 5. Stop Trackers, Calculate Averages, and Submit
  const finalizeAnswerAndSubmit = (transcript) => {
    if (trackingIntervalRef.current) {
      clearInterval(trackingIntervalRef.current);
    }

    mediaRecorderRef.current.onstop = () => {
      const videoBlob = new Blob(recordedChunksRef.current, {
        type: "video/webm",
      });
      const aggregatedData = calculateAverages(metricsRef.current);
      submitAnswer(transcript, aggregatedData, videoBlob);
    };

    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
    }
  };

  // 6. Average Calculation Helper
  const calculateAverages = (metricsArray) => {
    const totalFrames = metricsArray.length;

    if (totalFrames === 0) {
      return {
        face_presence: 0,
        confidence: 0,
        emotion: "no_face_detected",
        eye_contact: 0,
      };
    }

    let presenceCount = 0;
    let eyeContactCount = 0;
    let totalConfidence = 0;
    const emotionCounts = {};

    metricsArray.forEach((m) => {
      if (m.presence) {
        presenceCount++;
        if (m.eyeContact) eyeContactCount++;
        totalConfidence += m.confidence;
        emotionCounts[m.emotion] = (emotionCounts[m.emotion] || 0) + 1;
      }
    });

    if (presenceCount === 0) {
      return {
        face_presence: 0,
        eye_contact: 0,
        confidence: 0,
        emotion: "no_face_detected",
      };
    }

    const mostFrequentEmotion = Object.keys(emotionCounts).reduce(
      (a, b) => (emotionCounts[a] > emotionCounts[b] ? a : b),
      "unknown",
    );

    return {
      face_presence: ((presenceCount / totalFrames) * 100).toFixed(2),
      eye_contact: ((eyeContactCount / totalFrames) * 100).toFixed(2),
      confidence: (totalConfidence / presenceCount).toFixed(2),
      emotion: mostFrequentEmotion,
    };
  };

  const navigate = useNavigate();

  const submitAnswer = async (transcript, metrics, videoBlob) => {
    const toastId = toast.loading("Submitting your answer...");

    try {
      const formData = new FormData();
      formData.append("question_id", question.id);
      formData.append("answer", transcript);
      formData.append("emotion", metrics.emotion);
      formData.append("confidence", metrics.confidence);
      formData.append("eye_contact", metrics.eye_contact);
      formData.append("face_presence", metrics.face_presence);

      formData.append(
        "video_file",
        videoBlob,
        `question_${question.id}_answer.webm`,
      );

      const response = await API.post("/interviews/answers/submit/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Answer saved!", { id: toastId });

      if (response.data.complete) {
        navigate(`/interviews/${interview_id}/analysis`);
      } else {
        const nextQuestion = response.data.next_question;
        setQuestion(nextQuestion);
        setUserAnswer("");
      }
    } catch (error) {
      console.error("Submission error:", error);
      toast.error(error?.response?.data?.error || "Failed to submit answer.", {
        id: toastId,
      });
    }
  };

  const capturePhoto = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        setImgSrc(imageSrc);
      }
    }
  }, [webcamRef]);

  // UI Render
  return (
    <div className="space-y-8">
      {/* Header and Loading */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <FiVideo className="text-accent" />
            <span>AI Interview Room</span>
          </h1>
          <p className="text-secondary-text mt-1 text-sm font-medium">
            AI is analyzing your facial expressions, eye contact, and verbal
            responses.
          </p>
        </div>

        {!isModelsLoaded ? (
          <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-warning/10 border border-warning/20 text-warning text-xs font-semibold">
            <div className="w-1.5 h-1.5 rounded-full bg-warning animate-ping" />
            <span>Loading Emotion AI Models...</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-success/10 border border-success/20 text-success text-xs font-semibold">
            <div className="w-1.5 h-1.5 rounded-full bg-success" />
            <span>AI Models Ready</span>
          </div>
        )}
      </div>

      {/* Two Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side: Video Feed */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative glass-card rounded-[24px] overflow-hidden border border-white/10 shadow-2xl bg-secondary-bg flex items-center justify-center aspect-video">
            {/* Overlay indicators */}
            <div className="absolute top-4 left-4 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-xs font-bold text-white">
              <span className="w-2.5 h-2.5 rounded-full bg-danger animate-pulse" />
              <span>RECORDING</span>
            </div>

            <div className="absolute top-4 right-4 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/80 backdrop-blur-md text-xs font-bold text-white">
              <FiActivity className="animate-pulse" />
              <span>LIVE FEED</span>
            </div>

            <Webcam
              audio={true}
              muted={true}
              ref={webcamRef}
              mirrored={true}
              screenshotFormat="image/jpeg"
              videoConstraints={videoConstraints}
              className="w-full h-full object-cover transform rounded-[24px]"
              onUserMedia={() => setIsWebcamReady(true)}
            />
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 p-4 bg-white/5 border border-border-custom rounded-2xl">
            <div className="flex items-center gap-2 text-xs font-bold text-secondary-text">
              <FiCpu className="text-accent" />
              <span>AI EMOTION & GAZE EVALUATION</span>
            </div>
            <span className="text-[10px] bg-white/10 px-2.5 py-1 rounded-full text-white font-semibold uppercase tracking-wider">
              Autodetecting every 500ms
            </span>
          </div>
        </div>

        {/* Right Side: AI Recruiter Panel */}
        <div className="lg:col-span-5 space-y-6">
          {/* Question speech card */}
          <div className="glass-card rounded-[24px] p-6 space-y-4 relative overflow-hidden">
            <div className="absolute right-0 top-0 w-32 h-32 bg-accent/5 blur-2xl rounded-full" />

            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-accent/15 border border-accent/20 rounded-xl text-accent">
                <FiCpu size={16} />
              </div>
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                AI Recruiter Assistant
              </span>
            </div>

            {question ? (
              <div className="space-y-4">
                <div className="p-4 bg-primary-bg/60 border border-border-custom rounded-2xl text-white font-medium leading-relaxed">
                  {question.question_text}
                </div>

                <div className="flex justify-between items-center gap-3">
                  <button
                    onClick={question_speak}
                    disabled={!isModelsLoaded || !question}
                    className="flex items-center gap-2 text-xs font-semibold px-4 py-2.5 rounded-xl border border-accent/30 text-accent hover:bg-accent/10 hover:border-accent transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FiVolume2 size={14} />
                    <span>Repeat Question</span>
                  </button>

                  <span className="text-[10px] text-secondary-text font-semibold uppercase">
                    Question active
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-6 bg-primary-bg/30 rounded-2xl text-center text-secondary-text text-sm">
                Preparing targeted question...
              </div>
            )}
          </div>

          {/* User speech live transcribe */}
          <div className="glass-card rounded-[24px] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FiMic className="text-success animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider text-secondary-text">
                  Speech Transcription
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-success font-semibold uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-success animate-ping" />
                <span>Listening</span>
              </div>
            </div>

            <div className="bg-primary-bg/60 border border-border-custom rounded-2xl p-4 min-h-[140px] text-sm leading-relaxed text-white">
              {userAnswer ? (
                <p className="font-medium text-white">{userAnswer}</p>
              ) : (
                <span className="text-secondary-text italic font-medium block mt-2 text-center">
                  Listen to the question, then speak your response clearly. It
                  will transcribe in real-time.
                </span>
              )}
            </div>

            {/* TIPS SECTION */}
            <div className="space-y-2 mt-2">
              <div className="text-[10px] text-secondary-text text-center font-semibold leading-relaxed">
                Tip: AI waits for 5 seconds of silence before automatically
                saving your answer.
              </div>
              <div className="text-[10px] text-warning/90 text-center font-semibold leading-relaxed bg-warning/10 py-2 px-3 rounded-xl border border-warning/20">
                Note: The live transcriber may occasionally misspell technical
                terms. Don't worry—our AI is trained to understand the context
                and will automatically correct phonetic errors (like "jango" to
                "django") during the final evaluation!
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewRoom;
