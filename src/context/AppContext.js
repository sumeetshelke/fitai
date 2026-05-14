import React, { createContext, useContext, useEffect, useState } from 'react';
import { Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { defaultTheme, palettes } from '../theme';
import * as backend from '../services/backend';

const AppContext = createContext();
const DAILY_DATA_KEY = 'fitai.dailyData.v1';
const DAILY_HISTORY_KEY = 'fitai.dailyHistory.v1';

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [dietProfile, setDietProfile] = useState(null);
  const [foodLog, setFoodLog] = useState({ Breakfast: [], Lunch: [], Dinner: [], Snack: [] });
  const [manualNutrients, setManualNutrients] = useState([]);
  const [workouts, setWorkouts] = useState([]);
  const [dailyHistory, setDailyHistory] = useState({});
  const [themeMode, setThemeModeState] = useState(defaultTheme);
  const [localReady, setLocalReady] = useState(false);
  const themeColors = palettes[themeMode];

  const totalCals = Object.values(foodLog).flat().reduce((s, i) => s + (i.cal || 0), 0);
  const totalProtein = Object.values(foodLog).flat().reduce((s, i) => s + (i.prot || 0), 0);
  const totalCarbs = Object.values(foodLog).flat().reduce((s, i) => s + (i.carb || 0), 0);
  const totalFat = Object.values(foodLog).flat().reduce((s, i) => s + (i.fat || 0), 0);
  const goalCal = user?.goalCal || 2100;

  useEffect(() => {
    hydrateSession();
  }, []);

  useEffect(() => {
    if (!localReady) return;
    persistDailyData().catch(() => {});
  }, [foodLog, manualNutrients, workouts, dietProfile, localReady]);

  async function hydrateSession() {
    try {
      await hydrateDailyData();
      const currentUser = await backend.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        await hydrateUserData();
      }
    } catch (error) {
      await backend.logout();
      setUser(null);
    } finally {
      setLocalReady(true);
      setAuthReady(true);
    }
  }

  async function hydrateDailyData() {
    const today = getLocalDate(0);
    const historyRaw = await AsyncStorage.getItem(DAILY_HISTORY_KEY);
    const history = historyRaw ? JSON.parse(historyRaw) : {};
    const raw = await AsyncStorage.getItem(DAILY_DATA_KEY);
    const data = raw ? JSON.parse(raw) : null;
    const nextHistory = data?.date ? { ...history, [data.date]: data } : history;

    setDailyHistory(nextHistory);
    await AsyncStorage.setItem(DAILY_HISTORY_KEY, JSON.stringify(nextHistory));

    const todayData = nextHistory[today];
    if (!todayData) return;

    setFoodLog(todayData.foodLog || { Breakfast: [], Lunch: [], Dinner: [], Snack: [] });
    setManualNutrients(todayData.manualNutrients || []);
    setWorkouts(todayData.workouts || []);
    setDietProfile(todayData.dietProfile || null);
  }

  async function persistDailyData() {
    const today = getLocalDate(0);
    const todayData = {
      date: today,
      foodLog,
      manualNutrients,
      workouts,
      dietProfile,
    };

    await AsyncStorage.setItem(DAILY_DATA_KEY, JSON.stringify(todayData));
    setDailyHistory(prev => {
      const next = { ...prev, [today]: todayData };
      AsyncStorage.setItem(DAILY_HISTORY_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }

  async function hydrateUserData() {
    const [foodLogs, workoutLogs] = await Promise.all([
      backend.listFoodLogs().catch(() => null),
      backend.listWorkoutLogs().catch(() => null),
    ]);

    if (foodLogs) setFoodLog(groupFoodLogs(foodLogs));
    if (workoutLogs) setWorkouts(workoutLogs);
  }

  async function addFoodItem(meal, item) {
    const loggedAt = getLocalDate(0);
    const optimisticItem = { ...item, loggedAt };
    setFoodLog(prev => ({ ...prev, [meal]: [...(prev[meal] || []), optimisticItem] }));

    if (!user) return;
    try {
      const savedItem = await backend.createFoodLog(meal, optimisticItem);
      setFoodLog(prev => ({
        ...prev,
        [meal]: (prev[meal] || []).map(entry => entry === optimisticItem ? savedItem : entry),
      }));
    } catch (error) {}
  }
  async function removeFoodItem(meal, index) {
    const item = foodLog[meal]?.[index];
    setFoodLog(prev => ({ ...prev, [meal]: (prev[meal] || []).filter((_, i) => i !== index) }));
    if (item?.id) await backend.deleteFoodLog(item.id).catch(() => {});
  }
  function addMealCategory(meal) {
    const cleanMeal = meal.trim();
    if (!cleanMeal) return false;
    setFoodLog(prev => (prev[cleanMeal] ? prev : { ...prev, [cleanMeal]: [] }));
    return true;
  }
  function addManualNutrient(entry) {
    const loggedAt = getLocalDate(0);
    setManualNutrients(prev => [...prev, { ...entry, loggedAt }]);
  }
  function applyUser(userData) {
    setUser(userData);
    hydrateUserData().catch(() => {});
  }
  async function updateCalorieGoal(goalCal) {
    const nextUser = await backend.updateProfile({ goalCal });
    setUser(nextUser);
  }
  function setThemeMode(mode) {
    setThemeModeState(mode);
    Appearance.setColorScheme?.(mode);
  }
  async function logout() {
    await backend.logout();
    setUser(null);
    setDietProfile(null);
    setFoodLog({ Breakfast: [], Lunch: [], Dinner: [], Snack: [] });
    setWorkouts([]);
  }

  async function saveProfile(profile) {
    const nextUser = await backend.updateProfile(profile);
    setUser(nextUser);
    return nextUser;
  }

  async function addWorkout(workout) {
    const optimisticWorkout = { ...workout, loggedAt: getLocalDate(0) };
    setWorkouts(prev => [...prev, optimisticWorkout]);

    if (!user) return;
    try {
      const savedWorkout = await backend.createWorkoutLog(optimisticWorkout);
      setWorkouts(prev => prev.map(entry => entry === optimisticWorkout ? savedWorkout : entry));
    } catch (error) {}
  }

  async function updateWorkout(id, changes) {
    setWorkouts(prev => prev.map(workout => workout.id === id ? { ...workout, ...changes } : workout));
    if (id) await backend.updateWorkoutLog(id, changes).catch(() => {});
  }

  return (
    <AppContext.Provider value={{
      user, authReady, applyUser, logout, updateCalorieGoal, saveProfile, dietProfile, setDietProfile,
      foodLog, addFoodItem, removeFoodItem, addMealCategory,
      manualNutrients, addManualNutrient,
      workouts, setWorkouts, addWorkout, updateWorkout,
      dailyHistory,
      totalCals, totalProtein, totalCarbs, totalFat, goalCal,
      themeMode, setThemeMode, themeColors,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() { return useContext(AppContext); }

function groupFoodLogs(logs) {
  const grouped = { Breakfast: [], Lunch: [], Dinner: [], Snack: [] };

  logs.forEach(log => {
    const meal = log.meal || 'Snack';
    grouped[meal] = [...(grouped[meal] || []), log];
  });

  return grouped;
}

function getLocalDate(offsetDays) {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
