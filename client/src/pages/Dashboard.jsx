import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { errMsg } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import ScoreRing from '../components/ScoreRing.jsx';
import Spinner from '../components/Spinner.jsx';
import Alert from '../components/Alert.jsx';
import { money, shortDate } from '../utils/format.js';

export default function Dashboard() {
  const { user } = useAuth();
  const [plans, setPlans] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/plans').then((r) => setPlans(r.data)).catch((e) => setError(errMsg(e)));
  }, []);

  async function remove(id) {
    if (!window.confirm('Delete this plan? This cannot be undone.')) return;
    try {
      await api.delete(`/plans/${id}`);
      setPlans((p) => p.filter((x) => x._id !== id));
    } catch (e) { setError(errMsg(e)); }
  }

  if (!plans && !error) return <Spinner full />;
  const avg = plans?.length ? Math.round(plans.reduce((s, p) => s + p.feasibilityScore, 0) / plans.length) : 0;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Hi {user.name.split(' ')[0]}, here are your plans</h1>
          {plans?.length > 0 && <p className="mt-1 text-muted">{plans.length} saved. Average feasibility {avg}/100.</p>}
        </div>
        <div className="flex gap-2">
          {plans?.length > 1 && <Link to="/compare" className="btn-ghost">Compare ideas</Link>}
          <Link to="/new" className="btn-primary">New plan</Link>
        </div>
      </div>

      <div className="mt-6"><Alert>{error}</Alert></div>

      {plans?.length === 0 && (
        <div className="mt-10 rounded-2xl border border-dashed border-line bg-white p-12 text-center">
          <h2 className="text-xl font-bold">No plans yet</h2>
          <p className="mx-auto mt-1 max-w-sm text-muted">Describe a business idea and get a full plan with a feasibility score in under a minute.</p>
          <Link to="/new" className="btn-primary mt-5">Create your first plan</Link>
        </div>
      )}

      <ul className="mt-6 divide-y divide-line overflow-hidden rounded-xl border border-line bg-white">
        {plans?.map((p) => (
          <li key={p._id} className="flex flex-wrap items-center gap-4 p-4 sm:flex-nowrap">
            <ScoreRing score={p.feasibilityScore} size={64} stroke={7} label={false} />
            <Link to={`/plans/${p._id}`} className="min-w-0 flex-1 group">
              <h2 className="truncate text-lg font-bold group-hover:text-pine">{p.analysis.title}</h2>
              <p className="truncate text-sm text-muted">{p.input.idea}</p>
              <p className="mt-0.5 text-xs text-muted">{p.input.category}, {p.input.location}. Saved {shortDate(p.createdAt)}</p>
            </Link>
            <div className="hidden text-right sm:block">
              <p className="text-xs text-muted">Investment</p>
              <p className="font-semibold">{money(p.analysis.investment.total, p.input.currency)}</p>
            </div>
            <button onClick={() => remove(p._id)} className="btn-danger !px-3 !py-1.5" aria-label={`Delete ${p.analysis.title}`}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
