import { detectIntent, IntentType } from './intent';
import { retrieveKnowledge, RetrievedChunk } from './rag';
import { GoogleGenerativeAI } from '@google/generative-ai';

export interface AIResponse {
  answer: string;
  intent: IntentType;
  confidence: number;
  recommendedService?: string;
  sources: string[];
  suggestLeadCapture: boolean;
  quickActions: string[];
  followUpQuestions: string[];
  isFallback: boolean;
}

const SYSTEM_PROMPT = `You are the Inpartner AI Business Consultation Assistant, the official corporate advisory assistant for Inpartner (https://inpartner.id/).
Inpartner is a premier management and business consultancy (PT Inpartner Optima Integra) in Indonesia focusing on 4 core pillars:
1. Funding & Investment Advisory
2. Growth (Business Growth & Expansion)
3. Profitability (Operational Process Optimization & Margin Enhancement)
4. Capacity Building (The Executive Business Program / Inpartner Academy)

CONVERSATION & INTEGRITY RULES (STRICTLY REQUIRED):
1. Answer questions based only on the official context and knowledge base provided.
2. DO NOT fabricate (hallucinate) services, fee schedules, investment yield guarantees, or return percentages.
3. Inpartner is NOT a direct lender or bank. Inpartner prepares companies for investment readiness, objective business valuations, investor teasers/pitch decks, and connects clients with verified institutional investors.
4. If information is not in the context, state transparently and honestly that you do not have that specific detail yet, and invite the visitor to schedule a direct exploratory discussion with Inpartner senior consultants.
5. Maintain a professional, consultative, articulate, and actionable tone with clear bullet points.
6. Provide relevant Inpartner service recommendations and encourage visitors to schedule a consultation session or leave their contact information.`;

export type AIStreamEvent =
  | {
      type: 'start';
      intent: IntentType;
      confidence: number;
      recommendedService?: string;
      sources: string[];
      isFallback: boolean;
    }
  | {
      type: 'chunk';
      text: string;
    }
  | {
      type: 'done';
      fullAnswer: string;
      intent: IntentType;
      confidence: number;
      recommendedService?: string;
      sources: string[];
      suggestLeadCapture: boolean;
      quickActions: string[];
      followUpQuestions: string[];
      isFallback: boolean;
    };

