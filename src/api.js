// ============================================================
// FitAI - local nutrition dataset helpers
// ============================================================

import AsyncStorage from '@react-native-async-storage/async-storage';
import { listNutritionItems } from './services/backend';

const NUTRITION_CACHE_KEY = 'fitai.nutritionDataset';

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
  { keys: ['poha', 'kanda poha'], serving: 100, unit: 'g', calories: 180, protein: 4, carbs: 32, fat: 4, micros: { iron: 3, magnesium: 6, zinc: 1 } },
  { keys: ['flattened rice', 'aval', 'beaten rice'], serving: 100, unit: 'g', calories: 346, protein: 7, carbs: 77, fat: 1, micros: { iron: 20, magnesium: 8, zinc: 2 } },
  { keys: ['upma', 'rava upma'], serving: 100, unit: 'g', calories: 170, protein: 5, carbs: 28, fat: 5, micros: { iron: 2, magnesium: 7, zinc: 1 } },
  { keys: ['suji', 'rava', 'semolina'], serving: 100, unit: 'g', calories: 360, protein: 12, carbs: 72, fat: 1, micros: { iron: 1.2, magnesium: 18, zinc: 1 } },
  { keys: ['idli'], serving: 1, unit: 'piece', calories: 58, protein: 2, carbs: 12, fat: 0, micros: { iron: 0.5, magnesium: 3 } },
  { keys: ['dosa', 'plain dosa'], serving: 1, unit: 'piece', calories: 133, protein: 3, carbs: 18, fat: 5, micros: { iron: 0.8, magnesium: 5 } },
  { keys: ['masala dosa'], serving: 1, unit: 'piece', calories: 250, protein: 6, carbs: 35, fat: 9, micros: { iron: 1.5, magnesium: 8, zinc: 1 } },
  { keys: ['medu vada', 'vada'], serving: 1, unit: 'piece', calories: 97, protein: 3, carbs: 8, fat: 6, micros: { iron: 1, magnesium: 4 } },
  { keys: ['sambar'], serving: 100, unit: 'g', calories: 70, protein: 3, carbs: 10, fat: 2, micros: { iron: 1, magnesium: 5, zinc: 0.5 } },
  { keys: ['coconut chutney'], serving: 1, unit: 'tbsp', calories: 45, protein: 1, carbs: 2, fat: 4, micros: { iron: 0.3, magnesium: 3 } },
  { keys: ['pongal', 'ven pongal'], serving: 100, unit: 'g', calories: 160, protein: 5, carbs: 24, fat: 5, micros: { iron: 1.5, magnesium: 6 } },
  { keys: ['khichdi', 'moong dal khichdi'], serving: 100, unit: 'g', calories: 140, protein: 5, carbs: 24, fat: 3, micros: { iron: 1.2, magnesium: 7 } },
  { keys: ['sabudana khichdi'], serving: 100, unit: 'g', calories: 190, protein: 3, carbs: 35, fat: 5, micros: { iron: 0.5, magnesium: 3 } },
  { keys: ['sabudana', 'sago'], serving: 100, unit: 'g', calories: 350, protein: 0, carbs: 87, fat: 0, micros: { calcium: 20 } },
  { keys: ['thepla'], serving: 1, unit: 'piece', calories: 130, protein: 4, carbs: 18, fat: 4, micros: { iron: 1.5, magnesium: 6 } },
  { keys: ['dhokla'], serving: 100, unit: 'g', calories: 160, protein: 8, carbs: 20, fat: 5, micros: { iron: 1.2, magnesium: 8 } },
  { keys: ['methi thepla'], serving: 1, unit: 'piece', calories: 140, protein: 4, carbs: 20, fat: 5, micros: { iron: 2, magnesium: 7 } },
  { keys: ['par boiled rice batter', 'idli batter', 'dosa batter'], serving: 100, unit: 'g', calories: 140, protein: 4, carbs: 28, fat: 1, micros: { iron: 1 } },
  { keys: ['besan chilla', 'chilla'], serving: 1, unit: 'piece', calories: 120, protein: 6, carbs: 12, fat: 5, micros: { iron: 2, magnesium: 15, zinc: 1 } },
  { keys: ['besan', 'gram flour'], serving: 100, unit: 'g', calories: 387, protein: 22, carbs: 58, fat: 6, micros: { iron: 4.8, magnesium: 166, zinc: 2.8 } },
  { keys: ['aloo paratha'], serving: 1, unit: 'piece', calories: 210, protein: 5, carbs: 30, fat: 8, micros: { iron: 1.5, magnesium: 7 } },
  { keys: ['stuffed paratha'], serving: 1, unit: 'piece', calories: 240, protein: 6, carbs: 32, fat: 10, micros: { iron: 2 } },
  { keys: ['puri'], serving: 1, unit: 'piece', calories: 85, protein: 2, carbs: 10, fat: 4, micros: { iron: 0.5 } },
  { keys: ['bhaji', 'potato bhaji'], serving: 100, unit: 'g', calories: 120, protein: 2, carbs: 18, fat: 4, micros: { vitaminC: 10, iron: 1 } },
  { keys: ['pav'], serving: 1, unit: 'piece', calories: 140, protein: 4, carbs: 26, fat: 2, micros: { iron: 1.2 } },
  { keys: ['misal pav'], serving: 1, unit: 'plate', calories: 320, protein: 12, carbs: 42, fat: 10, micros: { iron: 4, magnesium: 12 } },
  { keys: ['sprouts', 'mixed sprouts'], serving: 100, unit: 'g', calories: 110, protein: 9, carbs: 18, fat: 1, micros: { iron: 2.5, magnesium: 10, zinc: 1 } },
  { keys: ['moong sprouts'], serving: 100, unit: 'g', calories: 105, protein: 8, carbs: 19, fat: 1, micros: { iron: 2, magnesium: 9 } },
  { keys: ['moong dal'], serving: 100, unit: 'g', calories: 347, protein: 24, carbs: 63, fat: 1, micros: { iron: 6.7, magnesium: 189, zinc: 2.7 } },
  { keys: ['corn flakes'], serving: 30, unit: 'g', calories: 110, protein: 2, carbs: 25, fat: 0, micros: { iron: 4.5 } },
  { keys: ['muesli'], serving: 100, unit: 'g', calories: 380, protein: 10, carbs: 65, fat: 8, micros: { iron: 4, magnesium: 18 } },
  { keys: ['vermicelli upma', 'seviyan upma'], serving: 100, unit: 'g', calories: 175, protein: 5, carbs: 30, fat: 4, micros: { iron: 1, magnesium: 5 } },
  { keys: ['vermicelli', 'seviyan'], serving: 100, unit: 'g', calories: 342, protein: 11, carbs: 69, fat: 1, micros: { iron: 1.5 } },
  { keys: ['uttapam'], serving: 1, unit: 'piece', calories: 180, protein: 5, carbs: 28, fat: 5, micros: { iron: 1, magnesium: 5 } },
  { keys: ['ragi dosa'], serving: 1, unit: 'piece', calories: 140, protein: 4, carbs: 24, fat: 3, micros: { calcium: 80, iron: 2 } },
  { keys: ['ragi'], serving: 100, unit: 'g', calories: 336, protein: 7, carbs: 72, fat: 1, micros: { calcium: 344, iron: 3.9, magnesium: 137 } },
  { keys: ['makhana'], serving: 100, unit: 'g', calories: 347, protein: 10, carbs: 77, fat: 0, micros: { calcium: 60, magnesium: 153 } },
  { keys: ['khakra'], serving: 1, unit: 'piece', calories: 50, protein: 2, carbs: 8, fat: 1, micros: { iron: 0.8 } },
  { keys: ['poori bhaji'], serving: 1, unit: 'plate', calories: 380, protein: 8, carbs: 45, fat: 18, micros: { iron: 3 } },
  { keys: ['sheera', 'sooji halwa'], serving: 100, unit: 'g', calories: 250, protein: 4, carbs: 38, fat: 9, micros: { iron: 1 } },
  { keys: ['masala oats'], serving: 100, unit: 'g', calories: 150, protein: 5, carbs: 24, fat: 4, micros: { iron: 2, magnesium: 30 } },
  { keys: ['onion'], serving: 100, unit: 'g', calories: 40, protein: 1, carbs: 9, fat: 0, micros: { vitaminC: 7, iron: 0.2, magnesium: 10 } },
  { keys: ['tomato'], serving: 100, unit: 'g', calories: 18, protein: 1, carbs: 4, fat: 0, micros: { vitaminC: 14, vitaminA: 17, potassium: 237 } },
  { keys: ['carrot'], serving: 100, unit: 'g', calories: 41, protein: 1, carbs: 10, fat: 0, micros: { vitaminA: 835, vitaminC: 6, iron: 0.3 } },
  { keys: ['cucumber'], serving: 100, unit: 'g', calories: 15, protein: 1, carbs: 4, fat: 0, micros: { vitaminC: 3, magnesium: 13 } },
  { keys: ['capsicum', 'bell pepper'], serving: 100, unit: 'g', calories: 31, protein: 1, carbs: 6, fat: 0, micros: { vitaminC: 128, vitaminA: 15 } },
  { keys: ['green chilli', 'chili'], serving: 100, unit: 'g', calories: 40, protein: 2, carbs: 9, fat: 0, micros: { vitaminC: 242, iron: 1.2 } },
  { keys: ['spinach', 'palak'], serving: 100, unit: 'g', calories: 23, protein: 3, carbs: 4, fat: 0, micros: { iron: 2.7, magnesium: 79, vitaminA: 469 } },
  { keys: ['cabbage'], serving: 100, unit: 'g', calories: 25, protein: 1, carbs: 6, fat: 0, micros: { vitaminC: 36, vitaminK: 76 } },
  { keys: ['cauliflower'], serving: 100, unit: 'g', calories: 25, protein: 2, carbs: 5, fat: 0, micros: { vitaminC: 48, folate: 57 } },
  { keys: ['broccoli'], serving: 100, unit: 'g', calories: 34, protein: 3, carbs: 7, fat: 0, micros: { vitaminC: 89, vitaminK: 101, iron: 0.7 } },
  { keys: ['peas', 'green peas'], serving: 100, unit: 'g', calories: 81, protein: 5, carbs: 14, fat: 0, micros: { vitaminC: 40, iron: 1.5, magnesium: 33 } },
  { keys: ['beetroot'], serving: 100, unit: 'g', calories: 43, protein: 2, carbs: 10, fat: 0, micros: { folate: 109, iron: 0.8, magnesium: 23 } },
  { keys: ['brinjal', 'eggplant'], serving: 100, unit: 'g', calories: 25, protein: 1, carbs: 6, fat: 0, micros: { fiber: 3, potassium: 229 } },
  { keys: ['okra', 'lady finger', 'bhindi'], serving: 100, unit: 'g', calories: 33, protein: 2, carbs: 7, fat: 0, micros: { vitaminC: 23, magnesium: 57 } },
  { keys: ['bottle gourd', 'lauki'], serving: 100, unit: 'g', calories: 14, protein: 1, carbs: 3, fat: 0, micros: { vitaminC: 10, calcium: 26 } },
  { keys: ['bitter gourd', 'karela'], serving: 100, unit: 'g', calories: 17, protein: 1, carbs: 4, fat: 0, micros: { vitaminC: 84, iron: 0.4 } },
  { keys: ['ridge gourd', 'turai'], serving: 100, unit: 'g', calories: 20, protein: 1, carbs: 4, fat: 0, micros: { vitaminC: 12, iron: 0.5 } },
  { keys: ['pumpkin'], serving: 100, unit: 'g', calories: 26, protein: 1, carbs: 7, fat: 0, micros: { vitaminA: 426, vitaminC: 9 } },
  { keys: ['mushroom'], serving: 100, unit: 'g', calories: 22, protein: 3, carbs: 3, fat: 0, micros: { vitaminD: 0.2, selenium: 9 } },
  { keys: ['sweet corn'], serving: 100, unit: 'g', calories: 86, protein: 3, carbs: 19, fat: 1, micros: { magnesium: 37, vitaminB6: 0.1 } },
  { keys: ['zucchini'], serving: 100, unit: 'g', calories: 17, protein: 1, carbs: 3, fat: 0, micros: { vitaminC: 17, potassium: 261 } },
  { keys: ['lettuce'], serving: 100, unit: 'g', calories: 15, protein: 1, carbs: 3, fat: 0, micros: { vitaminA: 370, vitaminK: 126 } },
  { keys: ['radish', 'mooli'], serving: 100, unit: 'g', calories: 16, protein: 1, carbs: 3, fat: 0, micros: { vitaminC: 15, calcium: 25 } },
  { keys: ['drumstick', 'moringa pods'], serving: 100, unit: 'g', calories: 37, protein: 2, carbs: 8, fat: 0, micros: { vitaminC: 120, calcium: 30 } },
  { keys: ['moringa leaves'], serving: 100, unit: 'g', calories: 64, protein: 9, carbs: 8, fat: 1, micros: { iron: 4, calcium: 185, vitaminA: 378 } },
  { keys: ['fenugreek leaves', 'methi'], serving: 100, unit: 'g', calories: 49, protein: 4, carbs: 6, fat: 1, micros: { iron: 3.9, magnesium: 10 } },
  { keys: ['mustard greens', 'sarson'], serving: 100, unit: 'g', calories: 27, protein: 3, carbs: 4, fat: 0, micros: { vitaminA: 151, vitaminC: 70 } },
  { keys: ['spring onion'], serving: 100, unit: 'g', calories: 32, protein: 2, carbs: 7, fat: 0, micros: { vitaminC: 18, iron: 1.5 } },
  { keys: ['ginger'], serving: 100, unit: 'g', calories: 80, protein: 2, carbs: 18, fat: 1, micros: { magnesium: 43, potassium: 415 } },
  { keys: ['garlic'], serving: 100, unit: 'g', calories: 149, protein: 6, carbs: 33, fat: 0, micros: { vitaminC: 31, manganese: 1.7 } },
  { keys: ['raw mango'], serving: 100, unit: 'g', calories: 60, protein: 1, carbs: 15, fat: 0, micros: { vitaminC: 36, vitaminA: 54 } },
  { keys: ['raw papaya'], serving: 100, unit: 'g', calories: 43, protein: 1, carbs: 11, fat: 0, micros: { vitaminC: 60, folate: 37 } },
  { keys: ['cluster beans', 'guar'], serving: 100, unit: 'g', calories: 16, protein: 3, carbs: 10, fat: 0, micros: { iron: 1.1, calcium: 130 } },
  { keys: ['ivy gourd', 'tindora'], serving: 100, unit: 'g', calories: 18, protein: 1, carbs: 4, fat: 0, micros: { vitaminC: 15, calcium: 40 } },
  { keys: ['snake gourd'], serving: 100, unit: 'g', calories: 18, protein: 1, carbs: 4, fat: 0, micros: { vitaminC: 10, calcium: 26 } },
  { keys: ['turnip'], serving: 100, unit: 'g', calories: 28, protein: 1, carbs: 6, fat: 0, micros: { vitaminC: 21, calcium: 30 } },
  { keys: ['yam', 'suran'], serving: 100, unit: 'g', calories: 118, protein: 2, carbs: 28, fat: 0, micros: { potassium: 816, vitaminC: 17 } },
  { keys: ['ash gourd', 'winter melon'], serving: 100, unit: 'g', calories: 13, protein: 0, carbs: 3, fat: 0, micros: { vitaminC: 13 } },
  { keys: ['ghee', 'clarified butter'], serving: 1, unit: 'tbsp', calories: 112, protein: 0, carbs: 0, fat: 13, micros: { vitaminA: 108, vitaminE: 0.4, vitaminK: 1.1 } },
  { keys: ['butter'], serving: 1, unit: 'tbsp', calories: 102, protein: 0, carbs: 0, fat: 12, micros: { vitaminA: 97, vitaminD: 0.1 } },
  { keys: ['olive oil', 'extra virgin olive oil'], serving: 1, unit: 'tbsp', calories: 119, protein: 0, carbs: 0, fat: 14, micros: { vitaminE: 1.9, vitaminK: 8.1 } },
  { keys: ['coconut oil'], serving: 1, unit: 'tbsp', calories: 121, protein: 0, carbs: 0, fat: 14, micros: { vitaminE: 0.1 } },
  { keys: ['mustard oil'], serving: 1, unit: 'tbsp', calories: 124, protein: 0, carbs: 0, fat: 14, micros: { vitaminE: 2.1, omega3: 820 } },
  { keys: ['groundnut oil', 'peanut oil'], serving: 1, unit: 'tbsp', calories: 119, protein: 0, carbs: 0, fat: 14, micros: { vitaminE: 2.2 } },
  { keys: ['sunflower oil'], serving: 1, unit: 'tbsp', calories: 120, protein: 0, carbs: 0, fat: 14, micros: { vitaminE: 5.6 } },
  { keys: ['soybean oil'], serving: 1, unit: 'tbsp', calories: 120, protein: 0, carbs: 0, fat: 14, micros: { vitaminK: 25, omega3: 920 } },
  { keys: ['sesame oil', 'til oil'], serving: 1, unit: 'tbsp', calories: 120, protein: 0, carbs: 0, fat: 14, micros: { vitaminE: 0.2, vitaminK: 2.1 } },
  { keys: ['rice bran oil'], serving: 1, unit: 'tbsp', calories: 120, protein: 0, carbs: 0, fat: 14, micros: { vitaminE: 4.5 } },
  { keys: ['canola oil'], serving: 1, unit: 'tbsp', calories: 124, protein: 0, carbs: 0, fat: 14, micros: { vitaminE: 2.4, vitaminK: 10 } },
  { keys: ['avocado oil'], serving: 1, unit: 'tbsp', calories: 124, protein: 0, carbs: 0, fat: 14, micros: { vitaminE: 1.8 } },
  { keys: ['flaxseed oil', 'linseed oil'], serving: 1, unit: 'tbsp', calories: 120, protein: 0, carbs: 0, fat: 14, micros: { omega3: 7190, vitaminE: 0.1 } },
  { keys: ['almond oil'], serving: 1, unit: 'tbsp', calories: 119, protein: 0, carbs: 0, fat: 14, micros: { vitaminE: 5.3 } },
  { keys: ['walnut oil'], serving: 1, unit: 'tbsp', calories: 120, protein: 0, carbs: 0, fat: 14, micros: { omega3: 1400, vitaminE: 0.1 } },
  { keys: ['palm oil'], serving: 1, unit: 'tbsp', calories: 120, protein: 0, carbs: 0, fat: 14, micros: { vitaminA: 120, vitaminE: 2.2 } },
  { keys: ['vegetable oil'], serving: 1, unit: 'tbsp', calories: 120, protein: 0, carbs: 0, fat: 14, micros: { vitaminE: 1.1 } },
  { keys: ['corn oil'], serving: 1, unit: 'tbsp', calories: 122, protein: 0, carbs: 0, fat: 14, micros: { vitaminE: 1.9 } },
  { keys: ['safflower oil'], serving: 1, unit: 'tbsp', calories: 120, protein: 0, carbs: 0, fat: 14, micros: { vitaminE: 4.6 } },
  { keys: ['vanaspati'], serving: 1, unit: 'tbsp', calories: 120, protein: 0, carbs: 0, fat: 14, micros: { transFat: 0.5, vitaminA: 75 } },
  { keys: ['mango'], serving: 1, unit: 'piece', calories: 150, protein: 2, carbs: 38, fat: 1, micros: { vitaminA: 180, vitaminC: 60, folate: 71 } },
  { keys: ['orange'], serving: 1, unit: 'piece', calories: 62, protein: 1, carbs: 15, fat: 0, micros: { vitaminC: 70, calcium: 52 } },
  { keys: ['grapes'], serving: 100, unit: 'g', calories: 69, protein: 1, carbs: 18, fat: 0, micros: { vitaminC: 3, vitaminK: 14.6 } },
  { keys: ['watermelon'], serving: 100, unit: 'g', calories: 30, protein: 1, carbs: 8, fat: 0, micros: { vitaminA: 28, vitaminC: 8 } },
  { keys: ['papaya'], serving: 100, unit: 'g', calories: 43, protein: 1, carbs: 11, fat: 0, micros: { vitaminC: 61, vitaminA: 47, folate: 37 } },
  { keys: ['pomegranate', 'anar'], serving: 100, unit: 'g', calories: 83, protein: 2, carbs: 19, fat: 1, micros: { vitaminC: 10, potassium: 236 } },
  { keys: ['guava'], serving: 100, unit: 'g', calories: 68, protein: 3, carbs: 14, fat: 1, micros: { vitaminC: 228, vitaminA: 31, folate: 49 } },
  { keys: ['pineapple'], serving: 100, unit: 'g', calories: 50, protein: 1, carbs: 13, fat: 0, micros: { vitaminC: 47, manganese: 0.9 } },
  { keys: ['muskmelon', 'melon'], serving: 100, unit: 'g', calories: 34, protein: 1, carbs: 8, fat: 0, micros: { vitaminA: 169, vitaminC: 36 } },
  { keys: ['kiwi'], serving: 1, unit: 'piece', calories: 42, protein: 1, carbs: 10, fat: 0, micros: { vitaminC: 64, vitaminK: 28 } },
  { keys: ['strawberry'], serving: 100, unit: 'g', calories: 32, protein: 1, carbs: 8, fat: 0, micros: { vitaminC: 58, manganese: 0.4 } },
  { keys: ['blueberry', 'blueberries'], serving: 100, unit: 'g', calories: 57, protein: 1, carbs: 14, fat: 0, micros: { vitaminC: 9, vitaminK: 19 } },
  { keys: ['raspberry'], serving: 100, unit: 'g', calories: 52, protein: 1, carbs: 12, fat: 1, micros: { vitaminC: 26, manganese: 0.6 } },
  { keys: ['blackberry'], serving: 100, unit: 'g', calories: 43, protein: 1, carbs: 10, fat: 0, micros: { vitaminC: 21, vitaminK: 20 } },
  { keys: ['pear'], serving: 1, unit: 'piece', calories: 101, protein: 1, carbs: 27, fat: 0, micros: { vitaminC: 7, potassium: 206 } },
  { keys: ['peach'], serving: 1, unit: 'piece', calories: 59, protein: 1, carbs: 14, fat: 0, micros: { vitaminA: 24, vitaminC: 10 } },
  { keys: ['plum'], serving: 1, unit: 'piece', calories: 30, protein: 0, carbs: 8, fat: 0, micros: { vitaminC: 6, vitaminK: 4 } },
  { keys: ['cherry', 'cherries'], serving: 100, unit: 'g', calories: 63, protein: 1, carbs: 16, fat: 0, micros: { vitaminC: 7, potassium: 222 } },
  { keys: ['lychee', 'litchi'], serving: 100, unit: 'g', calories: 66, protein: 1, carbs: 17, fat: 0, micros: { vitaminC: 71, copper: 0.1 } },
  { keys: ['dragon fruit'], serving: 100, unit: 'g', calories: 60, protein: 1, carbs: 13, fat: 0, micros: { vitaminC: 3, magnesium: 40 } },
  { keys: ['custard apple', 'sitaphal'], serving: 100, unit: 'g', calories: 94, protein: 2, carbs: 24, fat: 1, micros: { vitaminC: 36, magnesium: 21 } },
  { keys: ['sapota', 'chikoo'], serving: 100, unit: 'g', calories: 83, protein: 1, carbs: 20, fat: 1, micros: { vitaminC: 14, iron: 0.8 } },
  { keys: ['jackfruit'], serving: 100, unit: 'g', calories: 95, protein: 2, carbs: 23, fat: 1, micros: { vitaminC: 13, potassium: 448 } },
  { keys: ['fig', 'anjeer'], serving: 1, unit: 'piece', calories: 37, protein: 0, carbs: 10, fat: 0, micros: { calcium: 18, iron: 0.2 } },
  { keys: ['dates', 'khajoor'], serving: 100, unit: 'g', calories: 277, protein: 2, carbs: 75, fat: 0, micros: { potassium: 656, magnesium: 54, iron: 0.9 } },
  { keys: ['raisins'], serving: 100, unit: 'g', calories: 299, protein: 3, carbs: 79, fat: 0, micros: { iron: 1.9, potassium: 749 } },
  { keys: ['cranberry'], serving: 100, unit: 'g', calories: 46, protein: 0, carbs: 12, fat: 0, micros: { vitaminC: 13, manganese: 0.3 } },
  { keys: ['avocado'], serving: 100, unit: 'g', calories: 160, protein: 2, carbs: 9, fat: 15, micros: { potassium: 485, vitaminE: 2, folate: 81 } },
  { keys: ['lemon'], serving: 1, unit: 'piece', calories: 17, protein: 1, carbs: 5, fat: 0, micros: { vitaminC: 31 } },
  { keys: ['sweet lime', 'mosambi'], serving: 1, unit: 'piece', calories: 43, protein: 1, carbs: 9, fat: 0, micros: { vitaminC: 50 } }

];

