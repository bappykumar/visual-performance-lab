
import React, { useEffect, useState } from 'react';

interface ScoreCircleProps { score: number; }

export const ScoreCircle: React.FC<ScoreCircleProps> = ({ score }) => {
  const [val, setVal] = useState(0);
  const [showNumber, setShowNumber] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setVal(score), 200);
    const numTimeout = setTimeout(() => setShowNumber(true), 500);
    return () => {
      clearTimeout(timeout);
      clearTimeout(numTimeout);
    };
  }, [score]);

  const radius = 60;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (val / 100) * circ;

  const getColor = () => {
    if (val >= 80) return 'text-teal-500';
    if (val >= 60) return 'text-amber-500';
    return 'text-rose-600';
  };

  const activeColor = getColor();

  return (
    <div 
      className="relative flex items-center justify-center w-36 h-36 select-none"
      role="img" 
      aria-label={`Performance score: ${Math.round(val)}%`}
    >
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 140 140" aria-hidden="true">
        <circle
          className="text-slate-100"
          strokeWidth="2"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="70"
          cy="70"
        />
        <circle
          className={`${activeColor} transition-all duration-[1s] ease-out`}
          strokeWidth="2"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="70"
          cy="70"
        />
      </svg>
      
      <div className={`absolute flex items-baseline transition-opacity duration-500 ${showNumber ? 'opacity-100' : 'opacity-0'}`}>
        <span className="text-5xl font-bold text-slate-900 tracking-tight tabular-nums leading-none">
          {Math.round(val)}
        </span>
        <span className="text-xs font-mono text-slate-400 ml-1 font-bold">%</span>
      </div>
    </div>
  );
};
