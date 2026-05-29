import React, { useState, useEffect } from "react";

const STATUS_MESSAGES = [
  "Initializing ledger...",
  "Loading your data...",
  "Securing terminal connection...",
  "Loading capital reserves...",
  "Almost ready..."
];

const LoadingScreen = ({ isExiting = false }) => {
  const [statusIndex, setStatusIndex] = useState(0);
  const [fadeMsg, setFadeMsg] = useState(true);

  // Cycle status messages
  useEffect(() => {
    const messageInterval = setInterval(() => {
      setFadeMsg(false);
      setTimeout(() => {
        setStatusIndex((prev) => (prev + 1) % STATUS_MESSAGES.length);
        setFadeMsg(true);
      }, 200); // short fade out before changing text
    }, 1500);

    return () => clearInterval(messageInterval);
  }, []);

  return (
    <div
      className={`fixed inset-0 z-9999 bg-[#0a0f0d] flex flex-col items-center justify-center p-6 text-[#e0ffe8] transition-opacity duration-500 ease-in-out ${
        isExiting ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      {/* Self-contained CSS styles for typing and animations */}
      <style>{`
        @keyframes typing {
          from { width: 0 }
          to { width: 100% }
        }
        @keyframes blink-caret {
          from, to { border-color: transparent }
          50% { border-color: #00e676 }
        }
        @keyframes glow {
          from {
            box-shadow: 0 0 4px rgba(0, 230, 118, 0.2), 0 0 10px rgba(0, 230, 118, 0.1);
          }
          to {
            box-shadow: 0 0 10px rgba(0, 230, 118, 0.6), 0 0 20px rgba(0, 230, 118, 0.3);
          }
        }
        @keyframes progress {
          0% { width: 0%; }
          100% { width: 100%; }
        }
        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
        
        .typewriter-text {
          display: inline-block;
          overflow: hidden;
          border-right: 2px solid #00e676;
          white-space: nowrap;
          letter-spacing: 0.15em;
          animation: 
            typing 1.5s steps(11, end) forwards,
            blink-caret 0.75s step-end infinite;
          width: 0; /* starts at 0, animation forces to 100% */
        }
        
        .progress-bar-fill {
          height: 100%;
          background-color: #00e676;
          box-shadow: 0 0 12px #00e676, 0 0 20px rgba(0, 230, 118, 0.5);
          animation: progress 1.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }

        .crt-scanline {
          background: linear-gradient(
            to bottom,
            rgba(255,255,255,0),
            rgba(0, 230, 118, 0.03) 10%,
            rgba(255,255,255,0) 20%
          );
          animation: scanline 6s linear infinite;
        }
      `}</style>

      {/* CRT Scanline effect */}
      <div className="absolute inset-0 crt-scanline pointer-events-none z-10" />

      {/* Main Terminal Loader Box */}
      <div className="w-full max-w-sm flex flex-col items-center space-y-8 z-20 text-center">
        {/* Terminal Header */}
        <div className="flex items-center space-x-1.5 text-[10px] font-mono text-[#00e676]/40 uppercase tracking-widest">
          <span className="w-2 h-2 rounded-full bg-[#ff4444] animate-ping" />
          <span>Ledger Loader v1.0.0</span>
        </div>

        {/* Central Logo Typewriter */}
        <div className="h-12 flex items-center justify-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-widest font-heading text-[#00e676] uppercase">
            <span className="typewriter-text">TRACKERCORE</span>
          </h1>
        </div>

        {/* Dynamic Horizontal Progress Bar */}
        <div className="w-full h-1 bg-[#111a15] rounded-full border border-rgba(255,255,255,0.03) overflow-hidden relative">
          <div className="progress-bar-fill" />
        </div>

        {/* Rotating Terminal Status Lines */}
        <div className="h-6 flex items-center justify-center">
          <p
            className={`text-xs font-mono tracking-wide text-[#e0ffe8]/60 transition-opacity duration-200 ${
              fadeMsg ? "opacity-100" : "opacity-0"
            }`}
          >
            &gt; {STATUS_MESSAGES[statusIndex]}
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
