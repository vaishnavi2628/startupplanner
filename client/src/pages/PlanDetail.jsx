import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api, { errMsg } from '../api.js';
import AnalysisView from '../components/AnalysisView.jsx';
import ChatPanel from '../components/ChatPanel.jsx';
import Spinner from '../components/Spinner.jsx';
import Alert from '../components/Alert.jsx';
import { money, shortDate } from '../utils/format.js';

export default function PlanDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [plan, setPlan] = useState(null);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    api.get(`/plans/${id}`).then((r) => setPlan(r.data)).catch((e) => setError(errMsg(e)));
  }, [id]);

  async function download() {
    setDownloading(true); setError('');
    try {
      const res = await api.get(`/plans/${id}/pdf`, { responseType: 'blob' });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${(plan.analysis.title || 'business-plan').replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) { setError('Could not create the PDF. Try again.'); }
    finally { setDownloading(false); }
  }

  async function remove() {
    if (!window.confirm('Delete this plan? This cannot be undone.')) return;
    try { await api.delete(`/plans/${id}`); navigate('/dashboard'); } catch (e) { setError(errMsg(e)); }
  }

  if (error && !plan) return <div className="mx-auto max-w-xl px-4 py-16"><Alert>{error}</Alert><Link to="/dashboard" className="btn-ghost mt-4">Back to dashboard</Link></div>;
  if (!plan) return <Spinner full />;
  const { input } = plan;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 max-w-2xl">
          <Link to="/dashboard" className="text-sm font-semibold text-pine hover:underline">Back to dashboard</Link>
          <p className="mt-3 text-muted">{input.idea}</p>
          <p className="mt-1 text-sm text-muted">{input.category}, {input.location}. Budget {money(input.budget, input.currency)}. Saved {shortDate(plan.createdAt)}.</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-primary" onClick={download} disabled={downloading}>{downloading ? 'Preparing…' : 'Download PDF'}</button>
          <button className="btn-danger" onClick={remove}>Delete</button>
        </div>
      </div>
      <div className="mb-4"><Alert>{error}</Alert></div>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_380px]">
        <AnalysisView analysis={plan.analysis} currency={input.currency} />
        <aside className="lg:sticky lg:top-6 lg:self-start">
          <ChatPanel planId={plan._id} initial={plan.chat} />
        </aside>
      </div>
    </div>
  );
}
