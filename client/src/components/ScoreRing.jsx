import { useEffect, useState } from 'react';
import { scoreColor } from '../utils/format.js';

export default function ScoreRing({ score = 0, size = 160, stroke = 12, label = true }) {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    const t = requestAnimationFrame(() => setShown(score));
    return () => cancelAnimationFrame(t);
  }, [score]);

  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }} role="img" aria-label={`Feasibility score ${score} out of 100`}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#E3ECE9" strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={scoreColor(score)} strokeWidth={stroke}
          strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - shown / 100)} className="ring-draw"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display font-bold leading-none" style={{ fontSize: size * 0.32 }}>{score}</span>
        {label && size >= 120 && <span className="mt-1 text-xs text-muted">feasibility</span>}
      </div>
    </div>
  );
}
