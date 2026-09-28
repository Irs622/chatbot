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
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">AI Knowledge Base</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Verified company documents that power the website AI assistant.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search company knowledge..."
            className="w-full text-xs pl-9 pr-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 transition-colors"
          />
        </div>
      </div>

      {/* Grid: Document List (Left) + Document Viewer (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Document List */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs max-h-[600px] flex flex-col">
          <div className="p-3 bg-slate-50 border-b border-slate-200 text-xs font-medium text-slate-600">
            Documents ({filteredChunks.length})
          </div>
          <div className="divide-y divide-slate-100 overflow-y-auto flex-1">
            {filteredChunks.map((chunk) => {
              const isSelected = selectedChunk?.id === chunk.id;
              return (
                <div
                  key={chunk.id}
                  onClick={() => setSelectedChunk(chunk)}
                  className={`p-3.5 cursor-pointer text-xs transition-colors ${
                    isSelected ? 'bg-sky-50/70 border-l-3 border-l-sky-600' : 'hover:bg-slate-50'
                  }`}
                >
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">
                    {chunk.category || 'Company'}
                  </span>
                  <h4 className="font-medium text-slate-900 line-clamp-1 mt-0.5">{chunk.title}</h4>
                  <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">
                    {chunk.content ? chunk.content.slice(0, 110) + '...' : ''}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Document Viewer */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4 max-h-[600px] overflow-y-auto">
          {selectedChunk ? (
            <>
              <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[10px] font-semibold text-sky-600 uppercase tracking-wide">
                    {selectedChunk.category}
                  </span>
                  <h3 className="text-base font-semibold text-slate-900 mt-1">
                    {selectedChunk.title}
                  </h3>
                </div>

                <button
                  onClick={() => handleCopy(selectedChunk.content, selectedChunk.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors cursor-pointer shrink-0"
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

              <div className="text-xs leading-relaxed text-slate-700 whitespace-pre-wrap font-sans bg-slate-50/80 p-4 rounded-lg border border-slate-100">
                {selectedChunk.content}
              </div>
            </>
          ) : (
            <div className="py-20 text-center text-xs text-slate-400">
              Select a document to read.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
