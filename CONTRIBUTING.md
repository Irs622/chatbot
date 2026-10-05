# 🤝 Contributing to Inpartner AI Assistant & CRM

Welcome to the **Inpartner AI Business Consultation Assistant & CRM** repository. We appreciate contributions from our software engineering team, business development consultants, and digital infrastructure partners.

This guide outlines our development workflow, coding standards, quality assurance procedures, and guidelines for maintaining our corporate knowledge base.

---

## 🧭 Code of Conduct

All contributors are expected to uphold respectful, inclusive, and professional collaboration as defined in our [`CODE_OF_CONDUCT.md`](./CODE_OF_CONDUCT.md).

---

## 🛠️ 1. Getting Started Locally

### Prerequisites
- **Node.js:** v20.x or higher (LTS recommended)
- **npm:** v9.x or higher
- **Git:** v2.30+

### Setup Steps
1. **Clone the Repository:**
   ```bash
   git clone https://github.com/inpartner/chatbot.git
   cd chatbot
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   ```bash
   cp .env.local.example .env.local
   ```
   *Edit `.env.local` with your development Supabase credentials and Gemini API key.*

4. **Verify Database & Connectivity:**
   ```bash
   npm run db:check
   ```

5. **Start Development Server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view the chat assistant simulator.

---

## 🌿 2. Git Branching & Workflow

We follow a structured Git feature branch workflow:

### Branch Naming Conventions:
| Prefix | Description | Example |
| :--- | :--- | :--- |
| `feat/` | New product feature or capability | `feat/whatsapp-booking-flow` |
| `fix/` | Bug fix or regression repair | `fix/safari-keyboard-viewport` |
| `docs/` | Documentation update or new guide | `docs/add-admin-manual` |
| `test/` | Adding or refactoring test suites | `test/add-lead-qualification-tests` |
| `knowledge/`| Updating corporate advisory content | `knowledge/q3-projects-update` |
| `refactor/`| Code refactoring without behavioral change | `refactor/rag-scoring-pipeline` |

### Pull Request Process:
1. Create a branch from `main`:
   ```bash
   git checkout -b feat/your-feature-name
   ```
2. Make granular, focused commits.
3. Ensure all tests pass (`npm test` and `npm run test:report`).
4. Ensure no ESLint violations (`npm run lint`).
5. Open a Pull Request targeting `main`. Describe what changed, the business motivation, and attach screenshots for UI modifications.
6. Obtain approval from at least one core engineer or technical partner before merging.

---

## 💬 3. Commit Message Standards

We strictly adhere to **Conventional Commits (v1.0.0)**:

```text
<type>(<scope>): <short description in present tense>

[optional body explaining motivation and context]

[optional footer referencing issues or breaking changes]
```

### Supported Types:
- `feat`: A new feature for users or the CRM admin.
- `fix`: A bug fix.
- `docs`: Documentation-only changes.
- `style`: Formatting, missing semicolons, etc.; no code change.
- `refactor`: Refactoring production code without modifying external behavior.
- `perf`: Code change that improves execution speed or memory usage.
- `test`: Adding or correcting unit/integration tests.
- `chore`: Updating build scripts, dependencies, or configuration.

### Examples:
```bash
git commit -m "feat(rag): add Korean keyword tokenization for cross-border JV"
git commit -m "fix(crm): neutralize formula injection for values starting with @"
git commit -m "docs(api): document query parameters for GET /api/leads"
```

---

## 🧪 4. Quality Assurance & Testing Standards

The repository enforces a 14-layer native QA test suite. **No Pull Request will be merged with failing tests.**

### Running Tests:
```bash
# Run all test suites
npm test

# Run terminal executive visual report
npm run test:report

# Run ESLint linter
npm run lint
```

### When to Write Tests:
- **New Intent or NLP keywords:** Add assertions to `tests/intent.test.ts`.
- **RAG Chunking or Retrieval:** Add test cases to `tests/rag.test.ts`.
- **CRM / Lead Scoring Rules:** Update `tests/lead-scoring.test.ts`.
- **Security / Input Sanitization:** Add tests to `tests/validation-auth.test.ts`.

---

## 📚 5. Knowledge Base Guidelines for Consultants

Non-engineering team members (Business Development, Marketing, Managing Consultants) frequently update the RAG knowledge base in [`knowledge/`](./knowledge/):

1. **File Locations:**
   - Company Profile & Values: `knowledge/company/company-profile.md`
   - 5 Advisory Pillars: `knowledge/services/*.md`
   - Industry Verticals: `knowledge/sectors/sectors.md`
   - Case Studies & Track Record: `knowledge/projects/projects.md`
   - Contact Channels & Offices: `knowledge/contact/contact.md`
   - Consultation FAQ: `knowledge/faq/faq.md`

2. **Formatting Best Practices:**
   - Use clear markdown headers (`#`, `##`, `###`).
   - Use concise, factual bullet points.
   - Avoid vague marketing jargon; write grounded facts that the AI can confidently cite.
   - For detailed step-by-step guidance, refer to [`KNOWLEDGE_BASE_GUIDE.md`](./KNOWLEDGE_BASE_GUIDE.md).

3. **Verifying Knowledge Updates:**
   After editing any markdown file, run:
   ```bash
   npm test tests/config-knowledge.test.ts tests/rag.test.ts
   ```

---

## 🎨 6. Design System & Styling Rules

- **Brand Primary Color:** `#005DAD` (Inpartner Blue).
- **Dark Hover Variant:** `#004785`.
- **Tailwind CSS:** Utilize existing utility classes in `tailwind.config.ts`.
- **Accessibility:** Maintain minimum 4.5:1 contrast ratios for text elements against background colors.
- **Responsiveness:** Test UI across Desktop (1440px), Tablet (768px), and Mobile (375px/390px).

Thank you for helping build and refine the Inpartner AI Consultation Assistant!
