import React, { createContext, useContext, useEffect, useState } from 'react';
import { Appearance } from 'react-native';
import { defaultTheme, palettes } from '../theme';
import * as backend from '../services/backend';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [dietProfile, setDietProfile] = useState(null);
  const [foodLog, setFoodLog] = useState({ Breakfast: [], Lunch: [], Dinner: [], Snack: [] });
  const [manualNutrients, setManualNutrients] = useState([]);
  const [workouts, setWorkouts] = useState([]);
  const [themeMode, setThemeModeState] = useState(defaultTheme);
  const themeColors = palettes[themeMode];

  const totalCals = Object.values(foodLog).flat().reduce((s, i) => s + (i.cal || 0), 0);
  const totalProtein = Object.values(foodLog).flat().reduce((s, i) => s + (i.prot || 0), 0);
  const totalCarbs = Object.values(foodLog).flat().reduce((s, i) => s + (i.carb || 0), 0);
  const totalFat = Object.values(foodLog).flat().reduce((s, i) => s + (i.fat || 0), 0);
  const goalCal = user?.goalCal || 2100;

  useEffect(() => {
    hydrateSession();
  }, []);

  async function hydrateSession() {
    try {
      const currentUser = await backend.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        await hydrateUserData();
      }
    } catch (error) {
      await backend.logout();
      setUser(null);
    } finally {
      setAuthReady(true);
    }
  }

  async function hydrateUserData() {
    const [foodLogs, workoutLogs] = await Promise.all([
      backend.listFoodLogs(),
      backend.listWorkoutLogs(),
    ]);

    setFoodLog(groupFoodLogs(foodLogs));
    setWorkouts(workoutLogs);
  }

  async function addFoodItem(meal, item) {
    const loggedAt = new Date().toISOString().slice(0, 10);
    const optimisticItem = { ...item, loggedAt };
    setFoodLog(prev => ({ ...prev, [meal]: [...(prev[meal] || []), optimisticItem] }));

    if (!user) return;
    const savedItem = await backend.createFoodLog(meal, optimisticItem);
    setFoodLog(prev => ({
      ...prev,
      [meal]: (prev[meal] || []).map(entry => entry === optimisticItem ? savedItem : entry),
    }));
  }
  async function removeFoodItem(meal, index) {
    const item = foodLog[meal]?.[index];
    setFoodLog(prev => ({ ...prev, [meal]: (prev[meal] || []).filter((_, i) => i !== index) }));
    if (item?.id) await backend.deleteFoodLog(item.id);
  }
  function addMealCategory(meal) {
    const cleanMeal = meal.trim();
    if (!cleanMeal) return false;
    setFoodLog(prev => (prev[cleanMeal] ? prev : { ...prev, [cleanMeal]: [] }));
    return true;
  }
  function addManualNutrient(entry) {
    const loggedAt = new Date().toISOString().slice(0, 10);
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
    const optimisticWorkout = { ...workout, loggedAt: new Date().toISOString().slice(0, 10) };
    setWorkouts(prev => [...prev, optimisticWorkout]);

    if (!user) return;
    const savedWorkout = await backend.createWorkoutLog(optimisticWorkout);
    setWorkouts(prev => prev.map(entry => entry === optimisticWorkout ? savedWorkout : entry));
  }

  async function updateWorkout(id, changes) {
    setWorkouts(prev => prev.map(workout => workout.id === id ? { ...workout, ...changes } : workout));
    if (id) await backend.updateWorkoutLog(id, changes);
  }

  return (
    <AppContext.Provider value={{
      user, authReady, applyUser, logout, updateCalorieGoal, saveProfile, dietProfile, setDietProfile,
      foodLog, addFoodItem, removeFoodItem, addMealCategory,
      manualNutrients, addManualNutrient,
      workouts, setWorkouts, addWorkout, updateWorkout,
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
