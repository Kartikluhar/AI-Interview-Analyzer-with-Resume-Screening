import { useState } from "react";
import { UserPlus } from "lucide-react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import InputField from "../components/InputField";
import LoadingButton from "../components/LoadingButton";
import AnimatedBackground from "../components/AnimatedBackground";
import { signupUser } from "../services/authService";
import toast from "react-hot-toast";

function Signup() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    password: "",
  });

  const handleSignup = async () => {
    try {
      await signupUser(form);

      toast.success("Account Created");

      navigate("/");
    } catch {
      toast.error("Signup Failed");
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
        max-w-[480px]
        glass-card
        p-8
        md:p-10
        rounded-[24px]"
      >
        <div className="flex justify-center mb-6">
          <div className="p-3.5 rounded-2xl bg-[#10B981]/10 border border-[#10B981]/20">
            <UserPlus
              size={48}
              className="text-success"
            />
          </div>
        </div>

        <h1 className="text-center text-white text-3xl font-extrabold tracking-tight">
          Create Account
        </h1>

        <p className="text-center text-secondary-text mt-2 font-medium">
          Start practicing mock interviews today
        </p>

        <div className="space-y-4 mt-8">
          <div>
            <label className="text-xs text-secondary-text font-semibold uppercase tracking-wider block mb-2 ml-1">
              Username
            </label>
            <InputField
              type="text"
              placeholder="Pick a username"
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
              Email Address
            </label>
            <InputField
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) =>
                setForm({
                  ...form,
                  email: e.target.value,
                })
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-secondary-text font-semibold uppercase tracking-wider block mb-2 ml-1">
                First Name
              </label>
              <InputField
                type="text"
                placeholder="First name"
                value={form.first_name}
                onChange={(e) =>
                  setForm({
                    ...form,
                    first_name: e.target.value,
                  })
                }
              />
            </div>

            <div>
              <label className="text-xs text-secondary-text font-semibold uppercase tracking-wider block mb-2 ml-1">
                Last Name
              </label>
              <InputField
                type="text"
                placeholder="Last name"
                value={form.last_name}
                onChange={(e) =>
                  setForm({
                    ...form,
                    last_name: e.target.value,
                  })
                }
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-secondary-text font-semibold uppercase tracking-wider block mb-2 ml-1">
              Password
            </label>
            <InputField
              type="password"
              placeholder="Choose a password"
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
              text="Create Account"
              onClick={handleSignup}
            />
          </div>
        </div>

        <p className="text-center text-secondary-text mt-6 text-sm font-medium">
          Already have an account?
          <Link
            to="/login"
            className="text-success hover:text-[#10B981]/80 font-semibold ml-2 transition-colors duration-200"
          >
            Sign In
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

export default Signup;