import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';

// Safely initialize client only if key exists, otherwise we'll handle gracefully
const getClient = () => {
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

export const summarizeNote = async (text: string): Promise<string> => {
  const client = getClient();
  if (!client) return "AI Assistant is offline (API Key missing).";

  try {
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are a helpful study assistant for a student named Sushil. Summarize the following study notes into bullet points and suggest 2 review questions:\n\n${text}`,
    });
    return response.text || "Could not generate summary.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Failed to connect to Study Assistant.";
  }
};

export const generateStudyPlan = async (subject: string, hours: string): Promise<string> => {
  const client = getClient();
  if (!client) return "AI Assistant is offline.";

  try {
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Create a simple, structured ${hours}-hour study plan for the subject: ${subject}. Break it down into sessions with breaks. Format as a clean list.`,
    });
    return response.text || "Could not generate plan.";
  } catch (error) {
    return "Failed to generate plan.";
  }
};
