"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── DATA ───────────────────────────────────────────────────────────────────

const MOCK_USER = {
  name: "Priya Sharma",
  college: "IIT Madras",
  email: "priya.sharma@iitm.ac.in",
  skills: ["Social Media", "Event Mgmt", "Design", "Public Speaking"],
  points: 1340,
  rank: 4,
  streak: 12,
  tasksCompleted: 28,
  avatar: "PS",
};

const TASKS = [
  { id: 1, title: "Promote Webinar on Instagram", deadline: "Apr 28", points: 40, status: "active", category: "Social" },
  { id: 2, title: "Share Referral Link on WhatsApp", deadline: "Apr 30", points: 25, status: "active", category: "Referral" },
  { id: 3, title: "Conduct Campus Event", deadline: "May 5", points: 100, status: "active", category: "Event" },
  { id: 4, title: "Create YouTube Short", deadline: "May 10", points: 60, status: "active", category: "Content" },
];

const LEADERBOARD = [
  { rank: 1, name: "Aarav Mehta", college: "IIT Bombay", points: 2450, badge: "Elite Champion" },
  { rank: 2, name: "Divya Nair", college: "NIT Trichy", points: 2180, badge: "Gold Leader" },
  { rank: 3, name: "Karan Patel", college: "BITS Pilani", points: 1890, badge: "Gold Leader" },
  { rank: 4, name: "Priya Sharma", college: "IIT Madras", points: 1340, badge: "Silver Promoter", isMe: true },
  { rank: 5, name: "Rohan Das", college: "VIT Vellore", points: 1120, badge: "Silver Promoter" },
  { rank: 6, name: "Sneha Reddy", college: "SRM Chennai", points: 890, badge: "Bronze Ambassador" },
  { rank: 7, name: "Arjun Kumar", college: "Manipal", points: 780, badge: "Bronze Ambassador" },
  { rank: 8, name: "Meera Joshi", college: "Pune Univ.", points: 650, badge: "Bronze Ambassador" },
];

const BADGES = [
  { id: 1, icon: "🥉", title: "Bronze Ambassador", desc: "Complete your first 5 tasks", unlocked: "Mar 10, 2025", earned: true },
  { id: 2, icon: "🥈", title: "Silver Promoter", desc: "Reach 1000 points", unlocked: "Apr 1, 2025", earned: true },
  { id: 3, icon: "🥇", title: "Gold Leader", desc: "Reach 2000 points & top-5 rank", unlocked: null, earned: false },
  { id: 4, icon: "👑", title: "Elite Champion", desc: "Reach rank #1 for a month", unlocked: null, earned: false },
  { id: 5, icon: "🔥", title: "Streak Master", desc: "30-day activity streak", unlocked: null, earned: false },
  { id: 6, icon: "🎯", title: "Task Hunter", desc: "Complete 50 tasks", unlocked: null, earned: false },
  { id: 7, icon: "📢", title: "Campus Voice", desc: "Conduct 3 campus events", unlocked: null, earned: false },
  { id: 8, icon: "⚡", title: "Quick Starter", desc: "Submit within 1hr of task drop", unlocked: "Feb 20, 2025", earned: true },
];

const ACTIVITY = [
  { text: "Submitted Instagram promotion", time: "2h ago", type: "submit" },
  { text: "Earned 40 points – Webinar task", time: "3h ago", type: "points" },
  { text: "Moved to Rank #4", time: "1d ago", type: "rank" },
  { text: "Completed Referral Link task", time: "2d ago", type: "submit" },
  { text: "Started 12-day streak 🔥", time: "3d ago", type: "streak" },
];

const SUBMISSIONS = [
  { id: 1, student: "Priya Sharma", task: "Instagram Promo", college: "IIT Madras", status: "pending", proof: "instagram.com/p/xyz", time: "2h ago" },
  { id: 2, student: "Rohan Das", task: "Referral Link", college: "VIT Vellore", status: "pending", proof: "ref.link/rohan", time: "4h ago" },
  { id: 3, student: "Sneha Reddy", task: "Campus Event", college: "SRM Chennai", status: "approved", proof: "drive.google/...", time: "1d ago" },
  { id: 4, student: "Arjun Kumar", task: "YouTube Short", college: "Manipal", status: "rejected", proof: "youtu.be/abc", time: "2d ago" },
];

const AI_RECS = [
  { title: "Promote webinar on Instagram", reason: "High engagement window – post now for 3× reach", action: "Start Task" },
  { title: "Share referral link in college group", reason: "5 of your contacts haven't signed up yet", action: "Start Task" },
  { title: "Conduct campus event this week", reason: "Events near deadlines earn 20% bonus points", action: "Plan Event" },
];

const ADMIN_INSIGHTS = [
  { title: "Predicted Top Performers", value: "Aarav Mehta, Divya Nair", icon: "🏆", type: "success" },
  { title: "Inactive Ambassadors Alert", value: "14 ambassadors inactive >7 days", icon: "⚠️", type: "warning" },
  { title: "Avg. Engagement Score", value: "78.4 / 100", icon: "📊", type: "info" },
  { title: "Task Completion Rate", value: "63%  this week", icon: "✅", type: "success" },
];

