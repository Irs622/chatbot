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
  KeyRound
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

  // State 1: Loading verification
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#005DAD] flex items-center justify-center shadow-lg animate-pulse">
            <Lock className="w-6 h-6 text-white" />
          </div>
          <p className="text-slate-400 text-xs font-medium tracking-wide">
            Verifying administrative security session...
          </p>
        </div>
      </div>
    );
  }

  // State 2: Login Gate if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex flex-col items-center justify-center p-4 sm:p-6 font-sans">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* Card Header with Inpartner Blue Brand Accent */}
          <div className="bg-gradient-to-r from-[#005DAD] to-[#004785] p-6 text-white text-center relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />
            <div className="w-14 h-14 mx-auto rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 flex items-center justify-center shadow-inner mb-3">
              <KeyRound className="w-7 h-7 text-white stroke-[2.2]" />
            </div>
            <h1 className="text-xl font-extrabold tracking-tight text-white">
              Inpartner Admin & CRM
            </h1>
            <p className="text-xs text-sky-100/90 mt-1 font-normal">
              Corporate Client Inquiries & Intelligence Portal
            </p>
          </div>

          {/* Form Body */}
          <div className="p-6 sm:p-8">
            <div className="flex items-center gap-2 mb-5 p-3 rounded-2xl bg-sky-50/80 border border-sky-200/60 text-slate-700 text-xs">
              <ShieldCheck className="w-4 h-4 text-[#005DAD] shrink-0" />
              <span>This portal is restricted to authorized Inpartner management and advisory consultants.</span>
            </div>

            {loginError && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Internal Access PIN / Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter admin password..."
                    required
                    autoFocus
                    className="w-full text-sm px-4 py-3 pr-11 rounded-xl border border-slate-200 bg-slate-50/60 focus:bg-white focus:border-[#005DAD] focus:ring-3 focus:ring-[#005DAD]/15 focus:outline-none transition-all text-slate-900 placeholder:text-slate-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !password.trim()}
                className="w-full py-3 px-4 rounded-xl bg-[#005DAD] hover:bg-[#004785] active:scale-[0.99] text-white text-xs font-bold uppercase tracking-wider shadow-md hover:shadow-lg transition-all disabled:bg-slate-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Verifying Access...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Unlock CRM Dashboard</span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
              <Link
                href="/"
                className="flex items-center gap-1.5 text-slate-600 hover:text-[#005DAD] font-medium transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Chatbot</span>
              </Link>

              <span className="text-[11px] text-slate-400">
                PT Inpartner Optima Integra
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // State 3: Authenticated Admin Portal
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Top Application Header */}
      <header className="bg-slate-900 text-white px-4 sm:px-8 py-3.5 border-b border-slate-800 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-2 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-800 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Chatbot</span>
            </Link>
            <div className="w-8 h-8 rounded-lg bg-[#005DAD] flex items-center justify-center font-bold text-white text-sm shadow-inner">
              IN
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-sm tracking-tight text-white">
                  INPARTNER Admin & CRM
                </h1>
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-emerald-400/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Verified Session
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 text-xs">
            <a
              href={INPARTNER_CONFIG.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700 font-medium"
            >
              <span>inpartner.id</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <a
              href={getWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors font-medium shadow-xs"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>WA {INPARTNER_CONFIG.whatsappDisplay}</span>
            </a>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 hover:text-white border border-rose-500/30 transition-all font-medium active:scale-95 cursor-pointer"
              title="Sign out of admin session"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs Bar */}
      <div className="bg-white border-b border-slate-200 shadow-2xs sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar py-2">
          <button
            onClick={() => setActiveTab('leads')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'leads'
                ? 'bg-[#005DAD] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Leads CRM & Inquiries</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'analytics'
                ? 'bg-[#005DAD] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Analytics & KPIs</span>
          </button>

          <button
            onClick={() => setActiveTab('knowledge')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'knowledge'
                ? 'bg-[#005DAD] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Knowledge Base & RAG</span>
          </button>

          <button
            onClick={() => setActiveTab('embed')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'embed'
                ? 'bg-[#005DAD] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>Embed & Integration</span>
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      <main className="flex-1 p-4 sm:p-6 max-w-7xl mx-auto w-full">
        {activeTab === 'leads' && <AdminDashboard />}
        {activeTab === 'analytics' && <AnalyticsView />}
        {activeTab === 'knowledge' && <KnowledgeView />}
        {activeTab === 'embed' && <EmbedGuide />}
      </main>
    </div>
  );
}
