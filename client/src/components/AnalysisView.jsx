import ScoreRing from './ScoreRing.jsx';
import { money, scoreColor } from '../utils/format.js';

function Section({ title, hint, children }) {
  return (
    <section className="grid gap-4 border-t border-line py-8 md:grid-cols-[200px_1fr] md:gap-8">
      <div>
        <h3 className="text-lg font-bold">{title}</h3>
        {hint && <p className="mt-1 text-sm text-muted">{hint}</p>}
      </div>
      <div className="min-w-0">{children}</div>
    </section>
  );
}

function Bar({ label, value, color = '#0F766E', right }) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-sm">
        <span>{label}</span>
        <span className="font-semibold tabular-nums">{right ?? value}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-[#E3ECE9]">
        <div className="h-full rounded-full" style={{ width: `${Math.max(2, Math.min(100, value))}%`, background: color }} />
      </div>
    </div>
  );
}

const SEVERITY = { low: 'bg-pine-soft text-pine-dark', medium: 'bg-saffron-soft text-saffron', high: 'bg-rose-soft text-rose' };

export default function AnalysisView({ analysis: a, currency = 'INR' }) {
  const m = (n) => money(n, currency);
  const f = a.financials;
  const maxItem = Math.max(...a.investment.breakdown.map((b) => b.amount), 1);
  const stats = [
    ['Estimated investment', m(a.investment.total)],
    ['Monthly revenue', m(f.monthlyRevenue)],
    ['Monthly profit', m(f.monthlyProfit), f.monthlyProfit < 0],
    ['Break-even', f.breakEvenMonths ? `${f.breakEvenMonths} months` : 'Not reached'],
  ];

  return (
    <div>
      {/* Verdict */}
      <div className="flex flex-col gap-6 pb-8 sm:flex-row sm:items-center">
        <ScoreRing score={a.feasibility.score} size={168} />
        <div className="min-w-0">
          <h2 className="text-3xl font-bold leading-tight">{a.title}</h2>
          <p className="mt-2 text-lg font-medium" style={{ color: scoreColor(a.feasibility.score) }}>{a.feasibility.verdict}</p>
          <p className="mt-2 max-w-prose text-muted">{a.summary}</p>
        </div>
      </div>

      <dl className="grid grid-cols-2 overflow-hidden rounded-xl border border-line bg-white lg:grid-cols-4">
        {stats.map(([k, v, neg], i) => (
          <div key={k} className={`p-4 ${i % 2 ? 'border-l' : ''} ${i > 1 ? 'border-t lg:border-t-0' : ''} ${i > 0 ? 'lg:border-l' : ''} border-line`}>
            <dt className="text-sm text-muted">{k}</dt>
            <dd className={`mt-1 font-display text-2xl font-bold ${neg ? 'text-rose' : ''}`}>{v}</dd>
          </div>
        ))}
      </dl>

      <Section title="Feasibility" hint="How each part of the idea scores out of 100.">
        <p className="mb-5 max-w-prose">{a.feasibility.reasoning}</p>
        <div className="grid gap-4 sm:grid-cols-2">
          {Object.entries(a.feasibility.breakdown).map(([k, v]) => (
            <Bar key={k} label={k[0].toUpperCase() + k.slice(1)} value={v} color={scoreColor(v)} />
          ))}
        </div>
      </Section>

      <Section title="Target market" hint="Who you are selling to and how big the opportunity is.">
        <p className="max-w-prose">{a.targetMarket.overview}</p>
        {a.targetMarket.marketSize && <p className="mt-3"><strong>Market size:</strong> {a.targetMarket.marketSize}</p>}
        <div className="mt-4 flex flex-wrap gap-2">
          {a.targetMarket.segments.map((s) => <span key={s} className="rounded-full bg-pine-soft px-3 py-1 text-sm text-pine-dark">{s}</span>)}
        </div>
        {a.targetMarket.trends.length > 0 && (
          <ul className="mt-4 list-disc space-y-1 pl-5 text-muted">{a.targetMarket.trends.map((t) => <li key={t}>{t}</li>)}</ul>
        )}
      </Section>

      <Section title="Competitors" hint="Who you will be compared against.">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead className="text-muted"><tr><th className="pb-2 pr-4 font-semibold">Name</th><th className="pb-2 pr-4 font-semibold">Strength</th><th className="pb-2 font-semibold">Weakness</th></tr></thead>
            <tbody>
              {a.competitors.map((c, i) => (
                <tr key={i} className="border-t border-line align-top"><td className="py-3 pr-4 font-semibold">{c.name}</td><td className="py-3 pr-4">{c.strength}</td><td className="py-3">{c.weakness}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="Pricing strategy">
        <p><strong>{a.pricingStrategy.model}</strong></p>
        <p className="mt-1 font-display text-xl font-bold text-pine-dark">{a.pricingStrategy.suggestedPrice}</p>
        <p className="mt-2 max-w-prose text-muted">{a.pricingStrategy.rationale}</p>
      </Section>

      <Section title="Investment" hint="Where the money goes at launch.">
        <div className="space-y-3">
          {a.investment.breakdown.map((b) => (
            <Bar key={b.item} label={b.item} value={(b.amount / maxItem) * 100} right={m(b.amount)} />
          ))}
        </div>
      </Section>

      <Section title="Revenue and profit" hint="Monthly run rate and the first year.">
        <dl className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
          {[['Monthly revenue', f.monthlyRevenue], ['Monthly expenses', f.monthlyExpenses], ['Monthly profit', f.monthlyProfit], ['Year-one revenue', f.yearOneRevenue], ['Year-one profit', f.yearOneProfit]].map(([k, v]) => (
            <div key={k} className="flex justify-between border-b border-line pb-2">
              <dt className="text-muted">{k}</dt>
              <dd className={`font-semibold tabular-nums ${v < 0 ? 'text-rose' : ''}`}>{m(v)}</dd>
            </div>
          ))}
        </dl>
      </Section>

      <Section title="Marketing strategy">
        <p className="max-w-prose">{a.marketing.summary}</p>
        <ul className="mt-4 space-y-3">
          {a.marketing.channels.map((c, i) => (
            <li key={i}><span className="font-semibold">{c.channel}.</span> <span className="text-muted">{c.tactic}</span></li>
          ))}
        </ul>
      </Section>

      <Section title="Risks" hint="What could go wrong and how to reduce it.">
        <ul className="space-y-4">
          {a.risks.map((r, i) => (
            <li key={i}>
              <div className="flex items-start gap-2">
                <span className={`mt-0.5 shrink-0 rounded-md px-2 py-0.5 text-xs font-semibold ${SEVERITY[r.severity]}`}>{r.severity}</span>
                <span className="font-semibold">{r.risk}</span>
              </div>
              <p className="mt-1 pl-0 text-muted sm:pl-[3.4rem]">{r.mitigation}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Growth opportunities">
        <ul className="list-disc space-y-2 pl-5">{a.growth.map((g) => <li key={g}>{g}</li>)}</ul>
      </Section>

      <Section title="Recommendations" hint="Do these first, in this order.">
        <ol className="space-y-3">
          {a.recommendations.map((r, i) => (
            <li key={i} className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-pine text-xs font-bold text-white">{i + 1}</span>
              <span>{r}</span>
            </li>
          ))}
        </ol>
      </Section>
    </div>
  );
}
