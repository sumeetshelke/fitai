import React from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { colors, spacing, radius, shadow } from '../theme';
import { useApp } from '../context/AppContext';

export default function HomeScreen({ navigation }) {
  const { user, totalCals, totalProtein, totalCarbs, totalFat, goalCal } = useApp();
  const pct = Math.min(Math.round((totalCals / goalCal) * 100), 100);
  const firstName = user?.name?.split(' ')[0] || 'there';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{greeting}, {firstName}</Text>
          <Text style={styles.headerSub}>Track clearly. Train consistently.</Text>
        </View>
        <TouchableOpacity style={styles.avatar} onPress={() => navigation.navigate('Profile')}>
          <Text style={styles.avatarText}>{user?.initials || 'ME'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.heroCard}>
          <View style={styles.heroTop}>
            <Text style={styles.cardLabel}>Today's calories</Text>
            <Text style={styles.statusPill}>{pct}%</Text>
          </View>
          <View style={styles.calRow}>
            <Text style={styles.calBig}>{totalCals.toLocaleString()}</Text>
            <Text style={styles.calGoal}> / {goalCal.toLocaleString()} kcal</Text>
          </View>
          <View style={styles.barWrap}>
            <View style={[styles.bar, { width: pct + '%', backgroundColor: pct > 90 ? colors.error : colors.primary }]} />
          </View>
          <View style={styles.barLabels}>
            <Text style={styles.barLabel}>{totalCals.toLocaleString()} eaten</Text>
            <Text style={styles.barLabel}>{Math.max(0, goalCal - totalCals).toLocaleString()} remaining</Text>
          </View>
        </View>

        <View style={styles.macroRow}>
          {[
            { label: 'Protein', val: totalProtein + 'g', color: colors.primary },
            { label: 'Carbs', val: totalCarbs + 'g', color: colors.info },
            { label: 'Fat', val: totalFat + 'g', color: colors.warning },
          ].map(m => (
            <View key={m.label} style={styles.macroCard}>
              <Text style={[styles.macroVal, { color: m.color }]}>{m.val}</Text>
              <Text style={styles.macroLabel}>{m.label}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Quick actions</Text>
        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('FoodTab')}>
            <Text style={styles.actionIcon}>F</Text>
            <Text style={styles.actionLabel}>Log food</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('WorkoutTab')}>
            <Text style={styles.actionIcon}>W</Text>
            <Text style={styles.actionLabel}>Log workout</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('VitaminsTab')}>
            <Text style={styles.actionIcon}>V</Text>
            <Text style={styles.actionLabel}>Vitamins</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tipCard}>
          <View style={styles.tipTag}><Text style={styles.tipTagText}>Daily tip</Text></View>
          <Text style={styles.tipText}>
            {totalProtein < 100
              ? `You're ${160 - totalProtein}g short on protein. Add chicken, paneer or Greek yogurt to your next meal.`
              : 'Great protein intake today! Stay hydrated and aim for 7-8 hours of sleep for muscle recovery.'}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.xl, paddingBottom: spacing.md },
  greeting: { fontSize: 22, fontWeight: '700', color: colors.textPrimary },
  headerSub: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  avatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border },
  avatarText: { fontSize: 13, fontWeight: '600', color: colors.primaryDark },
  scroll: { padding: spacing.xl, paddingBottom: 32, gap: 12 },
  heroCard: { backgroundColor: colors.surface, borderWidth: 0.5, borderColor: colors.border, borderRadius: radius.xl, padding: 18, ...shadow.card },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statusPill: { fontSize: 12, color: colors.primaryDark, backgroundColor: colors.primaryLight, paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.full, fontWeight: '700' },
  card: { backgroundColor: colors.surface, borderWidth: 0.5, borderColor: colors.border, borderRadius: radius.lg, padding: 16, ...shadow.soft },
  cardLabel: { fontSize: 12, color: colors.textSecondary, marginBottom: 6, fontWeight: '500' },
  calRow: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 10 },
  calBig: { fontSize: 28, fontWeight: '600', color: colors.textPrimary },
  calGoal: { fontSize: 14, color: colors.textSecondary },
  barWrap: { backgroundColor: colors.backgroundSecondary, borderRadius: 99, height: 10, overflow: 'hidden', marginBottom: 6 },
  bar: { height: 10, borderRadius: 99 },
  barLabels: { flexDirection: 'row', justifyContent: 'space-between' },
  barLabel: { fontSize: 11, color: colors.textSecondary },
  macroRow: { flexDirection: 'row', gap: 10 },
  macroCard: { flex: 1, backgroundColor: colors.surface, borderRadius: radius.lg, padding: 14, alignItems: 'center', borderWidth: 0.5, borderColor: colors.border },
  macroVal: { fontSize: 20, fontWeight: '600' },
  macroLabel: { fontSize: 11, color: colors.textSecondary, marginTop: 3 },
  sectionTitle: { fontSize: 13, fontWeight: '500', color: colors.textSecondary, marginTop: 4 },
  actionsRow: { flexDirection: 'row', gap: 10 },
  actionCard: { flex: 1, backgroundColor: colors.surface, borderRadius: radius.lg, padding: 14, alignItems: 'center', gap: 6, borderWidth: 0.5, borderColor: colors.border },
  actionIcon: { fontSize: 18, fontWeight: '700', color: colors.primary },
  actionLabel: { fontSize: 12, color: colors.textSecondary },
  tipCard: { backgroundColor: colors.primaryLight, borderRadius: radius.xl, padding: 16, borderWidth: 0.5, borderColor: colors.border },
  tipTag: { flexDirection: 'row', marginBottom: 8 },
  tipTagText: { fontSize: 11, color: colors.primaryDark, fontWeight: '500' },
  tipText: { fontSize: 13, color: colors.textPrimary, lineHeight: 20 },
});
