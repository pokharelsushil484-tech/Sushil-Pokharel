
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Analyzes a social media URL for video extraction capabilities.
 */
export const analyzeSocialUrl = async (url: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analyze this social media URL for video extraction: ${url}. 
      1. Identify platform.
      2. Suggest available qualities: Focus on 8K, 7K, 4K, and 1080p.
      3. Verify Video Regulation: Is this content likely restricted or public?
      4. Provide a professional title.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            platform: { type: Type.STRING },
            title: { type: Type.STRING },
            suggestedQuality: { type: Type.STRING },
            isRegulated: { type: Type.BOOLEAN },
            regulationNote: { type: Type.STRING },
            isValid: { type: Type.BOOLEAN }
          },
          required: ["platform", "isValid", "suggestedQuality"]
        }
      }
    });
    
    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Analysis Failure:", error);
    return { platform: "Unknown", isValid: false, suggestedQuality: "1080p", title: "Untitled Video" };
  }
};

/**
 * Generates a strategic study plan for a subject and time duration.
 * Added to resolve error in StudyPlanner.tsx.
 */
export const generateStudyPlan = async (subject: string, estimatedTime: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Create a professional study plan for the subject: ${subject}. The student has approximately ${estimatedTime} hours available. Provide a structured breakdown.`,
    });
    return response.text || "Strategic breakdown unavailable at this moment.";
  } catch (error) {
    console.error("Study Plan Error:", error);
    return "Error generating AI study plan. Please verify your subject details.";
  }
};

/**
 * Summarizes the content of a node or academic note.
 * Added to resolve error in Notes.tsx.
 */
export const summarizeNote = async (content: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Summarize the following note content concisely for a student portfolio: \n\n${content}`,
    });
    return response.text || "Summary could not be generated.";
  } catch (error) {
    console.error("Summary Error:", error);
    return "Error generating AI summary.";
  }
};

/**
 * Technical AI chat assistant for student queries and strategy.
 * Added to resolve error in AIChat.tsx.
 */
export const chatWithAI = async (input: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: input,
    });
    return response.text || "I'm having trouble processing that query right now.";
  } catch (error) {
    console.error("Chat Assistant Error:", error);
    return "Technical Error: The AI Assistant is temporarily unavailable.";
  }
};