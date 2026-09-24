'use client';

import React, { useState } from 'react';
import {
  Users,
  BarChart3,
  BookOpen,
  Code2,
  ExternalLink,
  Phone,
  ArrowLeft
} from 'lucide-react';
import AdminDashboard from '@/components/AdminDashboard';
import AnalyticsView from '@/components/AnalyticsView';
import KnowledgeView from '@/components/KnowledgeView';
import EmbedGuide from '@/components/EmbedGuide';
import Link from 'next/link';
import { INPARTNER_CONFIG, getWhatsAppUrl } from '@/lib/config';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'leads' | 'analytics' | 'knowledge' | 'embed'>('leads');

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
              <span>Kembali ke Chatbot</span>
            </Link>
            <div className="w-8 h-8 rounded-lg bg-[#005DAD] flex items-center justify-center font-bold text-white text-sm shadow-inner">
              IN
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-sm tracking-tight text-white">
                  INPARTNER Admin & CRM
                </h1>
                <span className="bg-sky-500/20 text-sky-300 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-sky-400/30">
                  Internal Dashboard
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <a
              href={INPARTNER_CONFIG.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700 font-medium"
            >
              <span>Kunjungi inpartner.id</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <a
              href={getWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors font-medium shadow-xs"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>WA {INPARTNER_CONFIG.whatsappDisplay}</span>
            </a>
          </div>
        </div>
      </header>

      {/* Navigation Tabs Bar */}
      <div className="bg-white border-b border-slate-200 shadow-2xs sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar py-2">
          <button
            onClick={() => setActiveTab('leads')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'leads'
                ? 'bg-[#005DAD] text-white shadow-xs'
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
                ? 'bg-[#005DAD] text-white shadow-xs'
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
                ? 'bg-[#005DAD] text-white shadow-xs'
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
                ? 'bg-[#005DAD] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>Panduan Embed</span>
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