export async function* generateConsultationResponseStream(
  userMessage: string,
  chatHistory: { sender: 'user' | 'bot'; text: string }[] = [],
  selectedNeed?: string,
  simulateTyping = true
): AsyncGenerator<AIStreamEvent, void, unknown> {
  const query = (selectedNeed ? `${selectedNeed}: ` : '') + userMessage;
  const { intent, confidence } = detectIntent(query);

  // Retrieve relevant knowledge chunks
  const retrievedChunks = retrieveKnowledge(query, 4);

  // Check if query is completely unknown or gibberish
  const isQueryUnclear =
    confidence < 0.15 &&
    retrievedChunks.length > 0 &&
    retrievedChunks[0].score < 0.8 &&
    userMessage.trim().length > 3;

  // Determine recommended service based on intent or retrieved topics
  let recommendedService: string | undefined;
  if (intent === 'funding') recommendedService = 'Funding & Investment Advisory';
  else if (intent === 'growth') recommendedService = 'Business Growth & Market Expansion';
  else if (intent === 'profitability') recommendedService = 'Profitability & Operational Excellence';
  else if (intent === 'capacity_building') recommendedService = 'Capacity Building (The Executive Business Program)';
  else if (intent === 'company_information') recommendedService = 'Inpartner Corporate Advisory';

  // Lead capture triggers: business problems, questions about engaging or pricing or specific company needs
  const leadCaptureTriggers = [
    'funding',
    'profitability',
    'growth',
    'capacity_building',
    'contact'
  ];
  const suggestLeadCapture =
    leadCaptureTriggers.includes(intent) ||
    /pricing|fee|cost|consult|consultation|schedule|meeting|contact|proposal|help|my company|reach out/i.test(userMessage);

  // Determine follow-up questions in English
  const followUpQuestions: string[] = [];
  if (intent === 'profitability') {
    followUpQuestions.push(
      'Is the margin compression primarily driven by operating expenses (OPEX) or cost of goods sold (COGS)?',
      'Would you like Inpartner consultants to conduct an operational diagnostic and cost structure audit?'
    );
  } else if (intent === 'funding') {
    followUpQuestions.push(
      'What is your target funding amount for your corporate expansion plans?',
      'Do you already have an institutional-grade financial model or investor pitch deck prepared?'
    );
  } else if (intent === 'growth') {
    followUpQuestions.push(
      'Is your expansion focused on new market segments or opening new geographic branches?',
      'Do you require market feasibility research and competitor landscape benchmarking?'
    );
  } else if (intent === 'capacity_building') {
    followUpQuestions.push(
      'How many C-level executives or management leaders will participate in the program?',
      'Should the curriculum focus on strategic leadership or operational workflow execution?'
    );
  } else {
    followUpQuestions.push(
      'Which advisory pillar aligns most closely with your immediate business priorities?',
      'Would you like to schedule an exploratory discussion with the Inpartner Business Development team?'
    );
  }

  // Quick action chips in English
  const quickActions = [
    '💡 Profitability Solutions',
    '💰 Funding & Investor Advisory',
    '📈 Business Growth Strategy',
    '👥 Capacity Building Program',
    '📞 Contact Inpartner Advisors'
  ];

  const sources = retrievedChunks.slice(0, 3).map((c) => c.title);

  // Yield initial metadata event
  yield {
    type: 'start',
    intent,
    confidence: isQueryUnclear ? 0.1 : confidence,
    recommendedService,
    sources,
    isFallback: isQueryUnclear
  };

  let fullText = '';
  let streamSucceeded = false;

  // 1. Try real Gemini API streaming if key is set in environment
  const geminiApiKey = process.env.GEMINI_API_KEY;
  if (geminiApiKey && !isQueryUnclear) {
    try {
      const genAI = new GoogleGenerativeAI(geminiApiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const contextText = retrievedChunks
        .map((c, i) => `[Source ${i + 1}: ${c.title} (${c.sourceFile})]\n${c.content}`)
        .join('\n\n---\n\n');

      const prompt = `${SYSTEM_PROMPT}

CONTEXT KNOWLEDGE BASE:
${contextText}

VISITOR INQUIRY:
"${userMessage}"

FORMAT INSTRUCTIONS:
1. Provide a direct, strategic, and practical answer tailored to the visitor's corporate challenges.
2. Identify the relevant Inpartner advisory pillar.
3. Outline tangible steps for how Inpartner guides client engagements.
4. Offer an option to schedule an advisory consultation with Inpartner senior partners.
Use clean markdown formatting with bullet points.`;

      const result = await model.generateContentStream(prompt);
      for await (const chunk of result.stream) {
        const piece = chunk.text();
        if (piece) {
          fullText += piece;
          yield { type: 'chunk', text: piece };
        }
      }
      streamSucceeded = true;
    } catch (err) {
      console.warn('Gemini streaming call failed, falling back to offline RAG engine:', err);
    }
  }

  // 2. If Gemini API was not used or failed, use grounded offline RAG or fallback
  if (!streamSucceeded) {
    const targetAnswer = isQueryUnclear
      ? `I apologize, but I do not have sufficient official documentation regarding that specific question in the Inpartner knowledge base.

To comprehensively address your specific business requirements, Inpartner senior consultants are available for a direct consultation.

You can:
1. Select one of our 4 core advisory pillars: **Funding**, **Growth**, **Profitability**, or **Capacity Building**.
2. Submit your contact details using the consultation form below.
3. Directly connect with our advisory team on WhatsApp at **[+62 896 2831 0192](https://wa.me/6289628310192)** or email **corporatesecretary@inpartner.id**.`
      : buildGroundedAnswer(userMessage, intent, retrievedChunks);

    if (simulateTyping) {
      // Natural typewriter token streaming (~18ms per batch of 2-3 words)
      const tokens = targetAnswer.split(/(\s+)/);
      let buffer = '';
      for (let i = 0; i < tokens.length; i++) {
        buffer += tokens[i];
        if (i % 3 === 0 || tokens[i].includes('\n') || i === tokens.length - 1) {
          if (buffer) {
            fullText += buffer;
            yield { type: 'chunk', text: buffer };
            buffer = '';
            await new Promise((r) => setTimeout(r, 18));
          }
        }
      }
      if (buffer) {
        fullText += buffer;
        yield { type: 'chunk', text: buffer };
      }
    } else {
      fullText = targetAnswer;
      yield { type: 'chunk', text: targetAnswer };
    }
  }

  // Yield completion event with all contextual metadata
  yield {
    type: 'done',
    fullAnswer: fullText,
    intent,
    confidence: isQueryUnclear ? 0.1 : confidence,
    recommendedService,
    sources: isQueryUnclear ? ['Inpartner FAQ & Advisory Directory'] : sources,
    suggestLeadCapture: isQueryUnclear ? true : suggestLeadCapture,
    quickActions,
    followUpQuestions: isQueryUnclear
      ? [
          'Could you share more details about your current business goals or challenges?',
          'Would you like our advisory team to contact you directly on WhatsApp?'
        ]
      : followUpQuestions,
    isFallback: isQueryUnclear
  };
}

export async function generateConsultationResponse(
  userMessage: string,
  chatHistory: { sender: 'user' | 'bot'; text: string }[] = [],
  selectedNeed?: string
): Promise<AIResponse> {
  const stream = generateConsultationResponseStream(userMessage, chatHistory, selectedNeed, false);
  let finalResponse: AIResponse = {
    answer: '',
    intent: 'unknown',
    confidence: 0,
    sources: [],
    suggestLeadCapture: false,
    quickActions: [],
    followUpQuestions: [],
    isFallback: false
  };

  for await (const event of stream) {
    if (event.type === 'done') {
      finalResponse = {
        answer: event.fullAnswer,
        intent: event.intent,
        confidence: event.confidence,
        recommendedService: event.recommendedService,
        sources: event.sources,
        suggestLeadCapture: event.suggestLeadCapture,
        quickActions: event.quickActions,
        followUpQuestions: event.followUpQuestions,
        isFallback: event.isFallback
      };
    }
  }

  return finalResponse;
}

function buildGroundedAnswer(
  query: string,
  intent: IntentType,
  chunks: RetrievedChunk[]
): string {
  const topChunk = chunks[0];
  const queryLower = query.toLowerCase();

  // Specific query handling for common business problems
  if (
    queryLower.includes('profit margin') ||
    queryLower.includes('margin') ||
    queryLower.includes('opex') ||
    (intent === 'profitability' && (queryLower.includes('drop') || queryLower.includes('down') || queryLower.includes('decline') || queryLower.includes('fall')))
  ) {
    return `Certainly, **Inpartner actively helps enterprises resolve this challenge** through our **Profitability & Operational Excellence** pillar.

A scenario where revenue rises while net profitability shrinks is a frequent challenge known as the *growth paradox*. This is typically driven by:
- **Workflow Inefficiencies:** Unstandardized operational processes struggling under increasing transaction volumes.
- **OPEX Inflation:** Operating expenditures escalating faster than top-line revenue growth.
- **Supply Chain Leakage:** Unoptimized procurement costs, supplier dependencies, and logistics overhead.
- **Pricing Strategy Gaps:** Unit margins that fail to capture recent increases in variable operating costs.

### How Inpartner Guides Your Enterprise:
1. **End-to-End Operational Workflow Audit:** Pinpoint operational bottlenecks and eliminate non-value-adding activities (*lean waste elimination*).
2. **Cost Structure & Unit Economics Diagnostic:** Dissect COGS and OPEX drivers to isolate margin leakage sources.
3. **Alignment of People, Process, Technology & Data:** Establish real-time KPI Dashboards and standardized operating procedures (SOPs) so economies of scale directly convert to healthy net profitability.

Our senior advisory team is ready to assist your company in restoring sustainable profit margins. You can leave your details below or connect immediately with our advisory team via WhatsApp at **[+62 896 2831 0192](https://wa.me/6289628310192)**.`;
  }

  if (queryLower.includes('loan') || queryLower.includes('borrow') || (intent === 'funding' && queryLower.includes('money'))) {
    return `Inpartner is **not a direct lending institution or bank** (*not a direct lender*).

However, through our **Funding & Investment Advisory** pillar, Inpartner prepares and positions mid-market and corporate enterprises for institutional capital:
- **Investment Readiness:** Evaluating corporate readiness, refining institutional-grade financial models, and crafting executive investment materials (*Investment Teasers & Pitch Decks*).
- **Independent Business Valuation:** Establishing credible, defensible fair market valuations using DCF and market multiples.
- **Capital Structure Optimization:** Structuring the ideal blend of equity, convertible notes, or mezzanine financing.
- **Access to Verified Investor Networks:** Connecting your enterprise directly with active institutional investors (Venture Capital, Private Equity, Family Offices, and strategic corporate partners).

Is your company actively preparing for a capital raise or expansion round? Our advisory team can provide an initial Investment Readiness assessment.`;
  }

  if (intent === 'contact' || queryLower.includes('address') || queryLower.includes('office') || queryLower.includes('location')) {
    return `You can reach the official team at **Inpartner (PT Inpartner Optima Integra)** through the following corporate channels:

📍 **Jakarta Head Office:**
Pakuwon Tower, 10th Floor, Jl. Raya Casablanca Kav. 88, Menteng Dalam, Tebet, South Jakarta.

📍 **Surabaya Office:**
Jemur Sari Street V No. 10, Surabaya, East Java.

📞 **Phone & WhatsApp:**
[+62 896 2831 0192](https://wa.me/6289628310192)

✉️ **Official Email:**
[corporatesecretary@inpartner.id](mailto:corporatesecretary@inpartner.id)

🕒 **Business Hours:**
Monday – Friday, 09:00 – 17:00 WIB (UTC+7).

Please submit your business requirements below or schedule an exploratory consultation session with our advisory team!`;
  }

  if (intent === 'capacity_building') {
    return `The **Capacity Building (The Executive Business Program / Inpartner Academy)** advisory pillar is designed to strengthen executive capabilities and managerial leadership in navigating competitive and evolving market landscapes.

### Core Program Scope:
- **The Executive Business Program:** Comprehensive executive curriculum for C-level leaders, Board of Directors, and business unit heads covering *Strategic Thinking*, *Financial Acumen*, and organizational governance.
- **In-House Corporate Workshops & Training:** Customized practical training tailored to real industry case studies of your enterprise.
- **Executive Leadership Coaching & Mentoring:** Ongoing advisory to bridge boardroom strategy with field operational execution.
- **Implementation Toolkits:** Practical frameworks including *KPI Scorecards*, *SOP templates*, and governance monitoring systems.

The program focuses on elevating workforce productivity, cross-functional synergy, and disciplined execution of your strategic business plans.`;
  }

  if (intent === 'growth') {
    return `Inpartner's **Growth (Business & Market Growth)** advisory pillar guides mid-market and expanding enterprises in formulating resilient, data-driven expansion strategies.

### Strategic Advisory Focus:
- **Market Opportunity & Segmentation Studies:** Identifying untapped market demand, analyzing evolving customer behavior, and evaluating competitor positioning.
- **Strategic Business Planning:** Formulating comprehensive 3–5 year strategic business plans aligned with internal capabilities and technology.
- **Go-to-Market & Geographic Expansion:** Structuring expansion roadmaps into new regional territories or diversified sales channels.
- **Strategic Partnerships:** Structuring and negotiating high-value corporate partnerships and joint venture alliances.

Inpartner senior consultants not only design actionable roadmaps but also partner with executive management throughout strategic execution.`;
  }

  if (intent === 'funding') {
    return `Inpartner's **Funding & Investment** advisory pillar assists enterprises in structuring, planning, and securing capital from institutional investors and strategic financiers.

### Advisory Scope:
- **Investment Readiness Assessment:** Validating corporate governance, financial audit readiness, and legal structuring prior to investor presentations.
- **Valuation & Financial Modeling:** Building robust multi-scenario financial forecasts and verifiable corporate valuations.
- **Investor Collateral Preparation:** Producing institutional-grade *Investment Pitch Decks* and *Executive Teasers*.
- **Investor Network Introductions:** Providing direct access to vetted Venture Capital, Private Equity, Family Offices, and specialized financing partners across key sectors including ESG, renewable energy, F&B, manufacturing, and technology.

*Note: Inpartner is an independent advisory firm and adheres strictly to professional advisory standards.*`;
  }

  if (intent === 'company_information') {
    return `**PT Inpartner Optima Integra (INPARTNER)** is a leading independent business and management consultancy based in South Jakarta (Pakuwon Tower, 10th Floor) and Surabaya.

Established by seasoned professionals since 2009, Inpartner began as a specialized consultancy empowering businesses in market access, capital raising, and operational productivity in East Java. Today, Inpartner has expanded into a comprehensive strategic advisory partner for mid-market and enterprise corporations across Indonesia and Southeast Asia.

**Vision:** *"The Most Trusted Consulting Partner To help create positive and enduring changes with Local and Global Coverage."*

**Core Philosophy:** *"Go Beyond than Just Consultancy"* — dedicated to unlocking strategic financing (*funding*), accelerating market expansion (*business development*), and empowering executive talent (*people development*).

**Four Core Advisory Pillars:**
1. Funding & Investment Advisory
2. Business Growth & Market Expansion
3. Profitability & Operational Excellence
4. Capacity Building (The Executive Business Program)`;
  }

  // Generic Grounded Response using top chunk
  if (topChunk) {
    return `Based on official Inpartner advisory documentation regarding **${topChunk.title}**:

${topChunk.content.substring(0, 450).trim()}...

Inpartner partners with client enterprises using a holistic advisory approach aligning corporate strategy, operational processes, people, and technology.

For a comprehensive discussion tailored to your company's immediate priorities, feel free to submit your inquiry below or connect directly with our advisory team on WhatsApp at **[+62 896 2831 0192](https://wa.me/6289628310192)**.`;
  }

  return `Inpartner is prepared to assist your enterprise across our 4 core pillars: **Funding**, **Growth**, **Profitability**, and **Capacity Building**.

Please share your specific business objectives or corporate challenges, or schedule an exploratory consultation with our senior advisory team.`;
}
