'use client';

import React, { useState } from 'react';
import { Copy, Check, ExternalLink, Code2 } from 'lucide-react';

export default function EmbedGuide() {
  const [copied, setCopied] = useState(false);

  const snippet = `<script src="https://chatbot.inpartner.id/api/embed.js" defer></script>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto py-4 space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Website Widget</h2>
        <p className="text-sm text-slate-500 mt-1">
          Install the Inpartner AI Consultation Assistant on any website with a single script tag.
        </p>
      </div>

      {/* Code Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-600 flex items-center gap-1.5">
            <Code2 className="w-4 h-4 text-slate-400" />
            HTML Embed Code
          </span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Code</span>
              </>
            )}
          </button>
        </div>

        <div className="bg-slate-900 rounded-lg p-3.5 font-mono text-xs text-sky-300 overflow-x-auto">
          <code>{snippet}</code>
        </div>

        <div className="text-xs text-slate-500 space-y-1.5 pt-1">
          <p>• Paste this script tag right before the closing <code className="bg-slate-100 text-slate-700 px-1 py-0.5 rounded font-mono">&lt;/body&gt;</code> tag on your website.</p>
          <p>• The floating consultation bubble will automatically appear in the bottom-right corner.</p>
        </div>
      </div>

      {/* Test Demo Link */}
      <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 flex items-center justify-between">
        <div>
          <h4 className="text-xs font-medium text-slate-800">Preview on Live Website</h4>
          <p className="text-xs text-slate-500">See how the widget looks and behaves on a demo page.</p>
        </div>
        <a
          href="/demo-website.html"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 transition-colors"
        >
          <span>Open Demo</span>
          <ExternalLink className="w-3 h-3 text-slate-400" />
        </a>
      </div>
    </div>
  );
}
