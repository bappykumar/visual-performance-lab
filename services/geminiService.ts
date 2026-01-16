import { GoogleGenAI, Type } from "@google/genai";
import { VideoContextData } from "../types";
import type { AnalysisResult, AnalysisMode } from '../types';

// Using gemini-3-flash-preview for balanced speed and deep multimodal reasoning
export const ACTIVE_MODEL = 'gemini-3-flash-preview';

const analysisSchema = {
  type: Type.OBJECT,
  properties: {
    score: { type: Type.INTEGER, description: "Overall effectiveness score from 0-100 based on design psychology." },
    criteria: {
      type: Type.OBJECT,
      properties: {
        clarity: { type: Type.INTEGER },
        contrast: { type: Type.INTEGER },
        legibility: { type: Type.INTEGER },
        hierarchy: { type: Type.INTEGER },
        harmony: { type: Type.INTEGER },
        narrative: { type: Type.INTEGER },
        emotion: { type: Type.INTEGER },
        uniqueness: { type: Type.INTEGER },
      },
      required: ["clarity", "contrast", "legibility", "hierarchy", "harmony", "narrative", "emotion", "uniqueness"],
    },
    pros: { type: Type.ARRAY, items: { type: Type.STRING } },
    cons: { type: Type.ARRAY, items: { type: Type.STRING } },
    verdict: { type: Type.STRING, description: "A punchy, expert design verdict." },
    imageDescription: { type: Type.STRING, description: "Detailed visual breakdown." },
    dominantColors: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          hex: { type: Type.STRING },
          psychology: { type: Type.STRING, description: "Emotional impact of this color." }
        },
        required: ["hex", "psychology"]
      },
    },
    colorEvaluation: { type: Type.STRING, description: "Overall color strategy analysis." },
    textAnalysis: {
      type: Type.OBJECT,
      properties: {
        detectedText: { type: Type.ARRAY, items: { type: Type.STRING } },
        fontEvaluation: { type: Type.STRING, description: "Psychological impact of the chosen fonts." },
        sizeEvaluation: { type: Type.STRING },
        placementEvaluation: { type: Type.STRING },
        readabilityScore: { type: Type.INTEGER, description: "0-100 score for text clarity." },
        recommendedFonts: { type: Type.ARRAY, items: { type: Type.STRING } }
      },
      required: ["detectedText", "fontEvaluation", "sizeEvaluation", "placementEvaluation", "readabilityScore", "recommendedFonts"],
    },
    platformOptimization: { type: Type.STRING }
  },
  required: ["score", "criteria", "pros", "cons", "verdict", "imageDescription", "dominantColors", "colorEvaluation", "textAnalysis"],
};

async function fileToGenerativePart(file: File) {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
}

export const analyzeAsset = async (
    imageFile: File,
    mode: AnalysisMode,
    context: VideoContextData
): Promise<AnalysisResult> => {
    
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const baseSystemPrompt = mode === 'YOUTUBE' 
      ? "You are a YouTube Thumbnail Psychology Expert. Focus on Click-Through Rate (CTR), human facial psychology, and the 'Rule of Thirds'. Analyze if text is too crowded or just right for mobile viewing."
      : "You are a Digital Advertising Psychology Specialist. Focus on Call-to-Action (CTA) prominence, visual anchoring, and how typography influences trust and conversion in banners.";

    const diagnosticLogic = `
Analyze the asset using 'Cognitive Load Theory'. 
- **Typography Audit:** Detect all text. Evaluate if font styles match the brand emotion. Is text readable at small scales?
- **Color Psychology:** Explain why the dominant colors were chosen and their subconscious effect on the viewer.
- **Visual Hierarchy:** Determine where the eye lands first (Anchor point).
- **Scoring:** Assign the 'score' based on how effectively these psychological elements work together.
`;

    const prompt = `
${baseSystemPrompt}
${diagnosticLogic}

**Context:**
Type: ${context.assetType}
Goal: ${context.description || "Optimization for engagement."}

**Return strictly valid JSON according to the provided schema.**
`;

    const imagePart = await fileToGenerativePart(imageFile);

    try {
        const response = await ai.models.generateContent({
            model: ACTIVE_MODEL,
            contents: [{ parts: [ { text: prompt }, imagePart ] }],
            config: {
                responseMimeType: "application/json",
                responseSchema: analysisSchema,
                temperature: 0.1,
            }
        });
        
        const responseText = response.text;
        if (!responseText) throw new Error("Analysis failed - empty response.");
        const data = JSON.parse(responseText);
        return { ...data, mode };

    } catch (error: any) {
        console.error("AI Lab Error:", error);
        if (error.message?.includes("429")) {
          throw new Error("Quota exceeded. Please wait a minute and try again.");
        }
        throw new Error(error.message || "Diagnostic failed. Please try again.");
    }
};