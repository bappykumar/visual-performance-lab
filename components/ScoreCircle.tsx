
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

  const getColorClasses = () => {
    if (val >= 80) return {
      text: 'text-teal-500',
      glow: 'hover:drop-shadow-[0_0_15px_rgba(20,184,166,0.25)]'
    };
    if (val >= 60) return {
      text: 'text-amber-500',
      glow: 'hover:drop-shadow-[0_0_15px_rgba(245,158,11,0.25)]'
    };
    return {
      text: 'text-rose-600',
      glow: 'hover:drop-shadow-[0_0_15px_rgba(225,29,72,0.25)]'
    };
  };

  const { text: activeColor, glow: hoverGlow } = getColorClasses();

  return (
    <div 
      className={`relative flex items-center justify-center w-36 h-36 select-none transition-all duration-500 ease-out cursor-default hover:scale-[1.06] ${hoverGlow}`}
      role="img" 
      aria-label={`Performance score: ${Math.round(val)}%`}
    >
      <svg className="w-full h-full transform -rotate-90 transition-transform duration-500" viewBox="0 0 140 140" aria-hidden="true">
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
      
      <div className={`absolute flex items-baseline transition-all duration-500 ${showNumber ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'}`}>
        <span className="text-5xl font-bold text-slate-900 tracking-tight tabular-nums leading-none">
          {Math.round(val)}
        </span>
        <span className="text-xs font-mono text-slate-400 ml-1 font-bold">%</span>
      </div>
    </div>
  );
};
