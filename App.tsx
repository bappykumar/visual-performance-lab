import React, { useState, useRef } from 'react';
import { VideoContextForm, VideoContextData } from './components/VideoContextForm';
import { AnalysisResultDisplay } from './components/AnalysisResultDisplay';
import { analyzeAsset, ACTIVE_MODEL } from './services/geminiService';
import { ValidationFeedback } from './components/ValidationFeedback';
import type { AnalysisResult, AnalysisMode, ValidationStatus } from './types';

type AnalysisStep = 'IDLE' | 'LOADED' | 'RUNNING' | 'SCORING' | 'READY';

function App() {
  const [step, setStep] = useState<AnalysisStep>('IDLE');
  const [mode, setMode] = useState<AnalysisMode | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [validation] = useState<ValidationStatus>({ status: 'SAFE', messages: ["Format verified for analysis"] });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingMode, setPendingMode] = useState<AnalysisMode | null>(null);

  const handleImageUpload = (file: File) => {
    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setError(null);
    setStep('LOADED');
  };

  const handleModeClick = (selectedMode: AnalysisMode) => {
    setPendingMode(selectedMode);
    fileInputRef.current?.click();
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && pendingMode) {
      setMode(pendingMode);
      handleImageUpload(file);
    }
    e.target.value = '';
  };

  const handleAnalysis = async (context: VideoContextData) => {
    if (!imageFile || !mode) return;
    
    setStep('RUNNING');
    setError(null);

    try {
      const result = await analyzeAsset(imageFile, mode, context);
      
      setStep('SCORING');
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setAnalysisResult(result);
      setStep('READY');
    } catch (e: any) {
      console.error("Audit Protocol Interrupted:", e);
      setError(e.message || "The analysis engine encountered an unexpected error.");
      setStep('LOADED');
    }
  };

  const handleReset = () => {
    setStep('IDLE');
    setMode(null);
    setImageFile(null);
    setPreviewUrl(null);
    setAnalysisResult(null);
    setError(null);
  };

  const getProgressWidth = () => {
    switch (step) {
      case 'IDLE': return '0%';
      case 'LOADED': return '15%';
      case 'RUNNING': return '50%';
      case 'SCORING': return '85%';
      case 'READY': return '100%';
      default: return '0%';
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans antialiased flex flex-col items-center relative">
      <div 
        className="progress-line" 
        style={{ 
          width: getProgressWidth(),
          opacity: step === 'IDLE' || step === 'READY' ? 0 : 1
        }} 
      />

      {/* External Links Container */}
      <div className="fixed top-6 right-6 z-[110] flex items-center gap-3">
        {/* Prompt Master Link */}
        <a 
          href="https://stock-prompt-architect.vercel.app/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="p-2 bg-slate-50 border border-slate-100 rounded-full hover:bg-slate-100 hover:scale-110 transition-all duration-200 group shadow-sm"
          title="PROMPT MASTER"
          aria-label="Visit Prompt Master"
        >
          <svg 
            viewBox="0 0 24 24" 
            className="w-5 h-5 fill-slate-400 group-hover:fill-indigo-500 transition-colors"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M12 2L14.5 9L22 12L14.5 15L12 22L9.5 15L2 12L9.5 9L12 2ZM12 6.5L10.8 10.2L7.1 11.4L10.8 12.6L12 16.3L13.2 12.6L16.9 11.4L13.2 10.2L12 6.5ZM19 3L20.2 6.7L24 7.9L20.2 9.1L19 12.8L17.8 9.1L14 7.9L17.8 6.7L19 3ZM5.5 14L6.4 16.5L9 17.4L6.4 18.3L5.5 20.9L4.6 18.3L2 17.4L4.6 16.5L5.5 14Z"/>
          </svg>
        </a>

        {/* Telegram Minimal Link */}
        <a 
          href="https://t.me/designbd2" 
          target="_blank" 
          rel="noopener noreferrer"
          className="p-2 bg-slate-50 border border-slate-100 rounded-full hover:bg-slate-100 hover:scale-110 transition-all duration-200 group shadow-sm"
          title="Join Telegram"
          aria-label="Join our Telegram"
        >
          <svg 
            viewBox="0 0 24 24" 
            className="w-5 h-5 fill-slate-400 group-hover:fill-blue-500 transition-colors"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.13-.31-1.08-.66.02-.18.27-.36.74-.55 2.91-1.26 4.85-2.1 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .33z"/>
          </svg>
        </a>
      </div>

      <div className="w-full max-w-5xl px-6 py-12 md:py-24 space-y-12">
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={onFileChange} 
          accept="image/*" 
          className="hidden" 
        />

        {step === 'IDLE' && (
          <nav className="flex flex-col items-center space-y-16 animate-fade-in">
            <header className="text-center space-y-6">
               <div className="flex flex-col items-center gap-2">
                 <p className="text-[11px] font-bold text-blue-600 tracking-[0.2em] uppercase">Professional Analysis</p>
                 <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 border border-slate-100 rounded-full">
                    <div className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse"></div>
                    <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-tighter">Engine: {ACTIVE_MODEL}</span>
                 </div>
               </div>
               <h1 className="text-4xl font-semibold text-slate-900 tracking-tight">Thumbnail Audit Protocol</h1>
               <p className="text-slate-500 max-w-md mx-auto text-sm">Upload your asset to begin a deep-dive diagnostic of visual hierarchy and performance potential.</p>
            </header>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">
              {[
                { id: 'YOUTUBE' as const, title: 'YouTube Core', desc: 'CTR & Narrative Hierarchy Analysis' },
                { id: 'SOCIAL' as const, title: 'Brand Equity', desc: 'Aesthetic Impact & Branding Audit' }
              ].map((m) => (
                <button 
                  key={m.id}
                  onClick={() => handleModeClick(m.id)}
                  className="group card-flat p-8 rounded-xl hover:border-slate-300 transition-all duration-200 text-left active:scale-[0.99] shadow-sm hover:shadow-md"
                >
                  <h3 className="text-lg font-medium text-slate-900 mb-2">{m.title}</h3>
                  <p className="text-[13px] text-slate-500 mb-6">{m.desc}</p>
                  <div className="text-[11px] font-bold text-blue-600 uppercase tracking-widest opacity-60 group-hover:opacity-100 transition-opacity">Select Asset →</div>
                </button>
              ))}
            </div>
          </nav>
        )}

        {step !== 'IDLE' && (
          <main className="w-full">
            {step === 'RUNNING' || step === 'SCORING' ? (
              <div className="flex flex-col items-center justify-center py-40 space-y-6 animate-fade-in">
                <div className="w-8 h-8 border-2 border-slate-100 border-t-blue-600 rounded-full animate-spin" />
                <div className="text-center space-y-3">
                  <p className="text-[12px] font-bold text-slate-900 uppercase tracking-widest">{step === 'RUNNING' ? 'Executing Analysis' : 'Synthesizing Verdict'}</p>
                  <div className="inline-flex items-center gap-2 px-2 py-0.5 bg-slate-50 border border-slate-100 rounded">
                    <span className="text-[9px] font-mono text-slate-400 uppercase tracking-tight italic">Protocol: {ACTIVE_MODEL}</span>
                  </div>
                  <p className="text-[11px] text-slate-400">Neural diagnostic in progress</p>
                </div>
              </div>
            ) : error ? (
              <div className="text-center py-20 space-y-6 animate-fade-in">
                <p className="text-sm text-red-500 font-medium">{error}</p>
                <button onClick={handleReset} className="px-8 py-3 rounded-xl border border-slate-200 text-[11px] font-bold text-slate-900 uppercase tracking-widest hover:bg-slate-50 transition-all">Retry Analysis</button>
              </div>
            ) : step === 'LOADED' ? (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-16 items-start animate-fade-in-up">
                <div className="md:col-span-7 space-y-8">
                  <div className="rounded-xl overflow-hidden border border-slate-100 shadow-xl bg-slate-50">
                    <img src={previewUrl!} className="w-full aspect-video object-contain" alt="Preview" />
                  </div>
                  <ValidationFeedback validation={validation} />
                </div>

                <div className="md:col-span-5 space-y-10">
                  <header>
                    <button onClick={handleReset} className="text-[11px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-all mb-8 flex items-center gap-2">← Back</button>
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-semibold text-slate-900 tracking-tight">Audit Parameters</h2>
                      <span className="text-[9px] font-mono text-slate-400 bg-slate-50 px-2 py-1 rounded">V1.0-LAB</span>
                    </div>
                    <p className="text-sm text-slate-500 mt-2">Define diagnostic context for accurate evaluation</p>
                  </header>
                  <VideoContextForm onSubmit={handleAnalysis} disabled={step !== 'LOADED'} />
                </div>
              </div>
            ) : (
              analysisResult && <AnalysisResultDisplay result={analysisResult} previewUrl={previewUrl!} onReset={handleReset} />
            )}
          </main>
        )}
      </div>
    </div>
  );
}

export default App;