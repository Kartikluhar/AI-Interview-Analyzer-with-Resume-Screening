import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FileText,
  Search,
  Play,
  History,
  TrendingUp,
  Target,
  Smile,
  Zap,
  Plus,
  ChevronRight,
  Brain,
  Award,
  Sparkles,
  ArrowRight
} from "lucide-react";
import API from "../services/api";
import toast from "react-hot-toast";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from "recharts";

function Dashboard() {
  const navigate = useNavigate();
  const [resumes, setResumes] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("Candidate");

  useEffect(() => {
    const storedUser = localStorage.getItem("username");
    if (storedUser) {
      setUsername(storedUser);
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const [resumesRes, interviewsRes] = await Promise.all([
          API.get("/resumes/"),
          API.get("/interviews/")
        ]);
        setResumes(resumesRes.data.data || []);
        setInterviews(interviewsRes.data.data || []);
      } catch (error) {
        console.error("Dashboard data fetch error:", error);
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const completedInterviews = interviews.filter(
    (i) => i.status?.toLowerCase() === "completed"
  );

  const averageInterviewScore =
    completedInterviews.length > 0
      ? Math.round(
          completedInterviews.reduce(
            (acc, curr) => acc + (curr.total_score || 0),
            0
          ) / completedInterviews.length
        )
      : 0;

  const averageAtsScore = resumes.length > 0 ? 84 : 0;
  
  const latestResume = resumes.length > 0 ? resumes[0] : null;
  const latestInterview = interviews.length > 0 ? interviews[0] : null;

  // Chart Data
  const scoreTrends =
    completedInterviews.length > 0
      ? completedInterviews
          .map((item, idx) => ({
            name: `Int ${idx + 1}`,
            Score: item.total_score || 0,
          }))
          .reverse()
      : [
          { name: "Mock 1", Score: 60 },
          { name: "Mock 2", Score: 68 },
          { name: "Mock 3", Score: 75 },
          { name: "Mock 4", Score: 82 },
        ];

  const coreMetrics = [
    { name: "ATS Score", value: averageAtsScore, color: "#4F46E5" },
    { name: "Interview Score", value: averageInterviewScore || 75, color: "#10B981" },
    { name: "Confidence", value: completedInterviews.length > 0 ? 88 : 70, color: "#F59E0B" },
    { name: "Eye Contact", value: completedInterviews.length > 0 ? 92 : 80, color: "#6366F1" },
  ];

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col justify-center items-center gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-accent border-t-transparent animate-spin" />
        <p className="text-secondary-text text-sm font-medium">Syncing Dashboard Data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Top Welcome Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-gradient-to-r from-accent/10 via-accent/5 to-transparent border border-accent/20 rounded-[24px] p-6 md:p-8 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-accent/5 blur-3xl rounded-full pointer-events-none" />
        <div className="space-y-2 z-10">
          <div className="flex items-center gap-2 text-accent text-sm font-semibold">
            <Sparkles size={16} />
            <span>AI Platform Active</span>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            Welcome back, {username}
          </h1>

          <p className="text-secondary-text font-medium">
            Track your interview preparation and resume performance.
          </p>
        </div>

        <Link
          to="/start-interview"
          className="z-10 flex items-center gap-2 bg-accent hover:bg-accent-hover text-white px-6 py-3.5 rounded-2xl font-semibold shadow-lg shadow-accent/25 hover:shadow-accent/40 transition-all cursor-pointer"
        >
          <Play size={18} fill="currentColor" />
          <span>Start Practice Mock</span>
        </Link>
      </div>

      {/* Grid Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Resumes Uploaded */}
        <Link
          to="/resumes"
          className="glass-card rounded-[24px] p-6 flex flex-col justify-between h-48 hover:border-accent/40 hover:shadow-lg hover:shadow-accent/5 transition-all duration-300 group cursor-pointer"
        >
          <div className="flex justify-between items-center">
            <span className="text-secondary-text font-semibold text-sm">Total Resumes Uploaded</span>
            <div className="p-3 rounded-2xl bg-white/5 border border-white/5 text-secondary-text group-hover:text-accent group-hover:border-accent/20 transition-all">
              <FileText size={20} />
            </div>
          </div>

          <div className="mt-4">
            <h2 className="text-4xl font-extrabold text-white">{resumes.length}</h2>
            <p className="text-xs text-secondary-text mt-1.5 flex items-center gap-1 group-hover:text-white transition">
              <span>View uploaded documents</span>
              <ChevronRight size={14} />
            </p>
          </div>
        </Link>

        {/* Total Resume Analyses */}
        <Link
          to="/resume-analyzer"
          className="glass-card rounded-[24px] p-6 flex flex-col justify-between h-48 hover:border-[#10B981]/40 hover:shadow-lg hover:shadow-[#10B981]/5 transition-all duration-300 group cursor-pointer"
        >
          <div className="flex justify-between items-center">
            <span className="text-secondary-text font-semibold text-sm">Total Resume Analyses</span>
            <div className="p-3 rounded-2xl bg-white/5 border border-white/5 text-secondary-text group-hover:text-[#10B981] group-hover:border-[#10B981]/20 transition-all">
              <Search size={20} />
            </div>
          </div>

          <div className="mt-4">
            <h2 className="text-4xl font-extrabold text-white">{resumes.length}</h2>
            <p className="text-xs text-secondary-text mt-1.5 flex items-center gap-1 group-hover:text-white transition">
              <span>Generate or view report</span>
              <ChevronRight size={14} />
            </p>
          </div>
        </Link>

        {/* Total Interviews Completed */}
        <Link
          to="/interviews"
          className="glass-card rounded-[24px] p-6 flex flex-col justify-between h-48 hover:border-[#F59E0B]/40 hover:shadow-lg hover:shadow-[#F59E0B]/5 transition-all duration-300 group cursor-pointer"
        >
          <div className="flex justify-between items-center">
            <span className="text-secondary-text font-semibold text-sm">Interviews Completed</span>
            <div className="p-3 rounded-2xl bg-white/5 border border-white/5 text-secondary-text group-hover:text-[#F59E0B] group-hover:border-[#F59E0B]/20 transition-all">
              <History size={20} />
            </div>
          </div>

          <div className="mt-4">
            <h2 className="text-4xl font-extrabold text-white">{completedInterviews.length}</h2>
            <p className="text-xs text-secondary-text mt-1.5 flex items-center gap-1 group-hover:text-white transition">
              <span>Check interview history</span>
              <ChevronRight size={14} />
            </p>
          </div>
        </Link>
      </div>

      {/* Performance Statistics Grid & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Recharts Performance Visualizations */}
        {/* <div className="lg:col-span-2 glass-card rounded-[24px] p-6 md:p-8 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-white">Performance Analytics</h2>
              <p className="text-xs text-secondary-text">Mock interview scores and resume ATS evaluations</p>
            </div>

            <Award className="text-accent" size={24} />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {coreMetrics.map((metric) => (
              <div key={metric.name} className="bg-primary-bg/50 border border-white/5 rounded-2xl p-4 flex flex-col justify-between">
                <span className="text-xs text-secondary-text font-semibold">{metric.name}</span>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-2xl font-extrabold text-white">{metric.value}%</span>
                  <span className="text-xs font-semibold" style={{ color: metric.color }}>★</span>
                </div>
              </div>
            ))}
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={scoreTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="scoreColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} domain={[0, 100]} tickLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    background: '#111827', 
                    borderColor: 'rgba(255, 255, 255, 0.08)',
                    borderRadius: '12px',
                    color: '#fff'
                  }} 
                />
                <Area type="monotone" dataKey="Score" stroke="#4F46E5" strokeWidth={2.5} fillOpacity={1} fill="url(#scoreColor)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div> */}

        {/* Quick Actions & Recent Activity */}
        <div className="space-y-6">
          {/* Quick Actions Panel */}
          <div className="glass-card rounded-[24px] p-6 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-secondary-text">Quick Actions</h3>
            
            <div className="grid grid-cols-2 gap-3">
              <Link 
                to="/upload-resume" 
                className="flex flex-col items-center justify-center p-4 rounded-2xl bg-primary-bg hover:bg-white/5 border border-white/5 hover:border-accent/30 transition-all text-center group cursor-pointer"
              >
                <Plus size={20} className="text-accent mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-semibold text-white">Upload Resume</span>
              </Link>

              <Link 
                to="/resume-analyzer" 
                className="flex flex-col items-center justify-center p-4 rounded-2xl bg-primary-bg hover:bg-white/5 border border-white/5 hover:border-[#10B981]/30 transition-all text-center group cursor-pointer"
              >
                <Search size={20} className="text-[#10B981] mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-semibold text-white">Analyze ATS</span>
              </Link>

              <Link 
                to="/start-interview" 
                className="flex flex-col items-center justify-center p-4 rounded-2xl bg-primary-bg hover:bg-white/5 border border-white/5 hover:border-[#F59E0B]/30 transition-all text-center group cursor-pointer"
              >
                <Play size={20} className="text-[#F59E0B] mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-semibold text-white">Mock Interview</span>
              </Link>

              <Link 
                to="/interviews" 
                className="flex flex-col items-center justify-center p-4 rounded-2xl bg-primary-bg hover:bg-white/5 border border-white/5 hover:border-[#6366F1]/30 transition-all text-center group cursor-pointer"
              >
                <History size={20} className="text-[#6366F1] mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-semibold text-white">View Reports</span>
              </Link>
            </div>
          </div>

          {/* Recent Activity List */}
          <div className="glass-card rounded-[24px] p-6 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-secondary-text">Recent Activity</h3>

            <div className="space-y-4">
              {/* Latest Resume */}
              {latestResume ? (
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5">
                  <div className="p-2 rounded-xl bg-accent/10 border border-accent/20 text-accent">
                    <FileText size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-white truncate">{latestResume.title}</p>
                    <p className="text-[10px] text-secondary-text">Uploaded {new Date(latestResume.uploaded_at).toLocaleDateString()}</p>
                  </div>
                  <Link to="/resumes" className="text-secondary-text hover:text-white">
                    <ArrowRight size={14} />
                  </Link>
                </div>
              ) : (
                <p className="text-xs text-secondary-text">No resumes uploaded yet.</p>
              )}

              {/* Latest Interview */}
              {latestInterview ? (
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5">
                  <div className="p-2 rounded-xl bg-[#10B981]/10 border border-[#10B981]/20 text-[#10B981]">
                    <Zap size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-white truncate">{latestInterview.job_role}</p>
                    <p className="text-[10px] text-secondary-text">
                      Status: <span className="capitalize text-accent font-semibold">{latestInterview.status}</span>
                    </p>
                  </div>
                  <Link 
                    to={latestInterview.status?.toLowerCase() === "completed" ? `/interviews/${latestInterview.id}/analysis` : `/interview/${latestInterview.id}`} 
                    className="text-secondary-text hover:text-white"
                  >
                    <ArrowRight size={14} />
                  </Link>
                </div>
              ) : (
                <p className="text-xs text-secondary-text">No mock interviews taken yet.</p>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

export default Dashboard;