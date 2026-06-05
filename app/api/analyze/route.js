import { NextResponse } from 'next/server';
import { analyzeImage } from '@/services/vision.service';
import { getFoodItemByNameExact, searchFoodByName } from '@/services/nutrition.service';

export async function POST(request) {
  try {
    const body = await request.json();
    const { image, fileName, customName } = body;
    const userApiKey = request.headers.get('x-gemini-key') || '';

    if (!image) {
      return NextResponse.json({ error: 'Data gambar wajib disertakan.' }, { status: 400 });
    }

    // Call vision service — now returns { isFood, items: [...] }
    const visionResult = await analyzeImage(image, fileName, userApiKey, customName);

    // Check if the uploaded image is actually food
    if (visionResult.isFood === false || !visionResult.items || visionResult.items.length === 0) {
      return NextResponse.json({
        error: 'Gambar tidak terdeteksi sebagai makanan atau minuman. Silakan unggah foto makanan yang valid.'
      }, { status: 400 });
    }

    // Process each detected food item
    const resolvedItems = [];

    for (const item of visionResult.items) {
      let nutritionData = getFoodItemByNameExact(item.name);

      if (!nutritionData) {
        const searchResults = searchFoodByName(item.name);
        if (searchResults.length > 0) {
          nutritionData = searchResults[0];
        }
      }

      // Fallback: use AI estimated nutrition if not in local dataset
      if (!nutritionData) {
        if (item.nutrition && Object.keys(item.nutrition).length > 0) {
          nutritionData = {
            id: 'ai-estimated-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
            name: item.name,
            calories: item.nutrition.calories ?? 0,
            proteins: item.nutrition.proteins ?? 0,
            fat: item.nutrition.fat ?? 0,
            carbohydrate: item.nutrition.carbohydrate ?? 0,
            image: null,
            source: 'ai-estimate'
          };
        }
      }

      if (nutritionData) {
        resolvedItems.push({
          name: nutritionData.name,
          confidence: item.confidence,
          source: nutritionData.source || 'dataset',
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
      } else {
        // Still include items not found — mark as unresolved
        resolvedItems.push({
          name: item.name,
          confidence: item.confidence,
          source: 'not-found',
          nutrition: null
        });
      }
    }

    // Filter items that have nutrition data
    const itemsWithNutrition = resolvedItems.filter(i => i.nutrition !== null);

    if (itemsWithNutrition.length === 0) {
      const names = resolvedItems.map(i => `"${i.name}"`).join(', ');
      return NextResponse.json({
        error: `Makanan terdeteksi (${names}) tetapi informasi nutrisinya tidak ditemukan dalam database.`,
        recognizedNames: resolvedItems.map(i => i.name)
      }, { status: 404 });
    }

    // Calculate total nutrition across all items
    const totalNutrition = {
      calories: 0,
      proteins: 0,
      fat: 0,
      carbohydrate: 0
    };

    itemsWithNutrition.forEach(item => {
      totalNutrition.calories += Number(item.nutrition.calories) || 0;
      totalNutrition.proteins += Number(item.nutrition.proteins) || 0;
      totalNutrition.fat += Number(item.nutrition.fat) || 0;
      totalNutrition.carbohydrate += Number(item.nutrition.carbohydrate) || 0;
    });

    // Round totals
    totalNutrition.calories = Math.round(totalNutrition.calories * 10) / 10;
    totalNutrition.proteins = Math.round(totalNutrition.proteins * 10) / 10;
    totalNutrition.fat = Math.round(totalNutrition.fat * 10) / 10;
    totalNutrition.carbohydrate = Math.round(totalNutrition.carbohydrate * 10) / 10;

    return NextResponse.json({
      items: resolvedItems,
      totalNutrition
    });
  } catch (error) {
    console.error('Analyze API error:', error);
    return NextResponse.json({ error: 'Failed to analyze food image' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    hasServerKey: !!process.env.GEMINI_API_KEY
  });
}