const BADGE_COLORS = {
  "Elite Champion": "from-violet-500 to-purple-600",
  "Gold Leader": "from-amber-400 to-yellow-500",
  "Silver Promoter": "from-slate-400 to-gray-500",
  "Bronze Ambassador": "from-orange-700 to-amber-800",
};

const RANK_MEDALS = { 1: "🥇", 2: "🥈", 3: "🥉" };

// ─── SMALL COMPONENTS ────────────────────────────────────────────────────────

function Toast({ msg, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, []);
  return (
    <motion.div initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }}
      className="fixed bottom-6 right-6 z-50 bg-indigo-600 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-sm font-medium">
      <span>✅</span> {msg}
      <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100 text-lg leading-none">×</button>
    </motion.div>
  );
}

function StatCard({ label, value, icon, sub, color = "indigo" }) {
  const colors = {
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
    cyan: "bg-cyan-50 text-cyan-600 border-cyan-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
  };
  return (
    <motion.div whileHover={{ y: -2 }} className={`rounded-2xl border p-5 ${colors[color]} flex flex-col gap-2`}>
      <div className="text-2xl">{icon}</div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs font-semibold uppercase tracking-widest opacity-70">{label}</div>
      {sub && <div className="text-xs opacity-60">{sub}</div>}
    </motion.div>
  );
}

function SectionTitle({ children }) {
  return <h2 className="text-base font-semibold text-slate-700 mb-4">{children}</h2>;
}

function GlassCard({ children, className = "" }) {
  return (
    <div className={`bg-white/70 backdrop-blur-sm border border-white/80 rounded-2xl shadow-sm ${className}`}>
      {children}
    </div>
  );
}

function Badge({ badge }) {
  const color = BADGE_COLORS[badge] || "from-slate-400 to-slate-500";
  return (
    <span className={`inline-block text-xs font-semibold text-white bg-gradient-to-r ${color} px-2.5 py-0.5 rounded-full`}>
      {badge}
    </span>
  );
}

function StatusPill({ status }) {
  const styles = {
    pending: "bg-amber-100 text-amber-700",
    approved: "bg-emerald-100 text-emerald-700",
    rejected: "bg-red-100 text-red-700",
  };
  return <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${styles[status] || ""}`}>{status}</span>;
}

// ─── PROGRESS BAR ────────────────────────────────────────────────────────────

function ProgressBar({ value, max, color = "bg-indigo-500" }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
      <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1, ease: "easeOut" }}
        className={`h-2 rounded-full ${color}`} />
    </div>
  );
}

// ─── MINI RECHARTS CHART ─────────────────────────────────────────────────────

function MiniBarChart({ data, color = "#6366f1" }) {
  const max = Math.max(...data.map(d => d.v));
  return (
    <div className="flex items-end gap-1.5 h-20 w-full">
      {data.map((d, i) => (
        <div key={i} className="flex flex-col items-center gap-1 flex-1">
          <motion.div initial={{ height: 0 }} animate={{ height: `${(d.v / max) * 64}px` }}
            transition={{ delay: i * 0.05, duration: 0.5 }}
            style={{ background: color }} className="w-full rounded-t-md" />
          <span className="text-[9px] text-slate-400 font-medium">{d.l}</span>
        </div>
      ))}
    </div>
  );
}

// ─── SIDEBAR ─────────────────────────────────────────────────────────────────

const AMB_NAV = [
  { id: "dashboard", icon: "🏠", label: "Dashboard" },
  { id: "tasks", icon: "📋", label: "Tasks" },
  { id: "submit", icon: "📤", label: "Submit Task" },
  { id: "leaderboard", icon: "🏆", label: "Leaderboard" },
  { id: "badges", icon: "🎖️", label: "Badges" },
  { id: "profile", icon: "👤", label: "Profile" },
];

const ADMIN_NAV = [
  { id: "admin-dashboard", icon: "📊", label: "Analytics" },
  { id: "create-task", icon: "➕", label: "Create Task" },
  { id: "review", icon: "🔍", label: "Review Submissions" },
  { id: "ai-insights", icon: "🤖", label: "AI Insights" },
];

function Sidebar({ role, page, setPage, collapsed, setCollapsed }) {
  const nav = role === "admin" ? ADMIN_NAV : AMB_NAV;
  return (
    <motion.aside animate={{ width: collapsed ? 64 : 220 }} transition={{ duration: 0.25 }}
      className="h-full bg-white border-r border-slate-100 flex flex-col py-5 overflow-hidden shrink-0">
      <div className="flex items-center justify-between px-4 mb-6">
        {!collapsed && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center">
              <span className="text-white text-xs font-bold">A</span>
            </div>
            <span className="font-bold text-slate-800 text-sm">AmbassadorOS</span>
          </motion.div>
        )}
        <button onClick={() => setCollapsed(!collapsed)}
          className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 text-sm ml-auto">
          {collapsed ? "→" : "←"}
        </button>
      </div>
      <nav className="flex-1 px-2 space-y-0.5">
        {nav.map(item => (
          <button key={item.id} onClick={() => setPage(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              page === item.id
                ? "bg-indigo-50 text-indigo-700"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
            }`}>
            <span className="text-base shrink-0">{item.icon}</span>
            {!collapsed && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{item.label}</motion.span>}
          </button>
        ))}
      </nav>
      {!collapsed && (
        <div className="px-3 mt-4">
          <div className={`text-[10px] font-bold uppercase tracking-widest px-2 mb-2 ${role === "admin" ? "text-purple-400" : "text-indigo-400"}`}>
            {role === "admin" ? "Admin Mode" : "Ambassador"}
          </div>
        </div>
      )}
    </motion.aside>
  );
}

