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
  Search,
  Bell,
  MessageSquare,
  Settings,
  Plus,
  Home,
  Briefcase,
  GraduationCap,
  DollarSign,
  PiggyBank,
  Gift,
  Plane,
  Receipt,
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
      <div className="min-h-screen bg-[#EAEAEA] flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#F5F5F5] border border-[#E3E3E3] flex items-center justify-center shadow-sm">
            <Lock className="w-5 h-5 text-[#5FA0BE] animate-pulse" />
          </div>
          <span className="text-[#8B8B8B] text-xs font-mono tracking-wider">
            VERIFYING SESSION...
          </span>
        </div>
      </div>
    );
  }

  // State 2: Executive Security Login Gate
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#EAEAEA] flex flex-col items-center justify-center p-4 sm:p-6 font-sans">
        <div className="w-full max-w-[420px] bg-[#F5F5F5] rounded-[20px] shadow-[0px_4px_16px_rgba(0,0,0,0.08)] border border-[#E3E3E3] p-7 sm:p-8 animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#E3E3E3] pb-4 mb-6">
            <div className="flex items-center gap-2">
              <span className="text-[#5FA0BE] font-bold text-xl tracking-[2.4px]">DASHB</span>
              <span className="w-4 h-4 bg-[#5CA65F] rounded inline-block"></span>
              <span className="text-[#5FA0BE] font-bold text-xl tracking-[2.4px]">ARD</span>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#DCF1DD] text-[#3E7A41] text-[10px] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#5CA65F] animate-pulse" />
              PORTAL
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-base font-semibold text-[#747374] tracking-tight">
              Inpartner Admin & Deal Desk
            </h2>
            <p className="text-xs text-[#8B8B8B] mt-1 leading-relaxed">
              Enter your access PIN to inspect client consultation inquiries, RAG knowledge documents, and analytics.
            </p>
          </div>

          {loginError && (
            <div className="mb-4 p-3 bg-[#F8E0E0] border border-[#DE7E7E]/40 text-[#BE5F5F] text-xs rounded-[10px] flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-[#BE5F5F] shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="admin-access-password"
                  className="block text-[11px] font-medium uppercase tracking-wider text-[#747374]"
                >
                  Access PIN / Password
                </label>
                <span className="text-[10px] text-[#8B8B8B] font-mono">Default: inpartner2026</span>
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
                  className="w-full text-sm px-3.5 py-2.5 pr-10 rounded-[8px] border border-[#E3E3E3] bg-white text-[#747374] placeholder:text-[#B3AEAE] focus:outline-none focus:border-[#5FA0BE] transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8B8B8B] hover:text-[#747374] transition-colors p-1"
                  aria-label={showPassword ? 'Hide PIN' : 'Show PIN'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !password.trim()}
              className="w-full py-2.5 px-4 rounded-[8px] bg-[#5FA0BE] hover:bg-[#558BA4] active:scale-[0.99] text-white text-xs font-semibold tracking-wide transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer shadow-[0px_2px_4px_rgba(0,0,0,0.08)]"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  <span>Unlock Admin Portal</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-[#E3E3E3] flex items-center justify-between text-xs text-[#8B8B8B]">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-[#747374] hover:text-[#5FA0BE] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Chatbot</span>
            </Link>

            <span className="font-mono text-[10px] text-[#8B8B8B]">
              inpartner.id
            </span>
          </div>
        </div>
      </div>
    );
  }

  // State 3: Authenticated Dashboard (Exact Figma Layout Structure)
  return (
    <div className="min-h-screen bg-[#EAEAEA] text-[#747374] font-sans p-3 sm:p-5 lg:p-6 flex flex-col lg:flex-row gap-5 items-start">
      {/* ============================================================== */}
      {/* LEFT SIDEBAR (Matching width: 243px, background: #F5F5F5, radius: 20px) */}
      {/* ============================================================== */}
      <aside className="w-full lg:w-[245px] shrink-0 bg-[#F5F5F5] rounded-[20px] shadow-[0px_-2px_4px_rgba(0,0,0,0.08),0px_0px_6px_rgba(0,0,0,0.02)] border border-[#E3E3E3] p-5 flex flex-col justify-between self-stretch lg:min-h-[960px]">
        <div>
          {/* Brand Title: DASHBOARD with green square accent */}
          <div className="pb-6 border-b border-[#CFCFCF] flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-[#5FA0BE] font-bold text-xl tracking-[2.4px]">DASHB</span>
              <span className="w-4 h-4 bg-[#5CA65F] rounded inline-block mx-0.5"></span>
              <span className="text-[#5FA0BE] font-bold text-xl tracking-[2.4px]">ARD</span>
            </div>
            <button
              onClick={handleLogout}
              className="lg:hidden text-xs text-rose-500 font-semibold p-1"
            >
              Logout
            </button>
          </div>

          {/* Navigation Menu List */}
          <nav className="mt-6 space-y-2 text-sm">
            {/* Home / Overview */}
            <button
              onClick={() => setActiveTab('leads')}
              className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-[10px] text-xs font-medium transition-all text-left cursor-pointer ${
                activeTab === 'leads'
                  ? 'text-[#5FA0BE] font-semibold bg-[#EAEAEA]/70'
                  : 'text-[#747374] hover:bg-[#EAEAEA]/50'
              }`}
            >
              <div className="w-5 h-5 flex items-center justify-center">
                <Home className="w-4 h-4" />
              </div>
              <span className="tracking-[0.8px]">Home</span>
            </button>

            {/* Logistics / Advisory Leads (Active tab in snippet) */}
            <button
              onClick={() => setActiveTab('leads')}
              className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-[10px] text-xs font-semibold transition-all text-left cursor-pointer ${
                activeTab === 'leads'
                  ? 'text-[#5FA0BE] bg-[#EAEAEA]'
                  : 'text-[#747374] hover:bg-[#EAEAEA]/50'
              }`}
            >
              <div className="w-5 h-5 flex items-center justify-center">
                <Briefcase className="w-4 h-4 text-[#5FA0BE]" />
              </div>
              <span className="tracking-[0.8px] text-[#5FA0BE]">Logistics & CRM</span>
            </button>

            {/* Education / Knowledge Base */}
            <button
              onClick={() => setActiveTab('knowledge')}
              className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-[10px] text-xs font-medium transition-all text-left cursor-pointer ${
                activeTab === 'knowledge'
                  ? 'text-[#5FA0BE] font-semibold bg-[#EAEAEA]'
                  : 'text-[#747374] hover:bg-[#EAEAEA]/50'
              }`}
            >
              <div className="w-5 h-5 flex items-center justify-center">
                <GraduationCap className="w-4 h-4" />
              </div>
              <span className="tracking-[0.8px]">Education / RAG</span>
            </button>

            {/* Finance / Analytics */}
            <button
              onClick={() => setActiveTab('analytics')}
              className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-[10px] text-xs font-medium transition-all text-left cursor-pointer ${
                activeTab === 'analytics'
                  ? 'text-[#5FA0BE] font-semibold bg-[#EAEAEA]'
                  : 'text-[#747374] hover:bg-[#EAEAEA]/50'
              }`}
            >
              <div className="w-5 h-5 flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
              <span className="tracking-[0.8px]">Finance & Stats</span>
            </button>

            {/* Embed / Integrations */}
            <button
              onClick={() => setActiveTab('embed')}
              className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-[10px] text-xs font-medium transition-all text-left cursor-pointer ${
                activeTab === 'embed'
                  ? 'text-[#5FA0BE] font-semibold bg-[#EAEAEA]'
                  : 'text-[#747374] hover:bg-[#EAEAEA]/50'
              }`}
            >
              <div className="w-5 h-5 flex items-center justify-center">
                <Code2 className="w-4 h-4" />
              </div>
              <span className="tracking-[0.8px]">Embed Script</span>
            </button>

            {/* Supplementary Nav Placeholders from Figma */}
            <div className="pt-2">
              <div className="flex items-center gap-3.5 px-3.5 py-2 text-xs text-[#98939A] opacity-75">
                <PiggyBank className="w-4 h-4" />
                <span className="tracking-[0.8px]">Savings</span>
              </div>
              <div className="flex items-center gap-3.5 px-3.5 py-2 text-xs text-[#98939A] opacity-75">
                <Gift className="w-4 h-4" />
                <span className="tracking-[0.8px]">Campaigns</span>
              </div>
              <div className="flex items-center gap-3.5 px-3.5 py-2 text-xs text-[#98939A] opacity-75">
                <Plane className="w-4 h-4" />
                <span className="tracking-[0.8px]">Advisory Trips</span>
              </div>
              <div className="flex items-center gap-3.5 px-3.5 py-2 text-xs text-[#98939A] opacity-75">
                <Receipt className="w-4 h-4" />
                <span className="tracking-[0.8px]">Invoices</span>
              </div>
            </div>

            {/* + New Button */}
            <div className="pt-3">
              <button
                onClick={() => setActiveTab('leads')}
                className="w-full flex items-center gap-2 px-3.5 py-2 rounded-[5px] bg-[#EAEAEA] hover:bg-[#DFDFDF] text-[#747374] text-xs font-medium transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Inquiry</span>
              </button>
            </div>
          </nav>
        </div>

        {/* Bottom User Profile Section */}
        <div className="pt-4 border-t border-[#E3E3E3] flex items-center justify-between mt-8">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className="w-8 h-8 rounded-[5px] bg-[#DFDFDF] border border-[#D5D5D5] flex items-center justify-center text-[#747374] font-bold text-xs">
                IN
              </div>
              <span className="w-2 h-2 rounded-full bg-[#5CA65F] border border-[#95CB97] absolute -top-0.5 -right-0.5" />
            </div>
            <div>
              <div className="text-xs font-semibold text-[#747374]">Admin</div>
              <div className="text-[10px] text-[#8B8B8B]">inpartner.id</div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="text-[#8B8B8B] hover:text-[#BE5F5F] p-1.5 rounded-[5px] transition-colors cursor-pointer"
            title="Sign out"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </aside>

      {/* ============================================================== */}
      {/* RIGHT MAIN WORKSPACE */}
      {/* ============================================================== */}
      <div className="flex-1 w-full space-y-6 overflow-hidden">
        {/* Top Header Capsule Bar (Matching Figma top bar) */}
        <header className="w-full bg-[#F5F5F5] h-[63px] rounded-[10px] shadow-[0px_2px_4px_rgba(0,0,0,0.08),0px_0px_6px_rgba(0,0,0,0.02)] border border-[#E3E3E3] px-5 sm:px-6 flex items-center justify-between gap-4">
          {/* Search Input */}
          <div className="flex items-center gap-3 flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#747374]" />
            <input
              type="text"
              placeholder="Search here...."
              className="bg-transparent text-sm text-[#747374] placeholder:text-[#9E9E9E] focus:outline-none w-full tracking-[0.7px]"
            />
          </div>

          {/* Right Action Icons & Controls */}
          <div className="flex items-center gap-3 sm:gap-4 text-[#747374]">
            {currentTime && (
              <span className="hidden sm:inline-block text-xs font-mono text-[#8B8B8B] border-r border-[#747374]/30 pr-3">
                {currentTime}
              </span>
            )}

            <Link
              href="/"
              target="_blank"
              className="w-8 h-8 rounded-[5px] bg-[#F5F5F5] hover:bg-[#EAEAEA] flex items-center justify-center text-[#747374] transition-colors"
              title="Open Public Chatbot"
            >
              <ExternalLink className="w-4 h-4" />
            </Link>

            <a
              href={getWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-[5px] bg-[#F5F5F5] hover:bg-[#EAEAEA] flex items-center justify-center text-[#747374] transition-colors"
              title="Official WhatsApp"
            >
              <Phone className="w-4 h-4" />
            </a>

            <div className="w-[1px] h-5 bg-[#747374]/30 hidden sm:block" />

            <button
              onClick={handleLogout}
              className="w-8 h-8 rounded-[5px] bg-[#F5F5F5] hover:bg-[#F8E0E0] text-[#747374] hover:text-[#BE5F5F] flex items-center justify-center transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Section Heading Title matching Figma "Logistics" */}
        <div className="flex items-center justify-between px-1">
          <div>
            <h1 className="text-2xl font-normal text-[#8B8B8B] tracking-[1.44px] leading-none">
              {activeTab === 'leads' && 'Logistics & Advisory CRM'}
              {activeTab === 'analytics' && 'Performance & Analytics'}
              {activeTab === 'knowledge' && 'Education & Knowledge Base'}
              {activeTab === 'embed' && 'Integration & Embed SDK'}
            </h1>
            <p className="text-xs text-[#8B8B8B] mt-1.5">
              PT Inpartner Optima Integra • Corporate Advisory Consultation Records
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[#8B8B8B] font-mono">
              STATUS: <strong className="text-[#3E7A41]">LIVE</strong>
            </span>
          </div>
        </div>

        {/* Active Tab View */}
        <section>
          {activeTab === 'leads' && <AdminDashboard />}
          {activeTab === 'analytics' && <AnalyticsView />}
          {activeTab === 'knowledge' && <KnowledgeView />}
          {activeTab === 'embed' && <EmbedGuide />}
        </section>
      </div>
    </div>
  );
}
