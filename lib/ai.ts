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

const SYSTEM_PROMPT = `Anda adalah Inpartner AI Business Consultation Assistant, asisten konsultasi bisnis resmi untuk website Inpartner (https://inpartner.id/).
Inpartner adalah perusahaan konsultan bisnis dan manajemen (PT Inpartner Optima Integra) di Indonesia yang berfokus pada 4 pilar utama:
1. Funding & Investment
2. Growth (Business Growth & Expansion)
3. Profitability (Operational Process Optimization & Margin Enhancement)
4. Capacity Building (The Executive Business Program / Inpartner Academy)

ATURAN PERCAKAPAN & INTEGRITAS (SANGAT PENTING):
1. Jawab pertanyaan hanya berdasarkan informasi resmi pada Context Knowledge Base yang diberikan.
2. JANGAN mengarang (halusinasi) layanan yang tidak ada, besaran harga/fee, janji imbal hasil investasi, atau persentase keuntungan.
3. Inpartner BUKAN pemberi pinjaman langsung (bukan bank/direct lender). Inpartner membantu kesiapan investasi, valuasi, penyusunan teaser/pitch deck, dan menghubungkan dengan jejaring investor.
4. Jika informasi tidak tersedia pada Context, katakan secara transparan dan jujur bahwa Anda belum memiliki informasi resmi tersebut, lalu arahkan visitor untuk berdiskusi langsung dengan tim konsultan Inpartner.
5. Gunakan bahasa profesional, solutif, ramah, dan terstruktur (menggunakan poin-poin jelas dan rekomendasi langkah nyata).
6. Berikan rekomendasi layanan Inpartner yang relevan dan dorong visitor untuk menjadwalkan konsultasi atau meninggalkan kontak.`;