let nutritionDatasetCache = NUTRITION_DATASET;
let nutritionFetchPromise = null;

function mergeNutritionItems(baseItems, remoteItems) {
  const merged = new Map();

  baseItems.forEach(item => {
    merged.set((item.keys?.[0] || '').toLowerCase(), item);
  });

  remoteItems.forEach(item => {
    const key = (item.keys?.[0] || '').toLowerCase();
    if (key) merged.set(key, item);
  });

  return Array.from(merged.values());
}

async function refreshNutritionDataset() {
  if (nutritionFetchPromise) return nutritionFetchPromise;

  nutritionFetchPromise = (async () => {
    const items = await listNutritionItems();
    if (Array.isArray(items) && items.length > 0) {
      nutritionDatasetCache = mergeNutritionItems(NUTRITION_DATASET, items);
      await AsyncStorage.setItem(NUTRITION_CACHE_KEY, JSON.stringify(items));
    }
    return nutritionDatasetCache;
  })().finally(() => {
    nutritionFetchPromise = null;
  });

  return nutritionFetchPromise;
}

async function getNutritionDataset() {
  try {
    const cached = await AsyncStorage.getItem(NUTRITION_CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) {
        nutritionDatasetCache = mergeNutritionItems(NUTRITION_DATASET, parsed);
      }
    }
  } catch (error) {
    // Built-in nutrition data remains available if cache parsing fails.
  }

  try {
    return await refreshNutritionDataset();
  } catch (error) {
    return nutritionDatasetCache;
  }
}

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

function findFood(text, dataset = nutritionDatasetCache) {
  const lower = text.toLowerCase();
  return dataset.find(food => food.keys.some(key => lower.includes(key)));
}

export function getIngredientSuggestions(query, limit = 5) {
  const lower = query.trim().toLowerCase();
  if (lower.length < 2) return [];

  refreshNutritionDataset().catch(() => {});

  return nutritionDatasetCache
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
  const dataset = await getNutritionDataset();
  const items = ingredients.map(ingredient => {
    const food = findFood(ingredient, dataset);

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
  refreshNutritionDataset().catch(() => {});
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
