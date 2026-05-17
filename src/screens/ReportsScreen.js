import React, { useState } from 'react';
import { Alert, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { colors, radius, spacing } from '../theme';
import { useApp } from '../context/AppContext';
import * as backend from '../services/backend';

const REPORTS = [
  { type: 'weekly', title: 'Download Weekly Report', label: 'Weekly Report' },
  { type: 'monthly', title: 'Download Monthly Report', label: 'Monthly Report' },
  { type: 'all-time', title: 'Download All-Time Report', label: 'All-Time Fitness Report' },
];

export default function ReportsScreen() {
  const { user, foodLog, workouts, dailyHistory, goalCal } = useApp();
  const [loadingType, setLoadingType] = useState(null);

  async function downloadReport(type) {
    setLoadingType(type);
    try {
      let report;
      try {
        report = await backend.getReport(type);
      } catch (error) {
        report = buildOfflineReport(type, user, foodLog, workouts, dailyHistory, goalCal);
      }

      const html = buildReportHtml(report);

      if (Platform.OS === 'web') {
        downloadHtmlReport(html, `${report.type}-fitai-report.html`);
        Alert.alert('Report ready', 'On web preview, the report downloads as HTML. Open it and use Print > Save as PDF.');
      } else {
        const { uri } = await Print.printToFileAsync({ html, base64: false });
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(uri, {
            mimeType: 'application/pdf',
            dialogTitle: report.title,
            UTI: 'com.adobe.pdf',
          });
        } else {
          Alert.alert('PDF saved', uri);
        }
      }
    } catch (error) {
      Alert.alert('Report failed', error.message || 'Could not generate report.');
    } finally {
      setLoadingType(null);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Reports</Text>
        <Text style={styles.sub}>Generate PDF-ready fitness analytics from your cloud data or offline cache.</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Fitness reports</Text>
          <Text style={styles.bodyText}>
            Reports include nutrition, workouts, progress, charts, insights, and recommendations.
          </Text>
          {REPORTS.map(report => (
            <TouchableOpacity
              key={report.type}
              style={styles.reportBtn}
              disabled={loadingType === report.type}
              onPress={() => downloadReport(report.type)}
            >
              <Text style={styles.reportBtnText}>
                {loadingType === report.type ? 'Generating...' : report.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.noteCard}>
          <Text style={styles.noteTitle}>Cloud update note</Text>
          <Text style={styles.bodyText}>
            Backend report APIs can be deployed to Render/Supabase without reinstalling the app. The Reports screen itself needs an Expo update or app rebuild once if users do not already have it.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function buildOfflineReport(type, user, foodLog, workouts, dailyHistory, goalCal) {
  const dates = getDatesForType(type, dailyHistory);
  const foodLogs = dates.flatMap(date => {
    const log = date === localDate(0) ? foodLog : dailyHistory[date]?.foodLog || {};
    return Object.entries(log).flatMap(([meal, items]) => (items || []).map(item => ({ ...item, meal, loggedAt: date })));
  });
  const workoutLogs = dates.flatMap(date => date === localDate(0) ? workouts : dailyHistory[date]?.workouts || []);
  const dayCount = Math.max(dates.length, 1);
  const caloriesByDate = group(foodLogs, 'loggedAt', 'cal');
  const workoutByDate = workoutLogs.reduce((acc, item) => {
    acc[item.loggedAt] = (acc[item.loggedAt] || 0) + 1;
    return acc;
  }, {});
  const completedSets = workoutLogs.reduce((sum, workout) => sum + (workout.sets || []).filter(set => set.done).length, 0);
  const totalSets = workoutLogs.reduce((sum, workout) => sum + (workout.sets || []).length, 0);
  const withinGoalDays = Object.values(caloriesByDate).filter(value => Math.abs(value - goalCal) <= 150).length;

  return {
    type,
    title: type === 'weekly' ? 'Weekly Report' : type === 'monthly' ? 'Monthly Report' : 'All-Time Fitness Report',
    dateRange: { startDate: dates[dates.length - 1] || 'All time', endDate: dates[0] || localDate(0) },
    generatedAt: new Date().toISOString(),
    user: user || { name: 'FitAI User' },
    nutrition: {
      averageDailyCalories: Math.round(sum(foodLogs, 'cal') / dayCount),
      averageDailyProtein: Math.round(sum(foodLogs, 'prot') / dayCount),
      averageDailyCarbs: Math.round(sum(foodLogs, 'carb') / dayCount),
      averageDailyFat: Math.round(sum(foodLogs, 'fat') / dayCount),
      waterIntake: null,
      withinGoalDays,
      goalCal,
    },
    workouts: {
      totalWorkoutDays: new Set(workoutLogs.map(item => item.loggedAt)).size,
      exercisesCompleted: workoutLogs.length,
      caloriesBurned: completedSets * 18,
      consistencyScore: totalSets ? Math.round((completedSets / totalSets) * 100) : 0,
    },
    progress: { weightChange: 0, bmiTrend: [], indicators: [`${withinGoalDays} days close to calorie goal`] },
    charts: {
      caloriesTrend: Object.entries(caloriesByDate).map(([date, value]) => ({ date, value })),
      macroPie: [
        { label: 'Protein', value: sum(foodLogs, 'prot') },
        { label: 'Carbs', value: sum(foodLogs, 'carb') },
        { label: 'Fat', value: sum(foodLogs, 'fat') },
      ],
      workoutFrequency: Object.entries(workoutByDate).map(([date, value]) => ({ date, value })),
      weightProgress: [],
    },
    insights: [
      `You stayed within calorie goals on ${withinGoalDays} day${withinGoalDays === 1 ? '' : 's'}.`,
      workoutLogs.length ? `You logged ${workoutLogs.length} workout exercise${workoutLogs.length === 1 ? '' : 's'}.` : 'No workouts logged in this period.',
      foodLogs.length ? 'Nutrition data is available from your offline cache.' : 'Log meals daily to improve report quality.',
    ],
    recommendations: [
      'Keep logging meals and workouts daily for better analytics.',
      'Aim for consistent protein across each meal.',
      'Review your workout frequency every week.',
    ],
  };
}

function buildReportHtml(report) {
  const maxCalories = Math.max(...report.charts.caloriesTrend.map(item => item.value), 1);
  const maxWorkout = Math.max(...report.charts.workoutFrequency.map(item => item.value), 1);
  const macroTotal = Math.max(report.charts.macroPie.reduce((sum, item) => sum + item.value, 0), 1);

  return `
<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    body { font-family: Arial, sans-serif; color: #111827; padding: 28px; }
    .cover { background: #0f766e; color: white; padding: 28px; border-radius: 18px; }
    .logo { font-size: 30px; font-weight: 800; }
    h1, h2 { margin: 0 0 10px; }
    section { margin-top: 22px; padding: 18px; border: 1px solid #e5e7eb; border-radius: 14px; }
    .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
    .metric { background: #f8fafc; padding: 12px; border-radius: 12px; }
    .metric b { display: block; font-size: 20px; color: #0f766e; }
    .bar { height: 16px; background: #e5e7eb; border-radius: 999px; overflow: hidden; margin: 7px 0; }
    .fill { height: 16px; background: #14b884; }
    .pie-row { display: flex; gap: 8px; margin: 8px 0; align-items: center; }
    .dot { width: 12px; height: 12px; border-radius: 6px; display: inline-block; }
    li { margin: 7px 0; }
    .muted { color: #64748b; }
  </style>
</head>
<body>
  <div class="cover">
    <div class="logo">FitAI</div>
    <h1>${escapeHtml(report.title)}</h1>
    <p>${escapeHtml(report.user?.name || 'FitAI User')} | ${escapeHtml(report.dateRange.startDate)} to ${escapeHtml(report.dateRange.endDate)}</p>
    <p>Generated ${new Date(report.generatedAt).toLocaleString()}</p>
  </div>

  <section>
    <h2>Nutrition Summary</h2>
    <div class="grid">
      <div class="metric"><b>${report.nutrition.averageDailyCalories}</b>Avg kcal/day</div>
      <div class="metric"><b>${report.nutrition.averageDailyProtein}g</b>Protein/day</div>
      <div class="metric"><b>${report.nutrition.averageDailyCarbs}g</b>Carbs/day</div>
      <div class="metric"><b>${report.nutrition.averageDailyFat}g</b>Fat/day</div>
    </div>
    <p class="muted">Water intake: ${report.nutrition.waterIntake || 'Not available'}</p>
  </section>

  <section>
    <h2>Workout Summary</h2>
    <div class="grid">
      <div class="metric"><b>${report.workouts.totalWorkoutDays}</b>Workout days</div>
      <div class="metric"><b>${report.workouts.exercisesCompleted}</b>Exercises</div>
      <div class="metric"><b>${report.workouts.caloriesBurned}</b>Est. kcal burned</div>
      <div class="metric"><b>${report.workouts.consistencyScore}%</b>Consistency</div>
    </div>
  </section>

  <section>
    <h2>Progress Tracking</h2>
    <p>Weight change: <b>${report.progress.weightChange || 0} kg</b></p>
    <p>BMI trend: ${report.progress.bmiTrend?.length ? 'Available' : 'Not enough data yet'}</p>
    <ul>${report.progress.indicators.map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul>
  </section>

  <section>
    <h2>Charts & Graphs</h2>
    <h3>Calories Trend</h3>
    ${report.charts.caloriesTrend.map(item => `<div>${escapeHtml(item.date)}<div class="bar"><div class="fill" style="width:${Math.min((item.value / maxCalories) * 100, 100)}%"></div></div>${item.value} kcal</div>`).join('') || '<p>No calorie trend data.</p>'}
    <h3>Macronutrient Split</h3>
    ${report.charts.macroPie.map((item, i) => `<div class="pie-row"><span class="dot" style="background:${['#14b884', '#377dff', '#f59e0b'][i]}"></span>${escapeHtml(item.label)}: ${Math.round((item.value / macroTotal) * 100)}%</div>`).join('')}
    <h3>Workout Frequency</h3>
    ${report.charts.workoutFrequency.map(item => `<div>${escapeHtml(item.date)}<div class="bar"><div class="fill" style="width:${Math.min((item.value / maxWorkout) * 100, 100)}%"></div></div>${item.value} exercise(s)</div>`).join('') || '<p>No workout frequency data.</p>'}
    <h3>Weight Progress</h3>
    ${report.charts.weightProgress?.map(item => `<p>${escapeHtml(item.date)}: ${item.value} kg</p>`).join('') || '<p>No weight data yet.</p>'}
  </section>

  <section>
    <h2>Insights</h2>
    <ul>${report.insights.map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul>
  </section>

  <section>
    <h2>Recommendations</h2>
    <ul>${report.recommendations.map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul>
  </section>
</body>
</html>`;
}

function downloadHtmlReport(html, filename) {
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function getDatesForType(type, history) {
  if (type === 'all-time') return Object.keys(history).sort().reverse().concat(localDate(0));
  const length = type === 'monthly' ? 30 : 7;
  return Array.from({ length }, (_, index) => localDate(-index));
}

function localDate(offsetDays) {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function sum(items, key) {
  return items.reduce((total, item) => total + Number(item[key] || 0), 0);
}

function group(items, dateKey, valueKey) {
  return items.reduce((acc, item) => {
    acc[item[dateKey]] = (acc[item[dateKey]] || 0) + Number(item[valueKey] || 0);
    return acc;
  }, {});
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { padding: spacing.xl, paddingBottom: spacing.md, borderBottomWidth: 0.5, borderColor: colors.border },
  title: { fontSize: 22, fontWeight: '700', color: colors.textPrimary },
  sub: { fontSize: 13, color: colors.textSecondary, marginTop: 4, lineHeight: 19 },
  scroll: { padding: spacing.xl, paddingBottom: 32 },
  card: { backgroundColor: colors.surface, borderWidth: 0.5, borderColor: colors.border, borderRadius: radius.xl, padding: 16, marginBottom: 14 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary, marginBottom: 8 },
  bodyText: { fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginBottom: 12 },
  reportBtn: { backgroundColor: colors.primary, padding: 14, borderRadius: radius.md, alignItems: 'center', marginTop: 10 },
  reportBtnText: { color: colors.white, fontSize: 14, fontWeight: '700' },
  noteCard: { backgroundColor: colors.primaryLight, borderRadius: radius.xl, padding: 16, borderWidth: 0.5, borderColor: colors.border },
  noteTitle: { fontSize: 14, color: colors.primaryDark, fontWeight: '700', marginBottom: 6 },
});
