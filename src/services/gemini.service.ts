import { Injectable, inject } from '@angular/core';
import { GoogleGenAI, Type } from "@google/genai";
import { FirebaseService } from './firebase.service';
import { doc, getDoc, setDoc, Firestore } from 'firebase/firestore';

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
  private firebaseService = inject(FirebaseService);
  private firestore: Promise<Firestore>;

  constructor() {
    if (!process.env.API_KEY) {
      throw new Error("API_KEY environment variable not set.");
    }
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    this.firestore = this.firebaseService.firestore;
  }

  async getOrGenerateProducts(category: string): Promise<Product[]> {
    const db = await this.firestore;
    const categoryId = category.trim().toLowerCase().replace(/\s+/g, '-');
    const categoryDocRef = doc(db, 'product_categories', categoryId);

    try {
      const docSnap = await getDoc(categoryDocRef);
      if (docSnap.exists()) {
        console.log(`[Cache Hit] Fetched '${category}' from Firestore.`);
        return docSnap.data().products as Product[];
      }
    } catch (error) {
      console.error("Firestore read failed, will try generating directly:", error);
    }
    
    console.log(`[Cache Miss] Generating products for '${category}' with Gemini.`);
    const products = await this.generateAndParseProducts(category);

    try {
      await setDoc(categoryDocRef, { products });
      console.log(`[Cache Set] Stored products for '${category}' in Firestore.`);
    } catch (error) {
      console.error("Firestore write failed, returning products without caching:", error);
    }
    
    return products;
  }
  
  private async generateAndParseProducts(category: string): Promise<Product[]> {
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

      return parsedData as Product[];
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      throw new Error('Could not generate product ideas from the AI model.');
    }
  }
}
