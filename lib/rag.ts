import fs from 'fs';
import path from 'path';

export interface KnowledgeChunk {
  id: string;
  sourceFile: string;
  category: 'company' | 'services' | 'sectors' | 'projects' | 'faq' | 'contact';
  title: string;
  content: string;
  keywords: string[];
}

export interface RetrievedChunk extends KnowledgeChunk {
  score: number;
}

let cachedChunks: KnowledgeChunk[] | null = null;

// Stopwords for Indonesian and English to clean queries
const STOPWORDS = new Set([
  'yang', 'untuk', 'pada', 'ke', 'para', 'namun', 'menurut', 'antara', 'dia', 'dua',
  'ia', 'seperti', 'jika', 'sehingga', 'kembali', 'dan', 'ini', 'karena', 'kepada',
  'oleh', 'saat', 'harus', 'sementara', 'setelah', 'belum', 'kami', 'sekitar', 'bagi',
  'serta', 'di', 'dari', 'telah', 'sebagai', 'masih', 'hal', 'ketika', 'adalah', 'itu',
  'dengan', 'bisa', 'apakah', 'bagaimana', 'apa', 'saya', 'kami', 'anda', 'kamu',
  'mau', 'ingin', 'tolong', 'bantu', 'bantuan', 'tentang', 'kenapa', 'mengapa', 'adakah',
  'the', 'is', 'at', 'which', 'on', 'and', 'a', 'an', 'in', 'to', 'for', 'of', 'with', 'about',
  'how', 'what', 'can', 'we', 'you', 'my', 'our',
  // Korean common particles & stopwords
  '은', '는', '이', '가', '을', '를', '에', '에서', '으로', '로', '와', '과', '도', '의',
  '대한', '대해', '어떻게', '무엇', '어떤', '있나요', '있습니까', '해주세요', '합니다'
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s\uac00-\ud7af\u1100-\u11ff\u3130-\u318f-]/g, ' ')
    .split(/\s+/)
    .filter((word) => {
      const hasHangul = /[\uac00-\ud7af]/.test(word);
      return (hasHangul ? word.length >= 2 : word.length > 2) && !STOPWORDS.has(word);
    });
}

