export type AnalysisMode = 'YOUTUBE' | 'SOCIAL';

export interface YouTubeSuggestion {
  videoTitle: string;
  channelName: string;
  reason: string;
}

export interface CriteriaScores {
  clarity: number;
  contrast: number;
  legibility: number;
  emotion: number;
  uniqueness: number;
}

export interface TextAnalysis {
  detectedText: string[];
  fontEvaluation: string;
  sizeEvaluation: string;
  placementEvaluation: string;
  readabilityScore: number;
  recommendedFonts: string[];
}

export interface ColorInfo {
  hex: string;
  psychology: string;
}

export interface ValidationStatus {
  status: 'SAFE' | 'WARNING' | 'ERROR';
  messages: string[];
}

export interface AnalysisResult {
  mode: AnalysisMode;
  score: number;
  criteria: CriteriaScores;
  pros: string[];
  cons: string[];
  verdict: string;
  imageDescription: string;
  dominantColors: ColorInfo[];
  colorEvaluation: string;
  textAnalysis: TextAnalysis;
  platformOptimization?: string;
}