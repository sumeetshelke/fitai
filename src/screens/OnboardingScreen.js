import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { colors, spacing, radius } from '../theme';
import { useApp } from '../context/AppContext';

const GOALS = [
  { val: 'Lose weight', icon: '📉', sub: 'Calorie deficit · Fat loss' },
  { val: 'Build muscle', icon: '💪', sub: 'Calorie surplus · High protein' },
  { val: 'Stay fit', icon: '✅', sub: 'Maintenance · Balanced diet' },
];

const ACTIVITY = [
  { val: 'Sedentary', sub: 'Little or no exercise, desk job' },
  { val: 'Lightly active', sub: '1–3 workouts per week' },
  { val: 'Moderately active', sub: '3–5 workouts per week' },
  { val: 'Very active', sub: '6–7 days heavy training' },
];

export default function OnboardingScreen({ navigation }) {
  const { saveProfile, user } = useApp();
  const [step, setStep] = useState(0);
  const [goal, setGoal] = useState('');
  const [activity, setActivity] = useState('');

  async function next() {
    if (step < 1) { setStep(s => s + 1); return; }
    // Calculate goal calories based on goal
    const goalCal = goal === 'Lose weight' ? 1600 : goal === 'Build muscle' ? 2500 : 2000;
    await saveProfile({ name: user?.name, goal, activity, goalCal });
    navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.dots}>
          {[0, 1].map(i => (
            <View key={i} style={[styles.dot, i <= step && styles.dotActive]} />
          ))}
        </View>
        <Text style={styles.stepLabel}>Step {step + 1} of 2</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {step === 0 ? (
          <>
            <Text style={styles.title}>What is your fitness goal?</Text>
            <Text style={styles.sub}>We will calculate your calorie target based on this.</Text>
            {GOALS.map(g => (
              <TouchableOpacity key={g.val} style={[styles.optionCard, goal === g.val && styles.optionSelected]} onPress={() => setGoal(g.val)}>
                <Text style={styles.optionIcon}>{g.icon}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.optionTitle}>{g.val}</Text>
                  <Text style={styles.optionSub}>{g.sub}</Text>
                </View>
                <View style={[styles.radio, goal === g.val && styles.radioSelected]}>
                  {goal === g.val && <View style={styles.radioDot} />}
                </View>
              </TouchableOpacity>
            ))}
          </>
        ) : (
          <>
            <Text style={styles.title}>Your activity level</Text>
            <Text style={styles.sub}>Used to fine-tune your daily calorie needs.</Text>
            {ACTIVITY.map(a => (
              <TouchableOpacity key={a.val} style={[styles.optionCard, activity === a.val && styles.optionSelected]} onPress={() => setActivity(a.val)}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.optionTitle}>{a.val}</Text>
                  <Text style={styles.optionSub}>{a.sub}</Text>
                </View>
                <View style={[styles.radio, activity === a.val && styles.radioSelected]}>
                  {activity === a.val && <View style={styles.radioDot} />}
                </View>
              </TouchableOpacity>
            ))}
          </>
        )}
      </ScrollView>

      <View style={styles.footer}>
        {step > 0 && (
          <TouchableOpacity style={styles.backBtn} onPress={() => setStep(s => s - 1)}>
            <Text style={styles.backBtnText}>Back</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={[styles.nextBtn, { flex: step > 0 ? 2 : 1 }]} onPress={next} disabled={step === 0 ? !goal : !activity}>
          <Text style={styles.nextBtnText}>{step === 1 ? 'Start my journey 🚀' : 'Next'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { padding: spacing.xl, paddingBottom: 0 },
  dots: { flexDirection: 'row', gap: 6, marginBottom: 10 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.backgroundSecondary, borderWidth: 0.5, borderColor: colors.border },
  dotActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  stepLabel: { fontSize: 12, color: colors.textSecondary },
  scroll: { padding: spacing.xl },
  title: { fontSize: 20, fontWeight: '600', color: colors.textPrimary, marginBottom: 6 },
  sub: { fontSize: 13, color: colors.textSecondary, marginBottom: 20, lineHeight: 20 },
  optionCard: { flexDirection: 'row', alignItems: 'center', borderWidth: 0.5, borderColor: colors.border, borderRadius: radius.lg, padding: 16, marginBottom: 10, gap: 12 },
  optionSelected: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
  optionIcon: { fontSize: 24 },
  optionTitle: { fontSize: 15, fontWeight: '500', color: colors.textPrimary },
  optionSub: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 1.5, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  radioSelected: { borderColor: colors.primary },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary },
  footer: { flexDirection: 'row', padding: spacing.xl, gap: 10 },
  backBtn: { flex: 1, borderWidth: 0.5, borderColor: colors.border, padding: 14, borderRadius: radius.md, alignItems: 'center' },
  backBtnText: { fontSize: 14, color: colors.textPrimary },
  nextBtn: { backgroundColor: colors.primary, padding: 14, borderRadius: radius.md, alignItems: 'center' },
  nextBtnText: { color: colors.white, fontSize: 14, fontWeight: '600' },
});
