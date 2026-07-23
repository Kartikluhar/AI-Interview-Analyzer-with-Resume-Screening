import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";
import toast from "react-hot-toast";
import {
  FiFileText,
  FiTrash2,
  FiCalendar,
  FiTarget,
  FiPlus,
  FiBarChart2,
} from "react-icons/fi";

const ResumeList = () => {
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    fetchAnalyses();
  }, []);

  const fetchAnalyses = async () => {
    try {
      setLoading(true);
      // Adjust the endpoint URL if your Django url path differs for get_all_resume_analysis
      const response = await API.get("/resumes/analysis/");
      setAnalyses(response.data.data);
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.error || "Failed to fetch analyses");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation(); // Prevents the card click (navigation) from triggering

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this analysis report?",
    );
    if (!confirmDelete) return;

    try {
      setDeletingId(id);
      // Adjust the endpoint URL if your Django url path differs for delete_resume_analysis
      await API.delete(`/resumes/analysis/${id}/delete/`);

      toast.success("Analysis deleted successfully");

      // Remove the deleted item from state
      setAnalyses((prev) => prev.filter((analysis) => analysis.id !== id));
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.error || "Failed to delete analysis");
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <FiFileText className="text-accent" />
            <span>Analysis Reports</span>
          </h1>
          <p className="text-secondary-text mt-1.5 font-medium">
            Review and manage your previously generated ATS & Resume scores.
          </p>
        </div>

        <Link
          to="/resume-analyzer" // Update to your actual analyzer route path
          className="flex items-center gap-2 px-5 py-3 rounded-2xl font-semibold text-white bg-gradient-to-r from-accent to-accent-hover shadow-lg shadow-accent/20 hover:shadow-accent/35 transition-all duration-200 text-sm"
        >
          <FiPlus size={16} />
          <span>New Analysis</span>
        </Link>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
        </div>
      ) : analyses.length === 0 ? (
        <div className="glass-card rounded-[24px] p-12 text-center flex flex-col items-center justify-center space-y-4">
          <div className="p-4 bg-white/5 rounded-full text-secondary-text">
            <FiBarChart2 size={32} />
          </div>
          <h3 className="text-xl font-bold text-white">No Reports Found</h3>
          <p className="text-secondary-text font-medium max-w-md mx-auto">
            You haven't generated any resume analyses yet. Click the "New
            Analysis" button above to get started.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {analyses.map((analysis) => (
            <div
              key={analysis.id}
              onClick={() => navigate(`/resumes/analysis/${analysis.id}`)}
              className="glass-card rounded-[24px] p-6 hover:bg-white/5 hover:border-accent/40 transition-all duration-300 cursor-pointer group flex flex-col justify-between h-full relative overflow-hidden"
            >
              {/* Subtle background glow on hover */}
              <div className="absolute right-0 top-0 w-32 h-32 bg-accent/0 group-hover:bg-accent/10 blur-3xl rounded-full transition-all duration-500 pointer-events-none" />

              <div className="space-y-5 z-10 relative">
                {/* Header of Card */}
                <div className="flex justify-between items-start gap-3">
                  <div className="space-y-1 overflow-hidden">
                    <div className="flex items-center gap-2 text-accent text-xs font-bold uppercase tracking-wider">
                      <FiTarget size={14} />
                      <span className="truncate">{analysis.job_role}</span>
                    </div>
                    {/* If you pass resume title from backend, you can display it here. Assuming standard 'Resume ID' fallback for now */}
                    <h3 className="text-lg font-bold text-white truncate">
                      {analysis.resume?.title || `Resume Profile`}
                    </h3>
                  </div>

                  <button
                    onClick={(e) => handleDelete(e, analysis.id)}
                    disabled={deletingId === analysis.id}
                    className="p-2.5 rounded-xl bg-danger/10 text-danger border border-danger/20 hover:bg-danger hover:text-white transition-colors disabled:opacity-50"
                    title="Delete Report"
                  >
                    {deletingId === analysis.id ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <FiTrash2 size={16} />
                    )}
                  </button>
                </div>

                {/* Scores Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-primary-bg/50 border border-border-custom rounded-2xl p-4 flex flex-col items-center justify-center text-center">
                    <span className="text-[10px] text-secondary-text font-bold uppercase tracking-widest mb-1">
                      ATS Match
                    </span>
                    <span className="text-2xl font-extrabold text-white">
                      {analysis.ats_score}%
                    </span>
                  </div>
                  <div className="bg-primary-bg/50 border border-border-custom rounded-2xl p-4 flex flex-col items-center justify-center text-center">
                    <span className="text-[10px] text-secondary-text font-bold uppercase tracking-widest mb-1">
                      Resume Score
                    </span>
                    <span className="text-2xl font-extrabold text-white">
                      {analysis.resume_score}%
                    </span>
                  </div>
                </div>

                {/* Footer of Card */}
                <div className="pt-2 flex items-center justify-between text-xs font-medium text-secondary-text border-t border-border-custom">
                  <div className="flex items-center gap-1.5 mt-4">
                    <FiCalendar size={14} />
                    <span>{formatDate(analysis.analysis_date)}</span>
                  </div>
                  <span className="mt-4 text-accent group-hover:underline decoration-accent underline-offset-4">
                    View Details →
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ResumeList;
