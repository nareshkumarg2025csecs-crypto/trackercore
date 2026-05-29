import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, User, Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const mapAuthErrorToMessage = (code) => {
  switch (code) {
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Incorrect email or password. Please try again.";
    case "auth/user-not-found":
      return "No account exists with this email address.";
    case "auth/email-already-in-use":
      return "This email is already registered.";
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/weak-password":
      return "Password is too weak. Make it at least 6 characters.";
    case "auth/popup-closed-by-user":
      return "Google Sign-In was cancelled.";
    case "auth/too-many-requests":
      return "Too many failed attempts. Try again later.";
    default:
      return code ? `Error: ${code}` : "An authentication error occurred. Please try again.";
  }
};

const GoogleIcon = () => (
  <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
    <path
      fill="currentColor"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="currentColor"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="currentColor"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <path
      fill="currentColor"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </svg>
);

const Login = ({ showToast }) => {
  const navigate = useNavigate();
  const { loginWithEmail, loginWithGoogle, registerWithEmail, resetPassword } = useAuth();

  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // UI state
  const [showPassword, setShowPassword] = useState(false);

  // Password strength calculation
  const getPasswordStrength = (pass) => {
    let score = 0;
    if (!pass) return { score, color: "bg-brand-danger/20", label: "None" };
    if (pass.length >= 6) score += 1;
    if (/[a-z]/.test(pass) && /[A-Z]/.test(pass)) score += 1;
    if (/\d/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 1) return { score, color: "bg-[#ff4444]", label: "Weak" };
    if (score <= 3) return { score, color: "bg-[#ffa726]", label: "Medium" };
    return { score, color: "bg-[#00e676]", label: "Strong" };
  };

  const strength = getPasswordStrength(password);
  const passwordsMatch = !isRegister || !confirmPassword || password === confirmPassword;

  // Handle Login & Register submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isRegister) {
        if (password !== confirmPassword) {
          showToast("Passwords do not match!", "error");
          setLoading(false);
          return;
        }
        if (strength.score < 2) {
          showToast("Password is too weak!", "error");
          setLoading(false);
          return;
        }
        await registerWithEmail(name, email, password);
        showToast("Welcome to TrackerCore! 🚀", "success");
      } else {
        await loginWithEmail(email, password);
        showToast("Access Granted. Welcome back 🌐", "success");
      }
      navigate("/");
    } catch (error) {
      console.error("Auth error:", error);
      showToast(mapAuthErrorToMessage(error.code), "error");
    } finally {
      setLoading(false);
    }
  };

  // Google Sign In
  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await loginWithGoogle();
      showToast("Access Granted via Google 🌐", "success");
      navigate("/");
    } catch (error) {
      console.error("Google Auth error:", error);
      showToast(mapAuthErrorToMessage(error.code), "error");
    } finally {
      setLoading(false);
    }
  };

  // Forgot Password
  const handleForgotPassword = async () => {
    if (!email) {
      showToast("Please enter your email first.", "error");
      return;
    }
    try {
      await resetPassword(email);
      showToast("Password reset link sent to your email. Check inbox! ✉️", "success");
    } catch (error) {
      showToast(mapAuthErrorToMessage(error.code), "error");
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0f0d] flex items-center justify-center p-4">
      {/* Self-contained CSS styles for sliding underline */}
      <style>{`
        .glass-login-card {
          background: rgba(17, 26, 21, 0.75);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
        }
      `}</style>

      <div className="w-full max-w-md glass-login-card rounded-[32px] p-8 sm:p-10 space-y-8 animate-modal">
        {/* Logo and Tagline */}
        <div className="text-center space-y-1">
          <h2 className="text-3xl font-extrabold tracking-widest text-[#00e676] neon-text-glow font-heading uppercase">
            TRACKER<span className="text-[#e0ffe8]">CORE</span>
          </h2>
          <p className="text-[10px] uppercase font-mono tracking-widest text-[#e0ffe8]/40">
            Secure Personal Capital Terminal
          </p>
        </div>

        {/* Sliding Tabs */}
        <div className="relative flex bg-[#0a0f0d] border border-rgba(255,255,255,0.04) p-1 rounded-xl font-mono text-xs text-center font-bold">
          {/* Highlight indicator background slide */}
          <div
            className={`absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] bg-[#111a15] border border-[#00e676]/30 rounded-lg transition-transform duration-300 ${
              isRegister ? "translate-x-full" : "translate-x-0"
            }`}
          />
          <button
            type="button"
            onClick={() => {
              setIsRegister(false);
              setPassword("");
              setConfirmPassword("");
            }}
            className={`flex-1 py-2.5 z-10 transition-colors cursor-pointer ${
              !isRegister ? "text-[#00e676]" : "text-[#e0ffe8]/40"
            }`}
          >
            SIGN IN
          </button>
          <button
            type="button"
            onClick={() => {
              setIsRegister(true);
              setPassword("");
              setConfirmPassword("");
            }}
            className={`flex-1 py-2.5 z-10 transition-colors cursor-pointer ${
              isRegister ? "text-[#00e676]" : "text-[#e0ffe8]/40"
            }`}
          >
            REGISTER
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {isRegister && (
            <div className="space-y-1.5 font-mono">
              <label className="text-[9px] uppercase tracking-wider text-[#e0ffe8]/50">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#e0ffe8]/30" />
                <input
                  type="text"
                  required
                  placeholder="Enter full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#0a0f0d]/50 border border-rgba(255,255,255,0.08) focus:border-[#00e676]/40 focus:outline-none rounded-xl pl-10 pr-4 py-3 text-xs text-[#e0ffe8]"
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5 font-mono">
            <label className="text-[9px] uppercase tracking-wider text-[#e0ffe8]/50">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#e0ffe8]/30" />
              <input
                type="email"
                required
                placeholder="name@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#0a0f0d]/50 border border-rgba(255,255,255,0.08) focus:border-[#00e676]/40 focus:outline-none rounded-xl pl-10 pr-4 py-3 text-xs text-[#e0ffe8]"
              />
            </div>
          </div>

          <div className="space-y-1.5 font-mono">
            <label className="text-[9px] uppercase tracking-wider text-[#e0ffe8]/50">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#e0ffe8]/30" />
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="******"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#0a0f0d]/50 border border-rgba(255,255,255,0.08) focus:border-[#00e676]/40 focus:outline-none rounded-xl pl-10 pr-11 py-3 text-xs text-[#e0ffe8]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#e0ffe8]/30 hover:text-[#00e676] cursor-pointer"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            {/* Password strength indicator */}
            {isRegister && password && (
              <div className="space-y-1 mt-2">
                <div className="flex justify-between items-center text-[8px] uppercase tracking-wider text-[#e0ffe8]/40">
                  <span>Strength: {strength.label}</span>
                </div>
                <div className="h-1 w-full bg-[#0a0f0d] rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${strength.color}`}
                    style={{ width: `${(strength.score / 4) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {isRegister && (
            <div className="space-y-1.5 font-mono">
              <label className="text-[9px] uppercase tracking-wider text-[#e0ffe8]/50">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#e0ffe8]/30" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="******"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full bg-[#0a0f0d]/50 border rounded-xl pl-10 pr-4 py-3 text-xs text-[#e0ffe8] focus:outline-none ${
                    passwordsMatch
                      ? "border-rgba(255,255,255,0.08) focus:border-[#00e676]/40"
                      : "border-[#ff4444] focus:border-[#ff4444]"
                  }`}
                />
              </div>
              {!passwordsMatch && (
                <p className="text-[9px] text-[#ff4444]">Passwords do not match.</p>
              )}
            </div>
          )}

          {!isRegister && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-[9px] font-mono text-[#00e676]/80 hover:text-[#00e676] hover:underline cursor-pointer"
              >
                Forgot Password?
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !passwordsMatch}
            className="w-full py-3.5 rounded-xl bg-[#00e676] text-[#0a0f0d] font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-1.5 hover:bg-[#00e676]/90 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin text-[#0a0f0d]" />
            ) : (
              <span>{isRegister ? "Create Account" : "Access Terminal"}</span>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-rgba(255,255,255,0.04)" />
          <span className="flex-shrink mx-3 text-[8px] font-mono uppercase tracking-widest text-[#e0ffe8]/30">
            or connect with
          </span>
          <div className="flex-grow border-t border-rgba(255,255,255,0.04)" />
        </div>

        {/* Google Sign In */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full py-3 rounded-xl border border-rgba(255,255,255,0.08) hover:bg-rgba(255,255,255,0.02) text-[#e0ffe8]/80 hover:text-[#e0ffe8] font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center transition cursor-pointer disabled:opacity-50"
        >
          <GoogleIcon />
          <span>Google Console</span>
        </button>
      </div>
    </div>
  );
};

export default Login;
