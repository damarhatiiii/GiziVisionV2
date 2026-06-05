import { NextResponse } from 'next/server';
import { analyzeImage } from '@/services/vision.service';
import { getFoodItemByNameExact, searchFoodByName } from '@/services/nutrition.service';

export async function POST(request) {
  try {
    const body = await request.json();
    const { image, fileName } = body;

    if (!image) {
      return NextResponse.json({ error: 'Image data is required' }, { status: 400 });
    }

    // Call vision service (mocked for now, ready for Gemini API)
    const visionResult = await analyzeImage(image, fileName);

    // Look up matching nutritional data from the dataset
    let nutritionData = getFoodItemByNameExact(visionResult.name);

    if (!nutritionData) {
      const searchResults = searchFoodByName(visionResult.name);
      if (searchResults.length > 0) {
        nutritionData = searchResults[0];
      }
    }

    if (!nutritionData) {
      return NextResponse.json({
        error: `Food recognized as "${visionResult.name}" but not found in the dataset.`,
        recognizedName: visionResult.name
      }, { status: 404 });
    }

    return NextResponse.json({
      name: nutritionData.name,
      confidence: visionResult.confidence,
      nutrition: {
        id: nutritionData.id,
        name: nutritionData.name,
        calories: nutritionData.calories,
        proteins: nutritionData.proteins,
        fat: nutritionData.fat,
        carbohydrate: nutritionData.carbohydrate,
        image: nutritionData.image
      }
    });
  } catch (error) {
    console.error('Analyze API error:', error);
    return NextResponse.json({ error: 'Failed to analyze food image' }, { status: 500 });
  }
}
