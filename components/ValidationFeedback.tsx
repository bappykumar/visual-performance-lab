import React from 'react';
import type { ValidationStatus } from '../types';

interface ValidationFeedbackProps {
  validation: ValidationStatus;
}

export const ValidationFeedback: React.FC<ValidationFeedbackProps> = ({ validation }) => {
  const { status, messages } = validation;

  const config = {
    SAFE: {
      border: 'border-slate-800',
      text: 'text-slate-400',
      indicator: 'bg-teal-500',
      label: 'Format Verified'
    },
    WARNING: {
      border: 'border-amber-900/50',
      text: 'text-amber-500',
      indicator: 'bg-amber-500',
      label: 'Attention Required'
    },
    ERROR: {
      border: 'border-red-900/50',
      text: 'text-red-500',
      indicator: 'bg-red-500',
      label: 'Protocol Error'
    }
  };

  const current = config[status];

  return (
    <div className={`pt-6 space-y-3`}>
      <div className="flex items-center gap-3">
        <div className={`w-1.5 h-1.5 rounded-full ${current.indicator} shadow-[0_0_8px_currentColor]`}></div>
        <span className={`text-[10px] font-bold uppercase tracking-widest ${current.text}`}>{current.label}</span>
      </div>
      <ul className="space-y-1">
        {messages.map((m, i) => (
          <li key={i} className="text-[13px] text-slate-500 font-normal">
            {m}
          </li>
        ))}
      </ul>
    </div>
  );
};