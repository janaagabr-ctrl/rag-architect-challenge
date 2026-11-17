# RAG Architect Challenge

A 10-question quiz on Retrieval-Augmented Generation fundamentals, used as the final exercise of the RAG Fundamentals session. Scenario: an internal IT Support RAG Assistant.

**Live quiz:** https://janaagabr-ctrl.github.io/rag-architect-challenge/

QR codes for the live URL are in [`qr/`](qr/) (PNG at 1230 × 1230, plus SVG).

## Stack

React + TypeScript + Vite with plain CSS. React APIs are served by `preact/compat` at build time, so the whole site ships as one self-contained ~45 KB `docs/index.html`. It's fully static: no backend, no sign-in, no external API calls, and no personal data collected. In-progress answers are kept in `sessionStorage` so an accidental refresh doesn't lose them; Restart clears them.

## Develop

```bash
npm install
npm run dev      # local dev server
npm test         # data and scoring tests
npm run build    # writes docs/index.html
```

## Update the questions and redeploy

1. Edit `src/questions.ts`. Each question has `id`, `question`, `options`, `correctAnswer`, `points` and `explanation`. Score titles and thresholds are in `src/scoring.ts`; keep `src/scoring.test.ts` in step.
2. Rebuild and publish:

```bash
npm test && npm run build
git add -A && git commit -m "Update quiz questions" && git push
```

GitHub Pages serves `docs/` on the `main` branch and updates about a minute after the push. You can also upload a new `docs/index.html` through GitHub's web UI (Add file → Upload files).

## Scoring

1 point per question, 10 points in total. Percentage = points ÷ 10 × 100, rounded to a whole number.

| Points | Title |
| --- | --- |
| 9–10 | RAG Architect |
| 7–8 | Retrieval Pro |
| 5–6 | RAG Builder |
| 3–4 | RAG Apprentice |
| 0–2 | Time to Re-index |
