import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { errMsg } from '../api.js';
import Spinner from '../components/Spinner.jsx';
import Alert from '../components/Alert.jsx';
import ScoreRing from '../components/ScoreRing.jsx';
import { money } from '../utils/format.js';

// [label, getter, "higher" or "lower" is better, formatter]
const ROWS = [
  ['Feasibility score', (p) => p.feasibilityScore, 'high', (v) => `${v}/100`],
  ['Market', (p) => p.analysis.feasibility.breakdown.market, 'high', (v) => v],
  ['Financial', (p) => p.analysis.feasibility.breakdown.financial, 'high', (v) => v],
  ['Competition', (p) => p.analysis.feasibility.breakdown.competition, 'high', (v) => v],
  ['Execution', (p) => p.analysis.feasibility.breakdown.execution, 'high', (v) => v],
  ['Investment needed', (p) => p.analysis.investment.total, 'low', (v, p) => money(v, p.input.currency)],
  ['Monthly revenue', (p) => p.analysis.financials.monthlyRevenue, 'high', (v, p) => money(v, p.input.currency)],
  ['Monthly profit', (p) => p.analysis.financials.monthlyProfit, 'high', (v, p) => money(v, p.input.currency)],
  ['Year-one profit', (p) => p.analysis.financials.yearOneProfit, 'high', (v, p) => money(v, p.input.currency)],
  ['Break-even (months)', (p) => p.analysis.financials.breakEvenMonths || Infinity, 'low', (v) => (Number.isFinite(v) ? v : 'Not reached')],
  ['High-severity risks', (p) => p.analysis.risks.filter((r) => r.severity === 'high').length, 'low', (v) => v],
];

export default function Compare() {
  const [plans, setPlans] = useState(null);
  const [picked, setPicked] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/plans').then((r) => { setPlans(r.data); setPicked(r.data.slice(0, 2).map((p) => p._id)); }).catch((e) => setError(errMsg(e)));
  }, []);

  const toggle = (id) => setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : p.length < 3 ? [...p, id] : p));
  if (!plans && !error) return <Spinner full />;
  const chosen = (plans || []).filter((p) => picked.includes(p._id));

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-bold">Compare ideas</h1>
      <p className="mt-1 text-muted">Pick up to three saved plans. The best value in each row is highlighted.</p>
      <div className="mt-4"><Alert>{error}</Alert></div>

      {plans?.length < 2 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-line bg-white p-10 text-center">
          <p className="text-muted">You need at least two saved plans to compare.</p>
          <Link to="/new" className="btn-primary mt-4">Create a plan</Link>
        </div>
      ) : (
        <>
          <fieldset className="mt-6 flex flex-wrap gap-2">
            <legend className="sr-only">Choose plans to compare</legend>
            {plans?.map((p) => {
              const on = picked.includes(p._id);
              return (
                <label key={p._id} className={`cursor-pointer rounded-lg border px-3 py-2 text-sm font-semibold ${on ? 'border-pine bg-pine-soft text-pine-dark' : 'border-line bg-white'}`}>
                  <input type="checkbox" className="sr-only" checked={on} onChange={() => toggle(p._id)} />
                  {p.analysis.title}
                </label>
              );
            })}
          </fieldset>

          {chosen.length >= 2 && (
            <div className="mt-8 overflow-x-auto rounded-xl border border-line bg-white">
              <table className="w-full min-w-[560px] text-left">
                <thead>
                  <tr className="border-b border-line align-bottom">
                    <th className="w-44 p-4" />
                    {chosen.map((p) => (
                      <th key={p._id} className="p-4">
                        <ScoreRing score={p.feasibilityScore} size={72} stroke={8} label={false} />
                        <Link to={`/plans/${p._id}`} className="mt-2 block font-display text-lg font-bold hover:text-pine">{p.analysis.title}</Link>
                        <span className="text-xs font-normal text-muted">{p.input.category}, {p.input.location}</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ROWS.map(([label, get, better, fmt]) => {
                    const vals = chosen.map(get);
                    const best = better === 'high' ? Math.max(...vals) : Math.min(...vals);
                    const tie = vals.every((v) => v === vals[0]);
                    return (
                      <tr key={label} className="border-b border-line last:border-0">
                        <th className="p-4 text-sm font-semibold text-muted">{label}</th>
                        {chosen.map((p, i) => (
                          <td key={p._id} className={`p-4 tabular-nums ${!tie && vals[i] === best ? 'font-bold text-pine-dark' : ''}`}>
                            {!tie && vals[i] === best && <span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-pine" aria-label="Best" />}
                            {fmt(vals[i], p)}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          {chosen.length < 2 && <p className="mt-6 text-muted">Select at least two plans.</p>}
        </>
      )}
    </div>
  );
}
