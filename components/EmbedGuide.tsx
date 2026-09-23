'use client';

import React, { useState } from 'react';
import {
  Code,
  Copy,
  Check,
  Globe,
  Layers,
  ShieldAlert,
  Sparkles,
  ExternalLink
} from 'lucide-react';

export default function EmbedGuide() {
  const [copied, setCopied] = useState(false);

  const snippet = `<!-- INPARTNER AI BUSINESS CONSULTATION ASSISTANT WIDGET -->
<script 
  src="https://chatbot.inpartner.id/api/embed.js" 
  defer
></script>
<!-- END INPARTNER ASSISTANT -->`;

  const handleCopy = () => {
    navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Intro */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-[#0d5f8a]" />
          <h2 className="text-xl font-bold text-slate-800">
            Panduan Integrasi Website inpartner.id (Embed Widget)
          </h2>
        </div>
        <p className="text-sm text-slate-600 mt-2 leading-relaxed">
          Chatbot Inpartner dirancang sebagai widget plug-and-play ringan yang dapat dipasang langsung pada kode website existing Inpartner (Next.js, WordPress, atau HTML statis) hanya dengan 1 baris tag script.
        </p>
      </div>

      {/* Code Snippet Box */}
      <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-sky-400 flex items-center gap-1.5 font-mono">
            <Code className="w-4 h-4" />
            HTML Embed Code Snippet
          </span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-sky-300 hover:text-white rounded-lg text-xs font-medium transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Tersalin ke Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Salin Kode</span>
              </>
            )}
          </button>
        </div>

        <pre className="bg-slate-950 p-4 rounded-xl text-xs font-mono text-emerald-400 overflow-x-auto border border-slate-800">
          <code>{snippet}</code>
        </pre>

        <p className="text-xs text-slate-400">
          *Catatan: Ganti domain URL dengan alamat hosting tempat backend chatbot ini di-deploy (misalnya Vercel, VPS, atau subdomain inpartner.id).
        </p>
      </div>

      {/* Step by Step Instructions */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <h3 className="font-bold text-base text-slate-800">Langkah Pemasangan di Website Inpartner:</h3>

        <div className="space-y-4 text-xs sm:text-sm text-slate-700">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-[#0d5f8a] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
              1
            </div>
            <div>
              <strong className="text-slate-900 block font-semibold">Salin Kode Embed Script:</strong>
              Klik tombol "Salin Kode" pada kotak di atas.
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-[#0d5f8a] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
              2
            </div>
            <div>
              <strong className="text-slate-900 block font-semibold">
                Tempelkan sebelum penutup &lt;/body&gt;:
              </strong>
              Buka file template website inpartner.id (misal: <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">pages/_app.tsx</code> atau <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">app/layout.tsx</code> atau <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">index.html</code>) dan tempelkan script sebelum tag penutup <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">&lt;/body&gt;</code>.
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-[#0d5f8a] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
              3
            </div>
            <div>
              <strong className="text-slate-900 block font-semibold">Verifikasi Tampilan:</strong>
              Muat ulang halaman website. Tombol floating konsultan AI Inpartner akan muncul otomatis di pojok kanan bawah desktop dan mobile dengan responsif.
            </div>
          </div>
        </div>
      </div>

      {/* Production Readiness Checklist */}
      <div className="bg-sky-50/60 border border-sky-200 rounded-2xl p-6 text-xs text-sky-900 space-y-3">
        <h4 className="font-bold text-sm text-[#0d5f8a] flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-[#0d5f8a]" />
          Checklist Kepatuhan PRD & Non-Functional Requirements:
        </h4>
        <ul className="space-y-1.5 list-disc list-inside text-slate-700">
          <li><strong>Performance:</strong> Target respon rata-rata &lt; 2 detik (memenuhi NFR target &lt; 5s).</li>
          <li><strong>Security:</strong> Semua API key terlindungi di server-side, tidak terekspos di browser client.</li>
          <li><strong>Privacy:</strong> Form lead capture meminta persetujuan eksplisit (consent) sebelum pengiriman.</li>
          <li><strong>Fallback:</strong> Sistem tidak berhalusinasi data palsu; mengarahkan ke WA resmi 0896 2831 0192 jika pertanyaan belum ada di knowledge base.</li>
        </ul>
      </div>
    </div>
  );
}
