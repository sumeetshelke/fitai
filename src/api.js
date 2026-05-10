// ============================================================
// FitAI - local nutrition dataset helpers
// ============================================================

const NUTRITION_DATASET = [
  { keys: ['rice', 'cooked rice', 'white rice'], serving: 100, unit: 'g', calories: 130, protein: 3, carbs: 28, fat: 0, micros: { iron: 1, magnesium: 3, zinc: 4 } },
  { keys: ['brown rice'], serving: 100, unit: 'g', calories: 123, protein: 3, carbs: 26, fat: 1, micros: { iron: 3, magnesium: 11, zinc: 8 } },
  { keys: ['roti', 'chapati'], serving: 1, unit: 'piece', calories: 110, protein: 4, carbs: 18, fat: 3, micros: { iron: 6, magnesium: 8, zinc: 5 } },
  { keys: ['paratha'], serving: 1, unit: 'piece', calories: 260, protein: 6, carbs: 36, fat: 10, micros: { iron: 8, magnesium: 8, zinc: 5 } },
  { keys: ['egg', 'eggs', 'boiled egg'], serving: 1, unit: 'piece', calories: 72, protein: 6, carbs: 0, fat: 5, micros: { vitaminA: 6, vitaminB12: 18, vitaminD: 6, iron: 3, zinc: 5 } },
  { keys: ['chicken', 'chicken breast'], serving: 100, unit: 'g', calories: 165, protein: 31, carbs: 0, fat: 4, micros: { vitaminB12: 13, iron: 5, magnesium: 7, zinc: 9 } },
  { keys: ['fish'], serving: 100, unit: 'g', calories: 140, protein: 22, carbs: 0, fat: 5, micros: { vitaminB12: 90, vitaminD: 35, iron: 5, magnesium: 8, zinc: 5 } },
  { keys: ['paneer'], serving: 100, unit: 'g', calories: 265, protein: 18, carbs: 6, fat: 20, micros: { vitaminA: 8, vitaminB12: 20, calcium: 35, zinc: 8 } },
  { keys: ['tofu'], serving: 100, unit: 'g', calories: 76, protein: 8, carbs: 2, fat: 5, micros: { calcium: 20, iron: 15, magnesium: 8, zinc: 6 } },
  { keys: ['dal', 'lentils'], serving: 100, unit: 'g', calories: 116, protein: 9, carbs: 20, fat: 0, micros: { iron: 18, magnesium: 9, zinc: 8 } },
  { keys: ['chana', 'chickpeas'], serving: 100, unit: 'g', calories: 164, protein: 9, carbs: 27, fat: 3, micros: { iron: 16, magnesium: 12, zinc: 12 } },
  { keys: ['rajma', 'kidney beans'], serving: 100, unit: 'g', calories: 127, protein: 9, carbs: 23, fat: 1, micros: { iron: 14, magnesium: 11, zinc: 7 } },
  { keys: ['oats'], serving: 100, unit: 'g', calories: 389, protein: 17, carbs: 66, fat: 7, micros: { iron: 26, magnesium: 42, zinc: 26 } },
  { keys: ['milk'], serving: 100, unit: 'ml', calories: 61, protein: 3, carbs: 5, fat: 3, micros: { vitaminA: 5, vitaminB12: 20, vitaminD: 6, calcium: 12 } },
  { keys: ['curd', 'yogurt'], serving: 100, unit: 'g', calories: 61, protein: 4, carbs: 5, fat: 3, micros: { vitaminB12: 15, calcium: 12, zinc: 5 } },
  { keys: ['banana'], serving: 1, unit: 'piece', calories: 105, protein: 1, carbs: 27, fat: 0, micros: { vitaminC: 11, magnesium: 8 } },
  { keys: ['apple'], serving: 1, unit: 'piece', calories: 95, protein: 1, carbs: 25, fat: 0, micros: { vitaminC: 8 } },
  { keys: ['bread'], serving: 1, unit: 'slice', calories: 80, protein: 3, carbs: 15, fat: 1, micros: { iron: 6, calcium: 4 } },
  { keys: ['potato'], serving: 100, unit: 'g', calories: 87, protein: 2, carbs: 20, fat: 0, micros: { vitaminC: 22, magnesium: 6, iron: 4 } },
  { keys: ['sweet potato'], serving: 100, unit: 'g', calories: 86, protein: 2, carbs: 20, fat: 0, micros: { vitaminA: 80, vitaminC: 4, magnesium: 6 } },
  { keys: ['peanut butter'], serving: 1, unit: 'tbsp', calories: 95, protein: 4, carbs: 4, fat: 8, micros: { magnesium: 7, zinc: 4 } },
  { keys: ['almonds'], serving: 10, unit: 'piece', calories: 70, protein: 3, carbs: 3, fat: 6, micros: { calcium: 3, iron: 4, magnesium: 12, zinc: 5 } },
  { keys: ['peanuts'], serving: 100, unit: 'g', calories: 567, protein: 26, carbs: 16, fat: 49, micros: { iron: 25, magnesium: 40, zinc: 30 } },
  { keys: ['whey protein', 'protein powder'], serving: 1, unit: 'scoop', calories: 120, protein: 24, carbs: 3, fat: 2, micros: { calcium: 12, vitaminB12: 20 } },
];

