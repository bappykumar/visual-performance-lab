
import React, { useId, useState, useEffect, useRef, useMemo } from 'react';
import type { AnalysisResult } from '../types';
import { ScoreCircle } from './ScoreCircle';

interface AnalysisResultDisplayProps {
  result: AnalysisResult;
  previewUrl: string;
  onReset: () => void;
}

const MetricBar: React.FC<{ label: string; value: number; index: number }> = ({ label, value, index }) => {
  const [displayValue, setDisplayValue] = useState(0);
  const labelId = useId();

  useEffect(() => {
    const delay = index * 80; // 80ms stagger delay per bar
    const duration = 800; // 800ms animation duration
    let startTimestamp: number | null = null;
    let animationFrame: number;

    const animate = (now: number) => {
      if (!startTimestamp) startTimestamp = now;
      const elapsed = now - (startTimestamp + delay);
      
      if (elapsed > 0) {
        const progress = Math.min(elapsed / duration, 1);
        // Ease-out cubic: 1 - pow(1 - x, 3) for smooth deceleration
        const easeOutProgress = 1 - Math.pow(1 - progress, 3);
        const currentVal = Math.round(easeOutProgress * value);
        
        setDisplayValue(currentVal);

        if (progress < 1) {
          animationFrame = requestAnimationFrame(animate);
        }
      } else {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [value, index]);

  return (
    <div className="group flex items-center gap-4 w-full">
      <div className="w-24 shrink-0">
        <span 
          id={labelId}
          className="text-[10px] font-bold uppercase tracking-widest text-slate-400 group-hover:text-slate-900 transition-colors duration-200"
        >
          {label}
        </span>
      </div>
      <div 
        role="progressbar"
        aria-labelledby={labelId}
        aria-valuenow={displayValue}
        aria-valuemin={0}
        aria-valuemax={100}
        className="flex-1 h-2 bg-slate-50 relative overflow-hidden rounded-full"
      >
        <div 
          className="h-full bg-blue-600 transition-none" 
          style={{ width: `${displayValue}%` }} 
        />
      </div>
      <div className="w-10 text-right shrink-0">
        <span className="text-[11px] font-mono text-slate-400 tabular-nums">
          {displayValue}%
        </span>
      </div>
    </div>
  );
};

export const AnalysisResultDisplay: React.FC<AnalysisResultDisplayProps> = ({ result, previewUrl, onReset }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    containerRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Logical derivation of metrics from Overall Score (result.score)
  const metrics = useMemo(() => {
    const s = result.score;
    return [
      { label: 'Clarity', value: Math.round(s * 0.91) }, // Instructions range: 85-90%, adjusted slightly to match example 74-78 for score 82
      { label: 'Contrast', value: Math.round(s * 0.84) }, // Instructions range: 80-85%
      { label: 'Focus', value: Math.round(s * 0.87) },   // Instructions range: 85-88%
      { label: 'Emotion', value: Math.round(s * 0.76) }, // Instructions range: 70-78%
      { label: 'Uniqueness', value: Math.round(s * 0.71) }, // Instructions range: 65-75%
    ];
  }, [result.score]);

  return (
    <div ref={containerRef} className="w-full max-w-5xl mx-auto space-y-6 animate-fade-in-up pb-24">
      
      {/* ROW 1: Thumbnail & Overall Score */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* THUMBNAIL */}
        <section className="md:col-span-8 relative group rounded-xl overflow-hidden border border-slate-100 shadow-sm bg-white">
          <img 
            src={previewUrl} 
            className="w-full aspect-video object-cover" 
            alt="Audited Asset" 
          />
          <div className="absolute inset-x-0 top-0 h-[1px] bg-blue-600/10 animate-scan pointer-events-none" aria-hidden="true" />
        </section>

        {/* OVERALL SCORE */}
        <section className="md:col-span-4 flex flex-col items-center justify-center border border-slate-100 rounded-xl p-8 bg-white shadow-sm space-y-6">
          <div className="text-center space-y-1">
            <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em]">Overall Performance Score</h2>
            <p className="text-[10px] text-slate-400 max-w-[140px] leading-tight mx-auto">Calculated from clarity, contrast, emotional pull, and narrative focus.</p>
          </div>
          <ScoreCircle score={result.score} />
        </section>
      </div>

      {/* ROW 2: Verdict & Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-8 space-y-6">
          <section className="border border-slate-100 rounded-xl p-8 bg-white shadow-sm border-l-4 border-l-blue-600">
             <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">Primary Verdict</h3>
             <h1 className="text-2xl font-medium text-slate-900 tracking-tight leading-relaxed">
               {result.verdict}
             </h1>
          </section>
          
          <section className="border border-slate-100 rounded-xl p-8 bg-white shadow-sm">
             <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">Diagnostic Insight</h3>
             <p className="text-[14px] text-slate-600 leading-relaxed font-normal">
               {result.imageDescription}
             </p>
          </section>
        </div>

        <section className="md:col-span-4 border border-slate-100 rounded-xl p-8 bg-white shadow-sm flex flex-col justify-center">
          <header className="mb-8">
            <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-900">Performance Matrix</h2>
          </header>
          <div className="space-y-6">
            {metrics.map((m, i) => (
              <MetricBar key={m.label} label={m.label} value={m.value} index={i} />
            ))}
          </div>
        </section>
      </div>

      {/* ROW 3: Observations & Logic */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <section className="border border-slate-100 rounded-xl p-8 bg-white shadow-sm space-y-6">
          <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-900 border-b border-slate-50 pb-4">Critical Observations</h3>
          <ul className="space-y-4">
            {result.pros.map((p, i) => (
              <li key={i} className="flex gap-4 items-start text-[14px] text-slate-600 leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-2 shrink-0" />
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="border border-slate-100 rounded-xl p-8 bg-white shadow-sm space-y-6">
          <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-900 border-b border-slate-50 pb-4">Refinement Logic</h3>
          <ul className="space-y-4">
            {result.cons.map((c, i) => (
              <li key={i} className="flex gap-4 items-start text-[14px] text-slate-600 leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0 opacity-20" />
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* ROW 4: Footer Bar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        <section className="md:col-span-9 border border-slate-100 rounded-xl px-8 py-5 flex items-center justify-between bg-white shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Color Spectrum</span>
          <div className="flex gap-8 items-center">
            {result.dominantColors.slice(0, 4).map((c, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full border border-slate-100 shadow-sm" style={{ backgroundColor: c.hex }} />
                <span className="text-[10px] font-mono text-slate-500 font-bold uppercase">{c.hex}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="md:col-span-3">
          <button 
            onClick={onReset}
            className="w-full h-full py-5 rounded-xl bg-slate-900 text-white text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-slate-800 transition-all active:scale-[0.98] shadow-lg shadow-slate-200"
          >
            New Audit
          </button>
        </section>
      </div>
    </div>
  );
};
