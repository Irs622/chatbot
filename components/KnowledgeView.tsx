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
  CheckCircle2,
  Copy,
  Check,
  HelpCircle,
  Building,
  MapPin,
  Briefcase,
  TrendingUp,
  X
} from 'lucide-react';

export default function KnowledgeView() {
  const [chunks, setChunks] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedChunk, setSelectedChunk] = useState<any | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [copiedChunkId, setCopiedChunkId] = useState<string | null>(null);

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

  const handleSearch = async (queryText?: string) => {
    const q = queryText !== undefined ? queryText : searchQuery;
    if (!q.trim()) {
      setSearchResults(null);
      return;
    }

    if (queryText !== undefined) {
      setSearchQuery(queryText);
    }

    setIsSearching(true);
    try {
      const res = await fetch(`/api/knowledge?q=${encodeURIComponent(q)}`);
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

  const handleCopyContent = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedChunkId(id);
    setTimeout(() => setCopiedChunkId(null), 2500);
  };

  const displayedChunks = searchResults
    ? searchResults
    : activeCategory === 'all'
    ? chunks
    : chunks.filter((c) => c.category === activeCategory);

  const categories = [
    { id: 'all', label: 'All Knowledge' },
    { id: 'company', label: 'Company Profile' },
    { id: 'services', label: '4 Advisory Pillars' },
    { id: 'sectors', label: '13 Industry Sectors' },
    { id: 'projects', label: 'Projects & Case Studies' },
    { id: 'faq', label: 'Client FAQ & Pricing' },
    { id: 'contact', label: 'Offices & Contacts' }
  ];

  const sampleQuestions = [
    'What services do you offer for profit margins?',
    'How does Inpartner help raise investor funding?',
    'Where is the Inpartner office in Jakarta & Surabaya?',
    'How does the Executive Business Program work?'
  ];

  return (
    <div className="space-y-5">
      {/* Top Banner (Figma Card Style #F5F5F5) */}
      <div className="bg-[#F5F5F5] rounded-[10px] p-5 border border-[#E3E3E3] shadow-[0px_2px_4px_rgba(0,0,0,0.05)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-[#747374]">
              Inpartner AI Knowledge & Verified Answers
            </h2>
            <span className="bg-[#DCF1DD] text-[#3E7A41] text-[10px] font-semibold px-2 py-0.5 rounded-[4px] border border-[#6FA672]/30">
              Verified Source of Truth
            </span>
          </div>
          <p className="text-xs text-[#8B8B8B] mt-1 leading-relaxed">
            This repository contains official corporate documents that guide our website AI Assistant. The AI strictly answers client inquiries based on these verified facts.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-[#747374] bg-white px-3.5 py-2 rounded-[6px] border border-[#E3E3E3] shadow-xs shrink-0">
          <BookOpen className="w-4 h-4 text-[#5FA0BE]" />
          <span>{chunks.length} Verified Company Documents</span>
        </div>
      </div>

      {/* Interactive AI Question Test Box (Non-Dev Friendly) */}
      <div className="bg-[#F5F5F5] rounded-[10px] p-4 sm:p-5 border border-[#E3E3E3] shadow-[0px_2px_4px_rgba(0,0,0,0.05)] space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#747374] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#5FA0BE]" />
            <span>Test What the AI Assistant Tells Prospective Clients:</span>
          </span>
          <span className="text-[10px] text-[#8B8B8B]">Non-dev testing tool</span>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          className="flex flex-col sm:flex-row gap-2"
        >
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#747374]" />
            <input
              id="rag-search-query"
              name="ragQuery"
              type="text"
              aria-label="Test AI question"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Ask a question (e.g., 'profit margin decline', 'funding requirements', 'office location')..."
              className="w-full text-xs pl-9 pr-3 py-2 rounded-[5px] border border-[#E3E3E3] bg-white text-[#747374] placeholder:text-[#9E9E9E] focus:outline-none focus:border-[#5FA0BE]"
            />
          </div>
          <button
            type="submit"
            disabled={isSearching}
            className="px-4 py-2 bg-[#5FA0BE] hover:bg-[#558BA4] text-white text-xs font-semibold rounded-[5px] transition-colors shadow-xs flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isSearching ? 'Testing AI...' : 'Ask AI'}</span>
          </button>
          {searchResults && (
            <button
              type="button"
              onClick={() => {
                setSearchResults(null);
                setSearchQuery('');
              }}
              className="px-3 py-2 bg-white hover:bg-[#EAEAEA] text-[#747374] text-xs font-semibold rounded-[5px] border border-[#E3E3E3] transition-colors cursor-pointer"
            >
              Reset
            </button>
          )}
        </form>

        {/* Clickable Quick Sample Questions for Non-Devs */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[11px] text-[#8B8B8B] mr-1">Click to test:</span>
          {sampleQuestions.map((q, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSearch(q)}
              className="text-[11px] px-2.5 py-1 rounded-[5px] bg-white hover:bg-[#EAEAEA] text-[#747374] border border-[#E3E3E3] transition-colors cursor-pointer text-left"
            >
              💬 &quot;{q}&quot;
            </button>
          ))}
        </div>

        {searchResults && (
          <div className="pt-2 text-xs text-[#3E7A41] font-semibold flex items-center gap-1.5 border-t border-[#E3E3E3]">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#3E7A41]" />
            Found {searchResults.length} verified company documents matching &quot;{searchQuery}&quot;
          </div>
        )}
      </div>

      {/* Category Filter Tabs */}
      {!searchResults && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1.5 rounded-[5px] text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-[#5FA0BE] text-white shadow-2xs'
                  : 'bg-white text-[#747374] border border-[#E3E3E3] hover:bg-[#F5F5F5]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      )}

      {/* Document Explorer Grid (Figma #F5F5F5 styling) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Document List (Left 5 cols) */}
        <div className="lg:col-span-5 bg-[#F5F5F5] rounded-[10px] border border-[#E3E3E3] shadow-[0px_4px_8px_rgba(0,0,0,0.06),0px_0px_4px_rgba(0,0,0,0.04)] overflow-hidden flex flex-col max-h-[580px]">
          <div className="p-3 bg-[#DFDFDF] border-b border-[#E3E3E3] text-xs font-bold text-[#747374] flex items-center justify-between">
            <span>Company Documents ({displayedChunks.length})</span>
            <span className="text-[10px] text-[#8B8B8B] font-normal">Click to read</span>
          </div>
          <div className="divide-y divide-[#E3E3E3] overflow-y-auto flex-1 bg-white">
            {displayedChunks.map((chunk) => {
              const isSelected = selectedChunk?.id === chunk.id;
              return (
                <div
                  key={chunk.id}
                  onClick={() => setSelectedChunk(chunk)}
                  className={`p-3.5 cursor-pointer text-xs transition-colors flex items-start justify-between gap-3 ${
                    isSelected ? 'bg-[#EAEAEA] border-l-4 border-l-[#5FA0BE]' : 'hover:bg-[#F5F5F5]'
                  }`}
                >
                  <div className="space-y-1">
                    <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-[#F5F5F5] text-[#8B8B8B] border border-[#E3E3E3]">
                      {chunk.category}
                    </span>
                    <h4 className="font-semibold text-[#747374] line-clamp-1">{chunk.title}</h4>
                    <p className="text-[11px] text-[#8B8B8B] line-clamp-2">
                      {chunk.content ? chunk.content.slice(0, 100) + '...' : ''}
                    </p>
                  </div>

                  {chunk.score !== undefined && (
                    <span className="bg-[#DCF1DD] text-[#3E7A41] border border-[#6FA672]/30 text-[10px] font-bold px-2 py-0.5 rounded-[4px] shrink-0">
                      Match
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Document Viewer & Copy Tool (Right 7 cols) */}
        <div className="lg:col-span-7 bg-[#F5F5F5] rounded-[10px] border border-[#E3E3E3] shadow-[0px_4px_8px_rgba(0,0,0,0.06),0px_0px_4px_rgba(0,0,0,0.04)] p-5 flex flex-col max-h-[580px] overflow-y-auto space-y-4">
          {selectedChunk ? (
            <>
              {/* Document Header with Category & 1-Click Copy */}
              <div className="border-b border-[#E3E3E3] pb-3 flex items-start justify-between gap-3">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#5FA0BE] bg-[#CEEBF9] px-2 py-0.5 rounded-[4px]">
                    {selectedChunk.category}
                  </span>
                  <h3 className="font-bold text-base text-[#747374] mt-1.5">
                    {selectedChunk.title}
                  </h3>
                  <p className="text-[11px] text-[#8B8B8B] mt-0.5">
                    Official Inpartner Knowledge Source
                  </p>
                </div>

                <button
                  onClick={() => handleCopyContent(selectedChunk.content, selectedChunk.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-[#EAEAEA] text-[#747374] text-xs font-semibold rounded-[5px] border border-[#DADADA] shadow-xs transition-all cursor-pointer shrink-0"
                  title="Copy this verified text to send to a client"
                >
                  {copiedChunkId === selectedChunk.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#3E7A41]" />
                      <span className="text-[#3E7A41]">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-[#5FA0BE]" />
                      <span>Copy Text</span>
                    </>
                  )}
                </button>
              </div>

              {/* Verified Content Display */}
              <div className="bg-white p-4 rounded-[8px] border border-[#E3E3E3] text-xs leading-relaxed text-[#747374] whitespace-pre-wrap font-sans shadow-2xs">
                {selectedChunk.content}
              </div>

              {/* Non-dev guidance footer */}
              <div className="text-[11px] text-[#8B8B8B] bg-white p-3 rounded-[6px] border border-[#E3E3E3] flex items-center justify-between">
                <span>
                  💡 <strong>Tip for Consultants:</strong> You can copy and send snippets of this verified information directly in WhatsApp or email conversations with prospective clients.
                </span>
              </div>
            </>
          ) : (
            <div className="h-full flex items-center justify-center text-[#8B8B8B] text-xs py-20">
              Select any company document on the left to read verified content.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
