import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Brain,
  Search,
  Play,
  History,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Sparkles
} from "lucide-react";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { logoutUser } from "../services/authService";
import toast from "react-hot-toast";

function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMedium, setIsMedium] = useState(false);
  const [username, setUsername] = useState("User");

  useEffect(() => {
    const access = localStorage.getItem("access");
    if (!access) {
      navigate("/login");
    } else {
      const storedUser = localStorage.getItem("username");
      if (storedUser) {
        setUsername(storedUser);
      }
    }
  }, [navigate, location]);

  useEffect(() => {
    const handleResize = () => {
      setIsMedium(window.innerWidth >= 768 && window.innerWidth < 1024);
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = async () => {
    try {
      const refresh = localStorage.getItem("refresh");
      if (refresh) {
        await logoutUser(refresh);
      }
    } catch (err) {
      console.error("Logout failed", err);
    } finally {
      localStorage.clear();
      toast.success("Logged out successfully");
      navigate("/login");
    }
  };

  const navItems = [
    { name: "Dashboard", path: "/", icon: LayoutDashboard },
    { name: "Resume", path: "/resumes", icon: FileText },
    { name: "Resume Analysis", path: "/resume-analyzer", icon: Search },
    { name: "Interview", path: "/start-interview", icon: Play },
    { name: "Interview Report", path: "/interviews", icon: History },
    { name: "Resume Analysis List", path: "/resumes/analysis", icon: History },
  ];

  const isActive = (path) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  const showPlaceholder = (type) => {
    toast.success(`${type} module coming soon!`, {
      icon: "✨",
      style: {
        background: "#111827",
        color: "#fff",
        border: "1px solid rgba(255, 255, 255, 0.08)",
      }
    });
  };

  const sidebarContent = (
    <div className="flex flex-col h-full justify-between py-6">
      <div className="space-y-6 px-4">
        {/* Navigation List */}
        <nav className="space-y-2">
          {navItems.map((item) => {
            const active = isActive(item.path);
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300 relative group cursor-pointer ${
                  active
                    ? "bg-accent text-white shadow-lg shadow-accent/20"
                    : "text-secondary-text hover:text-white hover:bg-white/5"
                }`}
              >
                {/* Left Indicator bar */}
                {active && (
                  <span className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-white rounded-r" />
                )}
                <Icon size={20} className={`${active ? "text-white" : "text-secondary-text group-hover:text-white"}`} />
                <span className={`font-medium transition-all ${isMedium ? "hidden" : "block"}`}>
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="space-y-2 px-4 border-t border-border-custom pt-6">
        {/* <button
          onClick={() => showPlaceholder("Profile")}
          className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-secondary-text hover:text-white hover:bg-white/5 transition-all cursor-pointer"
        >
          <User size={20} />
          <span className={`font-medium ${isMedium ? "hidden" : "block"}`}>Profile</span>
        </button>

        <button
          onClick={() => showPlaceholder("Settings")}
          className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-secondary-text hover:text-white hover:bg-white/5 transition-all cursor-pointer"
        >
          <Settings size={20} />
          <span className={`font-medium ${isMedium ? "hidden" : "block"}`}>Settings</span>
        </button> */}

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-danger hover:bg-danger/10 transition-all cursor-pointer"
        >
          <LogOut size={20} />
          <span className={`font-medium ${isMedium ? "hidden" : "block"}`}>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-primary-bg text-white flex flex-col">
      {/* Top Navbar */}
      <header className="fixed top-0 left-0 right-0 h-16 glass-panel border-b border-border-custom z-50 px-4 md:px-8 flex justify-between items-center">
        {/* Left Section */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 hover:bg-white/5 rounded-xl transition"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          
          <Link to="/" className="flex items-center gap-2 group">
            <div className="p-2 rounded-xl bg-accent/10 border border-accent/20 group-hover:border-accent/50 transition">
              <Brain className="text-accent" size={24} />
            </div>
            <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-white via-white to-secondary-text bg-clip-text text-transparent">
              AI Interview Analyzer
            </span>
          </Link>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {/* <button
            onClick={() => showPlaceholder("Notifications")}
            className="p-2.5 rounded-xl hover:bg-white/5 border border-transparent hover:border-border-custom text-secondary-text hover:text-white transition relative cursor-pointer"
          >
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-accent rounded-full" />
          </button> */}

          <div className="h-8 w-px bg-border-custom hidden sm:block" />

          {/* User Profile */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-sm font-semibold text-white">{username}</span>
              <span className="text-xs text-secondary-text">Pro Candidate</span>
            </div>
            
            <div className="relative group cursor-pointer">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-accent to-accent-hover flex items-center justify-center text-white font-bold border border-white/10 shadow-md">
                {username.charAt(0).toUpperCase()}
              </div>
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-success border-2 border-primary-bg rounded-full" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex flex-1 pt-16 relative">
        {/* Desktop Left Sidebar */}
        <aside
          className={`fixed top-16 bottom-0 left-0 bg-secondary-bg/85 backdrop-blur-md border-r border-border-custom z-30 transition-all duration-300 hidden md:block ${
            isMedium ? "w-20" : "w-64"
          }`}
        >
          {sidebarContent}
        </aside>

        {/* Mobile Sidebar Drawer */}
        {mobileMenuOpen && (
          <>
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <aside className="fixed top-16 bottom-0 left-0 w-64 bg-secondary-bg border-r border-border-custom z-50 md:hidden animate-slide-in">
              {sidebarContent}
            </aside>
          </>
        )}

        {/* Main Content Area */}
        <main
          className={`flex-1 flex flex-col min-h-[calc(100vh-4rem)] transition-all duration-300 ${
            isMedium ? "md:pl-20" : "md:pl-64"
          }`}
        >
          <div className="flex-1 p-6 md:p-10 max-w-7xl w-full mx-auto">
            <Outlet />
          </div>

          {/* Footer */}
          <footer className="border-t border-border-custom py-6 px-6 md:px-10 bg-secondary-bg/30">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-secondary-text">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-accent" />
                <span>AI Interview Analyzer</span>
              </div>
              <div className="flex items-center gap-2">
                <span>Made with React + Django</span>
                <span>•</span>
                <span>Copyright © {new Date().getFullYear()}</span>
              </div>
              <div className="flex gap-4">
                <a href="#" className="hover:text-white transition">Privacy</a>
                <a href="#" className="hover:text-white transition">Terms</a>
                <a href="#" className="hover:text-white transition flex items-center gap-1">
                  <FaGithub size={14} />
                  <span>GitHub</span>
                </a>
                <a href="#" className="hover:text-white transition flex items-center gap-1">
                  <FaLinkedin size={14} />
                  <span>LinkedIn</span>
                </a>
              </div>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}

export default Layout;
