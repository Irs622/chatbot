'use client';

import React from 'react';
import {
  TrendingUp,
  DollarSign,
  BarChart2,
  GraduationCap,
  ArrowRight,
  Shield,
  CheckCircle,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import ChatWidget from './ChatWidget';

export default function WebsiteSimulator() {
  return (
    <div className="relative min-h-screen bg-slate-50 text-slate-900 font-sans overflow-x-hidden">
      {/* Website Top Bar */}
      <div className="bg-slate-900 text-slate-300 text-xs py-2 px-4 sm:px-8 flex justify-between items-center border-b border-slate-800">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <Phone className="w-3 h-3 text-[#005DAD]" />
            <a href="tel:+6289628310192" className="hover:text-white">0896 2831 0192</a>
          </span>
          <span className="hidden sm:flex items-center gap-1.5">
            <Mail className="w-3 h-3 text-[#005DAD]" />
            <a href="mailto:corporatesecretary@inpartner.id" className="hover:text-white">corporatesecretary@inpartner.id</a>
          </span>
        </div>
        <div className="flex items-center gap-3 text-[11px]">
          <span className="bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30">
            Jakarta & Surabaya
          </span>
          <span className="text-slate-400">EN | ID</span>
        </div>
      </div>

      {/* Website Navigation */}
      <nav className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#005DAD] to-[#004785] flex items-center justify-center text-white font-extrabold text-base shadow-md">
              IN
            </div>
            <div>
              <span className="font-extrabold text-lg text-slate-900 tracking-tight">INPARTNER</span>
              <span className="block text-[9px] uppercase tracking-widest text-[#005DAD] font-semibold -mt-1">
                Consulting
              </span>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-6 text-xs font-semibold text-slate-600">
            <span className="text-[#005DAD] hover:text-[#005DAD] cursor-pointer">About Us</span>
            <span className="hover:text-[#005DAD] cursor-pointer">Services</span>
            <span className="hover:text-[#005DAD] cursor-pointer">Sectors</span>
            <span className="hover:text-[#005DAD] cursor-pointer">Projects</span>
            <span className="hover:text-[#005DAD] cursor-pointer">Career</span>
            <span className="hover:text-[#005DAD] cursor-pointer">Insight & Update</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="https://inpartner.id/"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700"
          >
            <span>Live inpartner.id</span>
            <ExternalLink className="w-3 h-3" />
          </a>
          <a
            href="#contact"
            className="px-4 py-2 bg-[#005DAD] hover:bg-[#004785] text-white text-xs font-bold rounded-xl shadow-sm transition-all"
          >
            Get in Touch
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white py-20 px-4 sm:px-8 overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-sky-200 text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Founded in 2009 • Business & Management Consulting Services</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight">
            The Most Trusted <span className="text-sky-400">Consulting Partner</span> for Middle & Large Corporations
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Through our Consultation Services, we take a holistic approach to identify the right problem and give clear guides to unleash the power of your business for a brighter future.
          </p>

          <div className="flex flex-wrap justify-center items-center gap-3 pt-2">
            <a
              href="#pillars"
              className="px-6 py-3 bg-[#005DAD] hover:bg-[#004785] text-white font-semibold text-xs rounded-xl shadow-lg transition-all"
            >
              Jelajahi 4 Pilar Layanan
            </a>
            <a
              href="https://wa.me/6289628310192"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-xl border border-white/20 backdrop-blur-sm transition-all flex items-center gap-2"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              Konsultasi WhatsApp Langsung
            </a>
          </div>
        </div>
      </section>

      {/* 4 Pillars Section (PRD Section 1 & 5.1) */}
      <section id="pillars" className="py-16 px-4 sm:px-8 max-w-6xl mx-auto">
        <div className="text-center space-y-2 mb-12">
          <span className="text-xs uppercase font-bold text-[#005DAD] tracking-wider">
            Our Core Competencies
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            We Have Four Pillars To Work On
          </h2>
          <p className="text-sm text-slate-500 max-w-2xl mx-auto">
            Struktur konsultasi Inpartner dirancang untuk menjawab 4 kebutuhan bisnis paling fundamental:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Pillar 1: Funding */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
                <DollarSign className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-900 mb-2">Funding & Investment</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Pendampingan kesiapan investasi (investment readiness), penataan valuasi, financial model, dan penghubungan ke jaringan investor institusi (VC, PE, Family Offices).
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-semibold text-[#005DAD] flex items-center gap-1">
              <span>Investment Advisory</span>
              <ArrowRight className="w-3 h-3" />
            </div>
          </div>

          {/* Pillar 2: Growth */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-900 mb-2">Business Growth</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Riset pertumbuhan pasar potensial, penetrasi segmen konsumen baru, ekspansi wilayah/kota, model go-to-market, dan perumusan kemitraan strategis bernilai tinggi.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-semibold text-[#005DAD] flex items-center gap-1">
              <span>Market Expansion</span>
              <ArrowRight className="w-3 h-3" />
            </div>
          </div>

          {/* Pillar 3: Profitability */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-sky-50 text-[#005DAD] flex items-center justify-center mb-4">
                <BarChart2 className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-900 mb-2">Profitability</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Optimalisasi efisiensi alur kerja operasional, audit kebocoran beban biaya (OPEX/COGS), penyelarasan people & tech, dan restrukturisasi margin agar omzet berbuah laba nyata.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-semibold text-[#005DAD] flex items-center gap-1">
              <span>Operational Excellence</span>
              <ArrowRight className="w-3 h-3" />
            </div>
          </div>

          {/* Pillar 4: Capacity Building */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mb-4">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-900 mb-2">Capacity Building</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                The Executive Business Program (Inpartner Academy): pelatihan eksekutif, leadership coaching, mentoring, dan penyediaan kerangka kerja implementasi rencana bisnis terukur.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-semibold text-[#005DAD] flex items-center gap-1">
              <span>Executive Program</span>
              <ArrowRight className="w-3 h-3" />
            </div>
          </div>
        </div>
      </section>

      {/* Sectors Coverage Preview */}
      <section className="bg-slate-100/70 py-14 px-4 sm:px-8 border-y border-slate-200">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h3 className="text-xl font-bold text-slate-800">Cakupan Sektor & Tema Industri (Sectors Coverage)</h3>
            <p className="text-xs text-slate-500 mt-1">Inpartner mendampingi ragam sektor strategis nasional:</p>
          </div>

          <div className="flex flex-wrap justify-center gap-2 max-w-4xl mx-auto">
            {[
              'Environmental, Social, and Governance (ESG)',
              'Food and Beverage',
              'Industrial Gas',
              'Education & Training',
              'Alternative Investment',
              'Health and Pharmaceutical',
              'Biotechnology',
              'Renewable Energy',
              'Waste Solution',
              'Property Investment and Development',
              'Electric Vehicle',
              'Infrastructure',
              'Information Technology'
            ].map((s, idx) => (
              <span
                key={idx}
                className="bg-white border border-slate-200 text-slate-700 text-xs px-3.5 py-1.5 rounded-full font-medium shadow-2xs hover:border-[#005DAD] hover:text-[#005DAD] transition-colors cursor-pointer"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Authentic Footer */}
      <footer id="contact" className="bg-[#005DAD] text-white py-12 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-xs leading-relaxed">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center font-bold text-amber-300">
                IN
              </div>
              <span className="font-bold text-base tracking-wide">PT Inpartner Optima Integra</span>
            </div>
            <p className="text-sky-100">
              The Most Trusted Consulting Partner To help create positive and endure changes in Local and Global Coverage.
            </p>
            <p className="text-sky-200 font-semibold italic">
              "Go Beyond than Just Consultancy"
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-sm text-white mb-2">Lokasi Kantor Resmi:</h4>
            <div>
              <p className="font-semibold text-amber-300">Kantor Pusat Jakarta:</p>
              <p className="text-sky-100">
                Pakuwon Tower Lantai 10, Jl. Raya Casablanca Kav. 88, Menteng Dalam, Tebet, Jakarta Selatan.
              </p>
            </div>
            <div className="pt-2">
              <p className="font-semibold text-amber-300">Kantor Surabaya:</p>
              <p className="text-sky-100">Jemur Sari Street V No. 10, Surabaya, Jawa Timur.</p>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-sm text-white mb-2">Hubungi Kami:</h4>
            <p className="text-sky-100">
              <span className="text-slate-200">Telepon / WhatsApp:</span> 0896 2831 0192
            </p>
            <p className="text-sky-100">
              <span className="text-slate-200">Email:</span> corporatesecretary@inpartner.id
            </p>
            <p className="text-sky-100">
              <span className="text-slate-200">Website:</span> https://inpartner.id/
            </p>
            <div className="pt-2 flex gap-3 text-sky-200">
              <a href="https://instagram.com/inpartnerconsulting" className="hover:text-white underline">
                Instagram
              </a>
              <a href="https://linkedin.com/company/inpartner" className="hover:text-white underline">
                LinkedIn
              </a>
              <a href="https://tiktok.com/@inpartnerconsulting" className="hover:text-white underline">
                TikTok
              </a>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto mt-8 pt-6 border-t border-sky-600/60 text-center text-sky-200 text-[11px]">
          Copyright © 2026 INPARTNER (PT Inpartner Optima Integra). All rights reserved.
        </div>
      </footer>

      {/* Floating Chatbot Widget on Inpartner Website */}
      <ChatWidget />
    </div>
  );
}
