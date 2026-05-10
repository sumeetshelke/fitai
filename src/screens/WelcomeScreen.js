import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { colors, spacing, radius, shadow } from '../theme';

export default function WelcomeScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.logoArea}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoText}>F</Text>
        </View>
        <Text style={styles.appName}>FitAI</Text>
        <Text style={styles.tagline}>Your dataset-powered gym companion</Text>
      </View>

      <View style={styles.features}>
        {[
          'Nutrition estimates from food datasets',
          'Calorie and macro tracking',
          'Workout logging',
          'Vitamin and nutrient tracking',
        ].map((f, i) => (
          <Text key={i} style={styles.featureItem}>{f}</Text>
        ))}
      </View>

      <View style={styles.buttons}>
        <TouchableOpacity style={styles.primaryBtn} onPress={() => navigation.navigate('Signup')}>
          <Text style={styles.primaryBtnText}>Get started - it is free</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.ghostBtn} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.ghostBtnText}>I already have an account</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  logoArea: { alignItems: 'center', paddingTop: 72, paddingBottom: 34 },
  logoCircle: { width: 86, height: 86, borderRadius: 26, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 16, ...shadow.card },
  logoText: { fontSize: 36, color: colors.white, fontWeight: '700' },
  appName: { fontSize: 34, fontWeight: '700', color: colors.textPrimary },
  tagline: { fontSize: 14, color: colors.textSecondary, marginTop: 6 },
  features: { backgroundColor: colors.surface, marginHorizontal: spacing.xl, borderRadius: radius.xl, padding: spacing.lg, gap: 12, borderWidth: 0.5, borderColor: colors.border, ...shadow.soft },
  featureItem: { fontSize: 14, color: colors.textPrimary, lineHeight: 22 },
  buttons: { padding: spacing.xl, marginTop: 'auto', gap: 12 },
  primaryBtn: { backgroundColor: colors.primary, padding: 16, borderRadius: radius.md, alignItems: 'center' },
  primaryBtnText: { color: colors.white, fontSize: 15, fontWeight: '600' },
  ghostBtn: { borderWidth: 0.5, borderColor: colors.border, padding: 14, borderRadius: radius.md, alignItems: 'center' },
  ghostBtnText: { color: colors.textPrimary, fontSize: 15 },
});
