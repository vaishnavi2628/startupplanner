import Plan from '../models/Plan.js';
import { analyzeIdea, chatAboutPlan } from '../services/aiService.js';
import { streamPlanPdf } from '../services/pdfService.js';
import { asyncHandler, httpError } from '../utils/httpError.js';

const CURRENCIES = ['INR', 'USD', 'EUR', 'GBP'];

function cleanInput(body = {}) {
  const input = {
    idea: String(body.idea || '').trim(),
    category: String(body.category || '').trim(),
    location: String(body.location || '').trim(),
    targetCustomers: String(body.targetCustomers || '').trim(),
    budget: Number(body.budget),
    currency: CURRENCIES.includes(body.currency) ? body.currency : 'INR',
  };
  if (!input.idea || !input.category || !input.location || !input.targetCustomers) {
    throw httpError(400, 'Idea, category, location and target customers are all required.');
  }
  if (input.idea.length < 15) throw httpError(400, 'Describe your idea in a bit more detail (at least 15 characters).');
  if (input.idea.length > 2000) throw httpError(400, 'Idea description is too long (max 2000 characters).');
  if (!Number.isFinite(input.budget) || input.budget <= 0) throw httpError(400, 'Enter a budget greater than zero.');
  return input;
}

const findOwned = async (req) => {
  const plan = await Plan.findOne({ _id: req.params.id, user: req.user._id });
  if (!plan) throw httpError(404, 'Plan not found.');
  return plan;
};

// Generate an analysis without saving it.
export const generatePlan = asyncHandler(async (req, res) => {
  const input = cleanInput(req.body);
  const analysis = await analyzeIdea(input);
  res.json({ input, analysis });
});

// Save a generated plan.
export const savePlan = asyncHandler(async (req, res) => {
  const input = cleanInput(req.body.input);
  const analysis = req.body.analysis;
  if (!analysis?.feasibility) throw httpError(400, 'Missing analysis. Generate a plan first.');
  const plan = await Plan.create({ user: req.user._id, input, analysis, feasibilityScore: analysis.feasibility.score });
  res.status(201).json(plan);
});

export const listPlans = asyncHandler(async (req, res) => {
  const plans = await Plan.find({ user: req.user._id }).select('-chat').sort({ createdAt: -1 });
  res.json(plans);
});

export const getPlan = asyncHandler(async (req, res) => res.json(await findOwned(req)));

export const deletePlan = asyncHandler(async (req, res) => {
  const plan = await findOwned(req);
  await plan.deleteOne();
  res.json({ message: 'Plan deleted.' });
});

export const downloadPdf = asyncHandler(async (req, res) => {
  const plan = await findOwned(req);
  const safe = (plan.analysis.title || 'business-plan').replace(/[^a-z0-9]+/gi, '-').toLowerCase();
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${safe}.pdf"`);
  streamPlanPdf(plan, res);
});

export const chat = asyncHandler(async (req, res) => {
  const message = String(req.body.message || '').trim();
  if (!message) throw httpError(400, 'Type a question first.');
  if (message.length > 1000) throw httpError(400, 'Keep questions under 1000 characters.');

  const plan = await findOwned(req);
  const reply = await chatAboutPlan(plan, plan.chat, message);
  plan.chat.push({ role: 'user', content: message }, { role: 'assistant', content: reply });
  await plan.save();
  res.json({ reply, chat: plan.chat });
});

export const clearChat = asyncHandler(async (req, res) => {
  const plan = await findOwned(req);
  plan.chat = [];
  await plan.save();
  res.json({ chat: [] });
});
