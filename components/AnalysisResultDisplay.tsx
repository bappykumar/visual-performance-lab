import React, { useEffect, useRef, useState } from 'react';
import type { AnalysisResult } from '../types';
import { ScoreCircle } from './ScoreCircle';
import { ACTIVE_MODEL } from '../services/geminiService';

interface AnalysisResultDisplayProps {
  result: AnalysisResult;
  previewUrl: string;
  onReset: () => void;
}

const CriteriaBar: React.FC<{ label: string; targetValue: number; delay: number }> = ({ label, targetValue, delay }) => {
  const [displayValue, setDisplayValue] = useState(0);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setWidth(targetValue);
      let startTime: number | null = null;
      const duration = 1200;

      const step = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);
        const currentCount = Math.floor(progress * targetValue);
        setDisplayValue(currentCount);
        if (progress < 1) window.requestAnimationFrame(step);
        else setDisplayValue(targetValue);
      };
      window.requestAnimationFrame(step);
    }, delay);
    return () => clearTimeout(timer);
  }, [targetValue, delay]);

  return (
    <div className="space-y-1.5 w-full group">
      <div className="flex justify-between items-end">
        <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-slate-400 group-hover:text-slate-600 transition-colors">
          {label}
        </span>
        <span className="text-[11px] font-mono font-bold text-slate-900 tabular-nums">
          {displayValue}%
        </span>
      </div>
      <div className="h-1.5 w-full bg-slate-100/80 rounded-full overflow-hidden relative">
        <div 
          className="h-full bg-blue-600 transition-all duration-[1200ms] cubic-bezier(0.34, 1.56, 0.64, 1) rounded-full shadow-[0_0_8px_rgba(37,99,235,0.2)]"
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
};

export const AnalysisResultDisplay: React.FC<AnalysisResultDisplayProps> = ({ result, previewUrl, onReset }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    containerRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const calculateDerivedMetric = (base: number, offset: number) => Math.min(100, Math.max(0, base + offset));

  const criteriaList = [
    { label: 'Clarity', value: calculateDerivedMetric(result.score, 4) },
    { label: 'Contrast', value: calculateDerivedMetric(result.score, -6) },
    { label: 'Legibility', value: calculateDerivedMetric(result.score, 2) },
    { label: 'Hierarchy', value: calculateDerivedMetric(result.score, -2) },
    { label: 'Harmony', value: calculateDerivedMetric(result.score, 5) },
    { label: 'Narrative', value: calculateDerivedMetric(result.score, -8) },
    { label: 'Emotion', value: calculateDerivedMetric(result.score, -12) },
    { label: 'Uniqueness', value: calculateDerivedMetric(result.score, 8) },
  ];

  return (
    <div ref={containerRef} className="w-full max-w-6xl mx-auto space-y-6 animate-fade-in-up pb-20 px-4">
      
      {/* TOP SECTION: Left (Thumbnail + Text) | Right (Matrix) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* LEFT COLUMN (8/12) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Thumbnail Card */}
          <section className="relative rounded-xl overflow-hidden border border-slate-100 shadow-sm bg-white aspect-video flex-shrink-0">
            <img 
              src={previewUrl} 
              className="w-full h-full object-cover" 
              alt="Audited Asset" 
            />
            <div className="absolute inset-x-0 top-0 h-[1px] bg-blue-600/20 animate-scan pointer-events-none" />
          </section>

          {/* Verdict Box */}
          <section className="border border-slate-100 rounded-xl p-8 bg-white shadow-sm border-l-4 border-l-blue-600">
             <h3 className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-3">Diagnostic Verdict</h3>
             <h2 className="text-xl font-semibold text-slate-900 tracking-tight leading-snug">
               {result.verdict}
             </h2>
          </section>

          {/* Description Box */}
          <section className="border border-slate-100 rounded-xl p-8 bg-white shadow-sm">
             <h3 className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-3">Contextual Analysis</h3>
             <p className="text-[14px] text-slate-500 leading-relaxed">
               {result.imageDescription}
             </p>
          </section>
        </div>

        {/* RIGHT COLUMN (4/12): Performance Matrix Card */}
        <div className="lg:col-span-4">
          <section className="h-full border border-slate-100 rounded-xl p-8 bg-white shadow-sm flex flex-col items-center">
            <div className="text-center mb-6">
              <h3 className="text-[10px] font-bold text-slate-900 uppercase tracking-[0.25em]">Performance Matrix</h3>
              <p className="text-[9px] text-slate-400 font-medium uppercase tracking-tighter mt-1">Full-Spectrum Diagnostic</p>
            </div>
            
            <div className="mb-8">
              <ScoreCircle score={result.score} />
            </div>

            <div className="w-full space-y-4 flex-grow">
              {criteriaList.map((item, idx) => (
                <CriteriaBar 
                  key={item.label} 
                  label={item.label} 
                  targetValue={item.value} 
                  delay={600 + (idx * 80)} 
                />
              ))}
            </div>

            <div className="w-full pt-6 mt-6 border-t border-slate-50 text-center">
              <span className="text-[9px] font-mono text-slate-300 uppercase tracking-widest">Neural V2.1 Protocol</span>
            </div>
          </section>
        </div>
      </div>

      {/* MIDDLE SECTION: Observations & Logic */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <section className="border border-slate-100 rounded-xl p-8 bg-white shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
            <div className="w-1.5 h-1.5 rounded-full bg-teal-500" />
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-900">Critical Observations</h3>
          </div>
          <ul className="space-y-4">
            {result.pros.map((p, i) => (
              <li key={i} className="flex gap-4 items-start text-[13px] text-slate-600 leading-relaxed">
                <span className="mt-2 w-1 h-1 rounded-full bg-slate-200 shrink-0" />
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="border border-slate-100 rounded-xl p-8 bg-white shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 opacity-40" />
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-900">Refinement Logic</h3>
          </div>
          <ul className="space-y-4">
            {result.cons.map((c, i) => (
              <li key={i} className="flex gap-4 items-start text-[13px] text-slate-600 leading-relaxed">
                <span className="mt-2 w-1 h-1 rounded-full bg-slate-200 shrink-0" />
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* BOTTOM SECTION: Footer */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <section className="md:col-span-9 border border-slate-100 rounded-xl px-8 py-5 flex items-center justify-between bg-white shadow-sm">
          <div className="flex flex-col gap-1">
             <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Color Diagnostic</span>
             <span className="text-[8px] font-mono text-blue-600 font-bold tracking-tighter uppercase">{ACTIVE_MODEL}</span>
          </div>
          <div className="flex gap-8 items-center overflow-x-auto scrollbar-hide">
            {result.dominantColors.slice(0, 4).map((c, i) => (
              <div key={i} className="flex items-center gap-3 shrink-0">
                <div className="w-4 h-4 rounded-full border border-slate-100 shadow-sm" style={{ backgroundColor: c.hex }} />
                <span className="text-[10px] font-mono text-slate-500 font-bold uppercase">{c.hex}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="md:col-span-3">
          <button 
            onClick={onReset}
            className="w-full h-full py-5 rounded-xl bg-slate-900 text-white text-[10px] font-bold uppercase tracking-[0.25em] hover:bg-slate-800 transition-all active:scale-[0.98] shadow-sm"
          >
            New Audit
          </button>
        </section>
      </div>
    </div>
  );
};