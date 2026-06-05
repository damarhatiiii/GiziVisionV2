import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';

let cachedData = null;

export function loadNutritionData() {
  if (cachedData) return cachedData;

  const filePath = path.join(process.cwd(), 'data', 'nutrition.csv');
  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const parsed = Papa.parse(fileContent, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true
    });
    // Filter out rows that don't have a name
    cachedData = parsed.data.filter(item => item.name && String(item.name).trim() !== '');
    return cachedData;
  } catch (error) {
    console.error('Error reading nutrition dataset:', error);
    return [];
  }
}

export function searchFoodByName(name) {
  const data = loadNutritionData();
  if (!name) return [];
  const query = name.toLowerCase().trim();
  
  // Try to find an exact match first
  const exactMatch = data.find(item => item.name && item.name.toLowerCase() === query);
  if (exactMatch) return [exactMatch];

  // Otherwise, match items that contain the query
  return data.filter(item => item.name && item.name.toLowerCase().includes(query));
}

export function getFoodItemByNameExact(name) {
  const data = loadNutritionData();
  if (!name) return null;
  const query = name.toLowerCase().trim();
  return data.find(item => item.name && item.name.toLowerCase() === query) || null;
}

export function getStats() {
  const data = loadNutritionData();
  const totalItems = data.length;

  // Simple heuristic for categories (using first word of the food item name)
  const categories = new Set();
  data.forEach(item => {
    if (item.name) {
      const cleanName = String(item.name).trim();
      const firstWord = cleanName.split(/[\s,]+/)[0];
      if (firstWord && firstWord.length > 2) {
        // Standardize some categories
        const normalized = firstWord.charAt(0).toUpperCase() + firstWord.slice(1).toLowerCase();
        categories.add(normalized);
      }
    }
  });

  // Calculate nutrition metrics
  let totalCalories = 0;
  let totalProteins = 0;
  let totalFat = 0;
  let totalCarbohydrate = 0;

  data.forEach(item => {
    totalCalories += Number(item.calories) || 0;
    totalProteins += Number(item.proteins) || 0;
    totalFat += Number(item.fat) || 0;
    totalCarbohydrate += Number(item.carbohydrate) || 0;
  });

  const avgCalories = totalItems > 0 ? (totalCalories / totalItems) : 0;

  return {
    totalItems,
    totalCategories: categories.size,
    totalDataPoints: totalItems * 5, // name, calories, proteins, fat, carbohydrate
    avgCalories: Math.round(avgCalories * 10) / 10,
    avgProteins: Math.round((totalProteins / totalItems) * 10) / 10,
    avgFat: Math.round((totalFat / totalItems) * 10) / 10,
    avgCarbohydrate: Math.round((totalCarbohydrate / totalItems) * 10) / 10,
  };
}