export async function generateConsultationResponse(
  userMessage: string,
  chatHistory: { sender: 'user' | 'bot'; text: string }[] = [],
  selectedNeed?: string
): Promise<AIResponse> {
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
    /harga|biaya|konsultasi|jadwal|meeting|kontak|proposal|bantu|perusahaan saya/i.test(userMessage);

  // Determine follow-up questions
  const followUpQuestions: string[] = [];
  if (intent === 'profitability') {
    followUpQuestions.push(
      'Apakah penurunan laba terutama disebabkan oleh kenaikan beban operasional (OPEX) atau biaya pokok penjualan (HPP)?',
      'Apakah Anda ingin tim Inpartner melakukan audit struktur biaya dan pemetaan alur kerja operasional?'
    );
  } else if (intent === 'funding') {
    followUpQuestions.push(
      'Berapa estimasi kebutuhan modal permodalan yang sedang direncanakan perusahaan Anda?',
      'Apakah dokumen financial model atau pitch deck sudah dipersiapkan?'
    );
  } else if (intent === 'growth') {
    followUpQuestions.push(
      'Apakah ekspansi difokuskan pada penetrasi segmen pasar baru atau pembukaan cabang geografis baru?',
      'Apakah Anda memerlukan studi riset kelayakan pasar dan pemetaan kompetitor?'
    );
  } else if (intent === 'capacity_building') {
    followUpQuestions.push(
      'Berapa jumlah pimpinan eksekutif atau tim manajerial yang direncanakan mengikuti program?',
      'Apakah pelatihan difokuskan pada strategic leadership atau eksekusi operasional bisnis?'
    );
  } else {
    followUpQuestions.push(
      'Layanan mana yang paling relevan dengan tantangan bisnis Anda saat ini?',
      'Ingin menghubungkan jadwal diskusi dengan tim Business Development Inpartner?'
    );
  }

  // Quick action chips
  const quickActions = [
    '💡 Solusi Profitability',
    '💰 Bantuan Funding & Investor',
    '📈 Rencana Growth Bisnis',
    '👥 Pelatihan Capacity Building',
    '📞 Hubungi Tim Inpartner'
  ];

  // Try real Gemini API if key is set in environment
  const geminiApiKey = process.env.GEMINI_API_KEY;
  if (geminiApiKey && !isQueryUnclear) {
    try {
      const genAI = new GoogleGenerativeAI(geminiApiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const contextText = retrievedChunks
        .map((c, i) => `[Sumber ${i + 1}: ${c.title} (${c.sourceFile})]\n${c.content}`)
        .join('\n\n---\n\n');

      const prompt = `${SYSTEM_PROMPT}

CONTEXT KNOWLEDGE BASE:
${contextText}

PERTANYAAN PENGUNJUNG:
"${userMessage}"

FORMAT JAWABAN:
1. Berikan penjelasan lugas dan terarah sesuai kebutuhan pengunjung.
2. Sebutkan area layanan Inpartner yang relevan.
3. Jelaskan langkah nyata bagaimana Inpartner mendampingi klien.
4. Tawarkan opsi untuk menjadwalkan konsultasi lebih mendalam dengan tim Inpartner.
Gunakan format markdown dengan bullet point rapi.`;

      const result = await model.generateContent(prompt);
      const text = result.response.text();

      return {
        answer: text,
        intent,
        confidence,
        recommendedService,
        sources: retrievedChunks.slice(0, 3).map((c) => c.title),
        suggestLeadCapture,
        quickActions,
        followUpQuestions,
        isFallback: false
      };
    } catch (err) {
      console.warn('Gemini API call failed, using intelligent offline RAG engine:', err);
    }
  }

  // Fallback Handling (FR-10) for completely unknown questions
  if (isQueryUnclear) {
    return {
      answer: `Maaf, saya belum memiliki informasi resmi yang memadai mengenai pertanyaan tersebut dalam knowledge base Inpartner.

Untuk mendiskusikan kebutuhan bisnis spesifik Anda secara komprehensif, tim konsultan Inpartner siap membantu melalui konsultasi langsung.

Anda dapat:
1. Memilih salah satu dari 4 pilar utama layanan kami: **Funding**, **Growth**, **Profitability**, atau **Capacity Building**.
2. Meninggalkan informasi kontak Anda melalui formulir di bawah.
3. Langsung menghubungi tim kami melalui WhatsApp di **[0896 2831 0192](https://wa.me/6289628310192)** atau email **corporatesecretary@inpartner.id**.`,
      intent: 'unknown',
      confidence: 0.1,
      sources: ['FAQ & Kontak Inpartner'],
      suggestLeadCapture: true,
      quickActions,
      followUpQuestions: [
        'Bisakah Anda menceritakan lebih detail kebutuhan bisnis Anda?',
        'Apakah Anda ingin tim kami menghubungi Anda melalui WhatsApp?'
      ],
      isFallback: true
    };
  }

  // Intelligent Grounded RAG Synthesis Engine (Offline & Fast < 200ms)
  const synthesis = buildGroundedAnswer(userMessage, intent, retrievedChunks);

  return {
    answer: synthesis,
    intent,
    confidence,
    recommendedService,
    sources: retrievedChunks.slice(0, 3).map((c) => c.title),
    suggestLeadCapture,
    quickActions,
    followUpQuestions,
    isFallback: false
  };
}

function buildGroundedAnswer(
  query: string,
  intent: IntentType,
  chunks: RetrievedChunk[]
): string {
  const topChunk = chunks[0];
  const queryLower = query.toLowerCase();

  // Specific query handling for common patterns
  if (
    queryLower.includes('profit margin menurun') ||
    queryLower.includes('omzet naik tapi laba turun') ||
    (intent === 'profitability' && (queryLower.includes('turun') || queryLower.includes('menurun')))
  ) {
    return `Tentu, **Inpartner dapat sangat membantu** permasalahan ini melalui pilar **Profitability & Operational Excellence**.

Situasi di mana omzet meningkat namun laba bersih tertekan adalah tantangan umum yang sering dihadapi perusahaan berkembang (*growth paradox*). Hal ini biasanya dipicu oleh:
- **Inefisiensi Alur Kerja:** Proses operasional yang belum terstandardisasi seiring bertambahnya volume kerja.
- **Pembengkakan Biaya Operasional (OPEX):** Beban operasional yang tumbuh lebih cepat dibandingkan pertambahan pendapatan.
- **Kebocoran Rantai Pasok:** Biaya pengadaan bahan dan logistik yang belum teroptimalkan (*procurement inefficiencies*).
- **Strategi Penetapan Harga (Pricing):** Margin per produk belum memperhitungkan kenaikan biaya variabel secara akurat.

### Bagaimana Inpartner Membantu Anda:
1. **Audit Alur Operasional Menyeluruh:** Mengidentifikasi bottleneck dan memangkas proses yang tidak bernilai tambah (*waste elimination*).
2. **Analisis Struktur Biaya & Unit Economics:** Membedah HPP dan OPEX untuk menemukan sumber kebocoran margin.
3. **Penyelarasan People, Process, Technology & Data:** Membangun Dashboard KPI real-time dan SOP yang terukur agar skala ekonomi (*economies of scale*) benar-benar terwujud menjadi keuntungan bersih.

Tim konsultan Inpartner siap mendampingi perusahaan Anda untuk mengembalikan profitabilitas yang sehat. Anda dapat meninggalkan kontak di bawah atau langsung terhubung dengan tim kami via WhatsApp di **[0896 2831 0192](https://wa.me/6289628310192)**.`;
  }

  if (queryLower.includes('pinjaman') || (intent === 'funding' && queryLower.includes('pinjam'))) {
    return `Inpartner **bukan lembaga keuangan pemberi pinjaman langsung** (*not a direct lender* atau perbankan). 

Namun, melalui pilar **Funding & Investment Advisory**, Inpartner membantu perusahaan dalam:
- **Investment Readiness:** Mengevaluasi kesiapan bisnis, merapikan model keuangan (*financial model*), dan menyusun materi presentasi investor (*Investment Teaser & Pitch Deck*) berstandar institusi.
- **Valuasi Bisnis Obyektif:** Menentukan nilai wajar perusahaan secara independen.
- **Penataan Struktur Permodalan:** Membantu memilih struktur permodalan yang tepat (*equity*, *convertible note*, atau *mezzanine*).
- **Akses ke Jejaring Investor:** Menghubungkan bisnis Anda dengan ekosistem investor terverifikasi (Venture Capital, Private Equity, Family Offices, dan mitra strategis).

Apakah perusahaan Anda sedang merencanakan penghimpunan modal untuk ekspansi? Tim Inpartner dapat memberikan panduan kesiapan investasi awal.`;
  }

  if (intent === 'contact' || queryLower.includes('alamat') || queryLower.includes('kantor') || queryLower.includes('nomor')) {
    return `Anda dapat menghubungi tim resmi **Inpartner (PT Inpartner Optima Integra)** melalui saluran berikut:

📍 **Kantor Pusat Jakarta:**
Pakuwon Tower Lantai 10, Jl. Raya Casablanca Kav. 88, Menteng Dalam, Tebet, Jakarta Selatan.

📍 **Kantor Surabaya:**
Jemur Sari Street V No. 10, Surabaya, Jawa Timur.

📞 **Telepon & WhatsApp:**
[0896 2831 0192](https://wa.me/6289628310192)

✉️ **Email Resmi:**
[corporatesecretary@inpartner.id](mailto:corporatesecretary@inpartner.id)

🕒 **Jam Operasional:**
Senin – Jumat, pukul 09.00 – 17.00 WIB.

Silakan sampaikan kebutuhan bisnis Anda atau jadwalkan sesi konsultasi awal dengan tim kami!`;
  }

  if (intent === 'capacity_building') {
    return `Layanan **Capacity Building (The Executive Business Program / Inpartner Academy)** Inpartner dirancang khusus untuk memperkuat kapabilitas manajerial dan kepemimpinan tim Anda dalam menghadapi persaingan bisnis yang dinamis.

### Ruang Lingkup Program:
- **The Executive Business Program:** Modul kurikulum komprehensif bagi C-level, Board of Directors, dan pimpinan unit bisnis mengenai *Strategic Thinking*, *Financial Acumen*, dan tata kelola organisasi.
- **In-House Workshops & Training:** Pelatihan praktis yang disesuaikan secara spesifik dengan studi kasus nyata industri perusahaan Anda.
- **Leadership Coaching & Mentoring:** Pendampingan berkala untuk menjembatani strategi direksi dengan eksekusi tim di lapangan.
- **Implementation Toolkits:** Penyediaan kerangka kerja (*KPI Scorecards*, *SOP templates*, dan sistem monitoring).

Tujuan utama program ini adalah meningkatkan produktivitas, efisiensi kerja tim, dan memastikan rencana bisnis dapat diimplementasikan secara solid.`;
  }

  if (intent === 'growth') {
    return `Layanan **Growth (Business & Market Growth)** Inpartner membantu perusahaan menengah dan besar merancang strategi ekspansi yang terukur dan berdaya tahan tinggi.

### Fokus Pendampingan Inpartner:
- **Riset & Studi Segmen Potensial:** Memetakan peluang pasar baru, menganalisis dinamika konsumen, dan mengidentifikasi tren industri sebelum disrupsi terjadi.
- **Strategic Business Planning:** Merumuskan peta jalan bisnis 3–5 tahun yang selaras dengan kapabilitas internal dan teknologi.
- **Go-to-Market & Geographic Expansion:** Strategi penetrasi wilayah/kota baru atau diversifikasi saluran penjualan (*sales channels*).
- **Strategic Partnerships:** Menjajaki kemitraan strategis bernilai tinggi untuk mempercepat penetrasi pasar.

Konsultan Inpartner tidak hanya merumuskan strategi di atas kertas, tetapi juga mendampingi manajemen dalam mengeksekusi rencana bisnis tersebut.`;
  }

  if (intent === 'funding') {
    return `Layanan **Funding & Investment** Inpartner mendampingi perusahaan dalam merencanakan, menstrukturkan, dan memperoleh akses permodalan dari mitra investor institusional.

### Ruang Lingkup Layanan:
- **Investment Readiness Assessment:** Memastikan kesiapan tata kelola, legalitas, dan finansial perusahaan sebelum bertemu investor.
- **Valuasi & Financial Modeling:** Penyusunan proyeksi keuangan yang realistis dan valuasi bisnis yang dapat dipertanggungjawabkan.
- **Penyusunan Materi Investasi:** Membuat *Pitch Deck* dan *Investment Teaser* terstruktur berstandar internasional.
- **Koneksi Mitra Modal:** Membuka akses ke ekosistem Venture Capital, Private Equity, Family Offices, maupun pembiayaan alternatif di sektor-sektor unggulan seperti ESG, energi terbarukan, F&B, dan teknologi.

*Catatan: Inpartner bukan direct lender dan mematuhi regulasi integritas profesional konsultan independen.*`;
  }

  if (intent === 'company_information') {
    return `**PT Inpartner Optima Integra (INPARTNER)** adalah perusahaan konsultan bisnis dan manajemen independen yang berpusat di Jakarta Selatan (Pakuwon Tower Lt. 10) dan Surabaya.

Didirikan oleh para profesional sejak tahun 2009, Inpartner berawal sebagai konsultan pengembangan pasar, akses permodalan, dan peningkatan produktivitas bagi sektor usaha di Jawa Timur. Saat ini, Inpartner telah berkembang menjadi mitra strategis komprehensif bagi korporasi menengah dan besar di tingkat nasional dan regional.

**Visi:** *"The Most Trusted Consulting Partner To help create positive and endure changes in Local and Global Coverage."*

**Nilai Utama:** *"Go Beyond than Just Consultancy"* — berkomitmen membuka akses pembiayaan (*financing*), pengembangan pasar (*business development*), dan penguatan tim (*people development*).

**Empat Pilar Layanan:**
1. Funding & Investment
2. Business Growth
3. Profitability & Operational Excellence
4. Capacity Building (The Executive Business Program)`;
  }

  // Generic Grounded Response using top chunk
  if (topChunk) {
    return `Berdasarkan informasi resmi Inpartner mengenai **${topChunk.title}**:

${topChunk.content.substring(0, 450).trim()}...

Inpartner siap mendampingi perusahaan Anda dengan pendekatan holistik (*holistic approach*) yang menyelaraskan strategi, proses, sumber daya manusia, dan teknologi.

Untuk pembahasan lebih mendalam mengenai situasi bisnis Anda, Anda dapat meninggalkan kontak melalui formulir di bawah atau langsung menghubungi tim konsultan Inpartner melalui WhatsApp di **[0896 2831 0192](https://wa.me/6289628310192)**.`;
  }

  return `Inpartner siap membantu perusahaan Anda dalam empat area utama: **Funding**, **Growth**, **Profitability**, dan **Capacity Building**. 

Silakan beri tahu kami tantangan atau kebutuhan bisnis spesifik Anda, atau jadwalkan konsultasi langsung dengan tim Inpartner.`;
}
