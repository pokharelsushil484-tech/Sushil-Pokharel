
import {GoogleGenAI, Type} from "@google/genai";
import { UserProfile, VerificationQuestion } from "../types";

// Moved client initialization inside functions to prevent "process is not defined" crash during app boot.

export const generateVerificationForm = async (profile: UserProfile): Promise<VerificationQuestion[]> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate a professional identity verification questionnaire for a student pocket app. 
      The student's name is ${profile.name} and they study ${profile.education || 'General Studies'}.
      Create 4 targeted questions to verify they are a legitimate student and will use the storage responsibly.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              question: { type: Type.STRING },
              type: { type: Type.STRING, enum: ["text", "choice"] },
              options: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["id", "question", "type"]
          }
        }
      }
    });
    
    const jsonStr = response.text?.trim();
    return jsonStr ? JSON.parse(jsonStr) : [];
  } catch (error) {
    console.error("Form Generation Error:", error);
    return [
      { id: '1', question: "What is your primary academic goal?", type: 'text' },
      { id: '2', question: "How will you utilize the encrypted storage?", type: 'text' }
    ];
  }
};

export const chatWithAI = async (message: string): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: message,
      config: {
        systemInstruction: "You are a professional AI data assistant inside StudentPocket, a file infrastructure app for Sushil Pokharel. Help the user manage files and understand security protocols."
      }
    });
    return response.text || "Interface error. Please retry signal.";
  } catch (error) {
    console.error("AI Chat Error:", error);
    return "Network sync failed.";
  }
};

/**
 * Strategy Generator for Study Planner
 */
export const generateStudyPlan = async (subject: string, hours: string): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate a study plan for ${subject} with an available time budget of ${hours} hours. Provide a tactical breakdown.`,
      config: {
        systemInstruction: "You are a strategic academic assistant. Provide high-density, actionable study breakdowns."
      }
    });
    return response.text || "No strategy synthesized.";
  } catch (error) {
    console.error("Plan Generation Error:", error);
    return "Study plan module sync failure.";
  }
};

/**
 * Summarization Engine for Notes
 */
export const summarizeNote = async (content: string): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Summarize the following technical/academic note concisely: ${content}`,
      config: {
        systemInstruction: "You are a precise summarization utility. Focus on core concepts and key takeaways."
      }
    });
    return response.text || "Summary failed to compile.";
  } catch (error) {
    console.error("Summarization Error:", error);
    return "Summarization protocol error.";
  }
};
