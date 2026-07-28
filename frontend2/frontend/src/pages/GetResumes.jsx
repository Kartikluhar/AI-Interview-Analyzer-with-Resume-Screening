import React, { useEffect, useState } from "react";
import API from "../services/api";
import toast from "react-hot-toast";
import {
  FiFileText,
  FiExternalLink,
  FiRefreshCw,
  FiSearch,
  FiTrash2,
  FiCalendar,
} from "react-icons/fi";

const GetResumes = () => {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchResumes = async () => {
    try {
      setLoading(true);
      const response = await API.get("/resumes/");
      setResumes(response.data.data || []);
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Failed to fetch resumes");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (resume_id) => {
    try {
      await API.delete(`/resumes/${resume_id}/delete/`);
      toast.success("Resume deleted successfully");
      fetchResumes();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to delete resume");
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  const filteredResumes = resumes.filter((resume) =>
    resume.title.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-8">
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            My Resumes
          </h1>
          <p className="text-secondary-text mt-1.5 font-medium">
            Manage, search, and review your uploaded resume documents.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Search Box */}
          <div className="relative flex-1 md:w-80">
            <FiSearch
              className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary-text"
              size={18}
            />
            <input
              type="text"
              placeholder="Search resume title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-2xl glass-input text-white focus:outline-none text-sm placeholder-secondary-text"
            />
          </div>

          <button
            onClick={fetchResumes}
            className="flex items-center justify-center p-3.5 rounded-2xl bg-white/5 border border-border-custom hover:bg-white/10 hover:text-white text-secondary-text transition-all duration-200 cursor-pointer"
            title="Refresh list"
          >
            <FiRefreshCw
              className={`${loading ? "animate-spin" : ""}`}
              size={18}
            />
          </button>
        </div>
      </div>

      {/* Main Content */}
      {loading ? (
        <div className="min-h-[40vh] flex flex-col justify-center items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-accent border-t-transparent animate-spin" />
          <p className="text-secondary-text text-sm font-medium">
            Loading Resumes...
          </p>
        </div>
      ) : filteredResumes.length === 0 ? (
        <div className="glass-card rounded-[24px] p-12 text-center border-dashed border-2 border-accent/20">
          <FiFileText size={48} className="mx-auto text-secondary-text mb-4" />
          <h2 className="text-xl font-bold text-white">
            {search ? "No matches found" : "No Resumes Found"}
          </h2>
          <p className="text-secondary-text mt-2 font-medium max-w-sm mx-auto text-sm">
            {search
              ? "Try adjusting your search keywords to find your uploaded resume."
              : "Upload your first resume document to get started with ATS analysis."}
          </p>
          {!search && (
            <button
              onClick={() => (window.location.href = "/upload-resume")}
              className="mt-6 px-6 py-3 bg-accent hover:bg-accent-hover text-white rounded-2xl font-semibold shadow-lg shadow-accent/20 transition-all cursor-pointer"
            >
              Upload Now
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResumes.map((resume) => (
            <div
              key={resume.id}
              className="glass-card rounded-[24px] p-6 flex flex-col justify-between hover:border-accent/35 transition-all duration-300 hover:shadow-xl hover:shadow-black/20 group relative overflow-hidden"
            >
              <div className="space-y-4">
                {/* Card Title Header (Fixed Flex Layout) */}
                <div className="flex justify-between items-start gap-3 w-full">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="p-3 bg-accent/10 border border-accent/20 rounded-2xl text-accent shrink-0">
                      <FiFileText size={20} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h2
                        className="text-base font-bold text-white truncate w-full"
                        title={resume.title}
                      >
                        {resume.title}
                      </h2>
                      <span className="text-xs font-semibold text-secondary-text block truncate">
                        PDF / Document
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDelete(resume.id)}
                    className="p-2.5 rounded-xl bg-white/0 hover:bg-danger/10 text-secondary-text hover:text-danger border border-transparent hover:border-danger/10 transition-all duration-200 cursor-pointer shrink-0"
                    title="Delete resume"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>

                {/* Uploaded Timestamp */}
                <div className="flex items-center gap-2 text-xs font-semibold text-secondary-text bg-white/5 border border-border-custom rounded-xl p-3">
                  <FiCalendar size={14} className="text-accent shrink-0" />
                  <span className="truncate">
                    {new Date(resume.uploaded_at).toLocaleString([], {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>

                {/* Extracted Text Area */}
                <div>
                  <label className="text-[10px] text-secondary-text font-bold uppercase tracking-wider block mb-2">
                    Extracted Text Snippet
                  </label>
                  <div className="bg-primary-bg/50 border border-border-custom rounded-2xl p-4 text-xs font-medium text-secondary-text max-h-40 overflow-y-auto leading-relaxed scrollbar-thin">
                    {resume.text ? (
                      resume.text.length > 300 ? (
                        resume.text.substring(0, 300) + "..."
                      ) : (
                        resume.text
                      )
                    ) : (
                      <span className="italic">No text content parsed.</span>
                    )}
                  </div>
                </div>
              </div>

              {/* View Document Action */}
              <div className="mt-6 pt-4 border-t border-border-custom">
                <a
                  href={
                    resume.file.startsWith("http")
                      ? resume.file
                      : `http://localhost:8000${resume.file}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-white/5 hover:bg-accent border border-border-custom hover:border-accent text-white font-semibold transition-all duration-200 text-sm cursor-pointer"
                >
                  <FiExternalLink size={16} />
                  <span>View Document</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GetResumes;
