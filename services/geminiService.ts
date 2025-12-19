
import { GoogleGenAI } from "@google/genai";
import { UserProfile } from "../types";

export const summarizeNote = async (text: string): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are a helpful study assistant for a student named Sushil. Summarize the following study notes into bullet points and suggest 2 review questions:\n\n${text}`,
    });
    return response.text || "Could not generate summary.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Failed to connect to Study Assistant.";
  }
};

export const generateStudyPlan = async (subject: string, hours: string): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Create a simple, structured ${hours}-hour study plan for the subject: ${subject}. Break it down into sessions with breaks. Format as a clean list.`,
    });
    return response.text || "Could not generate plan.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Failed to generate plan.";
  }
};

export const generateUserBadge = async (profile: UserProfile, extraContext: string = ""): Promise<string> => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const prompt = `Based on this student profile and activity, generate a single creative, 2-3 word achievement badge name (e.g., "Physics Whiz", "Code Warrior", "Night Owl") with a matching emoji. 
        Profile: Profession: ${profile.profession}, Education: ${profile.education}, Skills: ${profile.skills.join(', ')}, Interests: ${profile.interests.join(', ')}.
        Activity Context: ${extraContext}
        Return ONLY the emoji and badge name.`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
        });
        return response.text?.trim() || "🎓 Dedicated Student";
    } catch (error) {
        console.error("Gemini Error:", error);
        return "📚 Scholar";
    }
};

export const chatWithAI = async (message: string): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: message,
      config: {
        systemInstruction: "You are a friendly, encouraging, and knowledgeable AI study companion inside the 'StudentPocket' app for Sushil Pokharel. Your goal is to help with homework, explain complex topics simply, provide career advice, and help organize study schedules. Keep answers concise, student-friendly, and motivating."
      }
    });
    return response.text || "I'm having trouble thinking right now. Try again?";
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    return "Sorry, I couldn't connect to the AI server. Please check your connection.";
  }
};
