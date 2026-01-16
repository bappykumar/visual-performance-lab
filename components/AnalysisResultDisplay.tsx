import React, { useEffect, useRef } from 'react';
import type { AnalysisResult } from '../types';
import { ScoreCircle } from './ScoreCircle';
import { ACTIVE_MODEL } from '../services/geminiService';

interface AnalysisResultDisplayProps {
  result: AnalysisResult;
  previewUrl: string;
  onReset: () => void;
}

export const AnalysisResultDisplay: React.FC<AnalysisResultDisplayProps> = ({ result, previewUrl, onReset }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    containerRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

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
            <p className="text-[10px] text-slate-400 max-w-[140px] leading-tight mx-auto">Calculated from clarity, contrast, and visual hierarchy.</p>
          </div>
          <ScoreCircle score={result.score} />
        </section>
      </div>

      {/* ROW 2: Verdict & Insight */}
      <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
        <div className="space-y-6">
          <section className="border border-slate-100 rounded-xl p-8 bg-white shadow-sm border-l-4 border-l-blue-600">
             <div className="flex justify-between items-start mb-4">
                <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em]">Primary Verdict</h3>
                <span className="text-[10px] font-mono text-slate-300 uppercase">Engine: {ACTIVE_MODEL}</span>
             </div>
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
          <div className="flex flex-col gap-1">
             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Neural Engine</span>
             <span className="text-[9px] font-mono text-blue-600 font-bold tracking-tighter">{ACTIVE_MODEL}</span>
          </div>
          <div className="h-8 w-[1px] bg-slate-100 mx-4 hidden md:block"></div>
          <div className="flex gap-8 items-center overflow-x-auto">
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
            className="w-full h-full py-5 rounded-xl bg-slate-900 text-white text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-slate-800 transition-all active:scale-[0.98] shadow-lg shadow-slate-200"
          >
            New Audit
          </button>
        </section>
      </div>
    </div>
  );
};