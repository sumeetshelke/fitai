import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { colors, spacing, radius } from '../theme';
import { useApp } from '../context/AppContext';
import { MICRO_TARGETS, calculateVitaminIntake } from '../api';

export default function VitaminsScreen() {
  const { foodLog, dietProfile, manualNutrients, addManualNutrient } = useApp();
  const [selectedNutrient, setSelectedNutrient] = useState(MICRO_TARGETS[0].key);
  const [manualPct, setManualPct] = useState('');
  const today = new Date().toISOString().slice(0, 10);
  const todayManual = manualNutrients.filter(entry => entry.loggedAt === today);
  const datasetVitamins = calculateVitaminIntake(foodLog);
  const vitamins = datasetVitamins.map(v => {
    const manualTotal = todayManual
      .filter(entry => entry.key === v.key)
      .reduce((sum, entry) => sum + entry.pct, 0);

    return { ...v, pct: Math.min(v.pct + manualTotal, 100), manualPct: manualTotal };
  });
  const low = vitamins.filter(v => v.pct < 50);
  const ok = vitamins.filter(v => v.pct >= 70);
  const loggedItems = Object.values(foodLog).flat().filter(item => !item.loggedAt || item.loggedAt === today).length;

  function saveManualNutrient() {
    const pct = parseInt(manualPct, 10);
    const nutrient = MICRO_TARGETS.find(item => item.key === selectedNutrient);

    if (!pct || pct < 1 || pct > 100) {
      Alert.alert('Check value', 'Enter a nutrition value between 1 and 100%.');
      return;
    }

    addManualNutrient({ key: selectedNutrient, name: nutrient.name, pct });
    setManualPct('');
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Vitamins</Text>
        <Text style={styles.sub}>Daily estimate from food log and manual entries</Text>
        <View style={styles.dataTag}><Text style={styles.dataTagText}>Dataset based</Text></View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Important disclaimer</Text>
          <Text style={styles.disclaimerText}>
            These nutrition values are estimates and may not be correct all the time. For accurate nutrition or health decisions, consult a doctor, dietitian, or do proper research from reliable sources.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Add manual daily nutrient value</Text>
          <Text style={styles.helperText}>Use this if you know a value from a label, supplement, or trusted source.</Text>
          <View style={styles.chipWrap}>
            {MICRO_TARGETS.map(nutrient => (
              <TouchableOpacity
                key={nutrient.key}
                style={[styles.chip, selectedNutrient === nutrient.key && styles.chipActive]}
                onPress={() => setSelectedNutrient(nutrient.key)}
              >
                <Text style={[styles.chipText, selectedNutrient === nutrient.key && styles.chipTextActive]}>{nutrient.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.manualRow}>
            <TextInput
              style={styles.input}
              value={manualPct}
              onChangeText={setManualPct}
              keyboardType="numeric"
              placeholder="% of daily value"
              placeholderTextColor={colors.textMuted}
            />
            <TouchableOpacity style={styles.addBtn} onPress={saveManualNutrient}>
              <Text style={styles.addBtnText}>Add</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Daily nutrient estimate</Text>
          {loggedItems === 0 && todayManual.length === 0 && (
            <Text style={styles.emptyText}>Log food or add manual values to calculate vitamins and minerals.</Text>
          )}
          {vitamins.map(v => (
            <View key={v.name} style={styles.vitRow}>
              <Text style={styles.vitName}>{v.name}</Text>
              <View style={styles.vitBarWrap}>
                <View style={[styles.vitBar, { width: v.pct + '%', backgroundColor: getColor(v.pct) }]} />
              </View>
              <Text style={styles.vitPct}>{v.pct}%</Text>
              {v.manualPct > 0 && <Text style={styles.manualTag}>+{v.manualPct}</Text>}
            </View>
          ))}
        </View>

        {(loggedItems > 0 || todayManual.length > 0) && low.length > 0 && (
          <View style={[styles.card, styles.cardRed]}>
            <Text style={styles.cardTitleRed}>Low nutrients</Text>
            {low.map(v => (
              <Text key={v.name} style={styles.defText}>
                {v.name} ({v.pct}%) - {v.advice}
              </Text>
            ))}
          </View>
        )}

        {(loggedItems > 0 || todayManual.length > 0) && ok.length > 0 && (
          <View style={[styles.card, styles.cardGreen]}>
            <Text style={styles.cardTitleGreen}>On track</Text>
            <Text style={styles.okText}>{ok.map(v => v.name).join(', ')} look good for today.</Text>
          </View>
        )}

        {dietProfile && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Your diet profile</Text>
            <Text style={styles.dietText}>
              Diet type: {dietProfile.type}{'\n'}
              Cuisine: {dietProfile.cuisine}{'\n'}
              Meals/day: {dietProfile.meals}
              {dietProfile.allergies !== 'none' ? '\nAvoids: ' + dietProfile.allergies : ''}
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function getColor(pct) {
  if (pct < 50) return colors.error;
  if (pct < 70) return colors.warning;
  return colors.primary;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { padding: spacing.xl, paddingBottom: spacing.md, borderBottomWidth: 0.5, borderColor: colors.border },
  title: { fontSize: 18, fontWeight: '500', color: colors.textPrimary },
  sub: { fontSize: 13, color: colors.textSecondary, marginTop: 2, marginBottom: 8 },
  dataTag: { alignSelf: 'flex-start', backgroundColor: colors.primaryLight, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 99 },
  dataTagText: { fontSize: 11, color: colors.primaryDark, fontWeight: '500' },
  scroll: { padding: spacing.xl, gap: 12, paddingBottom: 32 },
  card: { backgroundColor: colors.background, borderWidth: 0.5, borderColor: colors.border, borderRadius: radius.lg, padding: 14 },
  cardTitle: { fontSize: 13, fontWeight: '500', color: colors.textSecondary, marginBottom: 10 },
  disclaimerText: { fontSize: 13, color: colors.textPrimary, lineHeight: 20 },
  helperText: { fontSize: 12, color: colors.textSecondary, lineHeight: 18, marginBottom: 10 },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  chip: { borderWidth: 0.5, borderColor: colors.border, borderRadius: 99, paddingHorizontal: 10, paddingVertical: 6 },
  chipActive: { backgroundColor: colors.primaryLight, borderColor: colors.primary },
  chipText: { fontSize: 12, color: colors.textSecondary },
  chipTextActive: { color: colors.primaryDark, fontWeight: '600' },
  manualRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  input: { flex: 1, borderWidth: 0.5, borderColor: colors.border, borderRadius: radius.md, padding: 12, fontSize: 14, color: colors.textPrimary, backgroundColor: colors.backgroundSecondary },
  addBtn: { backgroundColor: colors.primary, borderRadius: radius.md, paddingHorizontal: 18, paddingVertical: 13 },
  addBtnText: { color: colors.white, fontSize: 14, fontWeight: '600' },
  emptyText: { fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginBottom: 12 },
  vitRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  vitName: { fontSize: 13, color: colors.textPrimary, width: 92 },
  vitBarWrap: { flex: 1, backgroundColor: colors.backgroundSecondary, borderRadius: 99, height: 7, marginHorizontal: 10, overflow: 'hidden' },
  vitBar: { height: 7, borderRadius: 99 },
  vitPct: { fontSize: 12, color: colors.textSecondary, width: 34, textAlign: 'right' },
  manualTag: { fontSize: 10, color: colors.primary, fontWeight: '700', width: 28 },
  cardRed: { borderColor: colors.dangerLight },
  cardTitleRed: { fontSize: 13, fontWeight: '600', color: colors.error, marginBottom: 10 },
  defText: { fontSize: 13, color: colors.textPrimary, lineHeight: 20, marginBottom: 8 },
  cardGreen: { borderColor: colors.successLight },
  cardTitleGreen: { fontSize: 13, fontWeight: '600', color: colors.success, marginBottom: 8 },
  okText: { fontSize: 13, color: colors.textPrimary, lineHeight: 20 },
  dietText: { fontSize: 13, color: colors.textPrimary, lineHeight: 22 },
});
