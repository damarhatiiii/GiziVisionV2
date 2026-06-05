/**
 * History Service
 * Handles user scan history saving, retrieval, and statistics calculation.
 * Now supports multi-food items per scan.
 * Optimized: does NOT store base64 images to avoid localStorage overflow.
 */

export function getHistory() {
  if (typeof window === 'undefined') return [];
  try {
    const history = localStorage.getItem('gizivision_history');
    return history ? JSON.parse(history) : [];
  } catch (error) {
    console.error('Error reading localStorage history:', error);
    return [];
  }
}

/**
 * Add a new scan to history.
 * @param {Object} scanData
 * @param {Array} scanData.items - Array of { name, confidence, source, nutrition }
 * @param {Object} scanData.totalNutrition - { calories, proteins, fat, carbohydrate }
 * @param {string} scanData.imagePreview - Small preview URL (NOT full base64, to save space)
 */
export function addHistory(scanData) {
  if (typeof window === 'undefined') return null;
  try {
    const history = getHistory();

    // Create a small thumbnail from the image to save localStorage space
    // We only store a very small version or skip entirely
    let thumbnail = null;
    if (scanData.imagePreview) {
      thumbnail = scanData.imagePreview; // UploadZone will provide a compressed thumbnail
    }

    const newScan = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      // Multi-food: store all items
      items: (scanData.items || []).map(item => ({
        name: item.name,
        confidence: item.confidence,
        source: item.source || 'dataset',
        nutrition: item.nutrition
      })),
      totalNutrition: scanData.totalNutrition || { calories: 0, proteins: 0, fat: 0, carbohydrate: 0 },
      // Primary food name for display (first item)
      foodName: scanData.items?.[0]?.name || 'Tidak Dikenal',
      // Small thumbnail only
      image: thumbnail,
    };

    history.unshift(newScan);

    // Safety: limit history to 50 entries to prevent localStorage overflow
    if (history.length > 50) {
      history.length = 50;
    }

    localStorage.setItem('gizivision_history', JSON.stringify(history));
    return newScan;
  } catch (error) {
    console.error('Error writing to localStorage history:', error);
    // If quota exceeded, try removing oldest entries
    if (error.name === 'QuotaExceededError' || error.code === 22) {
      try {
        const history = getHistory();
        // Remove oldest half
        const trimmed = history.slice(0, Math.floor(history.length / 2));
        localStorage.setItem('gizivision_history', JSON.stringify(trimmed));
        console.warn('localStorage was full, trimmed history to', trimmed.length, 'entries');
      } catch (e2) {
        console.error('Failed to trim history:', e2);
      }
    }
    return null;
  }
}

export function deleteHistoryItem(id) {
  if (typeof window === 'undefined') return;
  try {
    const history = getHistory();
    const filtered = history.filter(item => item.id !== id);
    localStorage.setItem('gizivision_history', JSON.stringify(filtered));
  } catch (error) {
    console.error('Error deleting history item:', error);
  }
}

export function clearHistory() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem('gizivision_history');
  } catch (error) {
    console.error('Error clearing localStorage history:', error);
  }
}

/**
 * Get dashboard statistics — compatible with both old and new history format.
 */
export function getDashboardStats() {
  const history = getHistory();
  const totalScans = history.length;

  if (totalScans === 0) {
    return {
      totalScans: 0,
      avgCalories: 0,
      popularFood: 'Belum ada data',
      popularCount: 0,
      totalMacros: { protein: 0, fat: 0, carbohydrate: 0 },
      chartCalories: [],
      chartMacros: [
        { name: 'Karbohidrat', value: 0, color: '#C9A227', grams: 0 },
        { name: 'Protein',     value: 0, color: '#6F4E37', grams: 0 },
        { name: 'Lemak',       value: 0, color: '#4A4A4A', grams: 0 }
      ],
      popularFoodsList: []
    };
  }

  let totalCalories = 0;
  let totalProtein = 0;
  let totalFat = 0;
  let totalCarbohydrate = 0;
  const foodCounts = {};

  history.forEach(scan => {
    // Support both old format (scan.nutrition) and new format (scan.totalNutrition)
    const nut = scan.totalNutrition || scan.nutrition || {};
    totalCalories += Number(nut.calories) || 0;
    totalProtein += Number(nut.proteins) || 0;
    totalFat += Number(nut.fat) || 0;
    totalCarbohydrate += Number(nut.carbohydrate) || 0;

    // Count food names — for new format, count each item separately
    if (scan.items && Array.isArray(scan.items)) {
      scan.items.forEach(item => {
        if (item.name) {
          foodCounts[item.name] = (foodCounts[item.name] || 0) + 1;
        }
      });
    } else if (scan.foodName) {
      foodCounts[scan.foodName] = (foodCounts[scan.foodName] || 0) + 1;
    }
  });

  const avgCalories = Math.round(totalCalories / totalScans);

  // Find most frequent food
  let popularFood = 'Belum ada data';
  let popularCount = 0;
  Object.entries(foodCounts).forEach(([name, count]) => {
    if (count > popularCount) {
      popularCount = count;
      popularFood = name;
    }
  });

  // Group daily data (last 7 active days)
  const dailyData = {};
  [...history].reverse().forEach(scan => {
    const dateObj = new Date(scan.timestamp);
    const dateStr = dateObj.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short'
    });
    if (!dailyData[dateStr]) {
      dailyData[dateStr] = { date: dateStr, Kalori: 0, Protein: 0, Lemak: 0, Karbo: 0 };
    }
    const nut = scan.totalNutrition || scan.nutrition || {};
    dailyData[dateStr].Kalori += Math.round(Number(nut.calories) || 0);
    dailyData[dateStr].Protein += Math.round(Number(nut.proteins) || 0);
    dailyData[dateStr].Lemak += Math.round(Number(nut.fat) || 0);
    dailyData[dateStr].Karbo += Math.round(Number(nut.carbohydrate) || 0);
  });

  const chartCalories = Object.values(dailyData).slice(-7);

  // Macro pie chart
  const totalMacrosVal = totalProtein + totalFat + totalCarbohydrate;
  const chartMacros = [
    {
      name: 'Karbohidrat',
      value: totalMacrosVal > 0 ? Math.round((totalCarbohydrate / totalMacrosVal) * 100) : 0,
      color: '#C9A227',
      grams: Math.round(totalCarbohydrate)
    },
    {
      name: 'Protein',
      value: totalMacrosVal > 0 ? Math.round((totalProtein / totalMacrosVal) * 100) : 0,
      color: '#6F4E37',
      grams: Math.round(totalProtein)
    },
    {
      name: 'Lemak',
      value: totalMacrosVal > 0 ? Math.round((totalFat / totalMacrosVal) * 100) : 0,
      color: '#4A4A4A',
      grams: Math.round(totalFat)
    }
  ];

  // Top 5 popular foods
  const popularFoodsList = Object.entries(foodCounts)
    .map(([name, count]) => ({ name, Jumlah: count }))
    .sort((a, b) => b.Jumlah - a.Jumlah)
    .slice(0, 5);

  return {
    totalScans,
    avgCalories,
    popularFood,
    popularCount,
    totalMacros: {
      protein: Math.round(totalProtein * 10) / 10,
      fat: Math.round(totalFat * 10) / 10,
      carbohydrate: Math.round(totalCarbohydrate * 10) / 10
    },
    chartCalories,
    chartMacros,
    popularFoodsList
  };
}
