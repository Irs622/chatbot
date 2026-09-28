'use client';

import React, { useState, useEffect } from 'react';
import { Search, BookOpen, Copy, Check, FileText } from 'lucide-react';

export default function KnowledgeView() {
  const [chunks, setChunks] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChunk, setSelectedChunk] = useState<any | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/knowledge')
      .then((res) => res.json())
      .then((data) => {
        if (data.chunks) {
          setChunks(data.chunks);
          if (data.chunks.length > 0) setSelectedChunk(data.chunks[0]);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  const filteredChunks = chunks.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.title.toLowerCase().includes(q) ||
      c.content.toLowerCase().includes(q) ||
      (c.category && c.category.toLowerCase().includes(q))
    );
  });

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* ============================================================== */}
      {/* 1. TOP HEADER: Title & Search Bar */}
      {/* ============================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">AI Knowledge Base</h2>
            <span className="bg-[#0779D1]/10 text-[#0779D1] border border-[#0779D1]/20 text-[10px] font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <BookOpen className="w-3 h-3" />
              <span>Verified Corporate RAG</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Verified corporate documents and advisory scopes that guide the website AI assistant.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search company knowledge..."
            className="w-full text-xs pl-9 pr-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 transition-colors shadow-2xs"
          />
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. MATCHING FIXED BLOCKS: List & Viewer (Fixed Height: 580px) */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Document List (5 cols, Fixed Height: 580px) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 shadow-xs h-[580px] flex flex-col justify-between overflow-hidden">
          {/* Fixed Card Header */}
          <div className="p-3.5 bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-700 flex items-center justify-between shrink-0">
            <span>Company Documents ({filteredChunks.length})</span>
            <span className="text-[10px] text-slate-400 font-normal">Click to read</span>
          </div>

          {/* Scrollable List Body */}
          <div className="divide-y divide-slate-100 overflow-y-auto flex-1">
            {filteredChunks.map((chunk) => {
              const isSelected = selectedChunk?.id === chunk.id;
              return (
                <div
                  key={chunk.id}
                  onClick={() => setSelectedChunk(chunk)}
                  className={`p-3.5 cursor-pointer text-xs transition-colors ${
                    isSelected ? 'bg-[#0779D1]/10 border-l-3 border-l-[#0779D1]' : 'hover:bg-slate-50'
                  }`}
                >
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">
                    {chunk.category || 'Company'}
                  </span>
                  <h4 className="font-semibold text-slate-900 line-clamp-1 mt-0.5">{chunk.title}</h4>
                  <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">
                    {chunk.content ? chunk.content.slice(0, 110) + '...' : ''}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Fixed Footer */}
          <div className="px-3.5 py-2.5 border-t border-slate-100 bg-slate-50 text-[11px] text-slate-500 shrink-0">
            <span>Verified Inpartner corporate source of truth</span>
          </div>
        </div>

        {/* Document Viewer (7 cols, Fixed Height: 580px) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-5 shadow-xs h-[580px] flex flex-col justify-between overflow-hidden">
          {selectedChunk ? (
            <>
              {/* Fixed Card Header */}
              <div className="flex items-start justify-between border-b border-slate-100 pb-3 shrink-0">
                <div>
                  <span className="text-[10px] font-semibold text-[#0779D1] uppercase tracking-wide">
                    {selectedChunk.category}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-0.5">
                    {selectedChunk.title}
                  </h3>
                </div>

                <button
                  onClick={() => handleCopy(selectedChunk.content, selectedChunk.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors cursor-pointer shrink-0 shadow-2xs"
                >
                  {copiedId === selectedChunk.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-600">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-500" />
                      <span>Copy Text</span>
                    </>
                  )}
                </button>
              </div>

              {/* Scrollable Document Text Body */}
              <div className="flex-1 overflow-y-auto my-3 bg-slate-50/80 p-4 rounded-lg border border-slate-100 text-xs leading-relaxed text-slate-700 whitespace-pre-wrap font-sans">
                {selectedChunk.content}
              </div>

              {/* Fixed Footer */}
              <div className="pt-2.5 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between shrink-0">
                <span>The AI assistant strictly uses this verified text to guide clients</span>
                <span className="font-mono text-[10px]">knowledge/{selectedChunk.sourceFile || 'source'}</span>
              </div>
            </>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-400">
              Select a document from the left list to read.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
