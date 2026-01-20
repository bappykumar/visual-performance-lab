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
    pros: { type: Type.ARRAY, items: { type: Type.STRING }, description: "What works perfectly for the audience?" },
    cons: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Constructive feedback on what kills the engagement." },
    verdict: { type: Type.STRING, description: "A punchy, expert design verdict as a Creative Director." },
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
      description: "Extract exactly 4 distinct dominant colors (Main, Secondary, Accent, Background)."
    },
    colorEvaluation: { type: Type.STRING, description: "Overall color strategy analysis." },
    textAnalysis: {
      type: Type.OBJECT,
      properties: {
        detectedText: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Return ONLY the intended overlay text/headlines. Exclude ALL environmental text." },
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
    
    // Updated Persona: The "Dual-Mind" Approach
    const persona = `
    You are 'Vision Lab', the world's most sophisticated Design Audit AI.
    You possess a **Dual-Mind Architecture**:
    
    1. **MIND A: The Impatient Audience (The Lizard Brain)**
       - You scan the image in 0.5 seconds.
       - You are emotional, easily bored, and judgmental.
       - You ask: "Is this boring? Do I click? Do I understand instantly?"
    
    2. **MIND B: The Creative Director (The Expert Brain)**
       - You analyze *why* Mind A reacted that way.
       - You use technical terms (Kerning, Leading, Rule of Thirds, Color Theory, Gestalt).
       - You provide actionable, tough love feedback to the designer.
    `;

    const diagnosticLogic = `
### ANALYSIS PROTOCOL (CHAIN OF THOUGHT):

1. **LAYER SEPARATION (Technical Step):**
   - **Foreground (Intentional):** Headlines, Arrows, Face expressions, Product shots.
   - **Background (Noise):** T-shirts with text, street signs, random logos, blurry crowds.
   - *INSTRUCTION:* When listing 'detectedText', STRICTLY IGNORE the Background layer. Only report the Foreground text meant for reading.

2. **THE "BLINK TEST" (Audience Step):**
   - Simulate a viewer scrolling fast. Does the asset stop the scroll?
   - If the main text is hard to read against the background, penalize the 'Legibility' score heavily.
   - If the face looks bored or fake, penalize the 'Emotion' score.

3. **THE "DIRECTOR'S CRITIQUE" (Expert Step):**
   - Analyze the **Visual Hierarchy**: Is the eye guided? (e.g., Face -> Headline -> CTA).
   - Analyze **Color Harmony**: Identify EXACTLY 4 distinct dominant colors (e.g., Background, Subject, Text, CTA) and explain their psychological role.
   - Analyze **Typography**: Is the font weight heavy enough? Is there enough negative space?

4. **VERDICT GENERATION:**
   - Combine the Audience's gut feeling with the Director's technical advice.
   - Be direct. Do not fluff. If the design is cluttered, say "The hierarchy is broken."
   - Give a score that reflects the *probability of success* in the real world.
`;

    const prompt = `
${persona}

${diagnosticLogic}

**ASSET CONTEXT:**
- Type: ${context.assetType}
- Title/Hook: "${context.title}"
- Creator Intent: ${context.description || "Maximize viewer retention and click-through rate."}

**OUTPUT INSTRUCTION:**
Return strictly valid JSON. Do not include markdown code blocks. Ensure 'dominantColors' contains exactly 4 items.
`;

    const imagePart = await fileToGenerativePart(imageFile);

    try {
        const response = await ai.models.generateContent({
            model: ACTIVE_MODEL,
            contents: [{ parts: [ { text: prompt }, imagePart ] }],
            config: {
                responseMimeType: "application/json",
                responseSchema: analysisSchema,
                temperature: 0.3, // Slightly higher creativity for the "Critique" persona
            }
        });
        
        const responseText = response.text;
        if (!responseText) throw new Error("Analysis failed - empty response.");
        const data = JSON.parse(responseText);
        return { ...data, mode };

    } catch (error: any) {
        console.error("AI Lab Error:", error);
        if (error.message?.includes("429")) {
          throw new Error("Server busy. Please wait a moment and try again.");
        }
        throw new Error("Diagnostic failed. Please try again.");
    }
};