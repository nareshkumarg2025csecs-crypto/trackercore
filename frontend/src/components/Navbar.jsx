import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Receipt, BarChart3, Lightbulb, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const navItems = [
    { path: "/", label: "Dashboard", icon: Home },
    { path: "/tracker", label: "Tracker", icon: Receipt },
    { path: "/graphs", label: "Graphs", icon: BarChart3 },
    { path: "/tips", label: "Insights", icon: Lightbulb },
  ];

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-brand-accent/15 bg-brand-bg/85 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <span className="text-xl font-extrabold tracking-wider text-brand-accent neon-text-glow font-heading transition-transform group-hover:scale-105">
              TRACKER<span className="text-brand-text">CORE</span>
            </span>
          </Link>

          {/* Right side panel containing links & auth actions */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Navigation Links */}
            <div className="flex space-x-1 sm:space-x-2 md:space-x-4">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-1.5 rounded-lg px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium transition-all duration-300 ${
                      isActive
                        ? "bg-brand-accent/15 text-brand-accent border border-brand-accent/30 neon-border-glow"
                        : "text-brand-text/60 hover:bg-brand-card hover:text-brand-text border border-transparent"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span className="hidden md:inline">{item.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Operator Chip / Logout */}
            {user && (
              <div className="flex items-center space-x-2 sm:space-x-3 border-l border-brand-accent/15 pl-2 sm:pl-4">
                <div className="hidden lg:flex flex-col text-right font-mono">
                  <span className="text-[8px] uppercase tracking-widest text-brand-text/30">Operator</span>
                  <span className="text-[10px] font-bold text-brand-accent tracking-wide max-w-[100px] truncate">
                    {user.displayName || "Operator"}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="flex items-center space-x-1 sm:space-x-1.5 rounded-lg px-2 py-1.5 text-[10px] font-bold font-mono transition-all duration-300 bg-brand-danger/10 text-brand-danger border border-brand-danger/20 hover:bg-brand-danger hover:text-white cursor-pointer uppercase tracking-wider"
                  title="Disconnect ledger terminal session"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Disconnect</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
