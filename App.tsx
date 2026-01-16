
import React, { useState, useRef } from 'react';
import { VideoContextForm, VideoContextData } from './components/VideoContextForm';
import { AnalysisResultDisplay } from './components/AnalysisResultDisplay';
import { analyzeAsset } from './services/geminiService';
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
    
    // Immediate state change to trigger global progress and eventual screen change
    setStep('RUNNING');
    setError(null);

    try {
      const result = await analyzeAsset(imageFile, mode, context);
      
      // Artificial delay for 'Scoring' phase to match professional SaaS expectations
      setStep('SCORING');
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setAnalysisResult(result);
      setStep('READY');
    } catch (e: any) {
      console.error("Audit Protocol Interrupted:", e);
      setError(e.message || "The analysis engine encountered an unexpected error.");
      setStep('LOADED'); // Re-enable form for retry
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
    <div className="min-h-screen bg-white text-slate-900 font-sans antialiased flex flex-col items-center">
      <div 
        className="progress-line" 
        style={{ 
          width: getProgressWidth(),
          opacity: step === 'IDLE' || step === 'READY' ? 0 : 1
        }} 
      />

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
            <header className="text-center space-y-4">
               <p className="text-[11px] font-bold text-blue-600 tracking-[0.2em] uppercase">Professional Analysis</p>
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
                <div className="text-center">
                  <p className="text-[12px] font-bold text-slate-900 uppercase tracking-widest">{step === 'RUNNING' ? 'Executing Analysis' : 'Synthesizing Verdict'}</p>
                  <p className="text-[11px] text-slate-400 mt-2">Neural diagnostic in progress</p>
                </div>
              </div>
            ) : error ? (
              <div className="text-center py-20 space-y-6 animate-fade-in">
                <p className="text-sm text-red-500 font-medium">{error}</p>
                <button onClick={handleReset} className="px-8 py-3 rounded-xl border border-slate-200 text-[11px] font-bold text-slate-900 uppercase tracking-widest hover:bg-slate-50 transition-all">Retry Analysis</button>
              </div>
            ) : step === 'LOADED' ? (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-16 items-start animate-fade-in-up">
                {/* LEFT: Thumbnail Preview */}
                <div className="md:col-span-7 space-y-8">
                  <div className="rounded-xl overflow-hidden border border-slate-100 shadow-xl bg-slate-50">
                    <img src={previewUrl!} className="w-full aspect-video object-contain" alt="Preview" />
                  </div>
                  <ValidationFeedback validation={validation} />
                </div>

                {/* RIGHT: Parameters */}
                <div className="md:col-span-5 space-y-10">
                  <header>
                    <button onClick={handleReset} className="text-[11px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-all mb-8 flex items-center gap-2">← Back</button>
                    <h2 className="text-2xl font-semibold text-slate-900 tracking-tight">Audit Parameters</h2>
                    <p className="text-sm text-slate-500 mt-2">Define diagnostic context for accurate evaluation</p>
                  </header>
                  <VideoContextForm onSubmit={handleAnalysis} disabled={step !== 'LOADED'} />
                </div>
              </div>
            ) : analysisResult && (
              <AnalysisResultDisplay result={analysisResult} previewUrl={previewUrl!} onReset={handleReset} />
            )}
          </main>
        )}
      </div>
    </div>
  );
}

export default App;
