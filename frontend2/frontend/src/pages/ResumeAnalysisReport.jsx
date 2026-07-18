import React, { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import API from "../services/api";
import toast from "react-hot-toast";
import jsPDF from "jspdf";
import html2canvas from "html2canvas-pro";

import {
  FiDownload,
  FiCpu,
  FiCheckCircle,
  FiAlertCircle,
  FiArrowLeft,
  FiFileText,
  FiBriefcase,
} from "react-icons/fi";

const ResumeAnalysisReport = () => {
  const { id } = useParams();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const reportRef = useRef();

  useEffect(() => {
    fetchReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const response = await API.get(`/resumes/analysis/${id}/`);
      setAnalysis(response.data.data);
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.error || "Failed to fetch the analysis report.",
      );
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = async () => {
    if (!reportRef.current) return;

    const toastId = toast.loading("Generating your PDF report...");

    try {
      const element = reportRef.current;

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#0f172a",
        logging: false,
      });

      const image = canvas.toDataURL("image/png", 1.0);

      // FIX 1: Calculate exact dimensions needed to prevent cutoffs
      const pdfWidth = 210; // A4 standard width in mm
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      // Create PDF with dynamic height instead of strict 'a4'
      const pdf = new jsPDF("p", "mm", [pdfWidth, pdfHeight]);

      pdf.addImage(image, "PNG", 0, 0, pdfWidth, pdfHeight);

      const roleName = analysis?.job_role || "Target-Role";
      pdf.save(`${roleName}-resume-analysis.pdf`);

      toast.success("PDF Downloaded successfully!", { id: toastId });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF.", { id: toastId });
    }
  };

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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="text-center text-secondary-text p-8 glass-card rounded-[24px]">
        Report not found or failed to load.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4">
        <Link
          to="/resumes/analysis"
          className="p-3 bg-white/5 border border-border-custom rounded-xl hover:bg-white/10 transition-colors text-white"
        >
          <FiArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Analysis Report Details
          </h1>
          <p className="text-secondary-text mt-1.5 font-medium">
            Review your previously generated ATS & Resume Score Report.
          </p>
        </div>
      </div>

      {/* REPORT SECTION */}
      <div className="space-y-6">
        <div className="flex justify-end">
          <button
            onClick={downloadPDF}
            className="flex items-center gap-2 bg-[#10B981] hover:bg-[#10B981]/90 text-white px-6 py-3.5 rounded-2xl font-semibold shadow-lg shadow-success/20 transition-all cursor-pointer text-sm"
          >
            <FiDownload size={16} />
            <span>Download PDF Report</span>
          </button>
        </div>

        <div
          ref={reportRef}
          className="glass-card rounded-[24px] p-6 md:p-10 space-y-8 bg-secondary-bg/85 relative overflow-hidden"
        >
          {/* FIX 2: Added data-html2canvas-ignore="true" to prevent the blur effect from rendering badly in PDF */}
          <div
            data-html2canvas-ignore="true"
            className="absolute right-0 top-0 w-80 h-80 bg-accent/5 blur-3xl rounded-full pointer-events-none"
          />

          {/* UPDATED HEADER: Now includes Resume Title and Job Role side-by-side */}
          <div className="text-center space-y-5 z-10 relative">
            <div className="p-4 bg-accent/10 border border-accent/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto text-accent shadow-md">
              <FiCpu size={32} />
            </div>

            <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              AI Resume Evaluation Report
            </h2>

            {/* Resume Title & Job Role Badges */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-xl">
                <FiFileText className="text-secondary-text" size={18} />
                <span className="text-sm text-secondary-text font-medium">
                  Resume:
                </span>
                <span className="text-sm text-white font-semibold">
                  {analysis.resume_title || "Untitled Resume"}
                </span>
              </div>

              <div className="flex items-center gap-2 bg-accent/10 border border-accent/20 px-4 py-2 rounded-xl">
                <FiBriefcase className="text-accent" size={18} />
                <span className="text-sm text-secondary-text font-medium">
                  Target Role:
                </span>
                <span className="text-sm text-accent font-bold">
                  {analysis.job_role || "Not Specified"}
                </span>
              </div>
            </div>
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
                <span>Skills Found ({analysis.skills_found?.length || 0})</span>
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
    </div>
  );
};

export default ResumeAnalysisReport;
