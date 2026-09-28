export type IntentType =
  | 'funding'
  | 'growth'
  | 'profitability'
  | 'capacity_building'
  | 'company_information'
  | 'service_information'
  | 'contact'
  | 'other'
  | 'unknown';

interface IntentRule {
  intent: IntentType;
  keywords: string[];
  patterns: RegExp[];
}

const INTENT_RULES: IntentRule[] = [
  {
    intent: 'funding',
    keywords: [
      'funding', 'investment', 'investor', 'capital', 'loan', 'raise capital',
      'pitch deck', 'teaser', 'financing', 'equity', 'shares',
      'venture capital', 'private equity', 'valuation', 'fundraising', 'debt'
    ],
    patterns: [
      /(raise|find|secure|need).*(capital|funding|investment|investor)/i,
      /investment readiness/i,
      /financial.*model/i,
      /pitch.*deck/i,
      /does inpartner (provide|lend|offer) (loans|money)/i
    ]
  },
  {
    intent: 'profitability',
    keywords: [
      'profit', 'margin', 'profitability', 'loss', 'revenue', 'cogs',
      'opex', 'efficiency', 'operating cost', 'leakage', 'lean',
      'cost', 'waste', 'cash flow', 'declining', 'drop', 'margin compression'
    ],
    patterns: [
      /profit.*(margin|dropping|declining|falling|down)/i,
      /revenue.*up.*profit.*down/i,
      /operational.*(cost|expenses|efficiency|waste)/i,
      /cost.*reduction/i,
      /operational.*excellence/i,
      /bottleneck.*process/i
    ]
  },
  {
    intent: 'growth',
    keywords: [
      'growth', 'grow', 'expansion', 'expand', 'market', 'scale',
      'strategy', 'branch', 'penetration', 'competitor', 'go to market',
      'business plan', 'strategic planning', 'strategic partnership', 'sales'
    ],
    patterns: [
      /market.*expansion/i,
      /increase.*sales/i,
      /strategic.*plan/i,
      /growth.*strategy/i,
      /open.*new.*branch/i,
      /go-to-market/i
    ]
  },
  {
    intent: 'capacity_building',
    keywords: [
      'capacity', 'building', 'training', 'mentoring', 'coaching',
      'workshop', 'executive', 'leadership', 'talent', 'employee', 'manager',
      'board', 'inpartner academy', 'corporate culture', 'skills', 'c-level'
    ],
    patterns: [
      /executive.*business.*program/i,
      /training.*program/i,
      /employee.*training/i,
      /leadership.*coaching/i,
      /capacity.*building/i,
      /corporate.*academy/i
    ]
  },
  {
    intent: 'contact',
    keywords: [
      'contact', 'call', 'phone', 'whatsapp', 'email', 'office',
      'address', 'location', 'meeting', 'schedule', 'book appointment',
      'pakuwon', 'surabaya', 'jakarta', 'office hours', 'inquiry'
    ],
    patterns: [
      /how.*to.*(contact|reach)/i,
      /phone.*number|whatsapp.*number/i,
      /office.*address|where.*located/i,
      /meet.*consultant/i,
      /schedule.*consultation/i,
      /book.*meeting/i
    ]
  },
  {
    intent: 'company_information',
    keywords: [
      'who is inpartner', 'about inpartner', 'profile', 'history', 'vision',
      'mission', 'values', 'directors', 'founded', 'track record', 'clients',
      'experience', 'projects', 'sectors', 'industry'
    ],
    patterns: [
      /who.*is.*inpartner/i,
      /company.*profile/i,
      /vision.*mission/i,
      /about.*inpartner/i,
      /when.*founded/i
    ]
  },
  {
    intent: 'service_information',
    keywords: [
      'services', 'service', 'advisory', 'scope', 'what do you do',
      'offerings', 'consulting pillars', 'solutions'
    ],
    patterns: [
      /what.*services/i,
      /inpartner.*services/i,
      /scope.*of.*work/i,
      /advisory.*areas/i
    ]
  }
];

export function detectIntent(text: string): {
  intent: IntentType;
  confidence: number;
  matchedKeywords: string[];
} {
  const clean = text.toLowerCase().trim();
  if (!clean) {
    return { intent: 'unknown', confidence: 0, matchedKeywords: [] };
  }

  let bestIntent: IntentType = 'unknown';
  let bestScore = 0;
  let bestMatchedKeywords: string[] = [];

  for (const rule of INTENT_RULES) {
    let score = 0;
    const matched: string[] = [];

    // Pattern matching (high confidence)
    for (const pattern of rule.patterns) {
      if (pattern.test(clean)) {
        score += 3.0;
      }
    }

    // Keyword matching
    for (const kw of rule.keywords) {
      if (clean.includes(kw.toLowerCase())) {
        score += 1.0;
        matched.push(kw);
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestIntent = rule.intent;
      bestMatchedKeywords = matched;
    }
  }

  if (bestScore === 0) {
    return { intent: 'unknown', confidence: 0.1, matchedKeywords: [] };
  }

  const confidence = Math.min(1.0, bestScore / 4.0);
  return {
    intent: bestIntent,
    confidence,
    matchedKeywords: bestMatchedKeywords
  };
}
