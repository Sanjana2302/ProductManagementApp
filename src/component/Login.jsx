import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Mail, User, ArrowRight, Store, KeyRound, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { forgotPasswordApi, resetPasswordApi } from "../api";

const slide = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

const AuthPage = () => {
  const navigate = useNavigate();
  const { login, register } = useAuth();

  // mode: "login" | "register" | "forgot" | "reset"
  const [mode, setMode] = useState("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    fullName: "", email: "", password: "", shopName: "",
    otp: "", newPassword: "",
  });

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      if (mode === "login") {
        await login(form.email, form.password);
        navigate("/dashboard");
      } else if (mode === "register") {
        await register(form.fullName, form.email, form.password, form.shopName);
        navigate("/dashboard");
      } else if (mode === "forgot") {
        await forgotPasswordApi(form.email);
        setSuccess("If that email exists, an OTP has been sent.");
        setMode("reset");
      } else if (mode === "reset") {
        await resetPasswordApi({ email: form.email, otp: form.otp, newPassword: form.newPassword });
        setSuccess("Password reset! Please login.");
        setMode("login");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const titles = {
    login: "Welcome Back",
    register: "Create Account",
    forgot: "Forgot Password",
    reset: "Reset Password",
  };

  const subtitles = {
    login: "Sign in to manage your stock",
    register: "Register your shop to get started",
    forgot: "Enter your email to receive an OTP",
    reset: "Enter the OTP and your new password",
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-orange-500/10 rounded-full blur-[120px]" />

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-md bg-zinc-900/50 border border-zinc-800 backdrop-blur-xl p-8 rounded-2xl shadow-2xl"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white tracking-tight">{titles[mode]}</h1>
          <p className="text-zinc-400 mt-2">{subtitles[mode]}</p>
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 px-4 py-3 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 text-sm">
            {success}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <AnimatePresence mode="wait">
            {mode === "register" && (
              <motion.div key="fullName" variants={slide} initial="initial" animate="animate" exit="exit" className="relative">
                <User className="absolute left-3 top-3.5 text-zinc-500" size={18} />
                <input type="text" placeholder="Full Name" value={form.fullName} onChange={set("fullName")}
                  className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:border-orange-500 transition-colors" required />
              </motion.div>
            )}
          </AnimatePresence>

          {(mode === "login" || mode === "register" || mode === "forgot" || mode === "reset") && (
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 text-zinc-500" size={18} />
              <input type="email" placeholder="Email Address" value={form.email} onChange={set("email")}
                className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:border-orange-500 transition-colors" required />
            </div>
          )}

          <AnimatePresence mode="wait">
            {mode === "register" && (
              <motion.div key="shopName" variants={slide} initial="initial" animate="animate" exit="exit" className="relative">
                <Store className="absolute left-3 top-3.5 text-zinc-500" size={18} />
                <input type="text" placeholder="Shop Name" value={form.shopName} onChange={set("shopName")}
                  className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:border-orange-500 transition-colors" required />
              </motion.div>
            )}
          </AnimatePresence>

          {(mode === "login" || mode === "register") && (
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 text-zinc-500" size={18} />
              <input type="password" placeholder="Password" value={form.password} onChange={set("password")}
                className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:border-orange-500 transition-colors" required />
            </div>
          )}

          <AnimatePresence mode="wait">
            {mode === "reset" && (
              <motion.div key="reset-fields" variants={slide} initial="initial" animate="animate" exit="exit" className="space-y-4">
                <div className="relative">
                  <KeyRound className="absolute left-3 top-3.5 text-zinc-500" size={18} />
                  <input type="text" placeholder="6-digit OTP" value={form.otp} onChange={set("otp")} maxLength={6}
                    className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:border-orange-500 transition-colors" required />
                </div>
                <div className="relative">
                  <ShieldCheck className="absolute left-3 top-3.5 text-zinc-500" size={18} />
                  <input type="password" placeholder="New Password" value={form.newPassword} onChange={set("newPassword")}
                    className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:border-orange-500 transition-colors" required />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {mode === "login" && (
            <div className="text-right">
              <button type="button" onClick={() => { setMode("forgot"); setError(""); setSuccess(""); }}
                className="text-zinc-500 hover:text-orange-400 text-xs transition-colors">
                Forgot password?
              </button>
            </div>
          )}

          <button type="submit" disabled={loading}
            className="w-full bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 group transition-all">
            {loading ? "Please wait..." : (
              <>
                {mode === "login" ? "Sign In" : mode === "register" ? "Register" : mode === "forgot" ? "Send OTP" : "Reset Password"}
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center space-y-2">
          {(mode === "login" || mode === "register") && (
            <button onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); setSuccess(""); }}
              className="text-zinc-400 hover:text-orange-400 text-sm transition-colors">
              {mode === "login" ? "Don't have an account? Sign Up" : "Already have an account? Log In"}
            </button>
          )}
          {(mode === "forgot" || mode === "reset") && (
            <button onClick={() => { setMode("login"); setError(""); setSuccess(""); }}
              className="text-zinc-400 hover:text-orange-400 text-sm transition-colors">
              ← Back to Login
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default AuthPage;
