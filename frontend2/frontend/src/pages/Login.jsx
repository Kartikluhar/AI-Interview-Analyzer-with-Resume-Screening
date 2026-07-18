import { useState } from "react";
import { BrainCircuit } from "lucide-react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import InputField from "../components/InputField";
import LoadingButton from "../components/LoadingButton";
import AnimatedBackground from "../components/AnimatedBackground";
import { loginUser } from "../services/authService";
import toast from "react-hot-toast";

function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  const handleLogin = async () => {
    try {
      const res = await loginUser(form);

      localStorage.setItem(
        "access",
        res.data.data.access
      );

      localStorage.setItem(
        "refresh",
        res.data.data.refresh
      );
      
      localStorage.setItem(
        "username",
        res.data.data.username || form.username
      );

      toast.success("Welcome back!");
      navigate("/");
    } catch {
      toast.error("Invalid Credentials");
    }
  };

  return (
    <div className="min-h-screen bg-primary-bg flex justify-center items-center relative overflow-hidden px-4">
      <AnimatedBackground />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="
        z-10
        w-full
        max-w-[460px]
        glass-card
        p-8
        md:p-10
        rounded-[24px]"
      >
        <div className="flex justify-center mb-6">
          <div className="p-3.5 rounded-2xl bg-accent/10 border border-accent/20">
            <BrainCircuit
              size={48}
              className="text-accent"
            />
          </div>
        </div>

        <h1 className="text-center text-white text-3xl font-extrabold tracking-tight">
          Welcome Back
        </h1>

        <p className="text-center text-secondary-text mt-2 font-medium">
          Sign in to your AI Career Dashboard
        </p>

        <div className="space-y-4 mt-8">
          <div>
            <label className="text-xs text-secondary-text font-semibold uppercase tracking-wider block mb-2 ml-1">
              Username
            </label>
            <InputField
              type="text"
              placeholder="Enter your username"
              value={form.username}
              onChange={(e) =>
                setForm({
                  ...form,
                  username: e.target.value,
                })
              }
            />
          </div>

          <div>
            <label className="text-xs text-secondary-text font-semibold uppercase tracking-wider block mb-2 ml-1">
              Password
            </label>
            <InputField
              type="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={(e) =>
                setForm({
                  ...form,
                  password: e.target.value,
                })
              }
            />
          </div>

          <div className="pt-2">
            <LoadingButton
              text="Sign In"
              onClick={handleLogin}
            />
          </div>
        </div>

        <p className="text-center text-secondary-text mt-6 text-sm font-medium">
          Don't have an account?
          <Link
            to="/signup"
            className="text-accent hover:text-accent-hover font-semibold ml-2 transition-colors duration-200"
          >
            Create an Account
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

export default Login;