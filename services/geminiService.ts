import { GoogleGenAI } from "@google/genai";
import { VideoContextData } from "../types";
import type { AnalysisResult, AnalysisMode } from '../types';

// Using gemini-3-flash-preview for balanced speed and deep multimodal reasoning
export const ACTIVE_MODEL = 'gemini-3-flash-preview';

// New Function: Validates key by making a lightweight API call
export const validateApiKey = async (apiKey: string): Promise<boolean> => {
  try {
    const ai = new GoogleGenAI({ apiKey: apiKey });
    // Minimal token count request to verify access without using heavy resources
    await ai.models.generateContent({
        model: ACTIVE_MODEL,
        contents: [{ parts: [{ text: "ping" }] }],
        config: { maxOutputTokens: 1 }
    });
    return true;
  } catch (error: any) {
    console.error("Key Validation Failed:", error);
    return false;
  }
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
    context: VideoContextData,
    apiKey: string
): Promise<AnalysisResult> => {
    
    // Initialize with the user-provided key
    const ai = new GoogleGenAI({ apiKey: apiKey });
    
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
### ANALYSIS PROTOCOL:

1. **LAYER SEPARATION:**
   - Detect Foreground vs Background text. 
   - *INSTRUCTION:* When listing 'detectedText', STRICTLY IGNORE the Background layer (e.g. text on t-shirts, random signs). Only report the Foreground text.

2. **THE "BLINK TEST":**
   - Does the asset stop the scroll?
   - If text is hard to read, penalize 'Legibility'.
   - If the face looks bored, penalize 'Emotion'.

3. **THE "DIRECTOR'S CRITIQUE":**
   - Analyze Visual Hierarchy and Color Harmony.
   - Identify EXACTLY 4 distinct dominant colors.

4. **VERDICT GENERATION:**
   - Be direct. Give a score that reflects the *probability of success*.
`;

    const prompt = `
${persona}

${diagnosticLogic}

**ASSET CONTEXT:**
- Type: ${context.assetType}
- Title/Hook: "${context.title}"
- Creator Intent: ${context.description || "Maximize viewer retention and click-through rate."}

**OUTPUT INSTRUCTION:**
You MUST return a valid JSON object. 
DO NOT use markdown code blocks (like \`\`\`json). 
Just return the raw JSON string.

Structure:
{
  "score": integer (0-100),
  "criteria": {
    "clarity": integer,
    "contrast": integer,
    "legibility": integer,
    "hierarchy": integer,
    "harmony": integer,
    "narrative": integer,
    "emotion": integer,
    "uniqueness": integer
  },
  "pros": [string array],
  "cons": [string array],
  "verdict": string,
  "imageDescription": string,
  "dominantColors": [{ "hex": string, "psychology": string }] (exactly 4 items),
  "colorEvaluation": string,
  "textAnalysis": {
    "detectedText": [string array],
    "fontEvaluation": string,
    "sizeEvaluation": string,
    "placementEvaluation": string,
    "readabilityScore": integer (0-100),
    "recommendedFonts": [string array]
  },
  "platformOptimization": string
}
`;

    const imagePart = await fileToGenerativePart(imageFile);

    try {
        // Create a timeout promise (45s)
        const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error("Analysis timed out. The server is taking too long to respond.")), 45000)
        );

        // Race the API call against the timeout
        const response: any = await Promise.race([
            ai.models.generateContent({
                model: ACTIVE_MODEL,
                contents: [{ parts: [ { text: prompt }, imagePart ] }],
                // Removed responseSchema to improve stability with Vision models
                config: {
                    temperature: 0.4,
                }
            }),
            timeoutPromise
        ]);
        
        let responseText = response.text;
        if (!responseText) throw new Error("Analysis failed - empty response.");
        
        // Robust cleaning: remove markdown and extract JSON
        responseText = responseText.replace(/```json\n?|\n?```/g, '').trim();
        const jsonStart = responseText.indexOf('{');
        const jsonEnd = responseText.lastIndexOf('}');
        
        if (jsonStart !== -1 && jsonEnd !== -1) {
            responseText = responseText.substring(jsonStart, jsonEnd + 1);
        }

        try {
            const data = JSON.parse(responseText);
            return { ...data, mode };
        } catch (jsonError) {
            console.error("JSON Parse Error:", jsonError, "Raw Text:", responseText);
            throw new Error("The AI returned malformed data. Please try again.");
        }

    } catch (error: any) {
        console.error("AI Lab Error:", error);
        
        if (error.message?.includes("429")) {
          throw new Error("System busy (429). Please wait 30 seconds and try again.");
        }
        if (error.message?.includes("403") || error.message?.includes("API key")) {
          throw new Error("AUTH_FAILED"); // Special code to trigger re-auth in UI
        }
        if (error.message?.includes("timed out")) {
            throw error;
        }
        
        throw new Error("Diagnostic engine failed. Please verify your internet connection and API key.");
    }
};