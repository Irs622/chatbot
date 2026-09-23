'use client';

import React, { useState } from 'react';
import {
  Globe,
  MessageSquare,
  Users,
  BarChart3,
  BookOpen,
  Code2,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Building2,
  Phone
} from 'lucide-react';
import WebsiteSimulator from '@/components/WebsiteSimulator';
import FullscreenChat from '@/components/FullscreenChat';
import AdminDashboard from '@/components/AdminDashboard';
import AnalyticsView from '@/components/AnalyticsView';
import KnowledgeView from '@/components/KnowledgeView';
import EmbedGuide from '@/components/EmbedGuide';

export default function Home() {
  const [activeTab, setActiveTab] = useState<
    'simulator' | 'chat' | 'leads' | 'analytics' | 'knowledge' | 'embed'
  >('simulator');

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Top Application Header */}
      <header className="bg-slate-900 text-white px-4 sm:px-8 py-3.5 border-b border-slate-800 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0d5f8a] to-[#083c5a] flex items-center justify-center font-extrabold text-amber-300 text-lg shadow-inner border border-white/20">
              IN
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-base tracking-tight text-white">
                  INPARTNER AI Assistant
                </h1>
                <span className="bg-sky-500/20 text-sky-300 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-sky-400/30">
                  PRD Compliant MVP
                </span>
              </div>
              <p className="text-xs text-slate-400">
                AI Business Consultation & Service Discovery for inpartner.id
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <a
              href="https://inpartner.id/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700 font-medium"
            >
              <span>Kunjungi inpartner.id</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <a
              href="https://wa.me/6289628310192"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors font-medium shadow-xs"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>WA 0896 2831 0192</span>
            </a>
          </div>
        </div>
      </header>

      {/* Navigation Tabs Bar */}
      <div className="bg-white border-b border-slate-200 shadow-2xs sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar py-2">
          <button
            onClick={() => setActiveTab('simulator')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'simulator'
                ? 'bg-[#0d5f8a] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>Website Simulator (inpartner.id)</span>
          </button>

          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'chat'
                ? 'bg-[#0d5f8a] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Fullscreen Assistant</span>
          </button>

          <button
            onClick={() => setActiveTab('leads')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'leads'
                ? 'bg-[#0d5f8a] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Leads CRM & Transkrip</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'analytics'
                ? 'bg-[#0d5f8a] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Analitik & KPI</span>
          </button>

          <button
            onClick={() => setActiveTab('knowledge')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'knowledge'
                ? 'bg-[#0d5f8a] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Knowledge Base & RAG</span>
          </button>

          <button
            onClick={() => setActiveTab('embed')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'embed'
                ? 'bg-[#0d5f8a] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>Panduan Embed</span>
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      <main className="flex-1">
        {activeTab === 'simulator' && <WebsiteSimulator />}

        {activeTab === 'chat' && (
          <div className="max-w-4xl mx-auto p-4 sm:p-6">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-slate-800">Fullscreen AI Business Consultation</h2>
              <p className="text-xs text-slate-500">
                Mode konsultasi penuh terfokus untuk visitor dan konsultan internal.
              </p>
            </div>
            <FullscreenChat />
          </div>
        )}

        {activeTab === 'leads' && (
          <div className="max-w-7xl mx-auto p-4 sm:p-6">
            <AdminDashboard />
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="max-w-7xl mx-auto p-4 sm:p-6">
            <AnalyticsView />
          </div>
        )}

        {activeTab === 'knowledge' && (
          <div className="max-w-7xl mx-auto p-4 sm:p-6">
            <KnowledgeView />
          </div>
        )}

        {activeTab === 'embed' && (
          <div className="max-w-5xl mx-auto p-4 sm:p-6">
            <EmbedGuide />
          </div>
        )}
      </main>
    </div>
  );
}
