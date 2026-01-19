
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Technical Q&A with AI
 */
export const chatWithAI = async (message: string) => {
  try {
    // Using gemini-3-pro-preview for complex reasoning tasks
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: message,
    });
    return response.text || "I'm sorry, I couldn't generate a response.";
  } catch (error) {
    console.error("Chat Error:", error);
    return "Error connecting to AI intelligence.";
  }
};

/**
 * Concisely summarizes notes
 */
export const summarizeNote = async (content: string) => {
  try {
    // Using gemini-3-flash-preview for standard summarization
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Summarize the following notes concisely and professionally:\n\n${content}`,
    });
    return response.text || "No summary available.";
  } catch (error) {
    console.error("Summary Error:", error);
    return "Failed to generate summary.";
  }
};

/**
 * Strategic study plan generation
 */
export const generateStudyPlan = async (subject: string, hours: string) => {
  try {
    // Using gemini-3-pro-preview for complex planning
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Architect a comprehensive study plan for "${subject}" to be mastered in ${hours} hours. Provide a milestone-based breakdown.`,
    });
    return response.text || "Study plan generation failed.";
  } catch (error) {
    console.error("Plan Error:", error);
    return "Unable to architect study plan.";
  }
};

/**
 * Analyzes a URL and provides metadata + regulation status.
 */
export const analyzeVideoLink = async (url: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analyze this video URL: ${url}. 
      1. Platform identification.
      2. Regulation check: Is it public or restricted?
      3. Quality simulation: List estimated sizes for 144p, 1080p, 4K, 7K, and 8K.
      4. Professional Title.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            platform: { type: Type.STRING },
            title: { type: Type.STRING },
            isRegulated: { type: Type.BOOLEAN },
            regulationMessage: { type: Type.STRING },
            estimatedSizes: { 
                type: Type.OBJECT,
                properties: {
                    low: { type: Type.STRING },
                    hd: { type: Type.STRING },
                    uhd: { type: Type.STRING },
                    pro: { type: Type.STRING }
                }
            },
            isValid: { type: Type.BOOLEAN }
          },
          required: ["platform", "isValid", "title"]
        }
      }
    });
    
    // Accessing .text property directly
    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Link Analysis Error:", error);
    return { platform: "Unknown", isValid: false, title: "Video Stream" };
  }
};
