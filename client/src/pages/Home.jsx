import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import ScoreRing from '../components/ScoreRing.jsx';

const FEATURES = [
  ['Market and competitors', 'Who your customers are, how big the market is, and who you will be up against.'],
  ['Money, in your currency', 'Startup cost breakdown, monthly revenue and profit, and when you break even.'],
  ['Risks with fixes', 'Each risk is rated and paired with a way to reduce it.'],
  ['An honest score', 'A feasibility score out of 100. Weak ideas get a low score and a reason.'],
  ['Compare ideas', 'Put two or three plans side by side and see which one is stronger.'],
  ['Ask follow-ups', 'A business assistant that knows your plan and answers in context.'],
];

export default function Home() {
  const { user } = useAuth();
  if (user) return <Navigate to="/dashboard" replace />;

  return (
    <div className="mx-auto max-w-6xl px-4">
      <section className="grid items-center gap-10 py-16 md:grid-cols-[1.3fr_1fr] md:py-24">
        <div>
          <h1 className="text-4xl font-bold leading-[1.1] sm:text-6xl">Find out if your idea can work before you spend on it.</h1>
          <p className="mt-5 max-w-xl text-lg text-muted">
            Describe your business, budget and location. StartupPlanner returns a full plan with market, costs, profit, risks and an honest feasibility score.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/register" className="btn-primary !px-6 !py-3 text-base">Create your first plan</Link>
            <Link to="/login" className="btn-ghost !px-6 !py-3 text-base">Log in</Link>
          </div>
        </div>
        <div className="mx-auto flex flex-col items-center rounded-2xl border border-line bg-white p-8">
          <ScoreRing score={74} size={200} stroke={14} />
          <p className="mt-4 font-display text-lg font-bold">Cloud kitchen, Raipur</p>
          <p className="text-sm text-muted">Promising, with manageable risk.</p>
        </div>
      </section>

      <section className="grid gap-x-10 gap-y-8 border-t border-line py-14 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map(([t, d]) => (
          <div key={t}>
            <h3 className="text-lg font-bold">{t}</h3>
            <p className="mt-1 text-muted">{d}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
