import React, { useEffect, useRef, useState } from 'react';
import type { AnalysisResult } from '../types';
import { ScoreCircle } from './ScoreCircle';

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
          className="h-full bg-blue-600 transition-all duration-[1200ms] cubic-bezier(0.34, 1.56, 0.64, 1) rounded-full"
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

  const criteriaList = [
    { label: 'Clarity', value: result.criteria.clarity },
    { label: 'Contrast', value: result.criteria.contrast },
    { label: 'Legibility', value: result.criteria.legibility },
    { label: 'Hierarchy', value: result.criteria.hierarchy },
    { label: 'Harmony', value: result.criteria.harmony },
    { label: 'Narrative', value: result.criteria.narrative },
    { label: 'Emotion', value: result.criteria.emotion },
    { label: 'Uniqueness', value: result.criteria.uniqueness },
  ];

  return (
    <div ref={containerRef} className="w-full max-w-6xl mx-auto space-y-6 animate-fade-in-up pb-20 px-4">
      
      {/* ROW 1: THUMBNAIL, VERDICT & SCORE (GRID 12 COLS) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: THUMBNAIL & VERDICT */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* THUMBNAIL CARD */}
          <section className="relative rounded-xl overflow-hidden border border-slate-100 shadow-sm bg-white aspect-video flex-shrink-0">
            <img src={previewUrl} className="w-full h-full object-cover" alt="Audit" />
            <div className="absolute inset-x-0 top-0 h-[1px] bg-blue-600/20 animate-scan pointer-events-none" />
          </section>

          {/* VERDICT CARD */}
          <section className="flex-grow border border-slate-100 rounded-xl p-8 bg-white shadow-sm border-l-4 border-l-blue-600 flex flex-col justify-center">
             <h3 className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-3">Diagnostic Verdict</h3>
             <h2 className="text-xl font-semibold text-slate-900 tracking-tight leading-snug">{result.verdict}</h2>
          </section>
        </div>

        {/* RIGHT COLUMN: SCORE CARD (FULL HEIGHT OF LEFT COLUMN) */}
        <div className="lg:col-span-4 h-full">
          <section className="h-full border border-slate-100 rounded-xl p-8 bg-white shadow-sm flex flex-col items-center justify-between">
            <div className="text-center w-full">
              <h3 className="text-[10px] font-bold text-slate-900 uppercase tracking-[0.25em]">Psychological Score</h3>
              <p className="text-[9px] text-slate-400 font-medium uppercase tracking-tighter mt-1">Cognitive Impact Diagnostic</p>
            </div>
            
            <div className="py-8">
              <ScoreCircle score={result.score} />
            </div>

            <div className="w-full space-y-4">
              {criteriaList.map((item, idx) => (
                <CriteriaBar key={item.label} label={item.label} targetValue={item.value} delay={600 + (idx * 80)} />
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* ROW 2: TYPOGRAPHY (FULL WIDTH) */}
      <section className="border border-slate-100 rounded-xl p-8 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-50 pb-6 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-900">Typography & Text Load Diagnostic</h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-bold text-slate-400 uppercase">Readability Index:</span>
            <span className="text-sm font-mono font-bold text-blue-600">{result.textAnalysis.readabilityScore}%</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="space-y-4">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Detected Symbols & Text</p>
            <div className="flex flex-wrap gap-2">
              {result.textAnalysis.detectedText.length > 0 ? (
                result.textAnalysis.detectedText.map((t, i) => (
                  <span key={i} className="px-2 py-1 bg-slate-50 border border-slate-100 rounded text-[11px] font-medium text-slate-600">"{t}"</span>
                ))
              ) : (
                <span className="text-[11px] italic text-slate-400">No textual symbols detected.</span>
              )}
            </div>
          </div>
          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Font Psychology</p>
              <p className="text-[13px] text-slate-600 leading-relaxed">{result.textAnalysis.fontEvaluation}</p>
            </div>
            <div className="space-y-2">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Placement & Scale</p>
              <p className="text-[13px] text-slate-600 leading-relaxed">{result.textAnalysis.placementEvaluation} {result.textAnalysis.sizeEvaluation}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ROW 3: COLOR PALETTE (FULL WIDTH) */}
      <section className="border border-slate-100 rounded-xl p-8 bg-white shadow-sm">
        <div className="flex items-center gap-3 border-b border-slate-50 pb-6 mb-6">
          <div className="w-1.5 h-1.5 rounded-full bg-teal-500" />
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-900">Color Palette & Emotional Anchors</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {result.dominantColors.map((c, i) => (
            <div key={i} className="space-y-3 p-4 rounded-xl bg-slate-50/50 border border-slate-100/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg shadow-sm" style={{ backgroundColor: c.hex }} />
                <span className="text-[11px] font-mono font-bold text-slate-900">{c.hex}</span>
              </div>
              <p className="text-[12px] text-slate-500 leading-tight">{c.psychology}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ROW 4: OBSERVATIONS & REFINEMENTS (2 COLUMNS) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <section className="border border-slate-100 rounded-xl p-8 bg-white shadow-sm space-y-6">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-900 flex items-center gap-2">
            <span className="w-1 h-1 rounded-full bg-teal-500" /> Observations
          </h3>
          <ul className="space-y-3">
            {result.pros.map((p, i) => (
              <li key={i} className="flex gap-4 items-start text-[13px] text-slate-600"><span className="mt-1.5 w-1 h-1 rounded-full bg-slate-200 shrink-0" />{p}</li>
            ))}
          </ul>
        </section>
        <section className="border border-slate-100 rounded-xl p-8 bg-white shadow-sm space-y-6">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-900 flex items-center gap-2">
            <span className="w-1 h-1 rounded-full bg-blue-500" /> Refinements
          </h3>
          <ul className="space-y-3">
            {result.cons.map((c, i) => (
              <li key={i} className="flex gap-4 items-start text-[13px] text-slate-600"><span className="mt-1.5 w-1 h-1 rounded-full bg-slate-200 shrink-0" />{c}</li>
            ))}
          </ul>
        </section>
      </div>

      {/* FOOTER: START NEW AUDIT (FULL WIDTH) */}
      <div className="pt-4">
        <button 
          onClick={onReset} 
          className="w-full py-6 rounded-xl bg-slate-900 text-white text-[11px] font-bold uppercase tracking-[0.3em] hover:bg-slate-800 transition-all active:scale-[0.99] shadow-xl hover:shadow-slate-200"
        >
          Start New Audit Protocol
        </button>
      </div>
    </div>
  );
};