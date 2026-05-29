import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Receipt, BarChart3, Lightbulb, LogOut, Menu, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
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
          <Link to="/" className="flex items-center space-x-3 group shrink-0">
            <div className="relative">
              <div className="absolute -inset-1 bg-brand-accent/20 rounded-full blur-md group-hover:bg-brand-accent/40 transition-all duration-500"></div>
              <img 
                src="/unnamed.png" 
                alt="Logo" 
                className="relative h-10 w-10 sm:h-11 sm:w-11 md:h-12 md:w-12 object-contain transition-all duration-500 group-hover:scale-110 group-hover:rotate-3" 
              />
            </div>
            <span className="hidden xs:block text-lg md:text-xl font-extrabold tracking-wider text-brand-accent neon-text-glow font-heading transition-transform group-hover:scale-105">
              TRACKER<span className="text-brand-text">CORE</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="flex space-x-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-300 ${
                      isActive
                        ? "bg-brand-accent/15 text-brand-accent border border-brand-accent/30 neon-border-glow"
                        : "text-brand-text/60 hover:bg-brand-card hover:text-brand-text border border-transparent"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Operator Chip / Logout */}
            {user && (
              <div className="flex items-center space-x-3 border-l border-brand-accent/15 pl-4">
                <div className="hidden lg:flex flex-col text-right font-mono">
                  <span className="text-[8px] uppercase tracking-widest text-brand-text/30">Operator</span>
                  <span className="text-[10px] font-bold text-brand-accent tracking-wide max-w-[100px] truncate">
                    {user.displayName || "Operator"}
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
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg text-brand-text/60 hover:bg-brand-card hover:text-brand-accent transition-colors"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? "max-h-[500px] opacity-100 border-t border-brand-accent/15" : "max-h-0 opacity-0 pointer-events-none"
        }`}
      >
        <div className="px-4 py-4 space-y-2 bg-brand-bg/95 backdrop-blur-xl">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center space-x-3 rounded-lg px-4 h-[48px] text-base font-medium transition-all duration-300 ${
                  isActive
                    ? "bg-brand-accent/15 text-brand-accent border border-brand-accent/30"
                    : "text-brand-text/60 hover:bg-brand-card hover:text-brand-text border border-transparent"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}

          {user && (
            <div className="pt-4 mt-4 border-t border-brand-accent/10">
              <div className="flex items-center justify-between mb-4 px-2">
                <div className="flex flex-col font-mono text-left">
                  <span className="text-[10px] uppercase tracking-widest text-brand-text/30">Operator</span>
                  <span className="text-sm font-bold text-brand-accent tracking-wide whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">
                    {user.displayName || "Operator"}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    logout();
                  }}
                  className="flex items-center space-x-2 rounded-lg px-4 h-[48px] text-xs font-bold font-mono transition-all duration-300 bg-brand-danger/10 text-brand-danger border border-brand-danger/20 hover:bg-brand-danger hover:text-white uppercase tracking-wider"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Disconnect</span>
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
