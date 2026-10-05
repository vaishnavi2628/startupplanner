// Provider-agnostic AI layer: Gemini, OpenAI, or a built-in mock for demos.
import { httpError } from '../utils/httpError.js';

const provider = () => (process.env.AI_PROVIDER || 'gemini').toLowerCase();

/* ---------- low-level provider calls ---------- */

async function callGemini({ system, messages, json }) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw httpError(500, 'GEMINI_API_KEY is not set on the server.');
  const model = process.env.GEMINI_MODEL || 'gemini-2.0-flash';

  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: messages.map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      })),
      generationConfig: {
        temperature: json ? 0.6 : 0.7,
        ...(json ? { responseMimeType: 'application/json' } : {}),
      },
    }),
  });
  const data = await res.json();
  if (!res.ok) throw httpError(502, `Gemini error: ${data?.error?.message || res.statusText}`);
  const text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') || '';
  if (!text) throw httpError(502, 'The AI returned an empty response. Try again.');
  return text;
}

async function callOpenAI({ system, messages, json }) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw httpError(500, 'OPENAI_API_KEY is not set on the server.');

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      temperature: json ? 0.6 : 0.7,
      ...(json ? { response_format: { type: 'json_object' } } : {}),
      messages: [{ role: 'system', content: system }, ...messages],
    }),
  });
  const data = await res.json();
  if (!res.ok) throw httpError(502, `OpenAI error: ${data?.error?.message || res.statusText}`);
  const text = data?.choices?.[0]?.message?.content || '';
  if (!text) throw httpError(502, 'The AI returned an empty response. Try again.');
  return text;
}

async function complete(opts) {
  const p = provider();
  if (p === 'openai') return callOpenAI(opts);
  if (p === 'gemini') return callGemini(opts);
  throw httpError(500, `Unknown AI_PROVIDER "${p}".`);
}

function parseJSON(text) {
  const clean = text.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '').trim();
  try {
    return JSON.parse(clean);
  } catch {
    const start = clean.indexOf('{');
    const end = clean.lastIndexOf('}');
    if (start !== -1 && end > start) return JSON.parse(clean.slice(start, end + 1));
    throw httpError(502, 'The AI response could not be read. Please try again.');
  }
}

/* ---------- business analysis ---------- */

const SCHEMA = `{
  "title": "short plan name (max 8 words)",
  "summary": "2-3 sentence executive summary",
  "targetMarket": { "overview": "string", "segments": ["string"], "marketSize": "string with a realistic estimate and basis", "trends": ["string"] },
  "competitors": [ { "name": "real or representative competitor", "strength": "string", "weakness": "string" } ],
  "pricingStrategy": { "model": "string", "suggestedPrice": "string", "rationale": "string" },
  "investment": { "total": number, "breakdown": [ { "item": "string", "amount": number } ] },
  "financials": { "monthlyRevenue": number, "monthlyExpenses": number, "monthlyProfit": number, "breakEvenMonths": number, "yearOneRevenue": number, "yearOneProfit": number },
  "marketing": { "summary": "string", "channels": [ { "channel": "string", "tactic": "string" } ] },
  "risks": [ { "risk": "string", "severity": "low|medium|high", "mitigation": "string" } ],
  "growth": ["string"],
  "feasibility": { "score": number 0-100, "verdict": "one sentence", "reasoning": "string", "breakdown": { "market": 0-100, "financial": 0-100, "competition": 0-100, "execution": 0-100 } },
  "recommendations": ["actionable, specific next step"]
}`;

const ANALYST_SYSTEM = `You are a seasoned startup consultant and financial analyst. You produce realistic, locally relevant business plans.
Rules:
- Respond with ONE valid JSON object matching the schema. No markdown, no commentary.
- All monetary numbers are plain numbers in the user's currency, with no symbols or separators.
- investment.total must equal the sum of investment.breakdown amounts, and should be realistic for the user's budget and location.
- financials.monthlyProfit = monthlyRevenue - monthlyExpenses; yearOneProfit should account for ramp-up and the initial investment is NOT subtracted.
- Be honest: if the idea is weak, over-budget or saturated, give a low score and say why. Do not flatter.
- Give 3-5 competitors, 4-6 risks, 4-6 recommendations.

Schema:
${SCHEMA}`;

export async function analyzeIdea(input) {
  if (provider() === 'mock') return mockAnalysis(input);

  const prompt = `Analyze this business idea.
Idea: ${input.idea}
Category: ${input.category}
Location: ${input.location}
Available budget: ${input.budget} ${input.currency}
Target customers: ${input.targetCustomers}`;

  const text = await complete({ system: ANALYST_SYSTEM, messages: [{ role: 'user', content: prompt }], json: true });
  return normalize(parseJSON(text));
}

