import React, { useEffect, useState } from "react";
import API from "../services/api";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

import {
  FaSearch,
  FaClipboardList,
  FaChartBar,
  FaPlay,
  FaCalendarAlt,
  FaTrashAlt,
} from "react-icons/fa";

const InterviewList = () => {
  const [interviews, setInterviews] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInterviews();
  }, []);

  useEffect(() => {
    const data = interviews.filter((item) =>
      item.job_role.toLowerCase().includes(search.toLowerCase()),
    );

    setFiltered(data);
  }, [search, interviews]);

  const fetchInterviews = async () => {
    try {
      const res = await API.get("/interviews/");

      setInterviews(res.data.data);
      setFiltered(res.data.data);
    } catch (err) {
      toast.error("Failed to fetch interviews");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/interviews/${id}/delete/`);
      toast.success("Interview deleted successfully");
      fetchInterviews();
    } catch (err) {
      toast.error("Failed to delete interview");
    }
  };

  const badgeColor = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "bg-green-600";

      case "pending":
        return "bg-yellow-600";

      case "in_progress":
      case "in progress":
        return "bg-blue-600";

      default:
        return "bg-gray-600";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0B10] flex justify-center items-center text-cyan-400 text-2xl">
        Loading Interviews...
      </div>
    );
  }

  const badgeColorClasses = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "bg-success/10 border border-success/20 text-success";
      case "pending":
        return "bg-warning/10 border border-warning/20 text-warning";
      case "in_progress":
      case "in progress":
        return "bg-accent/10 border border-accent/20 text-accent";
      default:
        return "bg-white/5 border border-border-custom text-secondary-text";
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">My Interviews</h1>
          <p className="text-secondary-text mt-1.5 font-medium">
            View and manage your AI mock interviews.
          </p>
        </div>

        <div className="relative w-full md:w-80">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary-text" size={16} />
          <input
            type="text"
            placeholder="Search by Job Role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-2xl glass-input text-white focus:outline-none text-sm placeholder-secondary-text"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="glass-card rounded-[24px] p-12 text-center border-dashed border-2 border-accent/20">
          <FaClipboardList className="mx-auto text-48 text-secondary-text mb-4" />
          <h2 className="text-xl font-bold text-white">No Interviews Found</h2>
          <p className="text-secondary-text mt-2 font-medium max-w-sm mx-auto text-sm">
            Start your first AI mock interview session to practice your skills.
          </p>
          <button
            onClick={() => window.location.href = "/start-interview"}
            className="mt-6 px-6 py-3 bg-accent hover:bg-accent-hover text-white rounded-2xl font-semibold shadow-lg shadow-accent/20 transition-all cursor-pointer text-sm"
          >
            Start Practice Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="glass-card rounded-[24px] p-6 flex flex-col justify-between hover:border-accent/35 transition-all duration-300 hover:shadow-xl hover:shadow-black/20 group relative overflow-hidden"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h2 className="text-lg font-bold text-white">
                      {item.job_role}
                    </h2>

                    <div className="flex items-center gap-2 mt-2 text-xs font-semibold text-secondary-text">
                      <FaCalendarAlt className="text-accent" />
                      <span>
                        {new Date(item.started_at).toLocaleDateString([], {
                          year: "numeric",
                          month: "short",
                          day: "numeric"
                        })}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`px-3.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${badgeColorClasses(
                      item.status,
                    )}`}
                  >
                    {item.status}
                  </span>
                </div>

                <div className="flex gap-3 pt-4 border-t border-border-custom items-center">
                  {item.status.toLowerCase() === "completed" ? (
                    <Link
                      to={`/interviews/${item.id}/analysis`}
                      className="flex-1 bg-accent hover:bg-accent-hover text-white text-center py-3 rounded-2xl font-semibold flex justify-center items-center gap-2 transition-all text-sm shadow-md shadow-accent/15 cursor-pointer"
                    >
                      <FaChartBar size={14} />
                      <span>View Performance Report</span>
                    </Link>
                  ) : (
                    <Link
                      to={`/interview/${item.id}`}
                      className="flex-1 bg-success hover:bg-success/90 text-white text-center py-3 rounded-2xl font-semibold flex justify-center items-center gap-2 transition-all text-sm shadow-md shadow-success/15 cursor-pointer"
                    >
                      <FaPlay size={12} fill="currentColor" />
                      <span>Continue Mock Session</span>
                    </Link>
                  )}
                  
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-3 rounded-2xl bg-white/5 border border-border-custom hover:bg-danger/10 text-secondary-text hover:text-danger hover:border-danger/25 transition-all duration-200 cursor-pointer"
                    title="Delete Interview"
                  >
                    <FaTrashAlt size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer stats */}
      <div className="pt-4 border-t border-border-custom text-center text-xs font-semibold text-secondary-text">
        Total Mock Sessions Taken:{" "}
        <span className="text-accent font-extrabold">{filtered.length}</span>
      </div>
    </div>
  );
};

export default InterviewList;
