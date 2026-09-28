# Inpartner Knowledge Base Management Guide

This guide is designed for the **Inpartner Internal Team (Business Development, Consultants, Marketing, & Management)** to maintain and update corporate data, services, contact details, and case studies so the AI Assistant remains accurate, timely, and free of hallucinations.

---

## 📂 Where Is Data Stored?

All chatbot domain knowledge is maintained within the [`knowledge/`](./knowledge/) directory in lightweight **Markdown (`.md`)** files.

```text
knowledge/
├── company/
│   └── company-profile.md       # Official profile, vision, mission, values, ESG commitments
├── services/
│   ├── growth.md                # Business Growth & Market Expansion advisory
│   ├── funding.md               # Funding Readiness & Investment Advisory
│   ├── profitability.md         # Profitability & Margin/Cost Structure Optimization
│   └── capacity-building.md     # The Executive Business Program
├── sectors/
│   └── sectors.md               # 13 priority industrial advisory sectors
├── projects/
│   └── projects.md              # Track record, portfolio, and corporate case studies
├── faq/
│   └── faq.md                   # Frequently asked questions regarding engagement models
└── contact/
    └── contact.md               # Office locations, WhatsApp lines, email, operational hours
```

---

## ✍️ How to Add or Update Content

### 1. Updating Contact Details / Office Locations
Open [`knowledge/contact/contact.md`](./knowledge/contact/contact.md).
- If a new WhatsApp PIC number or branch address is established, simply update the markdown file.
- The AI Assistant references these contact channels dynamically during visitor inquiries and WhatsApp click-throughs.

### 2. Adding a New Case Study / Portfolio Entry
Open [`knowledge/projects/projects.md`](./knowledge/projects/projects.md).
Append a new section following this structure:
```markdown
### 5. [Case Study Title / Client Industry Sector]
- **Context:** [Client operational challenge, e.g., OPEX increased by 30% YoY]
- **Inpartner Role:** [Strategic advisory interventions deployed by our consulting team]
- **Measurable Impact:** [Concrete results achieved, e.g., 18% cost efficiency realized within 6 months]
```

### 3. Adding Frequently Asked Questions (FAQ)
Open [`knowledge/faq/faq.md`](./knowledge/faq/faq.md).
Append at the bottom:
```markdown
## Question: [Enter query here]
**Official Answer:** [Enter board-approved response here]
```

---

## 💡 Content Writing Principles for Grounded AI

1. **Use Distinct Section Headings (`##` or `###`):**
   The semantic chunking engine segments documents based on markdown headings (`##`). Clear descriptive headings (e.g., `## Advisory Engagement Fee Structure`) maximize retrieval precision.
2. **State Explicit Boundaries (*What We Don't Do*):**
   If Inpartner does not provide a specific service (e.g., *Inpartner is an independent advisory firm and does not provide direct balance-sheet loans or peer-to-peer lending*), document it explicitly so the AI firmly declines out-of-scope inquiries.
3. **Avoid Fixed Pricing for Bespoke Advisory:**
   Since strategic consulting fees depend on engagement scope, state:
   *"Advisory fees are customized following an initial diagnostic discovery session and tailored to engagement scope."*
4. **Maintain an Authoritative Executive Tone:**
   The AI mirrors the tone, terminology, and professionalism of its source documentation.

---

## 🔄 Deployment & Synchronization

- **Local Development**: Modifications to markdown files take effect on the very next query without restarting the server.
- **Production (Vercel)**: Simply `git commit` and `push` the updated files to `main`. Vercel automatically deploys the updated knowledge base within 1–2 minutes.
