# Paper to Playground

**Turn academic papers into interactive, level-adapted lessons—with concept maps, quizzes, sliders, a chatbot, and related papers.**

Paper to Playground is a web app that takes a research paper (PDF upload or arXiv/OpenReview URL), extracts its text, and uses an LLM to generate a structured, interactive lesson tailored to the reader’s background (beginner → expert). You get sections with key takeaways, a concept map, interactive widgets (sliders, comparisons, animations), a quiz, related paper suggestions, and a floating chatbot to ask follow-up questions—all in one place.

---

## Features

- **PDF or URL input** — Upload a PDF or paste an arXiv/OpenReview URL; the app fetches and parses the paper.
- **Background level** — Choose **Beginner**, **Undergrad**, **Grad**, or **Expert** so the generated content matches your level (analogies vs. full methodology).
- **Structured lesson** — Sections with Markdown + LaTeX (KaTeX), TL;DR, and one-sentence key takeaways.
- **Concept map** — Interactive graph of concepts (nodes + edges) with prerequisites and difficulty.
- **Interactive elements** — Sliders (parameter exploration), before/after comparisons, and step-by-step animations.
- **Quiz** — Multiple-choice questions (conceptual, application, what-if) with explanations and section references.
- **Related papers** — AI-suggested follow-up papers; optional search via [Exa](https://exa.ai) for discovery. Clicking a discovered paper opens it in a new tab, ready to generate a lesson.
- **Paper chatbot** — Floating chat widget to ask follow-up questions about the paper. Supports markdown, LaTeX, and tables in responses.
- **Deep links** — Open a paper by URL with `?url=<encoded-paper-url>` for sharing or related-paper flows.

---

## Tech Stack

| Layer        | Technology |
|-------------|------------|
| Framework   | [Next.js 16](https://nextjs.org) (App Router, Turbopack) |
| UI         | React 19, [Tailwind CSS 4](https://tailwindcss.com) |
| Diagrams   | [React Flow](https://reactflow.dev) + [Dagre](https://github.com/dagrejs/dagre) for layout |
| Math       | [KaTeX](https://katex.org) via `react-markdown` + `remark-math` + `rehype-katex` + `remark-gfm` |
| PDF        | [pdf-parse](https://www.npmjs.com/package/pdf-parse) (server-side) |
| LLM        | [OpenRouter](https://openrouter.ai) (e.g. Nemotron 3 Nano 30B) for lesson generation |
| Search     | [Exa](https://exa.ai) (optional) for related-paper search |

---

## Prerequisites

- **Node.js** 18+ (recommend 20+)
- **npm** (or yarn/pnpm)
- **OpenRouter API key** — [Get one](https://openrouter.ai/keys); used for lesson generation.
- **Exa API key** (optional) — [Get one](https://exa.ai); used for “search related papers” and richer related-paper discovery.

---

## Quick Start

### 1. Clone and install

```bash
git clone https://github.com/SinfulSoul007/paper-to-playground.git
cd paper-to-playground
npm install
```

### 2. Environment variables

Copy the example env file and fill in your keys:

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

```env
# Required for lesson generation (OpenRouter)
OPENROUTER_API_KEY=your_openrouter_api_key_here

# Optional: for related-paper search (Exa)
EXA_API_KEY=your_exa_api_key_here
```

Without `EXA_API_KEY`, the app still runs; related-paper search (or Exa-backed discovery) will be disabled or fallback to AI-only suggestions.

### 3. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Upload a PDF or paste an arXiv URL (e.g. `https://arxiv.org/abs/1706.03762`), pick a level, and wait for the lesson to generate.

### 4. Build for production

```bash
npm run build
npm start
```

---

## Project structure

```
paper-to-playground/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── chat/              # POST: ask questions about the paper
│   │   │   ├── generate-lesson/   # POST: paperText + level → full lesson JSON
│   │   │   ├── parse-pdf/         # POST: file or url → { text, title }
│   │   │   └── search-papers/    # POST: query → Exa results (related papers)
│   │   ├── layout.tsx
│   │   └── page.tsx               # Main app: landing → level-select → loading → lesson
│   ├── components/
│   │   ├── LandingPage.tsx        # Upload / URL input, example papers
│   │   ├── LevelSelect.tsx        # Beginner / Undergrad / Grad / Expert
│   │   ├── LoadingScreen.tsx      # Generation in progress
│   │   ├── LessonView.tsx         # Lesson shell + sidebar
│   │   ├── SectionCard.tsx        # Section content + key takeaway
│   │   ├── ConceptMap.tsx         # React Flow concept graph
│   │   ├── Quiz.tsx               # Quiz questions + explanations
│   │   ├── InteractiveSlider.tsx
│   │   ├── InteractiveComparison.tsx
│   │   ├── InteractiveAnimation.tsx
│   │   ├── RelatedPapers.tsx      # Related papers + optional Exa search
│   │   ├── PaperChat.tsx          # Floating chatbot for paper Q&A
│   │   ├── MarkdownRenderer.tsx   # Markdown + LaTeX (KaTeX) + GFM tables
│   │   └── Sidebar.tsx
│   └── lib/
│       ├── api.ts                 # Client: parsePdf, generateLesson, searchPapers, chatWithPaper
│       └── types.ts               # LessonData, sections, concept map, quiz, etc.
├── .env.local.example
├── next.config.ts
├── package.json
└── README.md
```

---

## API overview

All APIs are under `src/app/api/`.

| Endpoint            | Method | Body / usage | Description |
|---------------------|--------|--------------|-------------|
| `/api/parse-pdf`    | POST   | `FormData` with `file`, or JSON `{ url }` | Extract text (and title) from PDF. |
| `/api/generate-lesson` | POST | `{ paperText: string, level: 'beginner' \| 'undergrad' \| 'grad' \| 'expert' }` | Generate full lesson JSON (sections, concept map, quiz, interactives, related papers). |
| `/api/search-papers`   | POST | `{ query: string }` | Search research papers via Exa (requires `EXA_API_KEY`). |
| `/api/chat`            | POST | `{ message: string, paperText: string, history: {role, content}[] }` | Chat about the paper; returns `{ reply: string }`. |

Lesson JSON shape (see `src/lib/types.ts` and the system prompt in `generate-lesson/route.ts`) includes: `paperTitle`, `authors`, `tldr`, `sections[]`, `conceptMap`, `interactiveElements[]`, `quiz[]`, `relatedPapers[]`.

---

## Configuration

- **Next.js** — `next.config.ts`: Turbopack root, `serverExternalPackages: ['pdf-parse']`.
- **LLM** — In `src/app/api/generate-lesson/route.ts` the app uses OpenRouter with a default model (e.g. `nvidia/nemotron-3-nano-30b-a3b:free`). You can change the model or add fallbacks there.
- **Paper text length** — Paper text is truncated (e.g. 40k chars) before sending to the LLM; see `generate-lesson/route.ts`. If the response is truncated, the API retries with a shorter slice.

---

## Scripts

| Command        | Description |
|----------------|-------------|
| `npm run dev`  | Start Next.js dev server (Turbopack). Clears dev lock before start. |
| `npm run build`| Production build. |
| `npm start`    | Run production server. |

---

## License

MIT (or your chosen license).

---

## Contributing

1. Fork the repo.
2. Create a branch, make changes, run `npm run build` (and lint if you add it).
3. Open a PR with a short description of the change.

---

**Paper to Playground** — from PDF to interactive lesson in one flow.
