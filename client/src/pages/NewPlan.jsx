import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { errMsg } from '../api.js';
import Alert from '../components/Alert.jsx';
import AnalysisView from '../components/AnalysisView.jsx';

const CATEGORIES = ['Food & Beverage', 'Retail', 'E-commerce', 'Technology / SaaS', 'Education', 'Health & Wellness', 'Agriculture', 'Manufacturing', 'Professional Services', 'Travel & Hospitality', 'Fashion & Beauty', 'Other'];
const STEPS = ['Reading your idea', 'Sizing the market', 'Checking competitors', 'Estimating costs and profit', 'Scoring feasibility'];
const EMPTY = { idea: '', category: CATEGORIES[0], location: '', budget: '', currency: 'INR', targetCustomers: '' };

export default function NewPlan() {
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY);
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(0);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  useEffect(() => {
    if (!busy) return;
    setStep(0);
    const t = setInterval(() => setStep((s) => Math.min(s + 1, STEPS.length - 1)), 4000);
    return () => clearInterval(t);
  }, [busy]);

  async function generate(e) {
    e.preventDefault();
    setError(''); setBusy(true);
    try {
      const { data } = await api.post('/plans/generate', { ...form, budget: Number(form.budget) });
      setResult(data);
      window.scrollTo({ top: 0 });
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setBusy(false);
    }
  }

  async function save() {
    setError(''); setSaving(true);
    try {
      const { data } = await api.post('/plans', result);
      navigate(`/plans/${data._id}`);
    } catch (err) {
      setError(errMsg(err));
      setSaving(false);
    }
  }

  if (result) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10">
        <div className="sticky top-0 z-10 -mx-4 mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-line bg-paper/95 px-4 py-3 backdrop-blur">
          <p className="text-sm text-muted">This plan is not saved yet.</p>
          <div className="flex gap-2">
            <button className="btn-ghost" onClick={() => setResult(null)} disabled={saving}>Edit inputs</button>
            <button className="btn-primary" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save plan'}</button>
          </div>
        </div>
        <div className="mb-4"><Alert>{error}</Alert></div>
        <AnalysisView analysis={result.analysis} currency={result.input.currency} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-3xl font-bold">Describe your business idea</h1>
      <p className="mt-1 text-muted">The more specific you are, the more useful the plan.</p>

      <form onSubmit={generate} className="mt-8 space-y-5">
        <Alert>{error}</Alert>
        <div>
          <label className="label" htmlFor="idea">Your idea</label>
          <textarea id="idea" className="input min-h-[120px]" value={form.idea} onChange={set('idea')} required minLength={15} maxLength={2000}
            placeholder="Example: A cloud kitchen that delivers healthy home-style tiffin meals to office workers on weekdays." />
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="category">Category</label>
            <select id="category" className="input" value={form.category} onChange={set('category')}>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select>
          </div>
          <div>
            <label className="label" htmlFor="location">Location</label>
            <input id="location" className="input" value={form.location} onChange={set('location')} required placeholder="City, state or country" />
          </div>
        </div>
        <div className="grid gap-5 sm:grid-cols-[1fr_120px]">
          <div>
            <label className="label" htmlFor="budget">Total budget</label>
            <input id="budget" type="number" min="1" step="any" className="input" value={form.budget} onChange={set('budget')} required placeholder="500000" />
          </div>
          <div>
            <label className="label" htmlFor="currency">Currency</label>
            <select id="currency" className="input" value={form.currency} onChange={set('currency')}>{['INR', 'USD', 'EUR', 'GBP'].map((c) => <option key={c}>{c}</option>)}</select>
          </div>
        </div>
        <div>
          <label className="label" htmlFor="targetCustomers">Target customers</label>
          <input id="targetCustomers" className="input" value={form.targetCustomers} onChange={set('targetCustomers')} required placeholder="Who will buy this? Age, profession, income, habits" />
        </div>

        <button className="btn-primary w-full !py-3" disabled={busy}>{busy ? STEPS[step] + '…' : 'Generate business plan'}</button>
        {busy && <p className="text-center text-sm text-muted">This usually takes 10 to 30 seconds.</p>}
      </form>
    </div>
  );
}
