import { GoogleGenAI } from "@google/genai";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

export const getPersonalizedMotivation = async (habit: string, day: number): Promise<string> => {
  const ai = getClient();
  if (!ai) return "";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are a supportive habit coach speaking Arabic.
      The user is on Day ${day} of a 21-day challenge to build the habit: "${habit}".
      Provide a very short, punchy, and inspiring motivational sentence in Arabic (maximum 15 words).
      Do not use quotes. Speak directly to the user.`,
    });
    
    return response.text?.trim() || "";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "";
  }
};
