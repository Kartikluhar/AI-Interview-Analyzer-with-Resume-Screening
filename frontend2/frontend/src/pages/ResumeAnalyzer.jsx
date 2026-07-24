import React, { useEffect, useRef, useState } from "react";
import API from "../services/api";
import toast from "react-hot-toast";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

import {
  FiFileText,
  FiDownload,
  FiCpu,
  FiCheckCircle,
  FiAlertCircle,
  FiTrendingUp,
  FiTarget,
} from "react-icons/fi";

const ResumeAnalyzer = () => {
  const [resumes, setResumes] = useState([]);
  const [selectedResume, setSelectedResume] = useState("");
  const [jobRole, setJobRole] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  const reportRef = useRef();

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      const response = await API.get("/resumes/");

      setResumes(response.data.data);
    } catch (error) {
      toast.error("Failed to fetch resumes");
    }
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();

    if (!jobRole.trim()) {
      return toast.error("Enter a job role");
    }

    if (!selectedResume) {
      return toast.error("Select a resume");
    }

    try {
      setLoading(true);

      const response = await API.get(
        `/resumes/analysis/${jobRole}/${selectedResume}/`,
      );

      setAnalysis(response.data.data);
      console.log(response.data.data);
      toast.success("Analysis generated successfully");
    } catch (error) {
      console.log("Status:", error.response?.status);
      console.log("Response:", error.response?.data);
      console.log(error);

      toast.error(
        error.response?.data?.error ||
          JSON.stringify(error.response?.data) ||
          "Failed to generate analysis",
      );
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = async () => {
    const canvas = await html2canvas(reportRef.current);

    const image = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");

    const width = 190;
    const height = (canvas.height * width) / canvas.width;

    pdf.addImage(image, "PNG", 10, 10, width, height);

    pdf.save(`${jobRole}-resume-analysis.pdf`);
  };

  const ProgressBar = ({ value, color }) => (
    <div className="w-full h-4 bg-[#0A0B10] rounded-full overflow-hidden">
      <div
        className="h-full transition-all duration-1000"
        style={{
          width: `${value}%`,
          backgroundColor: color,
          boxShadow: `0 0 15px ${color}`,
        }}
      />
    </div>
  );

  const roles = [
    "Frontend Developer",
    "Backend Developer",
    "Full Stack Developer",
    "Python Developer",
    "React Developer",
    "Node.js Developer",
    "AI Engineer",
    "Machine Learning Engineer",
    "Data Scientist",
    "DevOps Engineer",
    "Cloud Engineer",
    "Cyber Security Engineer",
    "iOS Developer",
    "Android Developer",
    "React Native Developer",
    "Flutter Developer",
    "UI/UX Engineer",
    "Data Engineer",
    "Data Analyst",
    "QA Automation Engineer",
    "SDET",
    "Product Manager",
    "Site Reliability Engineer (SRE)",
    "Blockchain Developer",
  ];

  const CircularScore = ({ score, label, color, shadowColor }) => {
    const radius = 50;
    const strokeWidth = 10;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;

    return (
      <div className="flex flex-col items-center justify-center p-6 bg-white/5 border border-border-custom rounded-[24px] relative overflow-hidden">
        <div className="relative w-36 h-36 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="72"
              cy="72"
              r={radius}
              className="stroke-white/5 fill-transparent"
              strokeWidth={strokeWidth}
            />
            <circle
              cx="72"
              cy="72"
              r={radius}
              className="fill-transparent transition-all duration-1000 ease-out"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              style={{
                filter: `drop-shadow(0 0 8px ${shadowColor})`,
              }}
            />
          </svg>
          <div className="absolute text-center">
            <span className="text-3xl font-extrabold text-white">{score}%</span>
          </div>
        </div>
        <span className="text-sm font-semibold text-secondary-text mt-4">
          {label}
        </span>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">
          AI Resume Analyzer
        </h1>
        <p className="text-secondary-text mt-1.5 font-medium">
          Generate ATS & Resume Score Reports compared against targeted job
          roles.
        </p>
      </div>

      {/* FORM */}
      <div className="glass-card rounded-[24px] p-6 md:p-8">
        <form onSubmit={handleAnalyze} className="space-y-6">
          <div>
            <label className="text-xs text-secondary-text font-semibold uppercase tracking-wider block mb-2 ml-1">
              Targeted Job Role
            </label>
            <input
              type="text"
              list="roles"
              value={jobRole}
              onChange={(e) => setJobRole(e.target.value)}
              placeholder="e.g. Frontend Developer"
              className="w-full p-4 rounded-2xl glass-input text-white placeholder-secondary-text focus:outline-none"
            />
            <datalist id="roles">
              {roles.map((role) => (
                <option key={role} value={role} />
              ))}
            </datalist>
          </div>

          <div>
            <label className="text-xs text-secondary-text font-semibold uppercase tracking-wider block mb-3 ml-1">
              Select Resume to Analyze
            </label>

            {resumes.length === 0 ? (
              <div className="p-6 bg-white/5 border border-border-custom rounded-2xl text-center text-secondary-text text-sm">
                No resumes found. Please upload a resume first.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {resumes.map((resume) => {
                  const isSelected = selectedResume === resume.id;
                  return (
                    <label
                      key={resume.id}
                      className={`flex items-center gap-3 p-4 rounded-2xl border transition-all duration-200 cursor-pointer ${
                        isSelected
                          ? "bg-accent/15 border-accent text-white"
                          : "bg-white/5 border-border-custom text-secondary-text hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <input
                        type="radio"
                        name="resume"
                        value={resume.id}
                        checked={isSelected}
                        onChange={() => setSelectedResume(resume.id)}
                        className="sr-only"
                      />
                      <FiFileText
                        className={
                          isSelected ? "text-accent" : "text-secondary-text"
                        }
                        size={18}
                      />
                      <span className="font-semibold text-sm truncate">
                        {resume.title}
                      </span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          <div className="pt-2">
            <button
              disabled={loading}
              className="w-full py-4 rounded-2xl font-semibold text-white bg-gradient-to-r from-accent to-accent-hover shadow-lg shadow-accent/20 hover:shadow-accent/35 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all duration-200"
            >
              {loading ? "Generating Analysis..." : "Generate Analysis"}
            </button>
          </div>
        </form>
      </div>

      {/* REPORT */}
      {analysis && (
        <div className="space-y-6">
          {/* <div className="flex justify-end">
            <button
              onClick={downloadPDF}
              className="flex items-center gap-2 bg-[#10B981] hover:bg-[#10B981]/90 text-white px-6 py-3.5 rounded-2xl font-semibold shadow-lg shadow-success/20 transition-all cursor-pointer text-sm"
            >
              <FiDownload size={16} />
              <span>Download PDF Report</span>
            </button>
          </div> */}

          <div
            ref={reportRef}
            className="glass-card rounded-[24px] p-6 md:p-10 space-y-8 bg-secondary-bg/85 relative overflow-hidden"
          >
            <div className="absolute right-0 top-0 w-80 h-80 bg-accent/5 blur-3xl rounded-full pointer-events-none" />

            <div className="text-center space-y-3 z-10 relative">
              <div className="p-4 bg-accent/10 border border-accent/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto text-accent shadow-md">
                <FiCpu size={32} />
              </div>

              <h2 className="text-3xl font-extrabold text-white tracking-tight">
                AI Resume Evaluation Report
              </h2>

              <p className="text-secondary-text font-semibold text-sm">
                Optimized for: <span className="text-accent">{jobRole}</span>
              </p>
            </div>

            {/* Circular Scores */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              <CircularScore
                score={analysis.ats_score}
                label="ATS Match Rating"
                color="#4F46E5"
                shadowColor="rgba(79, 70, 229, 0.4)"
              />
              <CircularScore
                score={analysis.resume_score}
                label="Resume Strength Score"
                color="#10B981"
                shadowColor="rgba(16, 185, 129, 0.4)"
              />
            </div>

            {/* Skills Tag Clouds */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white/5 border border-border-custom p-6 rounded-[24px] space-y-4">
                <h3 className="text-success font-bold text-base flex items-center gap-2">
                  <FiCheckCircle size={18} />
                  <span>
                    Skills Found ({analysis.skills_found?.length || 0})
                  </span>
                </h3>

                <div className="flex flex-wrap gap-2.5">
                  {analysis.skills_found?.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-success/10 border border-success/20 text-success"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-white/5 border border-border-custom p-6 rounded-[24px] space-y-4">
                <h3 className="text-danger font-bold text-base flex items-center gap-2">
                  <FiAlertCircle size={18} />
                  <span>
                    Missing Skills ({analysis.missing_skills?.length || 0})
                  </span>
                </h3>

                <div className="flex flex-wrap gap-2.5">
                  {analysis.missing_skills?.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-danger/10 border border-danger/20 text-danger"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Strengths & Weaknesses Detailed List */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white/5 border border-border-custom p-6 rounded-[24px] space-y-4">
                <h3 className="text-success font-bold text-base flex items-center gap-2">
                  <FiCheckCircle size={18} />
                  <span>Key Strengths</span>
                </h3>

                <ul className="space-y-3">
                  {analysis.strengths?.map((item, index) => (
                    <li
                      key={index}
                      className="border-l-2 border-success bg-white/5 p-4 rounded-r-2xl text-sm font-medium text-white leading-relaxed"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white/5 border border-border-custom p-6 rounded-[24px] space-y-4">
                <h3 className="text-danger font-bold text-base flex items-center gap-2">
                  <FiAlertCircle size={18} />
                  <span>Areas of Improvement</span>
                </h3>

                <ul className="space-y-3">
                  {analysis.weaknesses?.map((item, index) => (
                    <li
                      key={index}
                      className="border-l-2 border-danger bg-white/5 p-4 rounded-r-2xl text-sm font-medium text-white leading-relaxed"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeAnalyzer;
