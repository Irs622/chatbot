'use client';

import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Search,
  FileText,
  Folder,
  Layers,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Database,
  CheckCircle2
} from 'lucide-react';

export default function KnowledgeView() {
  const [chunks, setChunks] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedChunk, setSelectedChunk] = useState<any | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');

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

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setSearchResults(null);
      return;
    }

    setIsSearching(true);
    try {
      const res = await fetch(`/api/knowledge?q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      if (data.results) {
        setSearchResults(data.results);
        if (data.results.length > 0) {
          setSelectedChunk(data.results[0]);
        }
      }
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const displayedChunks = searchResults
    ? searchResults
    : activeCategory === 'all'
    ? chunks
    : chunks.filter((c) => c.category === activeCategory);

  const categories = [
    { id: 'all', label: 'Semua Dokumen' },
    { id: 'company', label: 'Company Profile' },
    { id: 'services', label: '4 Pilar Services' },
    { id: 'sectors', label: '13 Sektor Industri' },
    { id: 'projects', label: 'Proyek & Studi Kasus' },
    { id: 'faq', label: 'FAQ' },
    { id: 'contact', label: 'Kontak & Lokasi' }
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-800">Inpartner Official Knowledge Base & RAG Index</h2>
            <span className="bg-emerald-50 text-emerald-700 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-emerald-200">
              Source of Truth
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Seluruh jawaban AI Inpartner dijamin merujuk pada dokumen resmi terverifikasi berikut (PRD Section 10 & 11).
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200">
          <Database className="w-4 h-4 text-[#0d5f8a]" />
          <span>{chunks.length} Semantic Chunks Terindeks</span>
        </div>
      </div>

      {/* RAG Tester Search Bar */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Uji RAG Search (misal: 'omzet naik tapi profit turun', 'apakah menyediakan pinjaman modal', 'kantor pakuwon')..."
              className="w-full text-xs sm:text-sm pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-[#0d5f8a] bg-slate-50 focus:bg-white transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={isSearching}
            className="px-5 py-2.5 bg-[#0d5f8a] hover:bg-[#083c5a] text-white text-xs font-semibold rounded-xl transition-colors shadow-xs flex items-center justify-center gap-2"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            {isSearching ? 'Mencari...' : 'Uji Retrieval RAG'}
          </button>
          {searchResults && (
            <button
              type="button"
              onClick={() => {
                setSearchResults(null);
                setSearchQuery('');
              }}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
            >
              Reset
            </button>
          )}
        </form>

        {searchResults && (
          <div className="mt-3 text-xs text-[#0d5f8a] font-semibold flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Ditemukan {searchResults.length} dokumen relevan untuk kata kunci "{searchQuery}"
          </div>
        )}
      </div>

      {/* Categories Filter Tabs */}
      {!searchResults && (
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeCategory === cat.id
                  ? 'bg-[#0d5f8a] text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      )}

      {/* Chunks Explorer Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Document List (Left) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col max-h-[580px]">
          <div className="p-3 bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-700">
            Daftar Modul Knowledge Base ({displayedChunks.length})
          </div>
          <div className="divide-y divide-slate-100 overflow-y-auto flex-1">
            {displayedChunks.map((chunk) => {
              const isSelected = selectedChunk?.id === chunk.id;
              return (
                <div
                  key={chunk.id}
                  onClick={() => setSelectedChunk(chunk)}
                  className={`p-3.5 cursor-pointer text-xs transition-colors flex items-start justify-between gap-3 ${
                    isSelected ? 'bg-sky-50 border-l-4 border-l-[#0d5f8a]' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="space-y-1">
                    <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                      {chunk.category}
                    </span>
                    <h4 className="font-semibold text-slate-800 line-clamp-1">{chunk.title}</h4>
                    <p className="text-[11px] text-slate-400 font-mono line-clamp-1">
                      {chunk.sourceFile}
                    </p>
                  </div>

                  {chunk.score !== undefined && (
                    <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0">
                      Score: {chunk.score.toFixed(1)}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Document Viewer (Right) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-xs p-6 flex flex-col max-h-[580px] overflow-y-auto">
          {selectedChunk ? (
            <div className="space-y-4">
              <div className="border-b border-slate-100 pb-3 flex items-start justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#0d5f8a] bg-sky-50 px-2.5 py-1 rounded-md">
                    {selectedChunk.category}
                  </span>
                  <h3 className="font-bold text-lg text-slate-800 mt-2">{selectedChunk.title}</h3>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    File: knowledge/{selectedChunk.sourceFile}
                  </p>
                </div>

                {selectedChunk.score !== undefined && (
                  <div className="text-right">
                    <span className="text-xs text-slate-400">Relevance Match:</span>
                    <div className="text-lg font-extrabold text-amber-600">
                      {selectedChunk.score.toFixed(2)} pts
                    </div>
                  </div>
                )}
              </div>

              {/* Keywords Tagging */}
              {selectedChunk.keywords && (
                <div className="flex flex-wrap gap-1 items-center">
                  <span className="text-[11px] font-semibold text-slate-500 mr-1">Kata Kunci:</span>
                  {selectedChunk.keywords.slice(0, 10).map((kw: string, i: number) => (
                    <span key={i} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                      #{kw}
                    </span>
                  ))}
                </div>
              )}

              {/* Full Content */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs sm:text-sm leading-relaxed text-slate-700 whitespace-pre-wrap font-sans">
                {selectedChunk.content}
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400 text-xs">
              Pilih salah satu dokumen untuk membaca konten lengkapnya.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
