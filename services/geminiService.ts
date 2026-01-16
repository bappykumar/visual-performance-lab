import { GoogleGenAI, Type } from "@google/genai";
import type { AnalysisResult, AnalysisMode } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const analysisSchema = {
  type: Type.OBJECT,
  properties: {
    score: { type: Type.INTEGER },
    criteria: {
      type: Type.OBJECT,
      properties: {
        clarity: { type: Type.INTEGER },
        contrast: { type: Type.INTEGER },
        legibility: { type: Type.INTEGER },
        emotion: { type: Type.INTEGER },
        uniqueness: { type: Type.INTEGER },
      },
      required: ["clarity", "contrast", "legibility", "emotion", "uniqueness"],
    },
    pros: { type: Type.ARRAY, items: { type: Type.STRING } },
    cons: { type: Type.ARRAY, items: { type: Type.STRING } },
    verdict: { type: Type.STRING },
    imageDescription: { type: Type.STRING },
    dominantColors: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          hex: { type: Type.STRING },
          psychology: { type: Type.STRING }
        },
        required: ["hex", "psychology"]
      },
    },
    colorEvaluation: { type: Type.STRING },
    textAnalysis: {
      type: Type.OBJECT,
      properties: {
        detectedText: { type: Type.ARRAY, items: { type: Type.STRING } },
        fontEvaluation: { type: Type.STRING },
        sizeEvaluation: { type: Type.STRING },
        placementEvaluation: { type: Type.STRING },
        readabilityScore: { type: Type.INTEGER },
        recommendedFonts: { type: Type.ARRAY, items: { type: Type.STRING } }
      },
      required: ["detectedText", "fontEvaluation", "sizeEvaluation", "placementEvaluation", "readabilityScore", "recommendedFonts"],
    },
    platformOptimization: { type: Type.STRING, description: "Specific advice for the chosen platform." }
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
    context: { category: string; title: string; description: string }
): Promise<AnalysisResult> => {
    
    const model = 'gemini-3-flash-preview';

    const systemPrompt = mode === 'YOUTUBE' 
      ? "You are a YouTube Thumbnail Expert. Focus on Click-Through Rate (CTR), facial expressions, and high-impact visual narrative."
      : "You are a Social Media Design Specialist. Focus on brand aesthetics, stop-the-scroll visual storytelling, and platform-specific impact.";

    const diagnosticObjective = context.description || "No specific objective provided. Perform a general visual diagnostic focused on visual hierarchy, clarity, and universal performance heuristics.";

    const prompt = `
${systemPrompt}

**Task:**
Analyze the attached visual asset for its effectiveness. 

**Diagnostic Parameters:**
- Mode: ${mode}
- User Context/Objective: ${diagnosticObjective}

**Instructions:**
1. Evaluate visual composition, contrast, and focus.
2. If the user provided a specific objective, use it to fine-tune the verdict and refinement logic. 
3. If no objective was provided, assume a general-audience intent and evaluate based on professional design principles.
4. Output must be strictly valid JSON.
`;

    const imagePart = await fileToGenerativePart(imageFile);

    try {
        const result = await ai.models.generateContent({
            model: model,
            contents: [{ parts: [ { text: prompt }, imagePart ] }],
            config: {
                responseMimeType: "application/json",
                responseSchema: analysisSchema,
                temperature: 0.1,
            }
        });
        
        const responseText = result.text;
        if (!responseText) throw new Error("Analysis failed.");
        const data = JSON.parse(responseText);
        return { ...data, mode };

    } catch (error) {
        console.error("AI Lab Error:", error);
        throw new Error("Neural analysis interrupted. Please check your asset and try again.");
    }
};