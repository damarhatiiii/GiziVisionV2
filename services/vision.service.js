/**
 * Vision Service
 * Handles food recognition from images.
 * This is structured to easily migrate to Gemini Vision API, OpenAI Vision, or a FastAPI backend.
 */

import { searchFoodByName } from './nutrition.service';

/**
 * Recognizes food from an image.
 * @param {string} base64Image - Base64 representation of the image.
 * @param {string} fileName - Original filename of the uploaded image.
 * @returns {Promise<{name: string, confidence: number}>}
 */
export async function analyzeImage(base64Image, fileName = '') {
  // Simulate network delay for realistic premium dashboard loading state
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // Default fallback items in case no match is found in filename
  const popularItems = [
    'Bakso',
    'Nasi goreng',
    'Sate ayam',
    'Rendang',
    'Gado-gado',
    'Pempek',
    'Soto ayam',
    'Tahu goreng',
    'Tempe murni goreng',
    'Abon'
  ];

  let detectedFoodName = '';

  if (fileName) {
    const cleanFileName = fileName.toLowerCase();
    
    // Simple heuristic keyword mapping
    if (cleanFileName.includes('bakso')) {
      detectedFoodName = 'Bakso';
    } else if (cleanFileName.includes('goreng') && cleanFileName.includes('nasi')) {
      detectedFoodName = 'Nasi goreng';
    } else if (cleanFileName.includes('sate')) {
      detectedFoodName = 'Sate ayam';
    } else if (cleanFileName.includes('rendang')) {
      detectedFoodName = 'Rendang';
    } else if (cleanFileName.includes('gado')) {
      detectedFoodName = 'Gado-gado';
    } else if (cleanFileName.includes('pempek')) {
      detectedFoodName = 'Pempek';
    } else if (cleanFileName.includes('soto')) {
      detectedFoodName = 'Soto ayam';
    } else if (cleanFileName.includes('tahu')) {
      detectedFoodName = 'Tahu goreng';
    } else if (cleanFileName.includes('tempe')) {
      detectedFoodName = 'Tempe murni goreng';
    } else if (cleanFileName.includes('abon')) {
      detectedFoodName = 'Abon';
    }
  }

  // Fallback to random popular item if no keyword was detected
  if (!detectedFoodName) {
    const randomIndex = Math.floor(Math.random() * popularItems.length);
    detectedFoodName = popularItems[randomIndex];
  }

  return {
    name: detectedFoodName,
    confidence: Math.round((0.85 + Math.random() * 0.14) * 100) / 100 // Mock 85% to 99% confidence
  };
}

/*
========================================================================
GEMINI VISION API INTEGRATION BLUEPRINT
========================================================================

To integrate Gemini Vision API:
1. Install package: npm install @google/generative-ai
2. Set environment variable: GEMINI_API_KEY in .env.local
3. Implement the API route or Server Action as follows:

import { GoogleGenAI } from '@google/generative-ai';
import { searchFoodByName } from './nutrition.service';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function analyzeImageWithGemini(base64Image) {
  // Convert base64 data to GenAI Part object
  const base64Data = base64Image.split(',')[1] || base64Image;
  const imagePart = {
    inlineData: {
      data: base64Data,
      mimeType: 'image/jpeg' // or extract from base64 header
    }
  };

  const model = ai.getGenerativeModel({ model: 'gemini-2.5-flash' });
  const prompt = `
    Analyze this Indonesian food or drink.
    Identify the main food item and return ONLY its standard Indonesian name.
    It should match common items like: 'Bakso', 'Nasi goreng', 'Sate ayam', 'Rendang', etc.
    Do not add any additional explanation, markdown, or punctuation.
  `;

  try {
    const result = await model.generateContent([prompt, imagePart]);
    const name = result.response.text().trim();
    return { name, confidence: 0.95 };
  } catch (error) {
    console.error("Gemini analysis error:", error);
    throw error;
  }
}
*/
