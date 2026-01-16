
import React, { useState, useCallback } from 'react';

interface ImageUploaderProps {
  onImageUpload: (file: File) => void;
  disabled: boolean;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload, disabled }) => {
  const [isOver, setIsOver] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsOver(e.type === "dragenter" || e.type === "dragover");
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsOver(false);
    if (e.dataTransfer.files?.[0]) onImageUpload(e.dataTransfer.files[0]);
  }, [onImageUpload]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      document.getElementById('uploader-input')?.click();
    }
  };

  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-label="Upload an image to start analysis. Supports JPG, PNG, and WEBP up to 10 megabytes."
      className={`min-h-[400px] rounded-2xl flex flex-col items-center justify-center p-12 transition-all duration-300 cursor-pointer border focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/30 ${
        isOver ? 'border-white/20 bg-white/[0.01]' : 'border-white/5 hover:border-white/10'
      }`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      onKeyDown={handleKeyDown}
      onClick={() => !disabled && document.getElementById('uploader-input')?.click()}
    >
      <input 
        id="uploader-input" 
        type="file" 
        accept="image/*" 
        className="hidden" 
        onChange={(e) => e.target.files?.[0] && onImageUpload(e.target.files[0])} 
        disabled={disabled}
        aria-hidden="true"
      />
      
      <div className="flex flex-col items-center space-y-6">
        <div className="text-center space-y-1">
          <h2 className="text-lg font-light text-white tracking-tight">Select Asset</h2>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Upload or drop image</p>
        </div>

        <div className="flex items-center gap-3 pt-4" aria-hidden="true">
           <span className="text-[8px] font-bold text-slate-600 uppercase tracking-widest border border-white/5 px-2 py-1 rounded">JPG / PNG / WEBP</span>
           <span className="text-[8px] font-bold text-slate-700 uppercase tracking-widest border border-white/5 px-2 py-1 rounded">Max 10MB</span>
        </div>
      </div>
    </div>
  );
};
