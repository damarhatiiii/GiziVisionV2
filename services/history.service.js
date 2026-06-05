/**
 * History Service
 * Handles user scan history saving, retrieval, and statistics calculation.
 * Operates primarily on client side (localStorage).
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

export function addHistory(scanItem) {
  if (typeof window === 'undefined') return null;
  try {
    const history = getHistory();
    const newScan = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      foodName: scanItem.name,
      confidence: scanItem.confidence,
      nutrition: scanItem.nutrition,
      // Store the image path (from dataset) or user uploaded base64
      image: scanItem.image || null,
    };
    history.unshift(newScan); // Store newest first
    localStorage.setItem('gizivision_history', JSON.stringify(history));
    return newScan;
  } catch (error) {
    console.error('Error writing to localStorage history:', error);
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
        { name: 'Karbohidrat', value: 0, color: '#C9A227' },
        { name: 'Protein',     value: 0, color: '#6F4E37' },
        { name: 'Lemak',       value: 0, color: '#4A4A4A' }
      ],
      popularFoodsList: []
    };
  }

  let totalCalories = 0;
  let totalProtein = 0;
  let totalFat = 0;
  let totalCarbohydrate = 0;
  const foodCounts = {};

  history.forEach(item => {
    const nut = item.nutrition || {};
    totalCalories += Number(nut.calories) || 0;
    totalProtein += Number(nut.proteins) || 0;
    totalFat += Number(nut.fat) || 0;
    totalCarbohydrate += Number(nut.carbohydrate) || 0;

    const name = item.foodName;
    if (name) {
      foodCounts[name] = (foodCounts[name] || 0) + 1;
    }
  });

  // Calculate average calories per scan
  const avgCalories = Math.round(totalCalories / totalScans);

  // Find most frequent food scanned
  let popularFood = 'Belum ada data';
  let popularCount = 0;
  Object.entries(foodCounts).forEach(([name, count]) => {
    if (count > popularCount) {
      popularCount = count;
      popularFood = name;
    }
  });

  // Group calorie intake daily (last 7 active days) for Area/Line Chart
  const dailyData = {};
  // Reverse to process chronologically
  [...history].reverse().forEach(item => {
    const dateObj = new Date(item.timestamp);
    const dateStr = dateObj.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short'
    });
    if (!dailyData[dateStr]) {
      dailyData[dateStr] = { date: dateStr, Kalori: 0, Protein: 0, Lemak: 0, Karbo: 0 };
    }
    const nut = item.nutrition || {};
    dailyData[dateStr].Kalori += Math.round(Number(nut.calories) || 0);
    dailyData[dateStr].Protein += Math.round(Number(nut.proteins) || 0);
    dailyData[dateStr].Lemak += Math.round(Number(nut.fat) || 0);
    dailyData[dateStr].Karbo += Math.round(Number(nut.carbohydrate) || 0);
  });

  const chartCalories = Object.values(dailyData).slice(-7); // take last 7 unique days

  // Prepare macro pie chart data
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

  // Top 5 popular foods for Bar Chart
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