// ─── HEADER ──────────────────────────────────────────────────────────────────

function Header({ role, setRole, page, setPage, showToast }) {
  const [showDrop, setShowDrop] = useState(false);
  const [dark, setDark] = useState(false);
  const titles = {
    dashboard: "Dashboard", tasks: "My Tasks", submit: "Submit Task",
    leaderboard: "Leaderboard", badges: "Badges", profile: "Profile",
    "admin-dashboard": "Analytics", "create-task": "Create Task",
    review: "Review Submissions", "ai-insights": "AI Insights",
  };
  return (
    <header className="h-14 bg-white border-b border-slate-100 flex items-center px-5 gap-4 shrink-0">
      <h1 className="font-semibold text-slate-800 text-sm">{titles[page] || "AmbassadorOS"}</h1>
      <div className="flex-1" />
      <div className="relative">
        <input placeholder="Search…" className="text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 w-44 focus:outline-none focus:border-indigo-300 placeholder:text-slate-400" />
      </div>
      <button onClick={() => showToast("No new notifications")} className="relative w-8 h-8 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-500">
        🔔
        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
      </button>
      <button onClick={() => setDark(!dark)} className="w-8 h-8 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-500 text-sm">
        {dark ? "☀️" : "🌙"}
      </button>
      <div className="relative">
        <button onClick={() => setShowDrop(!showDrop)}
          className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-white text-xs font-bold">
          {role === "admin" ? "AD" : MOCK_USER.avatar}
        </button>
        {showDrop && (
          <div className="absolute right-0 top-10 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 w-48 z-50">
            <div className="px-3 py-2 text-xs text-slate-500">Signed in as <strong>{role === "admin" ? "Admin" : MOCK_USER.name}</strong></div>
            <hr className="border-slate-100 my-1" />
            <button onClick={() => { setRole(role === "admin" ? "ambassador" : "admin"); setPage(role === "admin" ? "dashboard" : "admin-dashboard"); setShowDrop(false); }}
              className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-xl">
              Switch to {role === "admin" ? "Ambassador" : "Admin"}
            </button>
            <button onClick={() => { setPage("profile"); setShowDrop(false); }}
              className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-xl">Profile</button>
            <button onClick={() => showToast("Logged out!")}
              className="w-full text-left px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-xl">Logout</button>
          </div>
        )}
      </div>
    </header>
  );
}

// ─── AUTH PAGES ──────────────────────────────────────────────────────────────

