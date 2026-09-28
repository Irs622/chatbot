'use client';

import React, { useState } from 'react';
import {
  Code,
  Copy,
  Check,
  Globe,
  Layers,
  ShieldCheck,
  Sparkles,
  ExternalLink,
  Send,
  MessageSquare,
  HelpCircle,
  Smartphone,
  Zap,
  CheckCircle2
} from 'lucide-react';

export default function EmbedGuide() {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedMessage, setCopiedMessage] = useState(false);

  const snippet = `<!-- INPARTNER AI BUSINESS CONSULTATION ASSISTANT WIDGET -->
<script 
  src="https://chatbot.inpartner.id/api/embed.js" 
  defer
></script>
<!-- END INPARTNER ASSISTANT -->`;

  const webmasterMessage = `Hi IT Team / Webmaster,

Please install the official Inpartner AI Consultation Widget on our website (inpartner.id).
All you need to do is paste this 1-line script tag right before the closing </body> tag:

<script src="https://chatbot.inpartner.id/api/embed.js" defer></script>

Key Details:
1. Widget Position: Appears as a sleek floating consultation bubble at the bottom-right corner.
2. Mobile Friendly: 100% responsive on all smartphones.
3. Performance: Asynchronous loading (will not slow down page speed).

Please let us know once deployed so we can test. Thank you!`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(snippet);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(webmasterMessage);
    setCopiedMessage(true);
    setTimeout(() => setCopiedMessage(false), 2500);
  };

  return (
    <div className="space-y-5 max-w-5xl">
      {/* Intro Card (Figma Style #F5F5F5) */}
      <div className="bg-[#F5F5F5] rounded-[10px] p-5 border border-[#E3E3E3] shadow-[0px_2px_4px_rgba(0,0,0,0.05)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-[#5FA0BE]" />
            <h2 className="text-base font-bold text-[#747374]">
              Website Widget & Webmaster Guide
            </h2>
            <span className="bg-[#DCF1DD] text-[#3E7A41] text-[10px] font-semibold px-2 py-0.5 rounded-[4px] border border-[#6FA672]/30">
              Plug & Play
            </span>
          </div>
          <p className="text-xs text-[#8B8B8B] mt-1 leading-relaxed max-w-2xl">
            You do not need to write code. Simply forward the ready-to-send instructions below to your IT team, web agency, or webmaster. They can install the floating AI consultation assistant on your website in under 2 minutes.
          </p>
        </div>

        {/* Live Demo Button */}
        <a
          href="/demo-website.html"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-4 py-2.5 bg-[#5FA0BE] hover:bg-[#558BA4] text-white rounded-[5px] text-xs font-semibold shadow-xs transition-all cursor-pointer whitespace-nowrap self-start sm:self-auto"
        >
          <ExternalLink className="w-4 h-4" />
          <span>Open Live Demo Page</span>
        </a>
      </div>

      {/* Main Grid: Forward to IT (Left) + FAQ & Specs (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: 1-Click Message for Webmaster (7 cols) */}
        <div className="lg:col-span-7 bg-[#F5F5F5] rounded-[10px] border border-[#E3E3E3] shadow-[0px_4px_8px_rgba(0,0,0,0.06),0px_0px_4px_rgba(0,0,0,0.04)] p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#E3E3E3] pb-3">
            <div>
              <h3 className="text-sm font-bold text-[#747374] flex items-center gap-1.5">
                <Send className="w-4 h-4 text-[#5FA0BE]" />
                <span>Option 1: Forward Ready-to-Send Message to IT</span>
              </h3>
              <p className="text-[11px] text-[#8B8B8B] mt-0.5">
                Copy this pre-written email or WhatsApp message to send to your website developer
              </p>
            </div>

            <button
              onClick={handleCopyMessage}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-[#EAEAEA] text-[#747374] text-xs font-semibold rounded-[5px] border border-[#DADADA] shadow-xs transition-all cursor-pointer shrink-0"
            >
              {copiedMessage ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#3E7A41]" />
                  <span className="text-[#3E7A41]">Copied Message!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-[#5FA0BE]" />
                  <span>📋 Copy Message</span>
                </>
              )}
            </button>
          </div>

          {/* Pre-written Message Preview */}
          <div className="bg-white p-4 rounded-[8px] border border-[#E3E3E3] text-xs font-sans leading-relaxed text-[#747374] whitespace-pre-wrap">
            {webmasterMessage}
          </div>

          {/* Direct Code Snippet for Technical Staff */}
          <div className="pt-2 border-t border-[#E3E3E3] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#747374] flex items-center gap-1.5">
                <Code className="w-3.5 h-3.5 text-[#5FA0BE]" />
                <span>Single HTML Script Tag (For Developer)</span>
              </span>
              <button
                onClick={handleCopyCode}
                className="text-[11px] text-[#5FA0BE] hover:underline cursor-pointer flex items-center gap-1"
              >
                {copiedCode ? (
                  <span className="text-[#3E7A41] font-semibold">✓ Copied Code</span>
                ) : (
                  <span>Copy Code Only</span>
                )}
              </button>
            </div>

            <pre className="bg-[#2E3440] p-3 rounded-[6px] text-xs font-mono text-[#88C0D0] overflow-x-auto border border-[#4C566A]">
              <code>{snippet}</code>
            </pre>
          </div>
        </div>

        {/* Right Column: Non-Dev FAQ & Verification Checklist (5 cols) */}
        <div className="lg:col-span-5 bg-[#F5F5F5] rounded-[10px] border border-[#E3E3E3] shadow-[0px_4px_8px_rgba(0,0,0,0.06),0px_0px_4px_rgba(0,0,0,0.04)] p-5 space-y-4">
          <div className="border-b border-[#E3E3E3] pb-3">
            <h3 className="text-sm font-bold text-[#747374] flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-[#5FA0BE]" />
              <span>Questions You Might Have</span>
            </h3>
            <p className="text-[11px] text-[#8B8B8B] mt-0.5">
              Everything management and marketing teams need to know
            </p>
          </div>

          <div className="space-y-3 text-xs text-[#747374]">
            {/* FAQ 1 */}
            <div className="bg-white p-3 rounded-[6px] border border-[#E3E3E3] space-y-1">
              <strong className="text-xs font-bold text-[#747374] flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-[#BE905F]" />
                <span>Will it slow down our website?</span>
              </strong>
              <p className="text-[11px] text-[#8B8B8B] leading-relaxed">
                No. The widget loads asynchronously (<code className="bg-[#F5F5F5] px-1 rounded text-[10px]">defer</code>) in the background and will never block or slow down your page loading speed.
              </p>
            </div>

            {/* FAQ 2 */}
            <div className="bg-white p-3 rounded-[6px] border border-[#E3E3E3] space-y-1">
              <strong className="text-xs font-bold text-[#747374] flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-[#5FA0BE]" />
                <span>Where do client inquiries go?</span>
              </strong>
              <p className="text-[11px] text-[#8B8B8B] leading-relaxed">
                Every consultation inquiry submitted on your website immediately appears in this Admin Portal under <strong>&quot;Client Inquiries&quot;</strong>, ready for your business development team.
              </p>
            </div>

            {/* FAQ 3 */}
            <div className="bg-white p-3 rounded-[6px] border border-[#E3E3E3] space-y-1">
              <strong className="text-xs font-bold text-[#747374] flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-[#3E7A41]" />
                <span>Does it work on mobile phones?</span>
              </strong>
              <p className="text-[11px] text-[#8B8B8B] leading-relaxed">
                Yes, 100%. When clicked on smartphones, it expands into a comfortable full-screen mobile chat window with big, easy-to-tap buttons.
              </p>
            </div>

            {/* FAQ 4 */}
            <div className="bg-white p-3 rounded-[6px] border border-[#E3E3E3] space-y-1">
              <strong className="text-xs font-bold text-[#747374] flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#5FA0BE]" />
                <span>Is client data safe?</span>
              </strong>
              <p className="text-[11px] text-[#8B8B8B] leading-relaxed">
                Yes. All client contact data is protected, and admin features are locked behind your team PIN.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
