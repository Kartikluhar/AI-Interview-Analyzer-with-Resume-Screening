import API from "../services/api";
import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";
import {
  FiDownload,
  FiSmile,
  FiChevronDown,
  FiChevronUp,
  FiAward,
  FiMessageSquare,
  FiBookOpen,
  FiActivity,
  FiVideo, // Added FiVideo import here
} from "react-icons/fi";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// Helper function to safely convert decimals (e.g., 0.85) to percentages (85)
const formatScore = (val) => {
  const num = parseFloat(val || 0);
  // If the value is a decimal between 0 and 1, multiply by 100
  return num <= 1 && num > 0 ? Math.round(num * 100) : Math.round(num);
};

const InterviewAnalysis = () => {
  const { interview_id } = useParams();
  const [report, setReport] = useState(null);
  const [expandedIndex, setExpandedIndex] = useState({});

  const reportRef = useRef();

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async () => {
    try {
      const res = await API.get(`/interviews/${interview_id}/analysis/`);
      setReport(res.data);
    } catch (err) {
      toast.error("Failed to load report");
    }
  };

  const toggleExpand = (index) => {
    setExpandedIndex((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const downloadPDF = async () => {
    const input = reportRef.current;
    const canvas = await html2canvas(input, {
      scale: 2,
      backgroundColor: "#111827",
      useCORS: true,
    });

    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF({
      orientation: canvas.width > canvas.height ? "landscape" : "portrait",
      unit: "px",
      format: [canvas.width, canvas.height],
    });

    pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
    pdf.save(`Interview_Report_${report.interview_id}.pdf`);
  };

  if (!report) {
    return (
      <div className="min-h-[60vh] flex flex-col justify-center items-center gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-accent border-t-transparent animate-spin" />
        <p className="text-secondary-text text-sm font-medium">
          Computing AI Analytics...
        </p>
      </div>
    );
  }

  const totalQuestions = report.results?.length || 0;

  const avgConfidence =
    totalQuestions > 0
      ? Math.round(
          report.results.reduce(
            (acc, curr) => acc + formatScore(curr.confidence),
            0,
          ) / totalQuestions,
        )
      : 80;

  const avgEyeContact =
    totalQuestions > 0
      ? Math.round(
          report.results.reduce(
            (acc, curr) => acc + formatScore(curr.eye_contact),
            0,
          ) / totalQuestions,
        )
      : 85;

  const emotionCounts = {};
  report.results?.forEach((item) => {
    const e = item.emotion || "neutral";
    emotionCounts[e] = (emotionCounts[e] || 0) + 1;
  });
  const dominantEmotion =
    Object.keys(emotionCounts).length > 0
      ? Object.keys(emotionCounts).reduce((a, b) =>
          emotionCounts[a] > emotionCounts[b] ? a : b,
        )
      : "neutral";

  const chartData =
    report.results?.map((item, idx) => ({
      name: `Q${idx + 1}`,
      Score: formatScore(item.answer_score),
      Confidence: formatScore(item.confidence),
    })) || [];

  const CircularScore = ({ score, label, color, shadowColor }) => {
    const radius = 40;
    const strokeWidth = 8;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;

    return (
      <div className="flex flex-col items-center justify-center p-4 bg-white/5 border border-border-custom rounded-2xl">
        <div className="relative w-24 h-24 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="48"
              cy="48"
              r={radius}
              className="stroke-white/5 fill-transparent"
              strokeWidth={strokeWidth}
            />
            <circle
              cx="48"
              cy="48"
              r={radius}
              className="fill-transparent transition-all duration-1000"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              style={{ filter: `drop-shadow(0 0 4px ${shadowColor})` }}
            />
          </svg>
          <span className="absolute text-lg font-extrabold text-white">
            {score}%
          </span>
        </div>
        <span className="text-xs font-semibold text-secondary-text mt-3">
          {label}
        </span>
      </div>
    );
  };

  const getFeedbackAndSuggestions = (item) => {
    if (item.feedback && item.suggestions?.length > 0) {
      return { feedback: item.feedback, suggestions: item.suggestions };
    }

    const score = formatScore(item.answer_score);
    const emotion = item.emotion || "neutral";
    const eyeContact = formatScore(item.eye_contact);

    let feedback = "";
    let suggestions = [];

    if (score >= 80) {
      feedback =
        "Excellent articulation of details. Your explanation demonstrated a solid grasp of the core concepts and principles.";
      suggestions.push(
        "Maintain this level of depth and clarity in live interviews.",
      );
      suggestions.push(
        "Consider briefly mentioning edge cases or alternative approaches to further showcase your expertise.",
      );
    } else if (score >= 60) {
      feedback =
        "Your response covers the primary aspects but could benefit from more concrete definitions or real-world examples.";
      suggestions.push(
        "Try using the STAR method (Situation, Task, Action, Result) to frame your response when applicable.",
      );
      suggestions.push(
        "Connect your answer to specific examples from your past projects or experiences.",
      );
    } else {
      feedback =
        "The answer is brief and misses some core concepts required to fully address the question.";
      suggestions.push(
        "Review the fundamental principles related to this topic.",
      );
      suggestions.push(
        "Take a brief pause to structure your thoughts clearly before answering.",
      );
    }

    if (eyeContact < 70) {
      suggestions.push(
        "Practice looking straight into the camera lens to project confidence.",
      );
    }

    if (["angry", "sad", "fearful"].includes(emotion.toLowerCase())) {
      suggestions.push(
        "Maintain a neutral, pleasant, or smiling expression to create rapport.",
      );
    }

    return { feedback, suggestions };
  };

  return (
    <div className="space-y-8">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <FiAward className="text-accent" />
            <span>Interview Report</span>
          </h1>
          <p className="text-secondary-text mt-1 text-sm font-medium">
            AI evaluated assessment metrics and constructive speech feedback.
          </p>
        </div>

        <button
          onClick={downloadPDF}
          className="flex items-center gap-2 bg-[#10B981] hover:bg-[#10B981]/90 text-white px-6 py-3.5 rounded-2xl font-semibold shadow-lg shadow-success/20 transition-all cursor-pointer text-sm w-full sm:w-auto justify-center"
        >
          <FiDownload size={16} />
          <span>Download PDF Report</span>
        </button>
      </div>

      {/* Main Report Wrapper */}
      <div
        ref={reportRef}
        className="space-y-8 bg-secondary-bg/50 border border-border-custom rounded-[24px] p-6 md:p-8 relative overflow-hidden"
      >
        <div
          data-html2canvas-ignore="true"
          className="absolute right-0 top-0 w-80 h-80 bg-accent/5 blur-3xl rounded-full pointer-events-none"
        />

        {/* Top Header Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/5 border border-border-custom p-6 rounded-2xl">
            <span className="text-xs font-semibold text-secondary-text uppercase tracking-wider block">
              Job Role
            </span>
            <span className="text-xl font-bold text-white block mt-2">
              {report.job_role}
            </span>
          </div>

          <div className="bg-white/5 border border-border-custom p-6 rounded-2xl">
            <span className="text-xs font-semibold text-secondary-text uppercase tracking-wider block">
              Mock Status
            </span>
            <div className="flex items-center gap-2 mt-2">
              <span className="w-2.5 h-2.5 rounded-full bg-success animate-pulse" />
              <span className="text-xl font-bold text-white capitalize">
                {report.status}
              </span>
            </div>
          </div>

          <div className="bg-white/5 border border-border-custom p-6 rounded-2xl bg-gradient-to-tr from-accent/10 to-accent-hover/10">
            <span className="text-xs font-semibold text-accent uppercase tracking-wider block">
              Overall Rating
            </span>
            <span className="text-3xl font-extrabold text-white block mt-1.5">
              {formatScore(report.score_percentage)}%
            </span>
          </div>
        </div>

        {/* Overall Score Circle Progress */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 pt-4">
          <CircularScore
            score={formatScore(report.score_percentage)}
            label="Overall Score"
            color="#4F46E5"
            shadowColor="rgba(79, 70, 229, 0.4)"
          />
          <CircularScore
            score={avgConfidence}
            label="Face Detection Score"
            color="#F59E0B"
            shadowColor="rgba(245, 158, 11, 0.4)"
          />
          <CircularScore
            score={avgEyeContact}
            label="Eye Contact"
            color="#06B6D4"
            shadowColor="rgba(6, 182, 212, 0.4)"
          />

          {/* Emotion Card */}
          <div className="flex flex-col items-center justify-center p-4 bg-white/5 border border-border-custom rounded-2xl">
            <div className="w-24 h-24 rounded-full bg-white/5 border border-border-custom flex items-center justify-center text-3xl text-warning">
              <FiSmile className="text-accent" size={36} />
            </div>
            <span className="text-xs font-bold text-white uppercase mt-3 tracking-wide">
              {dominantEmotion}
            </span>
            <span className="text-[10px] font-semibold text-secondary-text mt-1">
              Dominant Tone
            </span>
          </div>
        </div>

        {/* Score Chart Trends */}
        {chartData.length > 0 && (
          <div className="bg-white/5 border border-border-custom p-6 rounded-[24px] space-y-4">
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Score Distribution
              </h2>
              <p className="text-xs text-secondary-text">
                Technical evaluation scores per question answered
              </p>
            </div>
            <div className="h-56 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={chartData}
                  margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.4} />
                      <stop
                        offset="95%"
                        stopColor="#4F46E5"
                        stopOpacity={0.0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255, 255, 255, 0.03)"
                  />
                  <XAxis
                    dataKey="name"
                    stroke="#94A3B8"
                    fontSize={11}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="#94A3B8"
                    fontSize={11}
                    domain={[0, 100]}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "#111827",
                      borderColor: "rgba(255, 255, 255, 0.08)",
                      borderRadius: "12px",
                      color: "#fff",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="Score"
                    stroke="#4F46E5"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#chartGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Questions Loop */}
        <div data-html2canvas-ignore="true" className="space-y-4 pt-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-secondary-text">
            Detailed Answer Feedback
          </h3>

          <div className="space-y-4">
            {report.results.map((item, index) => {
              const isExpanded = !!expandedIndex[index];
              const details = getFeedbackAndSuggestions(item);

              return (
                <div
                  key={index}
                  className="bg-white/5 border border-border-custom rounded-[24px] overflow-hidden transition-all duration-300 hover:border-white/15"
                >
                  {/* Collapsible Accordion Header */}
                  <div
                    onClick={() => toggleExpand(index)}
                    className="flex justify-between items-center p-6 cursor-pointer hover:bg-white/5 transition-all duration-200"
                  >
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-accent">
                        QUESTION {index + 1}
                      </h4>
                      <p className="text-white font-medium text-sm leading-relaxed max-w-2xl pr-4">
                        {item.question}
                      </p>
                    </div>

                    <button className="p-2 bg-white/5 border border-border-custom rounded-xl text-secondary-text hover:text-white transition">
                      {isExpanded ? (
                        <FiChevronUp size={18} />
                      ) : (
                        <FiChevronDown size={18} />
                      )}
                    </button>
                  </div>

                  {/* Expanded Content Panel */}
                  {isExpanded && (
                    <div className="p-6 pt-0 border-t border-border-custom bg-black/10 space-y-6 animate-slide-in">
                      {/* Transcribed text */}
                      <div className="space-y-2 pt-6">
                        <span className="text-xs font-bold text-success uppercase tracking-wider flex items-center gap-1.5">
                          <FiMessageSquare size={14} />
                          <span>Your Answer Transcription</span>
                        </span>
                        <p className="p-4 bg-white/5 border border-border-custom rounded-2xl text-sm leading-relaxed text-white">
                          {item.answer ? (
                            item.answer
                          ) : (
                            <span className="italic text-secondary-text">
                              No voice recorded for this question.
                            </span>
                          )}
                        </p>
                      </div>

                      {/* --- NEW SECTION: Video Recording --- */}
                      {item.video_url && (
                        <div className="space-y-2 pt-2">
                          <span className="text-xs font-bold text-accent uppercase tracking-wider flex items-center gap-1.5">
                            <FiVideo size={14} />
                            <span>Video Recording</span>
                          </span>
                          <div className="rounded-2xl overflow-hidden border border-border-custom bg-black/40">
                            <video
                              src={item.video_url}
                              controls
                              className="w-full max-h-[350px] object-contain outline-none"
                              preload="metadata"
                            >
                              Your browser does not support the video tag.
                            </video>
                          </div>
                        </div>
                      )}
                      {/* ---------------------------------- */}

                      {/* Question Core Metrics */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-4 bg-white/5 border border-border-custom rounded-2xl flex flex-col justify-between">
                          <span className="text-xs font-semibold text-secondary-text">
                            Answer Score
                          </span>
                          <span className="text-lg font-bold text-white mt-2">
                            {formatScore(item.answer_score)}%
                          </span>
                        </div>
                        <div className="p-4 bg-white/5 border border-border-custom rounded-2xl flex flex-col justify-between">
                          <span className="text-xs font-semibold text-secondary-text">
                            Expression Tone
                          </span>
                          <span className="text-lg font-bold text-white capitalize mt-2">
                            {item.emotion}
                          </span>
                        </div>
                        <div className="p-4 bg-white/5 border border-border-custom rounded-2xl flex flex-col justify-between">
                          <span className="text-xs font-semibold text-secondary-text">
                            Confidence Value
                          </span>
                          <span className="text-lg font-bold text-white mt-2">
                            {formatScore(item.confidence)}%
                          </span>
                        </div>
                        <div className="p-4 bg-white/5 border border-border-custom rounded-2xl flex flex-col justify-between">
                          <span className="text-xs font-semibold text-secondary-text">
                            Eye Contact Rating
                          </span>
                          <span className="text-lg font-bold text-white mt-2">
                            {formatScore(item.eye_contact)}%
                          </span>
                        </div>
                      </div>

                      {/* AI Feedback & Developmental Suggestions */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <span className="text-xs font-bold text-accent uppercase tracking-wider flex items-center gap-1.5">
                            <FiActivity size={14} />
                            <span>AI Performance Feedback</span>
                          </span>
                          <div className="p-4 bg-accent/5 border border-accent/10 rounded-2xl text-sm text-secondary-text leading-relaxed">
                            {details.feedback}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <span className="text-xs font-bold text-[#F59E0B] uppercase tracking-wider flex items-center gap-1.5">
                            <FiBookOpen size={14} />
                            <span>Developmental Suggestions</span>
                          </span>
                          <div className="p-4 bg-warning/5 border border-warning/10 rounded-2xl text-sm text-secondary-text leading-relaxed">
                            {details.suggestions.length > 0 ? (
                              <ul className="list-disc pl-4 space-y-1.5">
                                {details.suggestions.map((s, sIdx) => (
                                  <li key={sIdx}>{s}</li>
                                ))}
                              </ul>
                            ) : (
                              <span>
                                No developmental issues identified. Excellent
                                job!
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewAnalysis;
