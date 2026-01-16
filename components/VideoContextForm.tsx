
import React, { useState, useId } from 'react';

export interface VideoContextData {
  category: string;
  title: string;
  description: string;
}

interface VideoContextFormProps {
  onSubmit: (data: VideoContextData) => void;
  disabled: boolean;
}

export const VideoContextForm: React.FC<VideoContextFormProps> = ({ onSubmit, disabled }) => {
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputId = useId();

  // Button logic: Enabled as long as no analysis is in progress and the parent hasn't disabled it.
  // The text input is now OPTIONAL.
  const isButtonEnabled = !disabled && !isSubmitting;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isButtonEnabled) return;

    setIsSubmitting(true);
    onSubmit({
      category: 'General Audience',
      title: 'Primary Visual Asset',
      description: description.trim()
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 animate-fade-in">
      <div className="space-y-3">
        <label 
          htmlFor={inputId}
          className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-900 ml-1 cursor-pointer select-none"
        >
          Diagnostic Objective
        </label>
        <textarea
          id={inputId}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={6}
          className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl px-5 py-4 focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 transition-all text-[15px] font-normal leading-relaxed outline-none resize-none shadow-sm placeholder:text-slate-300"
          placeholder="Optional: add context to fine-tune analysis…"
          disabled={disabled || isSubmitting}
        />
      </div>

      <button
        type="submit"
        disabled={!isButtonEnabled}
        className={`
          w-full py-5 rounded-xl text-[12px] font-bold uppercase tracking-widest transition-all duration-200
          ${isButtonEnabled 
            ? 'bg-blue-600 text-white cursor-pointer shadow-lg shadow-blue-100 hover:bg-blue-700 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]' 
            : 'bg-slate-100 text-slate-400 opacity-60 cursor-not-allowed shadow-none'
          }
        `}
      >
        <div className="flex items-center justify-center gap-3">
          {isSubmitting && (
            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          )}
          <span>{isSubmitting ? 'Processing Audit...' : 'Execute Analysis'}</span>
        </div>
      </button>
    </form>
  );
};
