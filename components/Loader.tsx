import React, { useState, useEffect } from 'react';

const STEPS = [
  { text: "Initializing Vision Core", color: "text-slate-400", bg: "bg-slate-500", shadow: "shadow-slate-500/50" },
  { text: "Deconstructing Layers", color: "text-blue-500", bg: "bg-blue-500", shadow: "shadow-blue-500/50" },
  { text: "Analyzing Visual Hierarchy", color: "text-indigo-500", bg: "bg-indigo-500", shadow: "shadow-indigo-500/50" },
  { text: "Evaluating Color Psychology", color: "text-violet-500", bg: "bg-violet-500", shadow: "shadow-violet-500/50" },
  { text: "Measuring Text Legibility", color: "text-fuchsia-500", bg: "bg-fuchsia-500", shadow: "shadow-fuchsia-500/50" },
  { text: "Synthesizing Final Verdict", color: "text-teal-500", bg: "bg-teal-500", shadow: "shadow-teal-500/50" }
];

export const Loader: React.FC = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const it = setInterval(() => {
        setIndex(prev => (prev + 1) % STEPS.length);
    }, 2000); 
    return () => clearInterval(it);
  }, []);

  const currentStep = STEPS[index];

  return (
    <div className="flex flex-col items-center justify-center py-32 space-y-16 animate-fade-in max-w-sm mx-auto">
      {/* Animation Container */}
      <div className="relative w-32 h-32 flex items-center justify-center">
        
        {/* 1. Pulsing Background Glow */}
        <div className={`absolute inset-0 rounded-full blur-xl opacity-20 transition-colors duration-1000 ${currentStep.bg}`}></div>

        {/* 2. Static Outer Ring (faint) */}
        <div className="absolute inset-0 border border-slate-800 rounded-full" />
        
        {/* 3. Rotating Dashed Ring (Slow) */}
        <div className="absolute inset-2 border border-dashed border-slate-700 rounded-full animate-[spin_10s_linear_infinite]" />

        {/* 4. Main Spinner Ring (Fast, Color shifting) */}
        <div className={`absolute inset-0 border-2 border-transparent border-t-current rounded-full animate-spin transition-colors duration-1000 ${currentStep.color}`} />
        
        {/* 5. Counter-rotating Inner Ring */}
        <div className={`absolute inset-4 border-2 border-transparent border-b-current rounded-full animate-[spin_3s_linear_infinite_reverse] opacity-50 transition-colors duration-1000 ${currentStep.color}`} />

        {/* 6. Center Core Pulse */}
        <div className="relative z-10">
            <div className={`w-4 h-4 rounded-full transition-all duration-1000 ${currentStep.bg} ${currentStep.shadow} shadow-lg animate-pulse`}></div>
            <div className={`absolute inset-0 rounded-full animate-ping opacity-20 ${currentStep.bg}`}></div>
        </div>
      </div>

      {/* Text Container */}
      <div className="space-y-6 w-full text-center">
        <div className="space-y-3 min-h-[60px]">
          <p className={`text-[12px] font-bold uppercase tracking-[0.25em] transition-colors duration-1000 ${currentStep.color} drop-shadow-md`}>
            {currentStep.text}...
          </p>
          <p className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.2em] flex items-center justify-center gap-2">
            <span className={`w-1 h-1 rounded-full ${currentStep.bg} animate-pulse`}></span>
            Neural Processing Protocol
            <span className={`w-1 h-1 rounded-full ${currentStep.bg} animate-pulse`}></span>
          </p>
        </div>
        
        {/* Progress Bar */}
        <div className="h-0.5 w-full bg-slate-800 overflow-hidden rounded-full max-w-[200px] mx-auto">
          <div 
            className={`h-full transition-colors duration-1000 relative overflow-hidden ${currentStep.bg} shadow-[0_0_10px_rgba(255,255,255,0.3)]`}
            style={{ width: '100%' }}
          >
             <div className="absolute inset-0 bg-white/60 w-full animate-[shimmer_1.5s_infinite] translate-x-[-100%]" />
          </div>
        </div>
        
        <style>{`
          @keyframes shimmer {
            100% { transform: translateX(100%); }
          }
        `}</style>
      </div>
    </div>
  );
};