
import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY || '';

export const generateBio = async (name: string, title: string, org: string): Promise<string> => {
  if (apiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Write a very professional and concise 2-sentence bio for a vCard based on these details: Name: ${name || 'Professional'}, Title: ${title || 'Specialist'}, Organization: ${org || 'Company'}. Focus on expertise and impact. Do not include markdown or quotes.`,
      });
      if (response.text) {
        return response.text.trim();
      }
    } catch (error) {
      console.warn("Gemini API call failed, using intelligent fallback:", error);
    }
  }

  // Graceful high-quality template fallback
  const cleanName = name || "Professional";
  const cleanTitle = title || "Specialist";
  const cleanOrg = org || "Organization";
  return `${cleanName} is a results-driven ${cleanTitle} at ${cleanOrg}, leading strategic initiatives and driving sustainable growth. Passionate about innovation, quality execution, and delivering measurable business impact.`;
};

export const generateMarketingSMS = async (product: string, offer: string): Promise<string> => {
  if (apiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Create a punchy, high-converting SMS marketing message for: Product: ${product || 'Our Services'}, Offer: ${offer || 'Limited Special'}. Max 140 characters, include a call to action. Do not include quotes.`,
      });
      if (response.text) {
        return response.text.trim();
      }
    } catch (error) {
      console.warn("Gemini API call failed, using intelligent fallback:", error);
    }
  }

  // Graceful fallback
  const prod = product || "exclusive offer";
  const promo = offer || "20% off";
  return `Don't miss out! Get ${promo} on ${prod} today. Scan to claim your limited discount now: tap to order!`;
};