function AuthPage({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [role, setRole] = useState("ambassador");
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [name, setName] = useState("");

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-cyan-500 p-8 text-white">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center font-bold text-xl">A</div>
            <span className="font-bold text-xl">AmbassadorOS</span>
          </div>
          <p className="text-indigo-100 text-sm">Campus Ambassador Management Platform</p>
        </div>
        <div className="p-8">
          <div className="flex rounded-xl border border-slate-200 p-1 mb-6">
            {["login", "signup"].map(m => (
              <button key={m} onClick={() => setMode(m)}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold capitalize transition-all ${mode === m ? "bg-indigo-600 text-white shadow" : "text-slate-500"}`}>
                {m === "login" ? "Log In" : "Sign Up"}
              </button>
            ))}
          </div>
          <div className="space-y-4">
            {mode === "signup" && (
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Full Name"
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400" />
            )}
            <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="Email address"
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400" />
            <input value={pwd} onChange={e => setPwd(e.target.value)} type="password" placeholder="Password"
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400" />
            <div>
              <p className="text-xs font-semibold text-slate-500 mb-2">Role</p>
              <div className="flex gap-2">
                {["ambassador", "admin"].map(r => (
                  <button key={r} onClick={() => setRole(r)}
                    className={`flex-1 py-2.5 rounded-xl border text-sm font-semibold capitalize transition-all ${
                      role === r ? "border-indigo-500 bg-indigo-50 text-indigo-700" : "border-slate-200 text-slate-500 hover:border-slate-300"
                    }`}>
                    {r === "ambassador" ? "🎓 Ambassador" : "🛡️ Admin"}
                  </button>
                ))}
              </div>
            </div>
            <motion.button whileTap={{ scale: 0.97 }}
              onClick={() => onLogin({ mode, name, email, pwd, role })}
              className="w-full bg-gradient-to-r from-indigo-600 to-cyan-500 text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity shadow-md shadow-indigo-200">
              {mode === "login" ? "Log In" : "Create Account"}
            </motion.button>
          </div>
          <p className="text-center text-xs text-slate-400 mt-4">
            {mode === "login" ? "No account? " : "Already registered? "}
            <button onClick={() => setMode(mode === "login" ? "signup" : "login")} className="text-indigo-600 font-semibold">
              {mode === "login" ? "Sign Up" : "Log In"}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

// ─── AMBASSADOR DASHBOARD ─────────────────────────────────────────────────────

function AmbassadorDashboard({ setPage, showToast }) {
  return (
    <div className="space-y-6">
      <GlassCard className="p-5 bg-gradient-to-r from-indigo-600 to-cyan-500 border-0">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-indigo-100 text-sm">Welcome back,</p>
            <h2 className="text-white text-2xl font-bold">{user.name} 👋</h2>
            <p className="text-indigo-200 text-sm mt-1">{user.college} · {user.streak} day streak 🔥</p>
          </div>
          <div className="text-right">
            <div className="text-white/80 text-xs">Overall Progress</div>
            <div className="text-white font-bold text-2xl">{user.points} pts</div>
            <div className="mt-2 w-32"><ProgressBar value={user.points} max={2000} color="bg-white" /></div>
            <div className="text-white/60 text-xs mt-1">{2000 - user.points} to Gold Leader</div>
          </div>
        </div>
      </GlassCard>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Total Points" value={user.points} icon="⭐" color="indigo" />
        <StatCard label="Leaderboard Rank" value={`#${user.rank}`} icon="🏆" color="amber" />
        <StatCard label="Tasks Done" value={user.tasksCompleted} icon="✅" color="emerald" />
        <StatCard label="Streak Days" value={user.streak} icon="🔥" color="cyan" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-1">
          <SectionTitle>🤖 AI Recommendations</SectionTitle>
          <div className="space-y-3">
            {aiRecs.map((r, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50 to-cyan-50 border border-indigo-100 backdrop-blur-sm">
                <p className="font-semibold text-slate-800 text-sm">{r.title}</p>
                <p className="text-xs text-slate-500 mt-1">{r.reason}</p>
                <button onClick={() => { setPage("submit"); showToast("Task started!"); }}
                  className="mt-2 text-xs font-semibold text-indigo-600 hover:text-indigo-800">{r.action} →</button>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="md:col-span-2">
          <SectionTitle>📋 Active Tasks</SectionTitle>
          <div className="space-y-3">
            {tasks.map((t, i) => (
              <motion.div key={t.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                className="bg-white border border-slate-100 rounded-2xl p-4 flex items-center gap-4 hover:shadow-sm transition-shadow">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full">{t.category}</span>
                    <span className="text-xs text-slate-400">Due {t.deadline}</span>
                  </div>
                  <p className="font-semibold text-slate-800 text-sm">{t.title}</p>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-bold text-amber-500 text-sm">+{t.points} pts</div>
                  <button onClick={() => setPage("submit")}
                    className="mt-1 text-xs bg-indigo-600 text-white px-3 py-1 rounded-lg hover:bg-indigo-700 font-semibold">
                    Submit
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <div>
        <SectionTitle>📅 Recent Activity</SectionTitle>
        <GlassCard className="p-4">
          <div className="space-y-3">
            {ACTIVITY.map((a, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-indigo-400 shrink-0" />
                <div className="flex-1 text-sm text-slate-700">{a.text}</div>
                <div className="text-xs text-slate-400">{a.time}</div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

// ─── TASKS PAGE ───────────────────────────────────────────────────────────────

function TasksPage({ setPage }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{TASKS.length} active tasks</p>
        <select className="text-sm border border-slate-200 rounded-xl px-3 py-1.5 focus:outline-none">
          <option>All Categories</option><option>Social</option><option>Event</option><option>Referral</option>
        </select>
      </div>
      {TASKS.map((t, i) => (
        <motion.div key={t.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
          className="bg-white border border-slate-100 rounded-2xl p-5 hover:shadow-md transition-all">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-semibold bg-indigo-50 text-indigo-600 px-2.5 py-0.5 rounded-full">{t.category}</span>
                <span className="text-xs font-semibold bg-amber-50 text-amber-600 px-2.5 py-0.5 rounded-full">+{t.points} pts</span>
              </div>
              <h3 className="font-semibold text-slate-800">{t.title}</h3>
              <p className="text-xs text-slate-400 mt-1">Deadline: {t.deadline}</p>
              <div className="mt-3">
                <div className="flex justify-between text-xs text-slate-400 mb-1"><span>Progress</span><span>0%</span></div>
                <ProgressBar value={0} max={100} />
              </div>
            </div>
            <button onClick={() => setPage("submit")}
              className="ml-4 bg-gradient-to-r from-indigo-600 to-cyan-500 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:opacity-90 shrink-0">
              Submit
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// ─── SUBMIT PAGE ──────────────────────────────────────────────────────────────

function SubmitPage({ showToast }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ task: "", link: "", desc: "" });
  const [file, setFile] = useState(null);

  const handleSubmit = () => {
    setStep(2);
    showToast("Submission sent for review! 🎉");
  };

  if (step === 2) return (
    <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
      className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center text-4xl mb-5">✅</div>
      <h2 className="text-2xl font-bold text-slate-800 mb-2">Submitted!</h2>
      <p className="text-slate-500 text-sm mb-6">Your proof is under review. You'll be notified once approved.</p>
      <div className="flex items-center gap-2 text-sm">
        <StatusPill status="pending" />
        <span className="text-slate-400">Awaiting admin review</span>
      </div>
      <button onClick={() => setStep(0)} className="mt-8 text-indigo-600 font-semibold text-sm hover:underline">Submit another →</button>
    </motion.div>
  );

  return (
    <div className="max-w-xl space-y-5">
      <GlassCard className="p-6">
        <SectionTitle>Task Details</SectionTitle>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-500 mb-1 block">Select Task</label>
            <select value={form.task} onChange={e => setForm({ ...form, task: e.target.value })}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400">
              <option value="">Choose a task…</option>
              {TASKS.map(t => <option key={t.id} value={t.id}>{t.title} (+{t.points} pts)</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 mb-1 block">Referral / Post Link</label>
            <input value={form.link} onChange={e => setForm({ ...form, link: e.target.value })} placeholder="https://…"
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 mb-1 block">Description</label>
            <textarea value={form.desc} onChange={e => setForm({ ...form, desc: e.target.value })} rows={3}
              placeholder="Describe what you did…"
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400 resize-none" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 mb-2 block">Upload Screenshot</label>
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl py-8 cursor-pointer hover:border-indigo-300 hover:bg-indigo-50 transition-all">
              <span className="text-3xl mb-2">📸</span>
              <span className="text-sm text-slate-500">{file ? file.name : "Click to upload or drag & drop"}</span>
              <span className="text-xs text-slate-400 mt-1">PNG, JPG, PDF up to 10MB</span>
              <input type="file" className="hidden" onChange={e => setFile(e.target.files[0])} />
            </label>
          </div>
          <motion.button whileTap={{ scale: 0.97 }} onClick={handleSubmit}
            className="w-full bg-gradient-to-r from-indigo-600 to-cyan-500 text-white font-semibold py-3 rounded-xl hover:opacity-90 shadow-md shadow-indigo-200">
            Submit Proof 🚀
          </motion.button>
        </div>
      </GlassCard>

      <GlassCard className="p-5">
        <SectionTitle>My Submission History</SectionTitle>
        <div className="space-y-2">
          {[
            { task: "Instagram Promo", status: "approved", pts: 40 },
            { task: "Referral Link", status: "approved", pts: 25 },
            { task: "YouTube Short", status: "pending", pts: 60 },
          ].map((s, i) => (
            <div key={i} className="flex items-center gap-3 text-sm">
              <StatusPill status={s.status} />
              <span className="flex-1 text-slate-700">{s.task}</span>
              <span className="text-amber-600 font-semibold">+{s.pts}</span>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}

// ─── LEADERBOARD ──────────────────────────────────────────────────────────────

function LeaderboardPage() {
  const [filter, setFilter] = useState("all");
  return (
    <div className="space-y-5">
      <div className="flex gap-2 flex-wrap">
        {["all", "week", "month", "campus"].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-xl text-sm font-semibold capitalize transition-all ${
              filter === f ? "bg-indigo-600 text-white" : "bg-white border border-slate-200 text-slate-500 hover:border-indigo-200"
            }`}>
            {f === "all" ? "All Time" : f === "campus" ? "By Campus" : `This ${f.charAt(0).toUpperCase() + f.slice(1)}`}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        {leaderboard.slice(0, 3).map((a, i) => (
          <motion.div key={a.rank} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className={`rounded-2xl p-5 text-center border ${
              i === 0 ? "bg-gradient-to-b from-amber-50 to-yellow-50 border-amber-200"
              : i === 1 ? "bg-gradient-to-b from-slate-50 to-gray-50 border-slate-200"
              : "bg-gradient-to-b from-orange-50 to-amber-50 border-orange-200"
            }`}>
            <div className="text-3xl mb-1">{RANK_MEDALS[a.rank]}</div>
            <div className="font-bold text-slate-800 text-sm">{a.name}</div>
            <div className="text-xs text-slate-500">{a.college}</div>
            <div className="font-bold text-indigo-600 mt-2">{a.points.toLocaleString()} pts</div>
            <div className="mt-2"><Badge badge={a.badge} /></div>
          </motion.div>
        ))}
      </div>

      <GlassCard className="overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="bg-slate-50 border-b border-slate-100">
            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Rank</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Ambassador</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">College</th>
            <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500">Points</th>
            <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500">Badge</th>
          </tr></thead>
          <tbody>
            {leaderboard.map((a, i) => (
              <motion.tr key={a.rank} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                className={`border-b border-slate-50 hover:bg-indigo-50/50 transition-colors ${a.isMe ? "bg-indigo-50" : ""}`}>
                <td className="px-4 py-3 font-bold text-slate-600">{RANK_MEDALS[a.rank] || `#${a.rank}`}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-400 to-cyan-400 flex items-center justify-center text-white text-xs font-bold">
                      {a.name.split(" ").map(n => n[0]).join("")}
                    </div>
                    <span className={`font-semibold ${a.isMe ? "text-indigo-700" : "text-slate-800"}`}>
                      {a.name} {a.isMe && <span className="text-xs font-normal text-indigo-400">(You)</span>}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-500 text-xs">{a.college}</td>
                <td className="px-4 py-3 text-right font-bold text-indigo-600">{a.points.toLocaleString()}</td>
                <td className="px-4 py-3 text-right"><Badge badge={a.badge} /></td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </GlassCard>
    </div>
  );
}

// ─── BADGES PAGE ──────────────────────────────────────────────────────────────

function BadgesPage() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-500">{badges.filter(b => b.earned).length} of {badges.length} badges unlocked</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {badges.map((b, i) => (
          <motion.div key={b.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
            className={`rounded-2xl border p-5 text-center transition-all ${
              b.earned
                ? "bg-white border-slate-100 hover:shadow-md"
                : "bg-slate-50 border-dashed border-slate-200 opacity-50 blur-[0.5px]"
            }`}>
            <div className={`text-4xl mb-3 ${!b.earned ? "grayscale" : ""}`}>{b.icon}</div>
            <div className="font-bold text-slate-800 text-sm mb-1">{b.title}</div>
            <div className="text-xs text-slate-500 mb-2">{b.desc}</div>
            {b.earned
              ? <div className="text-xs text-emerald-600 font-semibold">✓ {b.unlocked}</div>
              : <div className="text-xs text-slate-400">🔒 Locked</div>}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ─── PROFILE PAGE ─────────────────────────────────────────────────────────────

function ProfilePage({ showToast }) {
  const [editing, setEditing] = useState(false);
  return (
    <div className="max-w-2xl space-y-5">
      <GlassCard className="p-6">
        <div className="flex items-start gap-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-white text-xl font-bold shrink-0">
            {MOCK_USER.avatar}
          </div>
          <div className="flex-1">
            <h2 className="font-bold text-slate-800 text-xl">{MOCK_USER.name}</h2>
            <p className="text-slate-500 text-sm">{MOCK_USER.college}</p>
            <p className="text-slate-400 text-sm">{MOCK_USER.email}</p>
            <div className="flex flex-wrap gap-2 mt-3">
              {MOCK_USER.skills.map(s => (
                <span key={s} className="text-xs bg-indigo-50 text-indigo-600 font-semibold px-2.5 py-1 rounded-lg">{s}</span>
              ))}
            </div>
          </div>
          <button onClick={() => { setEditing(!editing); if (editing) showToast("Profile saved!"); }}
            className="text-sm font-semibold text-indigo-600 border border-indigo-200 px-4 py-2 rounded-xl hover:bg-indigo-50 transition-colors shrink-0">
            {editing ? "Save" : "Edit Profile"}
          </button>
        </div>
      </GlassCard>

      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Total Points" value={MOCK_USER.points} icon="⭐" color="indigo" />
        <StatCard label="Current Rank" value={`#${MOCK_USER.rank}`} icon="🏆" color="amber" />
        <StatCard label="Tasks Done" value={MOCK_USER.tasksCompleted} icon="✅" color="emerald" />
      </div>

      <GlassCard className="p-5">
        <SectionTitle>🏅 Achievements Timeline</SectionTitle>
        <div className="space-y-4">
          {BADGES.filter(b => b.earned).map((b, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="text-2xl">{b.icon}</div>
              <div className="flex-1">
                <div className="font-semibold text-slate-800 text-sm">{b.title}</div>
                <div className="text-xs text-slate-400">{b.unlocked}</div>
              </div>
              <span className="text-xs bg-emerald-50 text-emerald-600 font-semibold px-2 py-1 rounded-full">Unlocked</span>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}

// ─── ADMIN DASHBOARD ──────────────────────────────────────────────────────────

const WEEK_DATA = [
  { l: "Mon", v: 12 }, { l: "Tue", v: 18 }, { l: "Wed", v: 9 }, { l: "Thu", v: 24 },
  { l: "Fri", v: 31 }, { l: "Sat", v: 15 }, { l: "Sun", v: 7 },
];
const MONTH_DATA = [
  { l: "W1", v: 45 }, { l: "W2", v: 62 }, { l: "W3", v: 38 }, { l: "W4", v: 71 },
];

const HEATMAP_INTENSITY = [
  [0.6, 0.5, 0.2, 0.8],
  [0.3, 0.7, 0.4, 0.6],
  [0.45, 0.55, 0.3, 0.7],
  [0.2, 0.8, 0.4, 0.5],
  [0.75, 0.35, 0.45, 0.6],
  [0.5, 0.65, 0.25, 0.4],
  [0.4, 0.55, 0.7, 0.3],
];

function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Total Ambassadors" value="247" icon="🎓" color="indigo" />
        <StatCard label="Active (7d)" value="189" icon="🟢" color="emerald" />
        <StatCard label="Tasks Completed" value="1,482" icon="✅" color="cyan" />
        <StatCard label="Engagement Rate" value="78%" icon="📈" color="amber" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <GlassCard className="p-5">
          <SectionTitle>📊 Weekly Task Completions</SectionTitle>
          <MiniBarChart data={WEEK_DATA} color="#6366f1" />
        </GlassCard>
        <GlassCard className="p-5">
          <SectionTitle>📅 Monthly Participation</SectionTitle>
          <MiniBarChart data={MONTH_DATA} color="#06b6d4" />
        </GlassCard>
      </div>

      <GlassCard className="p-5">
        <SectionTitle>🏆 Leaderboard Trend</SectionTitle>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-slate-100">
              <th className="text-left py-2 text-xs font-semibold text-slate-400">Ambassador</th>
              <th className="text-right py-2 text-xs font-semibold text-slate-400">Points</th>
              <th className="py-2 text-xs font-semibold text-slate-400 w-32">Progress</th>
            </tr></thead>
            <tbody>
              {LEADERBOARD.slice(0, 5).map((a, i) => (
                <tr key={i} className="border-b border-slate-50">
                  <td className="py-2.5 font-medium text-slate-700">{RANK_MEDALS[a.rank] || `#${a.rank}`} {a.name}</td>
                  <td className="py-2.5 text-right text-indigo-600 font-bold">{a.points.toLocaleString()}</td>
                  <td className="py-2.5 pl-4"><ProgressBar value={a.points} max={2500} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}

// ─── CREATE TASK ──────────────────────────────────────────────────────────────

function CreateTaskPage({ showToast }) {
  const [form, setForm] = useState({ title: "", desc: "", deadline: "", points: "", target: "all" });
  const handlePublish = () => {
    showToast("Task published to all ambassadors! 🚀");
    setForm({ title: "", desc: "", deadline: "", points: "", target: "all" });
  };
  return (
    <div className="max-w-xl">
      <GlassCard className="p-6">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-500 mb-1 block">Task Title</label>
            <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. Promote Summer Webinar on Instagram"
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 mb-1 block">Description</label>
            <textarea value={form.desc} onChange={e => setForm({ ...form, desc: e.target.value })} rows={3}
              placeholder="What should ambassadors do?"
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400 resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1 block">Deadline</label>
              <input type="date" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1 block">Points Reward</label>
              <input type="number" value={form.points} onChange={e => setForm({ ...form, points: e.target.value })} placeholder="e.g. 50"
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400" />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 mb-1 block">Assign To</label>
            <select value={form.target} onChange={e => setForm({ ...form, target: e.target.value })}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400">
              <option value="all">All Ambassadors</option>
              <option value="top">Top 50 Ambassadors</option>
              <option value="inactive">Inactive Ambassadors</option>
            </select>
          </div>
          {form.title && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 text-sm">
              <p className="font-semibold text-indigo-700 mb-1">Preview</p>
              <p className="text-slate-700">{form.title}</p>
              {form.points && <p className="text-amber-600 font-semibold mt-1">+{form.points} points</p>}
            </motion.div>
          )}
          <motion.button whileTap={{ scale: 0.97 }} onClick={handlePublish}
            className="w-full bg-gradient-to-r from-indigo-600 to-cyan-500 text-white font-semibold py-3 rounded-xl hover:opacity-90 shadow-md shadow-indigo-200">
            Publish Task 🚀
          </motion.button>
        </div>
      </GlassCard>
    </div>
  );
}

// ─── REVIEW SUBMISSIONS ───────────────────────────────────────────────────────

function ReviewPage({ showToast }) {
  const [subs, setSubs] = useState(submissions);
  const handle = (id, action) => {
    setSubs(s => s.map(sub => sub.id === id ? { ...sub, status: action } : sub));
    showToast(action === "approved" ? "Submission approved! Leaderboard updated ✅" : "Submission rejected ❌");
  };
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {["All", "Pending", "Approved", "Rejected"].map(f => (
          <button key={f} className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-500 hover:border-indigo-300 capitalize">
            {f}
          </button>
        ))}
      </div>
      <GlassCard className="overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="bg-slate-50 border-b border-slate-100">
            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Student</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Task</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Proof</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Status</th>
            <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500">Actions</th>
          </tr></thead>
          <tbody>
            {subs.map((s, i) => (
              <motion.tr key={s.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                className="border-b border-slate-50 hover:bg-slate-50">
                <td className="px-4 py-3">
                  <div className="font-semibold text-slate-800">{s.student}</div>
                  <div className="text-xs text-slate-400">{s.college}</div>
                </td>
                <td className="px-4 py-3 text-slate-600">{s.task}</td>
                <td className="px-4 py-3 text-indigo-500 text-xs truncate max-w-[120px]">{s.proof}</td>
                <td className="px-4 py-3"><StatusPill status={s.status} /></td>
                <td className="px-4 py-3 text-right">
                  {s.status === "pending" && (
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => handle(s.id, "approved")}
                        className="text-xs font-semibold text-emerald-600 border border-emerald-200 px-3 py-1 rounded-lg hover:bg-emerald-50">Approve</button>
                      <button onClick={() => handle(s.id, "rejected")}
                        className="text-xs font-semibold text-red-500 border border-red-200 px-3 py-1 rounded-lg hover:bg-red-50">Reject</button>
                    </div>
                  )}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </GlassCard>
    </div>
  );
}

// ─── AI INSIGHTS ──────────────────────────────────────────────────────────────

function AIInsightsPage() {
  const typeColors = {
    success: "border-emerald-100 bg-emerald-50",
    warning: "border-amber-100 bg-amber-50",
    info: "border-indigo-100 bg-indigo-50",
  };
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {adminInsights.map((ins, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className={`rounded-2xl border p-5 ${typeColors[ins.type]}`}>
            <div className="text-2xl mb-2">{ins.icon}</div>
            <div className="font-bold text-slate-800 text-sm mb-1">{ins.title}</div>
            <div className="text-slate-700 text-sm">{ins.value}</div>
          </motion.div>
        ))}
      </div>

      <GlassCard className="p-5 bg-gradient-to-br from-indigo-50 to-cyan-50 border-indigo-100">
        <SectionTitle>🤖 AI Recommendations for Admins</SectionTitle>
        <div className="space-y-3">
          {[
            "Send re-engagement nudge to 14 inactive ambassadors via email",
            "Create a bonus task for Top 10 ambassadors to maintain momentum",
            "Schedule a live leaderboard reveal event this Friday",
          ].map((r, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center font-bold shrink-0 mt-0.5">{i + 1}</div>
              <p className="text-sm text-slate-700">{r}</p>
            </div>
          ))}
        </div>
      </GlassCard>

      <GlassCard className="p-5">
        <SectionTitle>📊 Engagement Heatmap (This Week)</SectionTitle>
        <div className="grid grid-cols-7 gap-1">
          {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
            <div key={i} className="text-center">
              <div className="text-xs text-slate-400 mb-1">{d}</div>
              {[...Array(4)].map((_, j) => {
                const intensity = Math.random();
                const bg = intensity > 0.7 ? "bg-indigo-600" : intensity > 0.4 ? "bg-indigo-300" : "bg-slate-100";
                return <div key={j} className={`h-4 rounded mb-1 ${bg}`} />;
              })}
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────

export default function AmbassadorOS() {
  const [authed, setAuthed] = useState(false);
  const [role, setRole] = useState("ambassador");
  const [page, setPage] = useState("dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const [toast, setToast] = useState(null);

  // Data states
  const [user, setUser] = useState(MOCK_USER);
  const [tasks, setTasks] = useState(TASKS);
  const [leaderboard, setLeaderboard] = useState(LEADERBOARD);
  const [badges, setBadges] = useState(BADGES);
  const [activity, setActivity] = useState(ACTIVITY);
  const [submissions, setSubmissions] = useState(SUBMISSIONS);
  const [aiRecs, setAiRecs] = useState(AI_RECS);
  const [adminInsights, setAdminInsights] = useState(ADMIN_INSIGHTS);
  const [token, setToken] = useState(null);

  const showToast = (msg) => setToast(msg);
  const hideToast = () => setToast(null);

  const handleLogin = async ({ mode, name, email, pwd, role: selectedRole }) => {
    try {
      const url = mode === 'signup' ? '/api/auth/register' : '/api/auth/login';
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          password: pwd,
          role: selectedRole,
        }),
      });

      const data = await response.json();
      if (!data.success) {
        showToast(data.message || 'Authentication failed');
        return;
      }

      const userData = data.data;
      setUser(userData);
      setRole(userData.role || selectedRole);
      setPage(userData.role === 'admin' ? 'admin-dashboard' : 'dashboard');
      setToken(userData.token);
      setAuthed(true);
      showToast('Logged in successfully!');
    } catch (error) {
      console.error('Login error:', error);
      showToast('Authentication error. Please try again.');
    }
  };

  const fetchData = async () => {
    try {
      if (!token) return;

      const headers = { Authorization: `Bearer ${token}` };

      const [userRes, tasksRes, lbRes, badgesRes] = await Promise.all([
        fetch('/api/auth/profile', { headers }),
        fetch('/api/tasks/all', { headers }),
        fetch('/api/leaderboard/', { headers }),
        fetch('/api/badges/', { headers }),
      ]);

      const [userData, tasksData, lbData, badgesData] = await Promise.all([
        userRes.json(),
        tasksRes.json(),
        lbRes.json(),
        badgesRes.json(),
      ]);

      if (userData.success) setUser(userData.data);
      if (tasksData.success) setTasks(tasksData.data);
      if (lbData.success) setLeaderboard(lbData.data);
      if (badgesData.success) setBadges(badgesData.data);

      if (role === 'admin') {
        const [subRes, analyticsRes] = await Promise.all([
          fetch('/api/submissions/all', { headers }),
          fetch('/api/analytics/summary', { headers }),
        ]);

        const [subData, analyticsData] = await Promise.all([subRes.json(), analyticsRes.json()]);
        if (subData.success) setSubmissions(subData.data);
        if (analyticsData.success) setAdminInsights(analyticsData.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      showToast('Unable to load backend data.');
    }
  };

  useEffect(() => {
    if (authed && token) {
      fetchData();
    }
  }, [authed, token]);

  if (!authed) return <AuthPage onLogin={handleLogin} />;

  const renderPage = () => {
    const pages = {
      dashboard: <AmbassadorDashboard setPage={setPage} showToast={showToast} />,
      tasks: <TasksPage setPage={setPage} />,
      submit: <SubmitPage showToast={showToast} />,
      leaderboard: <LeaderboardPage />,
      badges: <BadgesPage />,
      profile: <ProfilePage showToast={showToast} />,
      "admin-dashboard": <AdminDashboard />,
      "create-task": <CreateTaskPage showToast={showToast} />,
      review: <ReviewPage showToast={showToast} />,
      "ai-insights": <AIInsightsPage />,
    };
    return pages[page] || <div className="text-slate-400 p-10 text-center">Page not found</div>;
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      <Sidebar role={role} page={page} setPage={setPage} collapsed={collapsed} setCollapsed={setCollapsed} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header role={role} setRole={setRole} page={page} setPage={setPage} showToast={showToast} />
        <main className="flex-1 overflow-y-auto p-5">
          <AnimatePresence mode="wait">
            <motion.div key={page} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}>
              {renderPage()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      <AnimatePresence>
        {toast && <Toast msg={toast} onClose={hideToast} />}
      </AnimatePresence>
    </div>
  );
}
