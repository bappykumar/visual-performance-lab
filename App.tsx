import React, { useState, useRef, useEffect } from 'react';
import { VideoContextForm } from './components/VideoContextForm';
import { AnalysisResultDisplay } from './components/AnalysisResultDisplay';
import { analyzeAsset, ACTIVE_MODEL } from './services/geminiService';
import { ValidationFeedback } from './components/ValidationFeedback';
import { ApiKeyInput } from './components/ApiKeyInput';
import { Loader } from './components/Loader';
import type { AnalysisResult, AnalysisMode, ValidationStatus, VideoContextData } from './types';

type AnalysisStep = 'IDLE' | 'LOADED' | 'RUNNING' | 'SCORING' | 'READY';

function App() {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [step, setStep] = useState<AnalysisStep>('IDLE');
  const [mode, setMode] = useState<AnalysisMode | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [validation] = useState<ValidationStatus>({ status: 'SAFE', messages: ["Format verified for analysis"] });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingMode, setPendingMode] = useState<AnalysisMode | null>(null);

  // Check for stored API key on mount
  useEffect(() => {
    const storedKey = localStorage.getItem('gemini_api_key');
    if (storedKey) {
      setApiKey(storedKey);
    }
  }, []);

  const handleSaveApiKey = (key: string) => {
    localStorage.setItem('gemini_api_key', key);
    setApiKey(key);
    setShowApiKeyModal(false);
  };

  const handleRemoveApiKey = () => {
    localStorage.removeItem('gemini_api_key');
    setApiKey(null);
    handleReset();
  };

  const handleImageUpload = (file: File) => {
    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setError(null);
    setStep('LOADED');
  };

  const handleModeClick = (selectedMode: AnalysisMode) => {
    // Strict API Key Check
    if (!apiKey) {
        setShowApiKeyModal(true);
        return;
    }
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
    
    if (!apiKey) {
        setShowApiKeyModal(true);
        return;
    }

    setStep('RUNNING');
    setError(null);

    try {
      console.log("Starting analysis...");
      const result = await analyzeAsset(imageFile, mode, context, apiKey);
      console.log("Analysis complete:", result);
      
      setStep('SCORING');
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setAnalysisResult(result);
      setStep('READY');
    } catch (e: any) {
      console.error("Audit Protocol Interrupted:", e);
      
      // Auto-handle invalid key scenarios
      if (e.message === "AUTH_FAILED") {
          localStorage.removeItem('gemini_api_key');
          setApiKey(null);
          setShowApiKeyModal(true);
          setError("Session expired or invalid API key. Please re-authenticate.");
          setStep('LOADED');
          return;
      }

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
    <div className="min-h-screen bg-slate-950 text-slate-50 font-sans antialiased flex flex-col items-center relative overflow-x-hidden selection:bg-blue-500/30 selection:text-blue-200">
      {/* Background Gradients */}
      <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-900/10 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-teal-900/10 rounded-full blur-[120px]"></div>
      </div>

      {showApiKeyModal && (
        <ApiKeyInput 
            onSave={handleSaveApiKey} 
            onClose={() => setShowApiKeyModal(false)}
        />
      )}

      <div 
        className="progress-line" 
        style={{ 
          width: getProgressWidth(),
          opacity: step === 'IDLE' || step === 'READY' ? 0 : 1
        }} 
      />

      {/* External Links & Settings Container */}
      <div className="fixed top-6 right-6 z-[110] flex items-center gap-3">
        {apiKey ? (
            <button 
                onClick={handleRemoveApiKey}
                className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 rounded-full hover:bg-red-950/30 hover:border-red-900/50 hover:text-red-400 transition-all duration-200 group shadow-lg text-slate-400 text-[11px] font-bold uppercase tracking-wider backdrop-blur-sm"
                title="Remove API Key"
            >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 group-hover:bg-red-500 transition-colors shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                <span>Key Active</span>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 ml-1 opacity-50 group-hover:opacity-100">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                    <polyline points="16 17 21 12 16 7"></polyline>
                    <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
            </button>
        ) : (
            <button 
                onClick={() => setShowApiKeyModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white border border-blue-500 rounded-full hover:bg-blue-500 transition-all duration-200 shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_25px_rgba(37,99,235,0.5)] text-[11px] font-bold uppercase tracking-wider"
            >
                <span>Set API Key</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11.542 17.314A4 4 0 0110 18.5H7a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
            </button>
        )}

        {/* Telegram Minimal Link */}
        <a 
          href="https://t.me/designbd2" 
          target="_blank" 
          rel="noopener noreferrer"
          className="p-2 bg-slate-900 border border-slate-800 rounded-full hover:bg-slate-800 hover:scale-110 transition-all duration-200 group shadow-lg"
          title="Join Telegram"
          aria-label="Join our Telegram"
        >
          <svg 
            viewBox="0 0 24 24" 
            className="w-5 h-5 fill-slate-500 group-hover:fill-blue-500 transition-colors"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.13-.31-1.08-.66.02-.18.27-.36.74-.55 2.91-1.26 4.85-2.1 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .33z"/>
          </svg>
        </a>
      </div>

      <div className="w-full max-w-5xl px-6 py-12 md:py-24 space-y-12 relative z-10">
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
                 <p className="text-[11px] font-bold text-blue-500 tracking-[0.2em] uppercase drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]">Professional Analysis</p>
                 <div className="flex items-center gap-2 px-3 py-1 bg-slate-900/50 border border-slate-800 rounded-full backdrop-blur-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse shadow-[0_0_8px_rgba(20,184,166,0.8)]"></div>
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-tighter">Engine: {ACTIVE_MODEL}</span>
                 </div>
               </div>
               <h1 className="text-4xl md:text-5xl font-semibold text-white tracking-tight drop-shadow-xl">Design Audit Protocol</h1>
               <p className="text-slate-400 max-w-md mx-auto text-sm leading-relaxed">Upload your asset to begin a deep-dive diagnostic of visual hierarchy and performance potential.</p>
            </header>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">
              {[
                { id: 'YOUTUBE' as const, title: 'YouTube Core', desc: 'CTR & Narrative Hierarchy Analysis' },
                { id: 'BANNER' as const, title: 'Design Protocol', desc: 'Universal Visual & Aesthetic Performance Audit' }
              ].map((m) => (
                <button 
                  key={m.id}
                  onClick={() => handleModeClick(m.id)}
                  className="group relative p-8 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-800/50 transition-all duration-300 text-left active:scale-[0.99] shadow-lg hover:shadow-2xl overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <h3 className="text-lg font-medium text-white mb-2 relative z-10">{m.title}</h3>
                  <p className="text-[13px] text-slate-400 mb-6 relative z-10">{m.desc}</p>
                  <div className="text-[11px] font-bold text-blue-400 uppercase tracking-widest opacity-60 group-hover:opacity-100 transition-opacity flex items-center gap-2 relative z-10">
                    Select Asset <span className="transform group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </button>
              ))}
            </div>
          </nav>
        )}

        {step !== 'IDLE' && (
          <main className="w-full">
            {step === 'RUNNING' || step === 'SCORING' ? (
              <Loader />
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-6 animate-fade-in">
                <div className="p-4 bg-red-950/30 border border-red-900/50 rounded-full">
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                   </svg>
                </div>
                <div className="text-center space-y-2 max-w-md">
                   <h3 className="text-lg font-bold text-white">Analysis Halted</h3>
                   <p className="text-sm text-slate-400">{error}</p>
                </div>
                <button onClick={handleReset} className="px-8 py-3 rounded-xl border border-slate-700 text-[11px] font-bold text-white uppercase tracking-widest hover:bg-slate-800 transition-all">Retry Analysis</button>
              </div>
            ) : step === 'LOADED' ? (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-16 items-start animate-fade-in-up">
                <div className="md:col-span-7 space-y-8">
                  <div className="rounded-xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-900/50 backdrop-blur-sm">
                    <img src={previewUrl!} className="w-full aspect-video object-contain" alt="Preview" />
                  </div>
                  <ValidationFeedback validation={validation} />
                </div>

                <div className="md:col-span-5 space-y-10">
                  <header>
                    <button onClick={handleReset} className="text-[11px] font-bold uppercase tracking-widest text-slate-500 hover:text-white transition-all mb-8 flex items-center gap-2">← Back</button>
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-semibold text-white tracking-tight">Audit Parameters</h2>
                      <span className="text-[9px] font-mono text-slate-500 bg-slate-900 border border-slate-800 px-2 py-1 rounded">V1.0-LAB</span>
                    </div>
                    <p className="text-sm text-slate-400 mt-2">Define diagnostic context for accurate evaluation</p>
                  </header>
                  <VideoContextForm mode={mode!} onSubmit={handleAnalysis} disabled={step !== 'LOADED'} />
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