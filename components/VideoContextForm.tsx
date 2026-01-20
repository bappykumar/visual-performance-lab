import React, { useState, useId } from 'react';
import type { VideoContextData, AnalysisMode } from '../types';

interface VideoContextFormProps {
  mode: AnalysisMode;
  onSubmit: (data: VideoContextData) => void;
  disabled: boolean;
}

const ASSET_TYPES = [
  { id: 'ADVERTISEMENT', label: 'Ads' },
  { id: 'BANNER_DESIGN', label: 'Banner' },
  { id: 'SOCIAL_POST', label: 'Social Post' },
  { id: 'WEBSITE_HERO', label: 'Web Hero' },
  { id: 'PRODUCT_SHOT', label: 'Product' },
  { id: 'BRANDING', label: 'Branding' },
  { id: 'UI_UX', label: 'UI/UX' },
  { id: 'OTHER', label: 'Other' },
];

export const VideoContextForm: React.FC<VideoContextFormProps> = ({ mode, onSubmit, disabled }) => {
  const [description, setDescription] = useState('');
  const [selectedType, setSelectedType] = useState(mode === 'YOUTUBE' ? 'YOUTUBE_THUMBNAIL' : 'ADVERTISEMENT');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputId = useId();

  const isButtonEnabled = !disabled && !isSubmitting;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isButtonEnabled) return;

    setIsSubmitting(true);
    onSubmit({
      assetType: mode === 'YOUTUBE' ? 'YOUTUBE_THUMBNAIL' : selectedType,
      category: 'General Audience',
      title: mode === 'YOUTUBE' ? 'YouTube Thumbnail' : 'Primary Visual Asset',
      description: description.trim()
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 animate-fade-in">
      {/* Asset Type Selection - Only visible for BANNER mode */}
      {mode === 'BANNER' && (
        <div className="space-y-3">
          <label className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400 ml-1">
            Asset Category
          </label>
          <div className="flex flex-wrap gap-2">
            {ASSET_TYPES.map((type) => (
              <button
                key={type.id}
                type="button"
                onClick={() => setSelectedType(type.id)}
                disabled={disabled || isSubmitting}
                className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border ${
                  selectedType === type.id
                    ? 'bg-blue-600 border-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]'
                    : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700 hover:text-slate-300 hover:bg-slate-800'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-3">
        <label 
          htmlFor={inputId}
          className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400 ml-1 cursor-pointer select-none"
        >
          Diagnostic Objective
        </label>
        <textarea
          id={inputId}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={5}
          className="w-full bg-slate-900 border border-slate-800 text-slate-200 rounded-xl px-5 py-4 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all text-[15px] font-normal leading-relaxed outline-none resize-none shadow-inner placeholder:text-slate-600"
          placeholder="Optional: add context to fine-tune analysis (e.g., 'Targeting Gen-Z for a tech product launch')..."
          disabled={disabled || isSubmitting}
        />
      </div>

      <button
        type="submit"
        disabled={!isButtonEnabled}
        className={`
          w-full py-5 rounded-xl text-[12px] font-bold uppercase tracking-widest transition-all duration-200
          ${isButtonEnabled 
            ? 'bg-blue-600 text-white cursor-pointer shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:bg-blue-500 hover:shadow-[0_0_25px_rgba(37,99,235,0.5)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]' 
            : 'bg-slate-800 text-slate-600 border border-slate-700/50 opacity-60 cursor-not-allowed shadow-none'
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