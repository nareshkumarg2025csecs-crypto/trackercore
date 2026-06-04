import React, { useState, useEffect } from "react";
import { Save, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useProfile } from "../hooks/useProfile";

const ROLES = [
  "Student", "Business Owner", "Freelancer", "Homemaker", 
  "Gig Worker", "Salaried Employee", "Investor", "Other"
];

const AGE_RANGES = ["18-24", "25-34", "35-44", "45+"];
const SPENDING_CATEGORIES = ["Food", "Transport", "Shopping", "Bills", "Entertainment"];
const SAVINGS_GOALS = ["Emergency Fund", "Vacation", "Gadget", "House", "Retirement", "None"];
const FINANCIAL_HABITS = ["Spender", "Balanced", "Saver"];

const ProfilePage = ({ showToast }) => {
  const { user } = useAuth();
  const { profile, loading, updateProfile } = useProfile(user?.uid, showToast);

  const [formData, setFormData] = useState({
    username: "",
    role: "",
    ageRange: "",
    incomeRange: "",
    primarySpending: "",
    savingsGoal: "",
    financialHabit: ""
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData({
        username: profile.username || "",
        role: profile.role || "",
        ageRange: profile.ageRange || "",
        incomeRange: profile.incomeRange || "",
        primarySpending: profile.primarySpending || "",
        savingsGoal: profile.savingsGoal || "",
        financialHabit: profile.financialHabit || ""
      });
    }
  }, [profile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRoleSelect = (role) => {
    setFormData(prev => ({ ...prev, role }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateProfile(formData);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 text-brand-accent animate-spin" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 md:px-6 py-8 md:py-12 space-y-8">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-brand-text font-heading">
          Profile & AI Persona
        </h1>
        <p className="text-[10px] md:text-xs text-brand-text/50 font-mono mt-2">
          Configure your operator identity. This data is used by the AI engine to generate personalized financial insights.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* User Account Info Section */}
        <div className="glass-panel p-6 rounded-2xl border border-[rgba(255,255,255,0.06)] flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[9px] font-mono text-brand-text/40 uppercase tracking-widest">OPERATOR EMAIL</span>
            <h3 className="text-sm font-bold text-brand-text">{user?.email}</h3>
          </div>
          <div className="text-right space-y-1">
            <span className="text-[9px] font-mono text-brand-text/40 uppercase tracking-widest">OPERATOR ID</span>
            <p className="text-sm font-bold font-mono text-brand-accent tracking-wide">{user?.uid.substring(0, 8)}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] md:text-xs font-bold text-brand-text/40 uppercase tracking-wider font-heading">
                Username / Display Name
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="How should we call you?"
                className="w-full bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] rounded-xl px-4 py-3 text-sm text-brand-text focus:outline-none focus:border-brand-accent/50 transition-colors font-mono"
              />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] md:text-xs font-bold text-brand-text/40 uppercase tracking-wider font-heading">
                Primary Role
              </label>
              <div className="flex flex-wrap gap-2">
                {ROLES.map(role => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => handleRoleSelect(role)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] md:text-xs font-mono transition-all border ${
                      formData.role === role
                        ? "bg-brand-accent/10 border-brand-accent text-brand-accent font-bold shadow-[0_0_10px_rgba(0,255,136,0.15)]"
                        : "bg-[rgba(255,255,255,0.02)] border-[rgba(255,255,255,0.06)] text-brand-text/60 hover:border-brand-text/20"
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] md:text-xs font-bold text-brand-text/40 uppercase tracking-wider font-heading">
                Monthly Income Range (₹)
              </label>
              <input
                type="text"
                name="incomeRange"
                value={formData.incomeRange}
                onChange={handleChange}
                placeholder="e.g. 50,000 - 80,000"
                className="w-full bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] rounded-xl px-4 py-3 text-sm text-brand-text focus:outline-none focus:border-brand-accent/50 transition-colors font-mono"
              />
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] md:text-xs font-bold text-brand-text/40 uppercase tracking-wider font-heading">
                Age Range
              </label>
              <select
                name="ageRange"
                value={formData.ageRange}
                onChange={handleChange}
                className="w-full bg-[rgba(0,0,0,0.2)] border border-[rgba(255,255,255,0.06)] rounded-xl px-4 py-3 text-sm text-brand-text focus:outline-none focus:border-brand-accent/50 transition-colors font-mono appearance-none"
              >
                <option value="">Select Age Range</option>
                {AGE_RANGES.map(age => <option key={age} value={age}>{age}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] md:text-xs font-bold text-brand-text/40 uppercase tracking-wider font-heading">
                Primary Spending Category
              </label>
              <select
                name="primarySpending"
                value={formData.primarySpending}
                onChange={handleChange}
                className="w-full bg-[rgba(0,0,0,0.2)] border border-[rgba(255,255,255,0.06)] rounded-xl px-4 py-3 text-sm text-brand-text focus:outline-none focus:border-brand-accent/50 transition-colors font-mono appearance-none"
              >
                <option value="">Select Category</option>
                {SPENDING_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] md:text-xs font-bold text-brand-text/40 uppercase tracking-wider font-heading">
                Savings Goal
              </label>
              <select
                name="savingsGoal"
                value={formData.savingsGoal}
                onChange={handleChange}
                className="w-full bg-[rgba(0,0,0,0.2)] border border-[rgba(255,255,255,0.06)] rounded-xl px-4 py-3 text-sm text-brand-text focus:outline-none focus:border-brand-accent/50 transition-colors font-mono appearance-none"
              >
                <option value="">Select Goal</option>
                {SAVINGS_GOALS.map(goal => <option key={goal} value={goal}>{goal}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] md:text-xs font-bold text-brand-text/40 uppercase tracking-wider font-heading">
                Financial Habit
              </label>
              <select
                name="financialHabit"
                value={formData.financialHabit}
                onChange={handleChange}
                className="w-full bg-[rgba(0,0,0,0.2)] border border-[rgba(255,255,255,0.06)] rounded-xl px-4 py-3 text-sm text-brand-text focus:outline-none focus:border-brand-accent/50 transition-colors font-mono appearance-none"
              >
                <option value="">Select Habit</option>
                {FINANCIAL_HABITS.map(habit => <option key={habit} value={habit}>{habit}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-[rgba(255,255,255,0.06)] flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center space-x-2 px-6 py-3 rounded-xl bg-brand-accent text-brand-bg font-extrabold tracking-wider text-xs border border-brand-accent hover:bg-brand-accent/90 transition-all duration-200 font-heading cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            <span>SAVE CONFIGURATION</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfilePage;
