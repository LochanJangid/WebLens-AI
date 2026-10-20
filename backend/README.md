# WebLens Backend Starter

Evidence-first website auditing backend. It inspects HTML, runs PageSpeed Insights, applies deterministic rules, translates findings with Groq, suggests content/page improvements, and generates prompts users can paste into a coding agent.

## Important MVP boundaries

- This is a backend starter, not a finished production service.
- Audit runs are currently returned synchronously and are not persisted.
- The first inspector fetches static HTML. It does not inspect the fully rendered DOM of JavaScript-heavy applications.
- The Groq responses are JSON objects but are not yet validated against dedicated output models.
- PageSpeed results are retained as evidence. The LLM layer is responsible for translating them into user-friendly findings.
- Review the URL safety layer before public deployment. Use network-level egress controls and revalidate DNS/redirect behavior to defend against SSRF and DNS rebinding.

## Setup

1. Create a virtual environment.
2. Install dependencies: `pip install -r requirements.txt`
3. Copy `.env.example` to `.env`.
4. Set `GROQ_API_KEY`. Set `PSI_API_KEY` for a configured PageSpeed API key; quota and access rules still apply.
5. Run: `uvicorn app.main:app --reload`
6. Open `/docs`.

## Endpoints

- `GET /health`
- `POST /api/v1/audits`
- `POST /api/v1/explanations`
- `POST /api/v1/agent-prompt`
- `POST /api/v1/content-plan`
- `POST /api/v1/chat`

## Example audit request

```json
{
  "url": "https://example.com/",
  "strategy": "mobile",
  "include_pagespeed": true
}
```

## Product design rule

Every AI recommendation should refer to actual evidence: a page URL, selector or element when known, observed text/attribute, why it matters, a concrete proposed change, and a verification step. Do not invent selectors, file names, frameworks, business facts, or guaranteed performance improvements.

## Next milestones

1. Add tests and strict response schemas for all AI outputs.
2. Persist websites, audits, snapshots, findings, recommendations and chat sessions in PostgreSQL.
3. Add bounded crawling and sitemap parsing.
4. Add Playwright for rendered DOM inspection where needed.
5. Improve finding prioritization and merge duplicate HTML/Lighthouse findings.
6. Add retrieval scoped to the selected website and audit.
7. Add background jobs, audit progress, rate limiting, authentication, and observability.
