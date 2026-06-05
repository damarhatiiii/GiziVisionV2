import { NextResponse } from 'next/server';
import { searchFoodByName } from '@/services/nutrition.service';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json([]);
  }

  try {
    const results = searchFoodByName(query);
    return NextResponse.json(results);
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json({ error: 'Failed to search food items' }, { status: 500 });
  }
}
