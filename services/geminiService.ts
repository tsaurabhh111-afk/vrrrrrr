import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getGeminiResponse = async (
  history: { role: string; text: string }[],
  currentContext: string
): Promise<string> => {
  try {
    const model = 'gemini-2.5-flash';
    const systemInstruction = `
      You are a friendly and knowledgeable physics laboratory instructor in a virtual classroom.
      The student is performing the "Loss of Charge" method experiment to measure high resistance.
      
      Experiment Context:
      - A Capacitor (C) is charged to voltage V0.
      - It discharges through a high resistance Resistor (R).
      - The voltage V(t) decays exponentially: V(t) = V0 * exp(-t / (R*C)).
      - The student needs to record Voltage vs Time, plot ln(V) vs t, and find the slope to calculate R.
      
      Your Goal:
      - Answer questions about the physics concepts.
      - Help them with calculations if they are stuck, but don't give the answer immediately.
      - If they ask about the simulation status, refer to the provided context.
      - Keep responses concise (under 100 words) unless a detailed explanation is requested.
    `;

    // Convert history to format expected by Chat (if using Chat) or just append to prompt.
    // For single turn or manual history management with generateContent:
    
    const prompt = `
      Context: ${currentContext}
      
      User: ${history[history.length - 1].text}
    `;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction,
      }
    });

    return response.text || "I'm having trouble connecting to the lab server right now.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error communicating with the AI tutor.";
  }
};