export function loadAllKnowledgeChunks(): KnowledgeChunk[] {
  if (cachedChunks) return cachedChunks;

  const knowledgeDir = path.join(process.cwd(), 'knowledge');
  const chunks: KnowledgeChunk[] = [];

  if (!fs.existsSync(knowledgeDir)) {
    console.warn(`Knowledge directory not found at ${knowledgeDir}`);
    return [];
  }

  function readDirRecursive(dir: string) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        readDirRecursive(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        const relativePath = path.relative(knowledgeDir, fullPath);
        const parts = relativePath.split(path.sep);
        const category = (parts[0] as KnowledgeChunk['category']) || 'company';
        const fileContent = fs.readFileSync(fullPath, 'utf-8');

        // Split by markdown headers
        const sections = fileContent.split(/(?=^##\s+)/m);
        for (let i = 0; i < sections.length; i++) {
          const section = sections[i].trim();
          if (!section) continue;

          const titleMatch = section.match(/^##?\s+(.+)$/m);
          const title = titleMatch ? titleMatch[1].replace(/#+/g, '').trim() : `${entry.name} Section ${i + 1}`;

          chunks.push({
            id: `${category}-${path.basename(entry.name, '.md')}-${i}`,
            sourceFile: relativePath,
            category,
            title,
            content: section,
            keywords: tokenize(`${title} ${section}`)
          });
        }
      }
    }
  }

  try {
    readDirRecursive(knowledgeDir);
    cachedChunks = chunks;
  } catch (err) {
    console.error('Error loading knowledge base:', err);
  }

  return chunks;
}

export function retrieveKnowledge(query: string, topK: number = 4): RetrievedChunk[] {
  const chunks = loadAllKnowledgeChunks();
  if (chunks.length === 0) return [];

  const queryTokens = tokenize(query);
  if (queryTokens.length === 0) {
    return chunks.slice(0, topK).map((c) => ({ ...c, score: 0.5 }));
  }

  // Synonym expansion map for high domain accuracy (English, Indonesian, Korean)
  const expansionMap: Record<string, string[]> = {
    // Strategy & Corporate Advisory terms
    strategy: ['corporate', 'advisory', 'planning', 'roadmap', 'transformation', 'restructuring', 'strategi', 'korporat'],
    corporate: ['strategy', 'advisory', 'governance', 'restructuring', 'transformation', 'korporat'],
    merger: ['acquisition', 'ma', 'transaction', 'deal', 'advisory', 'divestiture', 'merger', 'akuisisi'],
    acquisition: ['merger', 'ma', 'transaction', 'deal', 'advisory', 'akuisisi'],
    restructuring: ['reorganization', 'turnaround', 'restrukturisasi', 'corporate', 'strategy'],
    ipo: ['listing', 'capital', 'market', 'public', 'offering', 'pre-ipo', 'rights', 'issue', 'bursa'],
    transformation: ['change', 'business', 'transformation', 'operational', 'improvement', 'transformasi'],

    // Investment & Project Advisory terms
    modal: ['funding', 'capital', 'investment', 'investor', 'equity', 'pembiayaan', 'pendanaan', 'saham'],
    pendanaan: ['funding', 'investment', 'investor', 'capital', 'equity', 'debt', 'pembiayaan', 'modal'],
    investasi: ['funding', 'modal', 'investor', 'capital', 'fund', 'equity', 'valuation', 'advisory', 'feasibility'],
    funding: ['investment', 'investor', 'capital', 'equity', 'debt', 'financing', 'valuation', 'fund', 'modal', 'pendanaan'],
    investment: ['funding', 'investor', 'capital', 'equity', 'venture', 'private', 'advisory', 'investasi', 'feasibility'],
    investor: ['funding', 'investment', 'capital', 'vc', 'pe', 'equity', 'investasi', 'modal'],
    feasibility: ['study', 'fs', 'kelayakan', 'analysis', 'commercial', 'financial', 'viability', 'project'],
    kelayakan: ['feasibility', 'studi', 'analisis', 'investasi', 'project'],
    valuation: ['valuasi', 'dcf', 'multiples', 'financial', 'model'],
    valuasi: ['valuation', 'dcf', 'multiples', 'financial', 'model'],
    pinjaman: ['loan', 'funding', 'debt', 'bank', 'financing', 'lender'],
    saham: ['equity', 'shares', 'valuation', 'capital', 'investor'],

    // Market Access & Business Expansion terms
    market: ['access', 'entry', 'research', 'expansion', 'penetration', 'growth', 'pasar', 'segment'],
    expansion: ['market', 'access', 'entry', 'growth', 'scale', 'territory', 'ekspansi', 'perluasan'],
    growth: ['expansion', 'scale', 'market', 'penetration', 'strategy', 'revenue', 'gtm', 'pertumbuhan', 'ekspansi'],
    ekspansi: ['expansion', 'market', 'growth', 'scale', 'perluasan', 'cabang'],
    pertumbuhan: ['growth', 'expansion', 'scale', 'market', 'sales'],
    pasar: ['market', 'access', 'entry', 'research', 'expansion', 'penetration'],
    riset: ['research', 'market', 'intelligence', 'analysis', 'study'],
    penjualan: ['sales', 'revenue', 'omset', 'omzet', 'growth'],
    omset: ['revenue', 'sales', 'topline', 'growth', 'omzet', 'turnover', 'income', 'penjualan'],
    omzet: ['revenue', 'sales', 'topline', 'growth', 'omset', 'turnover', 'income', 'penjualan'],
    distributor: ['partner', 'channel', 'distribution', 'network', 'mitra'],
    mitra: ['partner', 'distributor', 'matching', 'business', 'network', 'kemitraan'],

    // Profitability-related (mapped to strategy/advisory)
    profit: ['margin', 'revenue', 'cost', 'cogs', 'opex', 'operational', 'laba', 'keuntungan', 'strategy'],
    margin: ['profit', 'cost', 'cogs', 'opex', 'laba', 'keuntungan'],
    profitability: ['profit', 'margin', 'operational', 'efficiency', 'strategy', 'laba'],
    laba: ['profit', 'margin', 'profitability', 'keuntungan', 'revenue'],
    keuntungan: ['profit', 'margin', 'profitability', 'laba'],
    biaya: ['cost', 'opex', 'cogs', 'expenses', 'operational', 'pengeluaran'],
    operasional: ['operational', 'opex', 'efficiency', 'workflow', 'operations'],

    // Cross-Border & Technology Advisory terms
    'cross-border': ['international', 'border', 'global', 'overseas', 'lintas', 'batas', 'asing'],
    international: ['global', 'overseas', 'cross-border', 'foreign', 'internasional'],
    joint: ['venture', 'jv', 'partnership', 'collaboration', 'alliance'],
    technology: ['transfer', 'tech', 'digital', 'teknologi', 'alih'],
    transfer: ['technology', 'knowledge', 'transfer', 'alih', 'teknologi'],
    internasional: ['international', 'global', 'overseas', 'asing', 'cross-border'],
    asing: ['foreign', 'international', 'cross-border', 'global', 'internasional'],

    // Human Capital & Organization terms
    capacity: ['building', 'training', 'mentoring', 'coaching', 'executive', 'leadership', 'program', 'pelatihan', 'sdm', 'human', 'capital'],
    training: ['capacity', 'building', 'executive', 'workshop', 'coaching', 'mentoring', 'leadership', 'pelatihan'],
    leadership: ['coaching', 'executive', 'management', 'mentoring', 'kepemimpinan', 'talent'],
    pelatihan: ['training', 'capacity', 'coaching', 'mentoring', 'workshop', 'sdm'],
    executive: ['search', 'headhunting', 'leadership', 'coaching', 'training', 'c-suite', 'recruitment', 'human', 'capital', 'organization'],
    headhunting: ['executive', 'search', 'recruitment', 'talent', 'hiring', 'rekrutmen', 'human', 'capital', 'organization'],
    rekrutmen: ['recruitment', 'headhunting', 'executive', 'search', 'talent'],
    sdm: ['talent', 'employee', 'human', 'capital', 'training', 'capacity', 'karyawan'],
    karyawan: ['employee', 'talent', 'staff', 'sdm', 'training'],
    manajemen: ['management', 'executive', 'leadership', 'capacity', 'governance'],
    kepemimpinan: ['leadership', 'executive', 'management', 'coaching'],
    talent: ['executive', 'leadership', 'headhunting', 'recruitment', 'sdm', 'talent'],

    // Contact & Office terms
    contact: ['office', 'location', 'phone', 'whatsapp', 'email', 'address', 'jakarta', 'kontak', 'hubungi'],
    office: ['contact', 'location', 'address', 'jakarta', 'pakuwon', 'headquarters', 'kantor'],
    location: ['office', 'address', 'jakarta', 'pakuwon', 'contact', 'lokasi'],
    kontak: ['contact', 'office', 'phone', 'whatsapp', 'email', 'address', 'lokasi'],
    hubungi: ['contact', 'call', 'reach', 'whatsapp', 'phone'],
    kantor: ['office', 'address', 'location', 'jakarta', 'surabaya', 'pakuwon'],
    alamat: ['address', 'location', 'office', 'jakarta', 'surabaya'],

    // Company & Service terms
    layanan: ['service', 'services', 'advisory', 'pillars', 'consulting', 'solusi'],
    konsultasi: ['consultation', 'advisory', 'consulting', 'consultant'],
    profil: ['profile', 'company', 'about', 'history', 'inpartner'],
    sektor: ['sector', 'sectors', 'industry', 'industries', 'coverage', 'esg', 'energy', 'ev', 'property'],
    sector: ['sectors', 'industry', 'industries', 'coverage', 'esg', 'energy', 'ev', 'property'],
    sectors: ['sector', 'industry', 'industries', 'coverage', 'esg', 'energy', 'ev', 'property'],
    industry: ['sector', 'sectors', 'industries', 'coverage', 'f&b', 'gas', 'health'],
    project: ['projects', 'case', 'study', 'track', 'record', 'portfolio', 'experience'],
    projects: ['project', 'case', 'study', 'track', 'record', 'portfolio', 'experience']
  };

  const expandedQuery = new Set<string>(queryTokens);
  for (const token of queryTokens) {
    if (expansionMap[token]) {
      for (const syn of expansionMap[token]) {
        expandedQuery.add(syn);
      }
    }
  }

  const queryTerms = Array.from(expandedQuery);

  const scored = chunks.map((chunk) => {
    let score = 0;
    const chunkTitleLower = chunk.title.toLowerCase();
    const chunkContentLower = chunk.content.toLowerCase();

    // Check title matches (strong boost)
    for (const term of queryTerms) {
      if (chunkTitleLower.includes(term)) {
        score += 3.5;
      }
      if (chunk.keywords.includes(term)) {
        score += 1.2;
      }
      // Count frequency in content
      const regex = new RegExp(`\\b${term}\\b`, 'gi');
      const matches = chunkContentLower.match(regex);
      if (matches) {
        score += Math.min(matches.length * 0.4, 2.0);
      }
    }

    // Exact phrase match bonus
    if (chunkContentLower.includes(query.toLowerCase().trim())) {
      score += 4.0;
    }

    return {
      ...chunk,
      score
    };
  });

  scored.sort((a, b) => b.score - a.score);

  // Return top results with positive score only
  const results = scored.filter((s) => s.score > 0).slice(0, topK);
  return results;
}
