import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, TouchableOpacity, TextInput, Modal, ActivityIndicator, Alert } from 'react-native';
import { colors, spacing, radius } from '../theme';
import { useApp } from '../context/AppContext';
import { detectIngredientCalories, getIngredientSuggestions } from '../api';

export default function FoodScreen() {
  const { foodLog, dailyHistory, addFoodItem, removeFoodItem, addMealCategory, totalCals, goalCal } = useApp();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState('Breakfast');
  const [tab, setTab] = useState('estimate'); // 'estimate' | 'manual'
  const [customMealName, setCustomMealName] = useState('');
  const [historyRange, setHistoryRange] = useState('today');

  // Estimate tab state
  const [dishName, setDishName] = useState('');
  const [ingrInput, setIngrInput] = useState('');
  const [ingredients, setIngredients] = useState([]);
  const [detecting, setDetecting] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [editCal, setEditCal] = useState('');
  const [editProt, setEditProt] = useState('');
  const [editCarb, setEditCarb] = useState('');
  const [editFat, setEditFat] = useState('');

  // Manual tab state
  const [mName, setMName] = useState('');
  const [mQty, setMQty] = useState('');
  const [mCal, setMCal] = useState('');
  const [mProt, setMProt] = useState('');
  const [mCarb, setMCarb] = useState('');
  const [mFat, setMFat] = useState('');

  const pct = Math.min(Math.round((totalCals / goalCal) * 100), 100);
  const meals = Object.keys(foodLog);
  const history = getFoodHistorySummary(historyRange, foodLog, dailyHistory);

  function openModal(meal = 'Breakfast') {
    setSelectedMeal(meal);
    resetForm();
    setModalVisible(true);
  }

  function resetForm() {
    setDishName(''); setIngrInput(''); setIngredients([]);
    setDetecting(false); setAiResult(null); setEditCal(''); setEditProt(''); setEditCarb(''); setEditFat('');
    setMName(''); setMQty(''); setMCal(''); setMProt(''); setMCarb(''); setMFat('');
    setTab('estimate');
  }

  function addIngredient() {
    if (!ingrInput.trim()) return;
    setIngredients(prev => [...prev, ingrInput.trim()]);
    setIngrInput('');
    setAiResult(null);
  }

  async function handleDetect() {
    const allIngr = ingrInput.trim() ? [...ingredients, ingrInput.trim()] : ingredients;
    if (allIngr.length === 0 && !dishName.trim()) {
      Alert.alert('Add ingredients', 'Please add at least one ingredient first.');
      return;
    }
    if (ingrInput.trim()) { setIngredients(allIngr); setIngrInput(''); }
    setDetecting(true); setAiResult(null);
    try {
      const result = await detectIngredientCalories(allIngr, dishName);
      setAiResult(result);
      setEditCal(String(result.total.calories));
      setEditProt(String(result.total.protein));
      setEditCarb(String(result.total.carbs));
      setEditFat(String(result.total.fat));
    } catch (e) {
      Alert.alert('Estimate error', 'Could not estimate calories. Please add this food manually.');
    } finally {
      setDetecting(false);
    }
  }

  async function saveAI() {
    if (!editCal) { Alert.alert('Missing', 'Calories cannot be empty.'); return; }
    const name = dishName || ingredients.join(' + ');
    try {
      await addFoodItem(selectedMeal, {
        name, qty: ingredients.join(', ') || 'Mixed ingredients',
        cal: parseInt(editCal) || 0,
        prot: parseInt(editProt) || 0,
        carb: parseInt(editCarb) || 0,
        fat: parseInt(editFat) || 0,
      });
      setModalVisible(false);
    } catch (error) {
      Alert.alert('Save failed', error.message);
    }
  }

  async function saveManual() {
    if (!mName.trim()) { Alert.alert('Missing', 'Please enter a food name.'); return; }
    if (!mCal) { Alert.alert('Missing', 'Please enter calories.'); return; }
    try {
      await addFoodItem(selectedMeal, {
        name: mName, qty: mQty || '1 serving',
        cal: parseInt(mCal) || 0,
        prot: parseInt(mProt) || 0,
        carb: parseInt(mCarb) || 0,
        fat: parseInt(mFat) || 0,
      });
      setModalVisible(false);
    } catch (error) {
      Alert.alert('Save failed', error.message);
    }
  }

  function saveCustomMeal() {
    const cleanMeal = customMealName.trim();

    if (!cleanMeal) {
      Alert.alert('Meal name required', 'Please enter a meal name.');
      return;
    }

    addMealCategory(cleanMeal);
    setSelectedMeal(cleanMeal);
    setCustomMealName('');
  }

  const ingredientSuggestions = getIngredientSuggestions(ingrInput);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Food log</Text>
        <Text style={styles.sub}>{totalCals.toLocaleString()} / {goalCal.toLocaleString()} kcal · {pct}%</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <View style={styles.barWrap}>
            <View style={[styles.bar, { width: pct + '%' }]} />
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}>
            <Text style={styles.barLabel}>{totalCals.toLocaleString()} eaten</Text>
            <Text style={styles.barLabel}>{Math.max(0, goalCal - totalCals).toLocaleString()} remaining</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Food history</Text>
          <View style={styles.historyTabs}>
            {[
              { key: 'today', label: 'Today' },
              { key: 'yesterday', label: 'Yesterday' },
              { key: 'week', label: 'Last 7 days' },
            ].map(option => (
              <TouchableOpacity
                key={option.key}
                style={[styles.historyTab, historyRange === option.key && styles.historyTabActive]}
                onPress={() => setHistoryRange(option.key)}
              >
                <Text style={[styles.historyTabText, historyRange === option.key && styles.historyTabTextActive]}>{option.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.historyStats}>
            <Text style={styles.historyStat}>{history.totals.cal} kcal</Text>
            <Text style={styles.historyStat}>P {history.totals.prot}g</Text>
            <Text style={styles.historyStat}>C {history.totals.carb}g</Text>
            <Text style={styles.historyStat}>F {history.totals.fat}g</Text>
          </View>
          {history.items.length === 0 ? (
            <Text style={styles.emptyText}>No food saved for this period yet.</Text>
          ) : history.items.map((item, index) => (
            <View key={`${item.date}-${index}`} style={styles.historyItem}>
              <View style={{ flex: 1 }}>
                <Text style={styles.foodName}>{item.name}</Text>
                <Text style={styles.foodSub}>{item.date} · {item.meal} · P:{item.prot}g C:{item.carb}g F:{item.fat}g</Text>
              </View>
              <Text style={styles.foodCal}>{item.cal} kcal</Text>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Add your own meal section</Text>
          <View style={styles.customMealRow}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              value={customMealName}
              onChangeText={setCustomMealName}
              placeholder="e.g. Pre-workout, Late dinner"
              placeholderTextColor={colors.textMuted}
            />
            <TouchableOpacity style={styles.addCustomMealBtn} onPress={saveCustomMeal}>
              <Text style={styles.addCustomMealText}>Add</Text>
            </TouchableOpacity>
          </View>
        </View>

        {meals.map(meal => {
          const items = foodLog[meal] || [];
          const mealCal = items.reduce((s, i) => s + i.cal, 0);
          return (
            <View key={meal}>
              <View style={styles.mealHeader}>
                <Text style={styles.mealTitle}>{meal}</Text>
                {mealCal > 0 && <Text style={styles.mealCal}>{mealCal} kcal</Text>}
              </View>
              <View style={styles.card}>
                {items.length === 0 ? (
                  <Text style={styles.emptyText}>Nothing logged yet</Text>
                ) : items.map((item, idx) => (
                  <View key={idx} style={styles.foodRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.foodName}>{item.name}</Text>
                      <Text style={styles.foodSub}>{item.qty} · P:{item.prot}g C:{item.carb}g F:{item.fat}g</Text>
                    </View>
                    <Text style={styles.foodCal}>{item.cal} kcal</Text>
                    <TouchableOpacity onPress={() => removeFoodItem(meal, idx)} style={styles.delBtn}>
                      <Text style={styles.delBtnText}>×</Text>
                    </TouchableOpacity>
                  </View>
                ))}
                <TouchableOpacity style={styles.addMealBtn} onPress={() => openModal(meal)}>
                  <Text style={styles.addMealBtnText}>+ Add to {meal}</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </ScrollView>

      <TouchableOpacity style={styles.fab} onPress={() => openModal()}>
        <Text style={styles.fabText}>+ Add food / ingredients</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setModalVisible(false)}>
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add to food log</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.closeBtn}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={{ padding: spacing.xl }} keyboardShouldPersistTaps="handled">
            {/* Meal selector */}
            <Text style={styles.fieldLabel}>Add to meal</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {meals.map(m => (
                  <TouchableOpacity key={m} style={[styles.mealChip, selectedMeal === m && styles.mealChipActive]} onPress={() => setSelectedMeal(m)}>
                    <Text style={[styles.mealChipText, selectedMeal === m && styles.mealChipTextActive]}>{m}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            {/* Tab switcher */}
            <View style={styles.tabRow}>
              <TouchableOpacity style={[styles.tabBtn, tab === 'estimate' && styles.tabActive]} onPress={() => setTab('estimate')}>
                <Text style={[styles.tabText, tab === 'estimate' && styles.tabTextActive]}>Quick calorie estimate</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.tabBtn, tab === 'manual' && styles.tabActive]} onPress={() => setTab('manual')}>
                <Text style={[styles.tabText, tab === 'manual' && styles.tabTextActive]}>✏️ Add manually</Text>
              </TouchableOpacity>
            </View>

            {tab === 'estimate' ? (
              <>
                <Text style={styles.fieldLabel}>Dish / meal name (optional)</Text>
                <TextInput style={styles.input} value={dishName} onChangeText={setDishName} placeholder="e.g. Dal rice, Chicken sandwich" />

                <Text style={[styles.fieldLabel, { marginTop: 14 }]}>Ingredients with quantity</Text>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <TextInput style={[styles.input, { flex: 1 }]} value={ingrInput} onChangeText={setIngrInput} placeholder="e.g. 100g rice, 2 eggs" onSubmitEditing={addIngredient} />
                  <TouchableOpacity style={styles.addIngrBtn} onPress={addIngredient}>
                    <Text style={{ color: colors.primary, fontWeight: '500', fontSize: 13 }}>Add</Text>
                  </TouchableOpacity>
                </View>

                {ingredientSuggestions.length > 0 && (
                  <View style={styles.suggestionBox}>
                    {ingredientSuggestions.map(item => (
                      <TouchableOpacity
                        key={item.name}
                        style={styles.suggestionRow}
                        onPress={() => {
                          setIngrInput(item.unit === 'piece' || item.unit === 'slice' || item.unit === 'scoop' ? `1 ${item.name}` : `${item.serving}${item.unit} ${item.name}`);
                          setAiResult(null);
                        }}
                      >
                        <View style={{ flex: 1 }}>
                          <Text style={styles.suggestionName}>{item.name}</Text>
                          <Text style={styles.suggestionMeta}>{item.serving}{item.unit} · {item.calories} kcal · P{item.protein} C{item.carbs} F{item.fat}</Text>
                        </View>
                        <Text style={styles.suggestionAdd}>Use</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                {ingredients.length > 0 && (
                  <View style={styles.tagsWrap}>
                    {ingredients.map((ingr, i) => (
                      <View key={i} style={styles.tag}>
                        <Text style={styles.tagText}>{ingr}</Text>
                        <TouchableOpacity onPress={() => setIngredients(prev => prev.filter((_, idx) => idx !== i))}>
                          <Text style={styles.tagDel}>×</Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}

                <TouchableOpacity style={styles.detectBtn} onPress={handleDetect} disabled={detecting}>
                  {detecting ? <ActivityIndicator color={colors.white} /> : <Text style={styles.detectBtnText}>Estimate calories</Text>}
                </TouchableOpacity>

                {aiResult && (
                  <View style={styles.aiResult}>
                    <Text style={styles.aiResultTitle}>Calorie estimate</Text>
                    {aiResult.items.map((item, i) => (
                      <View key={i} style={styles.aiResultRow}>
                        <Text style={styles.aiResultName}>{item.name}</Text>
                        <Text style={styles.aiResultCal}>{item.calories} kcal · P{item.protein}g C{item.carbs}g F{item.fat}g</Text>
                      </View>
                    ))}
                    <View style={styles.aiResultTotal}>
                      <Text style={{ color: colors.primaryDark, fontWeight: '600' }}>Total</Text>
                      <Text style={{ color: colors.primaryDark, fontWeight: '600' }}>
                        {aiResult.total.calories} kcal · P{aiResult.total.protein} C{aiResult.total.carbs} F{aiResult.total.fat}
                      </Text>
                    </View>
                    <Text style={styles.editHint}>Edit before saving if needed:</Text>
                    <View style={{ flexDirection: 'row', gap: 10 }}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.fieldLabel}>Calories (kcal)</Text>
                        <TextInput style={styles.input} value={editCal} onChangeText={setEditCal} keyboardType="numeric" />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.fieldLabel}>Protein (g)</Text>
                        <TextInput style={styles.input} value={editProt} onChangeText={setEditProt} keyboardType="numeric" />
                      </View>
                    </View>
                    <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.fieldLabel}>Carbs (g)</Text>
                        <TextInput style={styles.input} value={editCarb} onChangeText={setEditCarb} keyboardType="numeric" />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.fieldLabel}>Fat (g)</Text>
                        <TextInput style={styles.input} value={editFat} onChangeText={setEditFat} keyboardType="numeric" />
                      </View>
                    </View>
                    <TouchableOpacity style={styles.saveBtn} onPress={saveAI}>
                      <Text style={styles.saveBtnText}>Save to {selectedMeal}</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </>
            ) : (
              <>
                <Text style={styles.fieldLabel}>Food / dish name *</Text>
                <TextInput style={styles.input} value={mName} onChangeText={setMName} placeholder="e.g. Paneer tikka, Oats" />
                <Text style={[styles.fieldLabel, { marginTop: 14 }]}>Serving size / quantity</Text>
                <TextInput style={styles.input} value={mQty} onChangeText={setMQty} placeholder="e.g. 150g, 1 bowl, 2 rotis" />
                <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.fieldLabel}>Calories (kcal) *</Text>
                    <TextInput style={styles.input} value={mCal} onChangeText={setMCal} keyboardType="numeric" placeholder="e.g. 320" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.fieldLabel}>Protein (g)</Text>
                    <TextInput style={styles.input} value={mProt} onChangeText={setMProt} keyboardType="numeric" placeholder="e.g. 28" />
                  </View>
                </View>
                <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.fieldLabel}>Carbs (g)</Text>
                    <TextInput style={styles.input} value={mCarb} onChangeText={setMCarb} keyboardType="numeric" placeholder="e.g. 30" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.fieldLabel}>Fat (g)</Text>
                    <TextInput style={styles.input} value={mFat} onChangeText={setMFat} keyboardType="numeric" placeholder="e.g. 12" />
                  </View>
                </View>
                <TouchableOpacity style={[styles.saveBtn, { marginTop: 20 }]} onPress={saveManual}>
                  <Text style={styles.saveBtnText}>Save to {selectedMeal}</Text>
                </TouchableOpacity>
              </>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

function getFoodHistorySummary(range, currentFoodLog, dailyHistory) {
  const dates = getHistoryDates(range);
  const items = dates.flatMap(date => {
    const foodLog = date === getLocalDate(0)
      ? currentFoodLog
      : dailyHistory[date]?.foodLog || {};

    return Object.entries(foodLog).flatMap(([meal, mealItems]) =>
      (mealItems || []).map(item => ({ ...item, meal, date }))
    );
  });

  return {
    items,
    totals: items.reduce((total, item) => ({
      cal: total.cal + (item.cal || 0),
      prot: total.prot + (item.prot || 0),
      carb: total.carb + (item.carb || 0),
      fat: total.fat + (item.fat || 0),
    }), { cal: 0, prot: 0, carb: 0, fat: 0 }),
  };
}

function getHistoryDates(range) {
  if (range === 'yesterday') return [getLocalDate(-1)];
  if (range === 'week') return Array.from({ length: 7 }, (_, index) => getLocalDate(-index));
  return [getLocalDate(0)];
}

function getLocalDate(offsetDays) {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { padding: spacing.xl, paddingBottom: spacing.md, borderBottomWidth: 0.5, borderColor: colors.border },
  title: { fontSize: 18, fontWeight: '500', color: colors.textPrimary },
  sub: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  scroll: { padding: spacing.xl, paddingBottom: 100, gap: 4 },
  card: { backgroundColor: colors.background, borderWidth: 0.5, borderColor: colors.border, borderRadius: radius.lg, padding: 14, marginBottom: 12 },
  cardTitle: { fontSize: 13, fontWeight: '600', color: colors.textPrimary, marginBottom: 10 },
  historyTabs: { flexDirection: 'row', gap: 6, backgroundColor: colors.backgroundSecondary, borderRadius: radius.md, padding: 4, marginBottom: 10 },
  historyTab: { flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: radius.sm },
  historyTabActive: { backgroundColor: colors.primary },
  historyTabText: { fontSize: 12, color: colors.textSecondary, fontWeight: '600' },
  historyTabTextActive: { color: colors.white },
  historyStats: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
  historyStat: { fontSize: 12, color: colors.primaryDark, backgroundColor: colors.primaryLight, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 99, fontWeight: '700' },
  historyItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 9, borderTopWidth: 0.5, borderColor: colors.border },
  customMealRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  addCustomMealBtn: { backgroundColor: colors.primary, borderRadius: radius.md, paddingHorizontal: 16, paddingVertical: 12 },
  addCustomMealText: { color: colors.white, fontSize: 13, fontWeight: '600' },
  barWrap: { backgroundColor: colors.backgroundSecondary, borderRadius: 99, height: 10, overflow: 'hidden' },
  bar: { height: 10, borderRadius: 99, backgroundColor: colors.primary },
  barLabel: { fontSize: 11, color: colors.textSecondary },
  mealHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, marginTop: 8 },
  mealTitle: { fontSize: 12, fontWeight: '500', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.8 },
  mealCal: { fontSize: 12, color: colors.textSecondary },
  foodRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 0.5, borderColor: colors.border },
  foodName: { fontSize: 14, fontWeight: '500', color: colors.textPrimary },
  foodSub: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  foodCal: { fontSize: 13, fontWeight: '500', color: colors.textPrimary, marginRight: 8 },
  delBtn: { width: 26, height: 26, borderRadius: 13, backgroundColor: colors.backgroundSecondary, alignItems: 'center', justifyContent: 'center' },
  delBtnText: { fontSize: 16, color: colors.textSecondary, lineHeight: 20 },
  emptyText: { fontSize: 13, color: colors.textSecondary, textAlign: 'center', paddingVertical: 10 },
  addMealBtn: { marginTop: 10, padding: 10, borderWidth: 0.5, borderColor: colors.border, borderRadius: radius.md, borderStyle: 'dashed', alignItems: 'center' },
  addMealBtnText: { fontSize: 13, color: colors.textSecondary },
  fab: { position: 'absolute', bottom: 24, alignSelf: 'center', backgroundColor: colors.primary, paddingHorizontal: 28, paddingVertical: 14, borderRadius: 99, elevation: 6, shadowColor: colors.primary, shadowOpacity: 0.4, shadowRadius: 12, shadowOffset: { width: 0, height: 4 } },
  fabText: { color: colors.white, fontSize: 14, fontWeight: '600' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.xl, borderBottomWidth: 0.5, borderColor: colors.border },
  modalTitle: { fontSize: 17, fontWeight: '600', color: colors.textPrimary },
  closeBtn: { fontSize: 18, color: colors.textSecondary, padding: 4 },
  fieldLabel: { fontSize: 12, color: colors.textSecondary, marginBottom: 6 },
  input: { borderWidth: 0.5, borderColor: colors.border, borderRadius: radius.md, padding: 12, fontSize: 14, backgroundColor: colors.backgroundSecondary, color: colors.textPrimary },
  mealChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 99, borderWidth: 0.5, borderColor: colors.border },
  mealChipActive: { backgroundColor: colors.primaryLight, borderColor: colors.primary },
  mealChipText: { fontSize: 13, color: colors.textSecondary },
  mealChipTextActive: { color: colors.primaryDark, fontWeight: '500' },
  tabRow: { flexDirection: 'row', backgroundColor: colors.backgroundSecondary, borderRadius: radius.md, padding: 3, marginBottom: 20, gap: 3 },
  tabBtn: { flex: 1, padding: 10, borderRadius: radius.sm, alignItems: 'center' },
  tabActive: { backgroundColor: colors.background, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, shadowOffset: { width: 0, height: 1 }, elevation: 1 },
  tabText: { fontSize: 12, color: colors.textSecondary },
  tabTextActive: { color: colors.textPrimary, fontWeight: '500' },
  addIngrBtn: { borderWidth: 0.5, borderColor: colors.primary, borderRadius: radius.md, paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center' },
  suggestionBox: { marginTop: 8, backgroundColor: colors.surface, borderWidth: 0.5, borderColor: colors.border, borderRadius: radius.md, overflow: 'hidden' },
  suggestionRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 0.5, borderColor: colors.borderLight },
  suggestionName: { fontSize: 13, fontWeight: '600', color: colors.textPrimary, textTransform: 'capitalize' },
  suggestionMeta: { fontSize: 11, color: colors.textSecondary, marginTop: 2 },
  suggestionAdd: { fontSize: 12, fontWeight: '600', color: colors.primary },
  tagsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10, marginBottom: 4 },
  tag: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.backgroundSecondary, borderWidth: 0.5, borderColor: colors.border, borderRadius: 99, paddingVertical: 4, paddingHorizontal: 10 },
  tagText: { fontSize: 12, color: colors.textPrimary },
  tagDel: { fontSize: 15, color: colors.textSecondary },
  detectBtn: { backgroundColor: colors.primary, padding: 14, borderRadius: radius.md, alignItems: 'center', marginTop: 14 },
  detectBtnText: { color: colors.white, fontWeight: '600', fontSize: 14 },
  aiResult: { backgroundColor: colors.primaryLight, borderRadius: radius.lg, padding: 14, marginTop: 14 },
  aiResultTitle: { fontSize: 12, fontWeight: '600', color: colors.primaryDark, marginBottom: 10 },
  aiResultRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5, borderBottomWidth: 0.5, borderColor: '#C0E8D8' },
  aiResultName: { fontSize: 13, color: colors.textPrimary },
  aiResultCal: { fontSize: 12, color: colors.textSecondary },
  aiResultTotal: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 8, marginTop: 4 },
  editHint: { fontSize: 11, color: colors.textSecondary, marginTop: 12, marginBottom: 8 },
  saveBtn: { backgroundColor: colors.primary, padding: 14, borderRadius: radius.md, alignItems: 'center', marginTop: 14 },
  saveBtnText: { color: colors.white, fontWeight: '600', fontSize: 14 },
});
