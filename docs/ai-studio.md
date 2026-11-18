# VietCraft AI Studio

Seven admin-only assistants available at `/admin/ai-studio`:
SEO article, Amazon affiliate copy, SEO meta/alt, SEO audit, keyword calendar, social/email repurposing and GA4 weekly insights.

## Setup
Set `OPENAI_API_KEY` on the API service (never in Vite/client variables), optionally `OPENAI_MODEL=gpt-4o-mini`. Restart/deploy the API and Admin apps. The Express backend calls OpenAI Chat Completions over HTTPS; an API key with billing is required.

## Security
Route: `POST /api/admin/ai/generate`. Requires valid admin/editor JWT; capped at 8 requests per minute per IP, payload constrained by Zod and max output tokens. Generated work is draft content, not automatically published. No API key is returned to the browser.

## Usage
Choose a tool, enter topic and optional keywords. Affiliate copy MUST receive verified Amazon product details; URL alone is not verification. GA4 tool requires pasted export/metrics: it does not connect directly to GA4 or invent numbers.

## Limitations
AI output must be reviewed for accuracy, SEO quality, Amazon Associates compliance, accessible alt text and citations. Rate limiter uses in-memory store; for multi-instance deployments use a shared store. For GA4 real-time automatic retrieval, implement an authenticated Google Analytics Data API connector separately.

## Local checks
Run `npm install`, `npm run build` at workspace root and launch the API/Admin. Log into Admin and open `/admin/ai-studio`. Ensure `OPENAI_API_KEY` is configured on API host, test each tool, and confirm unauthenticated POST returns 401.
