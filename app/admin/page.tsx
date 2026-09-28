'use client';

import React, { useState, useEffect } from 'react';
import {
  Lock,
  Eye,
  EyeOff,
  LogOut,
  AlertCircle,
  ExternalLink,
  Phone,
  MessageSquare,
  BookOpen,
  BarChart3,
  Code2
} from 'lucide-react';
import AdminDashboard from '@/components/AdminDashboard';
import AnalyticsView from '@/components/AnalyticsView';
import KnowledgeView from '@/components/KnowledgeView';
import EmbedGuide from '@/components/EmbedGuide';
import Link from 'next/link';
import { getWhatsAppUrl } from '@/lib/config';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'leads' | 'knowledge' | 'analytics' | 'embed'>('leads');

  // Check existing session
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/admin/check');
        const data = await res.json();
        setIsAuthenticated(Boolean(data.authenticated));
      } catch (err) {
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
        setLoginError(data.error || 'Incorrect PIN. Please enter the authorized administrator PIN.');
      }
    } catch {
      setLoginError('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
    } finally {
      setIsAuthenticated(false);
    }
  };

  // State 1: Checking session
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="w-6 h-6 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // State 2: Login Gate
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 font-sans">
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-slate-200 p-8 space-y-6">
          <div className="text-center space-y-1">
            <h1 className="text-xl font-bold tracking-tight text-[#0779D1]">Inpartner Portal</h1>
            <p className="text-xs text-slate-500">Enter access PIN to view client inquiries</p>
          </div>

          {loginError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="admin-pin" className="block text-xs font-medium text-slate-700">
                  Access PIN
                </label>
              </div>
              <div className="relative">
                <input
                  id="admin-pin"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter PIN..."
                  required
                  autoFocus
                  className="w-full text-sm px-3.5 py-2.5 pr-10 rounded-xl border border-slate-200 focus:outline-none focus:border-[#0779D1] focus:ring-2 focus:ring-[#0779D1]/20 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  aria-label={showPassword ? 'Hide PIN' : 'Show PIN'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !password.trim()}
              className="w-full py-2.5 px-4 rounded-xl bg-[#0779D1] hover:bg-[#0668b3] text-white text-xs font-semibold tracking-wide transition-all disabled:opacity-50 cursor-pointer shadow-xs"
            >
              {isSubmitting ? 'Verifying...' : 'Sign In'}
            </button>
          </form>

          <div className="pt-2 text-center">
            <Link href="/" className="text-xs text-slate-500 hover:text-slate-900 transition-colors">
              ← Back to Chatbot
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // State 3: Clean, Ultra-Simple Dashboard
  return (
    <div className="min-h-screen bg-slate-50/60 font-sans text-slate-800 flex flex-col">
      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo & Navigation Tabs */}
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <span className="font-bold text-base tracking-tight text-[#0779D1]">INPARTNER</span>
              <span className="text-[10px] font-semibold bg-[#0779D1]/10 text-[#0779D1] px-2 py-0.5 rounded-full">
                Portal
              </span>
            </div>

            {/* Navigation Tabs */}
            <nav className="hidden sm:flex items-center gap-1">
              <button
                onClick={() => setActiveTab('leads')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'leads'
                    ? 'bg-[#0779D1] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Inquiries</span>
              </button>

              <button
                onClick={() => setActiveTab('knowledge')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'knowledge'
                    ? 'bg-[#0779D1] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Knowledge</span>
              </button>

              <button
                onClick={() => setActiveTab('analytics')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'analytics'
                    ? 'bg-[#0779D1] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Analytics</span>
              </button>

              <button
                onClick={() => setActiveTab('embed')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'embed'
                    ? 'bg-[#0779D1] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>Widget</span>
              </button>
            </nav>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              className="hidden md:flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 font-medium transition-colors"
            >
              <span>Test Chatbot</span>
              <ExternalLink className="w-3 h-3" />
            </Link>

            <a
              href={getWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
            >
              <Phone className="w-3 h-3" />
              <span>Official WA</span>
            </a>

            <div className="w-[1px] h-4 bg-slate-200 hidden md:block" />

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="sm:hidden flex items-center gap-1 px-4 py-2 border-t border-slate-100 overflow-x-auto">
          {[
            { id: 'leads', label: 'Inquiries', icon: MessageSquare },
            { id: 'knowledge', label: 'Knowledge', icon: BookOpen },
            { id: 'analytics', label: 'Analytics', icon: BarChart3 },
            { id: 'embed', label: 'Widget', icon: Code2 }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1 rounded-md text-xs font-medium flex items-center gap-1 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-[#0779D1] text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-3 h-3" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex-1 w-full">
        {activeTab === 'leads' && <AdminDashboard />}
        {activeTab === 'knowledge' && <KnowledgeView />}
        {activeTab === 'analytics' && <AnalyticsView />}
        {activeTab === 'embed' && <EmbedGuide />}
      </main>
    </div>
  );
}
