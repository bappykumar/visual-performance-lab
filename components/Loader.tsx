
import React, { useState, useEffect } from 'react';

const STEPS = [
  "Asset Loaded",
  "Analysis Running",
  "Scoring Engine",
  "Verdict Synthesis"
];

export const Loader: React.FC = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const it = setInterval(() => setIndex(i => (i + 1) % STEPS.length), 1500);
    return () => clearInterval(it);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-40 space-y-12 animate-fade-in max-w-xs mx-auto">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 border border-white/5 rounded-full" />
        <div className="absolute inset-0 border border-transparent border-t-white/40 rounded-full animate-spin duration-[1.2s]" />
      </div>

      <div className="space-y-6 w-full text-center">
        <div className="space-y-1">
          <p className="text-[11px] font-bold text-white uppercase tracking-[0.5em] opacity-80 transition-all duration-300">
            {STEPS[index]}
          </p>
          <p className="text-[9px] font-mono text-slate-800 uppercase tracking-[0.2em]">Neural Processing Protocol</p>
        </div>
        
        <div className="h-[1px] w-full bg-white/[0.03] overflow-hidden rounded-full">
          <div 
            className="h-full bg-indigo-500 transition-all duration-[1.5s] ease-out"
            style={{ width: `${((index + 1) / STEPS.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};
