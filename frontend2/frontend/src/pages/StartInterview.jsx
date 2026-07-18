import React, { useEffect, useState } from "react";
import API from "../services/api";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import {
  FaRobot,
  FaFileAlt,
  FaUserTie,
  FaPlay,
  FaSpinner,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const API_URL = "http://127.0.0.1:8000/api";

const StartInterview = () => {
  const navigate = useNavigate();

  const [resumes, setResumes] = useState([]);
  const [selectedResume, setSelectedResume] = useState("");
  const [jobRole, setJobRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [resumeLoading, setResumeLoading] = useState(true);


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


  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      setResumeLoading(true);

      const response = await API.get("/resumes/");

      setResumes(response.data.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load resumes");
    } finally {
      setResumeLoading(false);
    }
  };

  const startInterview = async () => {
    if (!selectedResume) {
      return toast.error("Please select a resume");
    }

    if (!jobRole.trim()) {
      return toast.error("Please enter a job role");
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      stream.getTracks().forEach((track) => track.stop());

      setLoading(true);

      toast.loading("Generating AI Interview Questions...", {
        id: "startInterview",
      });

      const response = await API.post("/interviews/start/", {
        resume: selectedResume,
        job_role: jobRole,
      });

      toast.success("Interview Started Successfully", {
        id: "startInterview",
      });

      const interviewId = response.data.data.id;

      navigate(`/interview/${interviewId}`);
    } catch (error) {
      if (error.name === "NotAllowedError") {
        toast.error("Please allow access to your camera and microphone");
        
      } else {
        console.error(error);

        toast.error(
          error?.response?.data?.error || "Failed to start interview",
          {
            id: "startInterview",
          },
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center py-6 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-xl glass-card rounded-[24px] p-6 md:p-10 shadow-2xl"
      >
        {/* Header */}
        <div className="text-center mb-8 space-y-4">
          <motion.div
            animate={{
              rotate: [0, 8, -8, 0],
            }}
            transition={{
              repeat: Infinity,
              duration: 4,
              ease: "easeInOut"
            }}
            className="inline-block p-4 bg-accent/10 border border-accent/20 rounded-full text-accent shadow-md"
          >
            <FaRobot size={40} />
          </motion.div>

          <h1 className="color-white text-3xl font-extrabold tracking-tight">
            AI Mock Interview
          </h1>

          <p className="text-secondary-text font-medium text-sm">
            Generate personalized mock interview questions from your resume using AI.
          </p>
        </div>

        {/* Resume Selection */}
        <div className="space-y-2 mb-6">
          <label className="text-xs text-secondary-text font-semibold uppercase tracking-wider block ml-1 flex items-center gap-2">
            <FaFileAlt className="text-success" />
            <span>Select Resume</span>
          </label>

          {resumeLoading ? (
            <div className="p-4 bg-white/5 border border-border-custom rounded-2xl text-secondary-text text-sm animate-pulse">
              Loading resumes...
            </div>
          ) : (
            <select
              value={selectedResume}
              onChange={(e) => setSelectedResume(e.target.value)}
              className="w-full p-4 rounded-2xl glass-input text-white focus:outline-none text-sm cursor-pointer"
            >
              <option value="" className="bg-[#0B1120] text-secondary-text">Choose Resume</option>
              {resumes.map((resume) => (
                <option key={resume.id} value={resume.id} className="bg-[#0B1120] text-white">
                  {resume.title}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Job Role */}
        <div className="space-y-2 mb-8">
          <label className="text-xs text-secondary-text font-semibold uppercase tracking-wider block ml-1 flex items-center gap-2">
            <FaUserTie className="text-success" />
            <span>Target Job Role</span>
          </label>

          <input
            type="text"
            list="roles"
            value={jobRole}
            onChange={(e) => setJobRole(e.target.value)}
            placeholder="Enter Job Role (e.g. Frontend Developer)"
            className="w-full p-4 rounded-2xl glass-input text-white placeholder-secondary-text focus:outline-none text-sm"
          />

          <datalist id="roles">
            {roles.map((role) => (
              <option key={role} value={role} />
            ))}
          </datalist>
        </div>

        {/* Start Button */}
        <motion.button
          whileHover={!loading ? {
            scale: 1.02,
            y: -1,
          } : {}}
          whileTap={!loading ? {
            scale: 0.98,
          } : {}}
          onClick={startInterview}
          disabled={loading}
          className="w-full py-4 rounded-2xl font-semibold text-white bg-gradient-to-r from-accent to-accent-hover shadow-lg shadow-accent/25 hover:shadow-accent/40 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex justify-center items-center gap-2.5 transition-all duration-200 text-base"
        >
          {loading ? (
            <>
              <FaSpinner className="animate-spin text-white" size={18} />
              <span>Creating Mock Session...</span>
            </>
          ) : (
            <>
              <FaPlay fill="currentColor" size={14} />
              <span>Start Interview</span>
            </>
          )}
        </motion.button>

        {/* Note info */}
        <div className="mt-6 text-center text-xs text-secondary-text font-semibold leading-relaxed max-w-sm mx-auto">
          We will generate 10 custom interview questions based on your background and target position. Camera and audio access required.
        </div>
      </motion.div>
    </div>
  );
};

export default StartInterview;
