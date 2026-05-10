import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { spacing, radius } from '../theme';
import { useApp } from '../context/AppContext';

export default function ProfileScreen({ navigation }) {
  const { user, logout, goalCal, updateCalorieGoal, themeMode, setThemeMode, themeColors: colors } = useApp();
  const [goalInput, setGoalInput] = useState(String(goalCal));
  const styles = createStyles(colors);

  async function handleLogout() {
    await logout();
    navigation.reset({ index: 0, routes: [{ name: 'Welcome' }] });
  }

  async function saveCalorieGoal() {
    const nextGoal = parseInt(goalInput, 10);

    if (!nextGoal || nextGoal < 800 || nextGoal > 6000) {
      Alert.alert('Check calorie goal', 'Please enter a daily goal between 800 and 6000 kcal.');
      return;
    }

    await updateCalorieGoal(nextGoal);
    setGoalInput(String(nextGoal));
    Alert.alert('Saved', `Daily calorie goal updated to ${nextGoal} kcal.`);
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Profile</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.avatarArea}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.initials || 'ME'}</Text>
          </View>
          <Text style={styles.userName}>{user?.name || 'Your Name'}</Text>
          <Text style={styles.userEmail}>{user?.email || ''}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Your stats</Text>
          {[
            { label: 'Fitness goal', val: user?.goal || 'Build muscle' },
            { label: 'Activity level', val: user?.activity || 'Moderately active' },
            { label: 'Daily calorie goal', val: goalCal + ' kcal' },
            { label: 'Protein target', val: '160g / day' },
            { label: 'Member since', val: 'Today' },
          ].map(row => (
            <View key={row.label} style={styles.statRow}>
              <Text style={styles.statLabel}>{row.label}</Text>
              <Text style={styles.statVal}>{row.val}</Text>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Daily calorie goal</Text>
          <Text style={styles.helperText}>Set your own calorie target. Home and Food log update instantly.</Text>
          <View style={styles.goalEditRow}>
            <TextInput
              style={styles.goalInput}
              value={goalInput}
              onChangeText={setGoalInput}
              keyboardType="numeric"
              placeholder="2100"
              placeholderTextColor={colors.textMuted}
            />
            <TouchableOpacity style={styles.saveBtn} onPress={saveCalorieGoal}>
              <Text style={styles.saveBtnText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Appearance</Text>
          <View style={styles.themeSwitch}>
            {['light', 'dark'].map(mode => {
              const active = themeMode === mode;
              return (
                <TouchableOpacity
                  key={mode}
                  style={[styles.themeOption, active && styles.themeOptionActive]}
                  onPress={() => setThemeMode(mode)}
                >
                  <Text style={[styles.themeOptionText, active && styles.themeOptionTextActive]}>
                    {mode === 'light' ? 'Light' : 'Dark'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Sign out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.xl, borderBottomWidth: 0.5, borderColor: colors.border },
  backText: { fontSize: 15, color: colors.textSecondary },
  title: { fontSize: 17, fontWeight: '500', color: colors.textPrimary },
  scroll: { padding: spacing.xl, gap: 16, paddingBottom: 40 },
  avatarArea: { alignItems: 'center', paddingVertical: 20 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  avatarText: { fontSize: 26, fontWeight: '600', color: colors.primaryDark },
  userName: { fontSize: 18, fontWeight: '500', color: colors.textPrimary },
  userEmail: { fontSize: 13, color: colors.textSecondary, marginTop: 4 },
  card: { backgroundColor: colors.background, borderWidth: 0.5, borderColor: colors.border, borderRadius: radius.lg, padding: 14 },
  cardTitle: { fontSize: 12, fontWeight: '500', color: colors.textSecondary, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.6 },
  helperText: { fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginBottom: 12 },
  statRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 0.5, borderColor: colors.border },
  statLabel: { fontSize: 14, color: colors.textSecondary },
  statVal: { fontSize: 14, fontWeight: '500', color: colors.textPrimary },
  goalEditRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  goalInput: { flex: 1, borderWidth: 0.5, borderColor: colors.border, borderRadius: radius.md, padding: 12, fontSize: 15, color: colors.textPrimary, backgroundColor: colors.backgroundSecondary },
  saveBtn: { backgroundColor: colors.primary, borderRadius: radius.md, paddingHorizontal: 18, paddingVertical: 13 },
  saveBtnText: { color: colors.white, fontSize: 14, fontWeight: '600' },
  themeSwitch: { flexDirection: 'row', backgroundColor: colors.backgroundSecondary, borderRadius: radius.md, padding: 4, borderWidth: 0.5, borderColor: colors.border },
  themeOption: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: radius.sm },
  themeOptionActive: { backgroundColor: colors.primary },
  themeOptionText: { fontSize: 14, fontWeight: '600', color: colors.textSecondary },
  themeOptionTextActive: { color: colors.white },
  logoutBtn: { borderWidth: 0.5, borderColor: colors.border, borderRadius: radius.md, padding: 14, alignItems: 'center' },
  logoutText: { fontSize: 14, color: colors.error },
});
