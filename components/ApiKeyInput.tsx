import React, { useState } from 'react';
import { validateApiKey } from '../services/geminiService';

interface ApiKeyInputProps {
  onSave: (key: string) => void;
  onClose: () => void;
}

export const ApiKeyInput: React.FC<ApiKeyInputProps> = ({ onSave, onClose }) => {
  const [inputKey, setInputKey] = useState('');
  const [error, setError] = useState('');
  const [isValidating, setIsValidating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!inputKey.trim()) {
      setError('Please enter a valid API key');
      return;
    }
    if (!inputKey.startsWith('AIza')) {
        setError('Invalid format. Google keys typically start with "AIza".');
        return;
    }

    setIsValidating(true);

    try {
        const isValid = await validateApiKey(inputKey.trim());
        if (isValid) {
            onSave(inputKey.trim());
        } else {
            setError('Access Denied. This API key appears to be invalid or expired.');
        }
    } catch (e) {
        setError('Connection failed. Please check your internet.');
    } finally {
        setIsValidating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity" 
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-8 animate-fade-in-up">
        {/* Close Button */}
        <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-500 hover:text-slate-300 hover:bg-slate-800 rounded-full transition-all"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
        </button>

        <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-900/20 border border-blue-800/50 rounded-full mb-4">
                <span className={`w-2 h-2 rounded-full ${isValidating ? 'bg-amber-400 animate-ping' : 'bg-blue-500 animate-pulse'} shadow-[0_0_8px_currentColor]`}></span>
                <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">
                    {isValidating ? 'Verifying Protocol...' : 'Access Protocol'}
                </span>
            </div>
            <h1 className="text-2xl font-semibold text-white tracking-tight">Activate Neural Engine</h1>
            <p className="text-sm text-slate-400">Enter your Google Gemini API key to proceed.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          <div className="space-y-2">
            <label htmlFor="apiKey" className="text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1">
              API Key
            </label>
            <input
              id="apiKey"
              type="password"
              value={inputKey}
              onChange={(e) => {
                  setInputKey(e.target.value);
                  setError('');
              }}
              disabled={isValidating}
              placeholder="AIza..."
              className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded-xl px-4 py-3 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none text-sm font-mono placeholder:text-slate-600 shadow-inner disabled:opacity-50"
              autoFocus
            />
            {error && <p className="text-[11px] text-red-400 font-medium ml-1 animate-fade-in">{error}</p>}
          </div>

          <button
            type="submit"
            disabled={isValidating}
            className={`w-full py-3.5 rounded-xl text-[11px] font-bold uppercase tracking-[0.2em] transition-all active:scale-[0.99] shadow-lg shadow-slate-900/50 flex items-center justify-center gap-2
                ${isValidating 
                    ? 'bg-slate-700 text-slate-400 cursor-not-allowed' 
                    : 'bg-slate-100 text-slate-900 hover:bg-white'
                }
            `}
          >
            {isValidating && (
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            )}
            <span>{isValidating ? 'Validating Key...' : 'Authenticate'}</span>
          </button>
        </form>

        <div className="pt-6 mt-6 border-t border-slate-800 text-center space-y-3">
            <p className="text-[11px] text-slate-500 leading-relaxed max-w-xs mx-auto">
                Key validation happens securely via a secure handshake.
            </p>
            <a 
                href="https://aistudio.google.com/app/apikey" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-400 hover:text-blue-300 transition-colors uppercase tracking-wider group"
            >
                Get a free key here
                <svg className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
            </a>
        </div>
      </div>
    </div>
  );
};