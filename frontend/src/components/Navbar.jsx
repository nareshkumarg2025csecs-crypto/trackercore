import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Receipt, BarChart3, Lightbulb, LogOut, User } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useProfile } from "../hooks/useProfile";
import PillNav from "./PillNav";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();
  const { profile } = useProfile(user?.uid);

  useEffect(() => {
    setIsMenuOpen(false);
    setIsOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  const navItems = [
    { path: "/", label: "Dashboard", icon: Home },
    { path: "/tracker", label: "Tracker", icon: Receipt },
    { path: "/graphs", label: "Graphs", icon: BarChart3 },
    { path: "/tips", label: "Insights", icon: Lightbulb },
    { path: "/profile", label: "Profile", icon: User },
  ];

  return (
    <nav className="sticky top-0 z-[1000] w-full border-b border-brand-accent/15 bg-brand-bg/85 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group shrink-0">
            <div className="relative">
              <div className="absolute -inset-1 bg-brand-accent/20 rounded-full blur-md group-hover:bg-brand-accent/40 transition-all duration-500"></div>
              <img 
                src="/unnamed.png" 
                alt="Logo" 
                className="relative h-10 w-10 sm:h-11 sm:w-11 md:h-12 md:w-12 object-contain transition-all duration-500 group-hover:scale-110 group-hover:rotate-3" 
              />
            </div>
            <span className="text-lg md:text-xl font-extrabold tracking-wider text-brand-accent neon-text-glow font-heading transition-transform group-hover:scale-105">
              TRACKER<span className="text-brand-text">CORE</span>
            </span>
          </Link>

          {/* Desktop Navigation - Refactored with PillNav */}
          <div className="hidden md:flex items-center space-x-6">
            <PillNav
              items={[
                { label: 'Dashboard', href: '/' },
                { label: 'Tracker', href: '/tracker' },
                { label: 'Graphs', href: '/graphs' },
                { label: 'Insights', href: '/tips' },
                { label: 'Profile', href: '/profile' },
              ]}
              baseColor="#00FF87"
              pillColor="#09110E"
              pillTextColor="#00FF87"
              hoveredPillTextColor="#09110E"
              initialLoadAnimation={true}
            />

            {/* Operator Chip / Logout */}
            {user && (
              <div className="flex items-center space-x-3 border-l border-brand-accent/15 pl-4">
                <div className="hidden lg:flex flex-col text-right font-mono">
                  <span className="text-[8px] uppercase tracking-widest text-brand-text/30">Operator</span>
                  <span className="text-[10px] font-bold text-brand-accent tracking-wide max-w-[100px] truncate">
                    {profile?.username || user?.displayName || "Operator"}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="flex items-center space-x-1.5 rounded-lg px-2 py-1.5 text-[10px] font-bold font-mono transition-all duration-300 bg-brand-danger/10 text-brand-danger border border-brand-danger/20 hover:bg-brand-danger hover:text-white cursor-pointer uppercase tracking-wider"
                  title="Disconnect session"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Disconnect</span>
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 z-50 cursor-pointer relative w-10 h-10 flex flex-col items-center justify-center rounded-md transition-all duration-300 focus:outline-none"
              aria-label="Toggle Menu"
            >
              <div className="relative w-6 h-5">
                <span 
                  className="block h-[2px] bg-[#00e676] rounded-sm absolute left-1/2 -translate-x-1/2 transition-all duration-[0.6s] ease-[cubic-bezier(0.23,1,0.32,1)]"
                  style={{ 
                    width: '24px',
                    top: isMenuOpen ? '50%' : 'calc(50% - 7px)',
                    transform: isMenuOpen ? 'translateX(-50%) translateY(-50%) rotate(45deg)' : 'translateX(-50%) rotate(0deg)'
                  }}
                />
                <span 
                  className="block h-[2px] bg-[#00e676] rounded-sm absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 transition-all duration-[0.5s] ease-out"
                  style={{ 
                    width: isMenuOpen ? '0px' : '24px',
                    opacity: isMenuOpen ? 0 : 1,
                    transform: 'translateX(-50%) rotate(0deg)'
                  }}
                />
                <span 
                  className="block h-[2px] bg-[#00e676] rounded-sm absolute left-1/2 -translate-x-1/2 transition-all duration-[0.6s] ease-[cubic-bezier(0.23,1,0.32,1)]"
                  style={{ 
                    width: '24px',
                    top: isMenuOpen ? '50%' : 'calc(50% + 7px)',
                    transform: isMenuOpen ? 'translateX(-50%) translateY(-50%) rotate(-45deg)' : 'translateX(-50%) rotate(0deg)'
                  }}
                />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed z-[9999] md:hidden transition-all duration-700 ease-in-out ${
          isMenuOpen ? "translate-x-0 opacity-100" : "translate-x-full opacity-0 pointer-events-none"
        }`}
        style={{
          position: 'fixed',
          top: '64px',
          left: 0,
          width: '100vw',
          height: 'calc(100vh - 64px)',
          background: "#0a0f0d",
          paddingTop: '32px',
          paddingLeft: '24px',
          paddingRight: '24px',
          opacity: 1,
          overflowY: 'auto'
        }}
      >
        <div 
          className="absolute top-0 left-0 width-full h-[300px] pointer-events-none z-0"
          style={{ width: '100%', background: "radial-gradient(ellipse at 50% -20%, rgba(0,230,118,0.15) 0%, transparent 70%)" }}
        />
        
        <div className="flex flex-col h-full px-0 space-y-2 relative z-10">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <div 
                key={item.path} 
                className={index !== navItems.length - 1 ? "pb-1" : ""}
                style={{ borderBottom: index !== navItems.length - 1 ? "1px solid rgba(0,230,118,0.05)" : "none" }}
              >
                <Link
                  to={item.path}
                  className={`flex items-center space-x-4 rounded-xl px-5 py-4 text-lg font-semibold transition-all duration-300 ${
                    isActive
                      ? "text-[#00e676] bg-[#00e676]/[0.1]"
                      : "text-brand-text/70 hover:text-[#00e676] hover:bg-[#00e676]/[0.05]"
                  }`}
                  style={{ 
                    animation: isMenuOpen ? `menuLinkIn 0.4s cubic-bezier(0.23,1,0.32,1) forwards` : "none",
                    animationDelay: `${0.1 + index * 0.08}s`,
                    opacity: 0,
                    width: '100%'
                  }}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-heading tracking-wide uppercase">{item.label}</span>
                </Link>
              </div>
            );
          })}

          {user && (
            <div className="mt-auto pb-12 pt-6 border-t border-brand-accent/10 relative z-10">
              <div 
                className="flex flex-col space-y-4"
                style={{ 
                  animation: isMenuOpen ? `menuLinkIn 0.35s cubic-bezier(0.23,1,0.32,1) forwards` : "none",
                  animationDelay: `${0.05 + navItems.length * 0.05}s`,
                  opacity: 0
                }}
              >
                <div className="flex items-center space-x-4 px-2">
                  <div className="h-10 w-10 rounded-full bg-brand-accent/10 border border-brand-accent/20 flex items-center justify-center">
                    <span className="text-brand-accent font-bold">{(profile?.username || user?.displayName || "O")[0].toUpperCase()}</span>
                  </div>
                  <div className="flex flex-col font-mono text-left">
                    <span className="text-[10px] uppercase tracking-widest text-brand-text/30">Operator</span>
                    <span className="text-sm font-bold text-brand-accent tracking-wide whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px]">
                      {profile?.username || user?.displayName || "Operator"}
                    </span>
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="flex items-center justify-center space-x-3 rounded-xl px-4 py-4 w-full text-xs font-bold font-mono transition-all duration-300 bg-brand-danger/10 text-brand-danger border border-brand-danger/20 hover:bg-brand-danger hover:text-white uppercase tracking-widest"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Disconnect Session</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
