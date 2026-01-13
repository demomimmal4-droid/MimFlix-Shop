import { Injectable } from '@angular/core';
import { GoogleGenAI, Type } from "@google/genai";

export interface Product {
  name: string;
  description: string;
  price: number;
}

@Injectable({
  providedIn: 'root'
})
export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    // IMPORTANT: This relies on `process.env.API_KEY` being available in the execution environment.
    if (!process.env.API_KEY) {
      throw new Error("API_KEY environment variable not set.");
    }
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  async generateProductIdeas(category: string): Promise<Product[]> {
    const prompt = `Generate 8 creative and compelling e-commerce products for the category: "${category}". For each product, provide a name, a short, appealing description (around 20-30 words), and a realistic price in USD.`;

    const responseSchema = {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: {
            type: Type.STRING,
            description: "The name of the product.",
          },
          description: {
            type: Type.STRING,
            description: "A short, appealing description for the product (20-30 words).",
          },
          price: {
            type: Type.NUMBER,
            description: "The price of the product in USD.",
          },
        },
        required: ["name", "description", "price"],
      },
    };
    
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: responseSchema,
          temperature: 0.8,
          topP: 0.95,
        }
      });
      
      const jsonString = response.text.trim();
      const parsedData = JSON.parse(jsonString);

      // The response is already an array of products due to the schema.
      return parsedData as Product[];
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      throw new Error('Could not generate product ideas from the AI model.');
    }
  }
}