// Make sure the client never crashes on a slightly malformed AI response.
function normalize(a) {
  const num = (v, d = 0) => (Number.isFinite(Number(v)) ? Number(v) : d);
  const arr = (v) => (Array.isArray(v) ? v : []);
  const clamp = (v) => Math.max(0, Math.min(100, Math.round(num(v))));

  const breakdown = arr(a.investment?.breakdown).map((b) => ({ item: String(b.item || ''), amount: num(b.amount) }));
  const sum = breakdown.reduce((s, b) => s + b.amount, 0);
  const f = a.financials || {};
  const rev = num(f.monthlyRevenue);
  const exp = num(f.monthlyExpenses);

  return {
    title: a.title || 'Business plan',
    summary: a.summary || '',
    targetMarket: {
      overview: a.targetMarket?.overview || '',
      segments: arr(a.targetMarket?.segments),
      marketSize: a.targetMarket?.marketSize || '',
      trends: arr(a.targetMarket?.trends),
    },
    competitors: arr(a.competitors),
    pricingStrategy: {
      model: a.pricingStrategy?.model || '',
      suggestedPrice: a.pricingStrategy?.suggestedPrice || '',
      rationale: a.pricingStrategy?.rationale || '',
    },
    investment: { total: num(a.investment?.total, sum) || sum, breakdown },
    financials: {
      monthlyRevenue: rev,
      monthlyExpenses: exp,
      monthlyProfit: rev - exp,
      breakEvenMonths: num(f.breakEvenMonths),
      yearOneRevenue: num(f.yearOneRevenue),
      yearOneProfit: num(f.yearOneProfit),
    },
    marketing: { summary: a.marketing?.summary || '', channels: arr(a.marketing?.channels) },
    risks: arr(a.risks).map((r) => ({
      risk: r.risk || '',
      severity: ['low', 'medium', 'high'].includes(String(r.severity).toLowerCase()) ? String(r.severity).toLowerCase() : 'medium',
      mitigation: r.mitigation || '',
    })),
    growth: arr(a.growth),
    feasibility: {
      score: clamp(a.feasibility?.score),
      verdict: a.feasibility?.verdict || '',
      reasoning: a.feasibility?.reasoning || '',
      breakdown: {
        market: clamp(a.feasibility?.breakdown?.market),
        financial: clamp(a.feasibility?.breakdown?.financial),
        competition: clamp(a.feasibility?.breakdown?.competition),
        execution: clamp(a.feasibility?.breakdown?.execution),
      },
    },
    recommendations: arr(a.recommendations),
  };
}

/* ---------- business assistant chat ---------- */

export async function chatAboutPlan(plan, history, message) {
  if (provider() === 'mock') {
    return 'Mock mode is on, so this is a placeholder reply. Set AI_PROVIDER=gemini or openai in server/.env for real answers about your plan.';
  }
  const { input, analysis } = plan;
  const system = `You are the AI business assistant inside StartupPlanner. You are advising ONE entrepreneur about their specific business.
Be practical, concise (under 200 words unless asked for more), and specific to their numbers and location. Use short paragraphs or simple lists. If something is uncertain, say so rather than inventing facts. Stay on topic: this business and entrepreneurship.

BUSINESS INPUT:
${JSON.stringify(input)}

GENERATED ANALYSIS:
${JSON.stringify(analysis)}`;

  const messages = [...history.slice(-10).map((m) => ({ role: m.role, content: m.content })), { role: 'user', content: message }];
  return (await complete({ system, messages, json: false })).trim();
}

/* ---------- mock data (AI_PROVIDER=mock) ---------- */

function mockAnalysis({ idea, budget, category, location }) {
  const invest = Math.max(Math.round(budget * 0.85), 1000);
  return normalize({
    title: `${category} venture in ${location}`,
    summary: `Sample analysis for: ${idea}. This is demo data generated without calling an AI provider.`,
    targetMarket: { overview: `Local demand for ${category.toLowerCase()} offerings is steady.`, segments: ['Young professionals', 'Families', 'Students'], marketSize: 'Demo estimate: 50,000 potential customers within 10 km.', trends: ['Growing preference for convenience', 'Rising digital payments'] },
    competitors: [{ name: 'Local incumbent', strength: 'Established customers', weakness: 'Slow to innovate' }, { name: 'Online marketplace', strength: 'Wide reach', weakness: 'Impersonal service' }],
    pricingStrategy: { model: 'Value-based', suggestedPrice: 'Mid-range, 10% below the main competitor', rationale: 'Win early customers, then raise prices as reviews build.' },
    investment: { total: invest, breakdown: [{ item: 'Setup & equipment', amount: Math.round(invest * 0.5) }, { item: 'Inventory / materials', amount: Math.round(invest * 0.25) }, { item: 'Marketing', amount: Math.round(invest * 0.1) }, { item: 'Working capital', amount: invest - Math.round(invest * 0.85) }] },
    financials: { monthlyRevenue: Math.round(invest * 0.35), monthlyExpenses: Math.round(invest * 0.22), breakEvenMonths: 8, yearOneRevenue: Math.round(invest * 3.4), yearOneProfit: Math.round(invest * 0.9) },
    marketing: { summary: 'Start local and build word of mouth.', channels: [{ channel: 'Instagram & WhatsApp', tactic: 'Share behind-the-scenes content and take orders' }, { channel: 'Local partnerships', tactic: 'Cross-promote with nearby businesses' }] },
    risks: [{ risk: 'Slow customer acquisition', severity: 'medium', mitigation: 'Run an opening offer and collect reviews early' }, { risk: 'Cash flow gaps', severity: 'high', mitigation: 'Keep three months of expenses in reserve' }],
    growth: ['Add a second location or delivery zone', 'Launch a subscription or loyalty plan'],
    feasibility: { score: 72, verdict: 'Promising, with manageable risk.', reasoning: 'Demo score. Real analysis requires an AI provider.', breakdown: { market: 75, financial: 70, competition: 65, execution: 78 } },
    recommendations: ['Validate demand with 20 customer conversations', 'Start with a minimum viable offering', 'Track unit economics weekly'],
  });
}
