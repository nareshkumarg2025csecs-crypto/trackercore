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
  <svg className="h-5 w-5 mr-3" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <path
      fill="#EA4335"
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
    if (!pass) return { score, color: "bg-red-500/20", label: "None" };
    if (pass.length >= 6) score += 1;
    if (/[a-z]/.test(pass) && /[A-Z]/.test(pass)) score += 1;
    if (/\d/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 1) return { score, color: "bg-[#FF3333]", label: "Low" };
    if (score <= 3) return { score, color: "bg-[#FFAA33]", label: "Mid" };
    return { score, color: "bg-[#00FF88]", label: "High" };
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
          showToast("Security level too low!", "error");
          setLoading(false);
          return;
        }
        await registerWithEmail(name, email, password);
        showToast("Profile Initialized. Welcome, Operator. 🚀", "success");
      } else {
        await loginWithEmail(email, password);
        showToast("Access Granted. System Ready. 🌐", "success");
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
      showToast("External Auth Success. Welcome. 🌐", "success");
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
      showToast("Identify account via email first.", "error");
      return;
    }
    try {
      await resetPassword(email);
      showToast("Recovery signal sent to terminal. Check inbox! ✉️", "success");
    } catch (error) {
      showToast(mapAuthErrorToMessage(error.code), "error");
    }
  };

  return (
    <div className="min-h-screen bg-[#020705] flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Visual background decorations */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&family=Space+Grotesk:wght@300;400;500;700&display=swap');
        
        body {
          background-color: #020705;
          background-image: radial-gradient(circle at 50% 50%, #07110D 0%, #020705 100%);
        }
        
        .cyber-grid {
          background-image: 
            linear-gradient(rgba(0, 255, 136, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 136, 0.03) 1px, transparent 1px);
          background-size: 40px 40px;
        }

        .neon-glow-logo {
          text-shadow: 0 0 15px rgba(0, 255, 136, 0.5), 0 0 30px rgba(0, 255, 136, 0.2);
        }

        .glass-card {
          background: rgba(7, 17, 13, 0.6);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(0, 255, 136, 0.15);
          box-shadow: 0 0 40px rgba(0, 0, 0, 0.8), inset 0 0 20px rgba(0, 255, 136, 0.05);
        }

        .input-glow:focus {
          box-shadow: 0 0 12px rgba(0, 255, 136, 0.25);
          border-color: rgba(0, 255, 136, 0.5);
        }

        .font-orbitron { font-family: 'Orbitron', sans-serif; }
        .font-space { font-family: 'Space Grotesk', sans-serif; }
      `}</style>
      
      {/* Ambient background effects */}
      <div className="absolute inset-0 cyber-grid pointer-events-none opacity-40"></div>
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#00FF88]/5 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#00FF88]/5 blur-[120px] rounded-full"></div>

      <div className="w-[92%] sm:w-full max-w-[440px] glass-card rounded-[32px] p-8 sm:p-12 space-y-8 animate-modal relative z-10 overflow-hidden">
        
        {/* Top shine effect */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#00FF88]/30 to-transparent"></div>

        {/* Logo and Tagline */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl sm:text-4xl font-orbitron font-bold tracking-[0.15em] leading-tight text-white flex flex-col items-center justify-center">
            <span className="bg-gradient-to-b from-white via-white to-[#00FF88] bg-clip-text text-transparent neon-glow-logo">
              TRACKER
            </span>
            <span className="text-[#00FF88] neon-glow-logo">CORE</span>
          </h1>
          <div className="flex items-center justify-center space-x-3">
            <div className="h-[1px] w-8 bg-[#00FF88]/20"></div>
            <p className="text-[10px] sm:text-[11px] uppercase font-space font-medium tracking-[0.4em] text-[#00FF88]/40">
              SECURE CAPITAL TERMINAL
            </p>
            <div className="h-[1px] w-8 bg-[#00FF88]/20"></div>
          </div>
        </div>

        {/* Segmented Control Tabs */}
        <div className="relative flex bg-[#020705]/80 p-1.5 rounded-full border border-white/5 font-orbitron text-[10px] sm:text-xs">
          <div
            className={`absolute top-1.5 bottom-1.5 left-1.5 w-[calc(50%-3px)] bg-[#00FF88] rounded-full shadow-[0_0_15px_rgba(0,255,136,0.4)] transition-transform duration-500 ease-out ${
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
            className={`flex-1 py-3 rounded-full z-10 transition-all duration-300 font-bold uppercase tracking-widest cursor-pointer ${
              !isRegister ? "text-[#020705]" : "text-white/40 hover:text-white/60"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setIsRegister(true);
              setPassword("");
              setConfirmPassword("");
            }}
            className={`flex-1 py-3 rounded-full z-10 transition-all duration-300 font-bold uppercase tracking-widest cursor-pointer ${
              isRegister ? "text-[#020705]" : "text-white/40 hover:text-white/60"
            }`}
          >
            Register
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {isRegister && (
            <div className="space-y-2 group">
              <label className="text-[10px] font-space uppercase tracking-[0.2em] text-[#00FF88]/60 ml-1">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#00FF88]/40 transition-colors group-focus-within:text-[#00FF88]" />
                <input
                  type="text"
                  required
                  placeholder="Enter operator name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#020705]/40 border border-[#00FF88]/15 focus:outline-none rounded-2xl pl-12 pr-4 py-3.5 text-xs text-white input-glow transition-all duration-300 font-space placeholder:text-white/10"
                />
              </div>
            </div>
          )}

          <div className="space-y-2 group">
            <label className="text-[10px] font-space uppercase tracking-[0.2em] text-[#00FF88]/60 ml-1">
              Terminal Email
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#00FF88]/40 transition-colors group-focus-within:text-[#00FF88]" />
              <input
                type="email"
                required
                placeholder="id@terminal.secure"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#020705]/40 border border-[#00FF88]/15 focus:outline-none rounded-2xl pl-12 pr-4 py-3.5 text-xs text-white input-glow transition-all duration-300 font-space placeholder:text-white/10"
              />
            </div>
          </div>

          <div className="space-y-2 group">
            <div className="flex justify-between items-center ml-1">
              <label className="text-[10px] font-space uppercase tracking-[0.2em] text-[#00FF88]/60">
                Secure Password
              </label>
              {!isRegister && (
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-[9px] font-space uppercase tracking-widest text-[#00FF88]/40 hover:text-[#00FF88] transition-colors cursor-pointer"
                >
                  Forgot Key?
                </button>
              )}
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#00FF88]/40 transition-colors group-focus-within:text-[#00FF88]" />
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#020705]/40 border border-[#00FF88]/15 focus:outline-none rounded-2xl pl-12 pr-12 py-3.5 text-xs text-white input-glow transition-all duration-300 font-mono placeholder:text-white/20 tracking-widest"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-[#00FF88] transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            {/* Password strength indicator */}
            {isRegister && password && (
              <div className="space-y-1.5 mt-3 px-1">
                <div className="flex justify-between items-center text-[9px] font-space uppercase tracking-widest text-[#00FF88]/40">
                  <span>Encryption Level: {strength.label}</span>
                </div>
                <div className="h-1 w-full bg-[#020705] rounded-full overflow-hidden border border-white/5">
                  <div
                    className={`h-full transition-all duration-500 rounded-full ${strength.color} shadow-[0_0_8px_rgba(0,255,136,0.3)]`}
                    style={{ width: `${(strength.score / 4) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {isRegister && (
            <div className="space-y-2 group">
              <label className="text-[10px] font-space uppercase tracking-[0.2em] text-[#00FF88]/60 ml-1">
                Verify Key
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#00FF88]/40 transition-colors group-focus-within:text-[#00FF88]" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full bg-[#020705]/40 border rounded-2xl pl-12 pr-4 py-3.5 text-xs text-white focus:outline-none transition-all duration-300 font-mono tracking-widest placeholder:text-white/20 ${
                    passwordsMatch
                      ? "border-[#00FF88]/15 focus:border-[#00FF88]/50 input-glow"
                      : "border-red-500/50 focus:border-red-500 shadow-[0_0_12px_rgba(239,68,68,0.2)]"
                  }`}
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#00FF88] hover:bg-[#00e676] disabled:bg-[#00FF88]/40 disabled:cursor-not-allowed text-[#020705] py-4 rounded-2xl font-orbitron font-bold text-xs uppercase tracking-[0.2em] transition-all duration-500 shadow-[0_0_25px_rgba(0,255,136,0.3)] hover:shadow-[0_0_35px_rgba(0,255,136,0.5)] hover:-translate-y-1 flex items-center justify-center cursor-pointer overflow-hidden relative group"
          >
            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 slant-shine"></div>
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <span>Access Terminal</span>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/5"></div>
          </div>
          <div className="relative flex justify-center text-[9px] font-space uppercase tracking-[0.4em]">
            <span className="bg-[#07110D] px-4 text-[#00FF88]/40 py-1 rounded-full border border-white/5">
              OR CONNECT WITH
            </span>
          </div>
        </div>

        {/* Third Party Login */}
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 py-4 rounded-2xl font-orbitron font-bold text-[10px] uppercase tracking-[0.2em] transition-all duration-300 flex items-center justify-center hover:text-white hover:border-[#00FF88]/30 cursor-pointer disabled:opacity-50"
        >
          <GoogleIcon />
          Google Console
        </button>

        {/* Bottom Security Info */}
        <p className="text-[9px] text-center font-space text-white/20 tracking-widest uppercase">
          E2E Encrypted • Secure Fin-AI Node v3.0
        </p>

      </div>
    </div>
  );
};

export default Login;