export const MICRO_TARGETS = [
  { key: 'vitaminA', name: 'Vitamin A', advice: 'Add sweet potato, eggs, paneer, milk, or leafy vegetables.' },
  { key: 'vitaminB12', name: 'Vitamin B12', advice: 'Add milk, curd, paneer, eggs, fish, or fortified foods.' },
  { key: 'vitaminC', name: 'Vitamin C', advice: 'Add citrus fruits, potatoes, apple, amla, or vegetables.' },
  { key: 'vitaminD', name: 'Vitamin D', advice: 'Add eggs, fish, fortified milk, or get safe sunlight.' },
  { key: 'iron', name: 'Iron', advice: 'Add dal, chana, rajma, oats, roti, peanuts, or greens.' },
  { key: 'calcium', name: 'Calcium', advice: 'Add milk, curd, paneer, tofu, almonds, or fortified foods.' },
  { key: 'magnesium', name: 'Magnesium', advice: 'Add oats, peanuts, almonds, banana, dal, or chana.' },
  { key: 'zinc', name: 'Zinc', advice: 'Add chana, oats, peanuts, eggs, chicken, paneer, or curd.' },
];

function findFood(text) {
  const lower = text.toLowerCase();
  return NUTRITION_DATASET.find(food => food.keys.some(key => lower.includes(key)));
}

export function getIngredientSuggestions(query, limit = 5) {
  const lower = query.trim().toLowerCase();
  if (lower.length < 2) return [];

  return NUTRITION_DATASET
    .flatMap(food => food.keys.map(key => ({
      name: key,
      serving: food.serving,
      unit: food.unit,
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fat: food.fat,
    })))
    .filter(item => item.name.includes(lower))
    .slice(0, limit);
}

function parseQuantity(text, food) {
  const lower = text.toLowerCase();
  const amount = parseFloat(lower.match(/(\d+(?:\.\d+)?)/)?.[1] || '1');

  if (lower.includes('kg')) return (amount * 1000) / food.serving;
  if (lower.includes('g')) return amount / food.serving;
  if (lower.includes('ml')) return amount / food.serving;
  if (lower.includes('l') && food.unit === 'ml') return (amount * 1000) / food.serving;

  return amount / food.serving;
}

function round(value) {
  return Math.round(value * 10) / 10;
}

export async function detectIngredientCalories(ingredients, dishName = '') {
  const items = ingredients.map(ingredient => {
    const food = findFood(ingredient);

    if (!food) {
      return {
        name: ingredient,
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        matched: false,
      };
    }

    const quantity = parseQuantity(ingredient, food);

    return {
      name: ingredient,
      calories: Math.round(food.calories * quantity),
      protein: round(food.protein * quantity),
      carbs: round(food.carbs * quantity),
      fat: round(food.fat * quantity),
      micros: Object.fromEntries(Object.entries(food.micros || {}).map(([key, value]) => [key, round(value * quantity)])),
      matched: true,
    };
  });

  return {
    dishName,
    items,
    total: items.reduce((total, item) => ({
      calories: total.calories + item.calories,
      protein: round(total.protein + item.protein),
      carbs: round(total.carbs + item.carbs),
      fat: round(total.fat + item.fat),
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 }),
  };
}

export function calculateVitaminIntake(foodLog) {
  const totals = MICRO_TARGETS.reduce((acc, nutrient) => ({ ...acc, [nutrient.key]: 0 }), {});
  const today = new Date().toISOString().slice(0, 10);

  Object.values(foodLog).flat().forEach(item => {
    if (item.loggedAt && item.loggedAt !== today) return;

    const sourceText = `${item.name || ''} ${item.qty || ''}`;
    const food = findFood(sourceText);
    if (!food) return;

    const quantity = parseQuantity(sourceText, food);
    Object.entries(food.micros || {}).forEach(([key, value]) => {
      totals[key] = round((totals[key] || 0) + value * quantity);
    });
  });

  return MICRO_TARGETS.map(nutrient => ({
    ...nutrient,
    pct: Math.min(Math.round(totals[nutrient.key] || 0), 100),
  }));
}
