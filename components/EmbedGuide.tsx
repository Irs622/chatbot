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
          <Globe className="w-5 h-5 text-[#005DAD]" />
          <h2 className="text-xl font-bold text-slate-800">
            Website Integration Guide (Embed Widget)
          </h2>
        </div>
        <p className="text-sm text-slate-600 mt-2 leading-relaxed">
          The Inpartner Chatbot is engineered as a lightweight plug-and-play widget that can be embedded into any corporate website (Next.js, WordPress, or static HTML) with a single script tag.
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
                <span className="text-emerald-400">Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Code</span>
              </>
            )}
          </button>
        </div>

        <pre className="bg-slate-950 p-4 rounded-xl text-xs font-mono text-emerald-400 overflow-x-auto border border-slate-800">
          <code>{snippet}</code>
        </pre>

        <p className="text-xs text-slate-400">
          *Note: Replace the domain URL with the deployment host of your chatbot backend (e.g., Vercel, VPS, or inpartner.id subdomain).
        </p>
      </div>

      {/* Step by Step Instructions */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <h3 className="font-bold text-base text-slate-800">Integration Steps for Corporate Website:</h3>

        <div className="space-y-4 text-xs sm:text-sm text-slate-700">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-[#005DAD] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
              1
            </div>
            <div>
              <strong className="text-slate-900 block font-semibold">Copy Embed Script:</strong>
              Click the &quot;Copy Code&quot; button in the code box above.
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-[#005DAD] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
              2
            </div>
            <div>
              <strong className="text-slate-900 block font-semibold">
                Paste Before Closing &lt;/body&gt; Tag:
              </strong>
              Open your website template (e.g., <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">pages/_app.tsx</code>, <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">app/layout.tsx</code>, or <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">index.html</code>) and paste the script right before the closing <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">&lt;/body&gt;</code> tag.
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-[#005DAD] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
              3
            </div>
            <div>
              <strong className="text-slate-900 block font-semibold">Verify Deployment:</strong>
              Reload your website page. The floating Inpartner AI Corporate Advisory launcher and proactive teaser bubble will appear automatically at the bottom right corner with responsive mobile support.
            </div>
          </div>
        </div>
      </div>

      {/* Production Readiness Checklist */}
      <div className="bg-sky-50/60 border border-sky-200 rounded-2xl p-6 text-xs text-sky-900 space-y-3">
        <h4 className="font-bold text-sm text-[#005DAD] flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-[#005DAD]" />
          Production Readiness & Security Standards:
        </h4>
        <ul className="space-y-1.5 list-disc list-inside text-slate-700">
          <li><strong>Performance:</strong> Average response time target &lt; 2 seconds (comfortably under the 5s SLA).</li>
          <li><strong>Security:</strong> All LLM API keys and admin credentials are strictly server-side protected.</li>
          <li><strong>Privacy & Consent:</strong> Explicit client consent required prior to consultation lead submission.</li>
          <li><strong>Zero Hallucination:</strong> System will not hallucinate facts; routes unknown inquiries to official senior partners via WhatsApp or email.</li>
        </ul>
      </div>
    </div>
  );
}
