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
  'the', 'is', 'at', 'which', 'on', 'and', 'a', 'an', 'in', 'to', 'for', 'of', 'with', 'about'
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 2 && !STOPWORDS.has(word));
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

  // Synonym expansion map for high domain accuracy
  const expansionMap: Record<string, string[]> = {
    profit: ['margin', 'profitability', 'revenue', 'cost', 'cogs', 'opex', 'operational', 'margins', 'ebitda', 'loss'],
    margin: ['profit', 'profitability', 'cost', 'cogs', 'opex', 'margin', 'margins'],
    revenue: ['sales', 'topline', 'growth', 'omzet', 'turnover', 'income'],
    profitability: ['profit', 'margin', 'cogs', 'opex', 'operational', 'excellence', 'efficiency', 'bottomline'],
    investasi: ['funding', 'modal', 'investor', 'capital', 'fund', 'equity', 'valuation'],
    funding: ['investment', 'investor', 'capital', 'equity', 'debt', 'mezzanine', 'financing', 'valuation', 'fund'],
    investment: ['funding', 'investor', 'capital', 'equity', 'venture', 'private', 'advisory'],
    investor: ['funding', 'investment', 'capital', 'vc', 'pe', 'equity'],
    growth: ['expansion', 'scale', 'market', 'penetration', 'strategy', 'revenue', 'gtm'],
    expansion: ['growth', 'market', 'penetration', 'scale', 'territory'],
    market: ['growth', 'penetration', 'expansion', 'segment', 'customer'],
    capacity: ['building', 'training', 'mentoring', 'coaching', 'executive', 'leadership', 'academy', 'program'],
    training: ['capacity', 'building', 'executive', 'workshop', 'coaching', 'mentoring', 'leadership'],
    leadership: ['capacity', 'building', 'coaching', 'executive', 'management', 'mentoring'],
    contact: ['office', 'location', 'phone', 'whatsapp', 'email', 'address', 'jakarta', 'surabaya'],
    office: ['contact', 'location', 'address', 'jakarta', 'surabaya', 'pakuwon', 'headquarters'],
    location: ['office', 'address', 'jakarta', 'surabaya', 'pakuwon', 'contact'],
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

  // Return top results with positive score, or fallback to first few
  const results = scored.filter((s) => s.score > 0).slice(0, topK);
  if (results.length === 0) {
    return scored.slice(0, topK);
  }

  return results;
}
