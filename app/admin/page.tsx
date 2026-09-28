'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  BarChart3,
  BookOpen,
  Code2,
  ExternalLink,
  Phone,
  ArrowLeft,
  Lock,
  ShieldCheck,
  Eye,
  EyeOff,
  LogOut,
  AlertCircle,
  KeyRound,
  Sparkles,
  CheckCircle2,
  Clock
} from 'lucide-react';
import AdminDashboard from '@/components/AdminDashboard';
import AnalyticsView from '@/components/AnalyticsView';
import KnowledgeView from '@/components/KnowledgeView';
import EmbedGuide from '@/components/EmbedGuide';
import Link from 'next/link';
import { INPARTNER_CONFIG, getWhatsAppUrl } from '@/lib/config';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'leads' | 'analytics' | 'knowledge' | 'embed'>('leads');
  const [currentTime, setCurrentTime] = useState<string>('');

  // Live Jakarta clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-US', {
          timeZone: 'Asia/Jakarta',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        }) + ' WIB'
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Check existing session on mount
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/admin/check');
        const data = await res.json();
        setIsAuthenticated(Boolean(data.authenticated));
      } catch (err) {
        console.error('Failed to verify admin session:', err);
        setIsAuthenticated(false);
      }
    }
    checkAuth();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim() || isSubmitting) return;

    setLoginError('');
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setIsAuthenticated(true);
        setPassword('');
      } else {
        setLoginError(data.error || 'The password or PIN you entered is incorrect.');
      }
    } catch (err: any) {
      setLoginError('A network error occurred while reaching the server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setIsAuthenticated(false);
    }
  };

  // State 1: Verifying authentication session
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center shadow-lg">
            <Lock className="w-5 h-5 text-[#005DAD] animate-pulse" />
          </div>
          <span className="text-slate-400 text-xs font-mono tracking-wider">
            VERIFYING ENCRYPTED SESSION...
          </span>
        </div>
      </div>
    );
  }

  // State 2: Executive Security Login Gate
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 sm:p-6 font-sans relative overflow-hidden bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px]">
        {/* Subtle Ambient Vignette */}
        <div className="absolute inset-0 bg-radial from-transparent via-slate-950/80 to-slate-950 pointer-events-none" />

        <div className="relative w-full max-w-[420px] bg-slate-900/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-800 p-7 sm:p-8 animate-in fade-in zoom-in-95 duration-200">
          {/* Official Security Header */}
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-5 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#005DAD] flex items-center justify-center font-extrabold text-white text-sm shadow-md ring-1 ring-white/20">
                IN
              </div>
              <div>
                <h1 className="font-bold text-sm tracking-tight text-white leading-tight">
                  INPARTNER OPTIMA INTEGRA
                </h1>
                <p className="text-[11px] text-slate-400 font-mono tracking-tight mt-0.5">
                  Corporate Advisory Deal Desk
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              SECURE
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-base font-semibold text-slate-100 tracking-tight">
              Administrative Access
            </h2>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Enter your corporate security PIN to inspect incoming advisory inquiries, engagement analytics, and CRM records.
            </p>
          </div>

          {loginError && (
            <div className="mb-5 p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded-xl flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="admin-access-password"
                  className="block text-[11px] font-mono uppercase tracking-wider text-slate-400"
                >
                  Access PIN / Password
                </label>
                <span className="text-[10px] text-slate-500 font-mono">Default: inpartner2026</span>
              </div>
              <div className="relative">
                <input
                  id="admin-access-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter administrator PIN..."
                  required
                  autoFocus
                  className="w-full text-sm px-3.5 py-2.5 pr-10 rounded-xl border border-slate-700 bg-slate-950/80 text-white placeholder:text-slate-500 focus:outline-none focus:border-[#005DAD] focus:ring-1 focus:ring-[#005DAD] transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors p-1"
                  aria-label={showPassword ? 'Hide PIN' : 'Show PIN'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !password.trim()}
              className="w-full py-2.5 px-4 rounded-xl bg-[#005DAD] hover:bg-[#004785] active:scale-[0.99] text-white text-xs font-semibold tracking-wide transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer shadow-sm shadow-[#005DAD]/30"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  <span>Authenticate Session</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-slate-400 hover:text-slate-200 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Portal</span>
            </Link>

            <span className="font-mono text-[10px] text-slate-500">
              HMAC-SHA256 • 7d TTL
            </span>
          </div>
        </div>
      </div>
    );
  }

  // State 3: Authenticated Sovereign Executive CRM Portal
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* Top Application Header */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
          {/* Left Brand Identity */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#005DAD] flex items-center justify-center font-bold text-white text-xs shadow-inner">
              IN
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-white tracking-tight leading-none">
                  INPARTNER
                </span>
                <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  Advisory CRM
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-tight mt-0.5 hidden sm:block">
                PT Inpartner Optima Integra • Deal Desk & Intelligence
              </p>
            </div>
          </div>

          {/* Center / Navigation Segmented Control */}
          <nav className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setActiveTab('leads')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                activeTab === 'leads'
                  ? 'bg-[#005DAD] text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Leads</span>
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                activeTab === 'analytics'
                  ? 'bg-[#005DAD] text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Analytics</span>
            </button>

            <button
              onClick={() => setActiveTab('knowledge')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                activeTab === 'knowledge'
                  ? 'bg-[#005DAD] text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Knowledge RAG</span>
              <span className="sm:hidden">RAG</span>
            </button>

            <button
              onClick={() => setActiveTab('embed')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                activeTab === 'embed'
                  ? 'bg-[#005DAD] text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Embed</span>
            </button>
          </nav>

          {/* Right Action Tools */}
          <div className="flex items-center gap-2 text-xs">
            {currentTime && (
              <span className="hidden lg:flex items-center gap-1.5 text-slate-400 font-mono text-[11px] px-2 py-1 rounded bg-slate-800/60 border border-slate-700/60">
                <Clock className="w-3 h-3 text-slate-400" />
                {currentTime}
              </span>
            )}

            <Link
              href="/"
              target="_blank"
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700/80 font-medium"
              title="Open public consultation chatbot in new tab"
            >
              <span>Chatbot View</span>
              <ExternalLink className="w-3 h-3" />
            </Link>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 hover:text-rose-200 border border-rose-500/30 transition-all font-medium cursor-pointer"
              title="Sign out of administrative session"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeTab === 'leads' && <AdminDashboard />}
        {activeTab === 'analytics' && <AnalyticsView />}
        {activeTab === 'knowledge' && <KnowledgeView />}
        {activeTab === 'embed' && <EmbedGuide />}
      </main>
    </div>
  );
}
