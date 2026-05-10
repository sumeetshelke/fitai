// src/components/UI.js
// Shared reusable components used across all screens

import React from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ActivityIndicator, StyleSheet,
} from 'react-native';
import { colors, spacing, radius, fontSize, fontWeight } from '../theme';

// ── Button ────────────────────────────────────────────────────
export function Button({ title, onPress, variant = 'primary', disabled, loading, style }) {
  const isPrimary = variant === 'primary';
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.btn,
        isPrimary ? styles.btnPrimary : styles.btnGhost,
        (disabled || loading) && styles.btnDisabled,
        style,
      ]}
      activeOpacity={0.85}
    >
      {loading
        ? <ActivityIndicator color={isPrimary ? '#fff' : colors.primary} size="small" />
        : <Text style={[styles.btnText, !isPrimary && styles.btnTextGhost]}>{title}</Text>
      }
    </TouchableOpacity>
  );
}

// ── Input field ───────────────────────────────────────────────
export function Input({ label, error, style, ...props }) {
  return (
    <View style={[styles.inputWrap, style]}>
      {label ? <Text style={styles.inputLabel}>{label}</Text> : null}
      <TextInput
        style={[styles.input, error && styles.inputError]}
        placeholderTextColor={colors.textMuted}
        {...props}
      />
      {error ? <Text style={styles.inputErrorText}>{error}</Text> : null}
    </View>
  );
}

// ── Card ──────────────────────────────────────────────────────
export function Card({ children, style }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

// ── Section title ─────────────────────────────────────────────
export function SectionTitle({ children, style }) {
  return <Text style={[styles.sectionTitle, style]}>{children}</Text>;
}

// ── Badge ─────────────────────────────────────────────────────
export function Badge({ label, color = 'green' }) {
  const colorMap = {
    green: { bg: colors.successLight, text: colors.success },
    amber: { bg: colors.warningLight, text: '#633806' },
    blue: { bg: colors.infoLight, text: '#0C447C' },
    red: { bg: colors.dangerLight, text: '#A32D2D' },
  };
  const c = colorMap[color] || colorMap.green;
  return (
    <View style={[styles.badge, { backgroundColor: c.bg }]}>
      <Text style={[styles.badgeText, { color: c.text }]}>{label}</Text>
    </View>
  );
}

// ── AI tag ────────────────────────────────────────────────────
export function AITag({ label = 'AI' }) {
  return (
    <View style={styles.aiTag}>
      <View style={styles.aiDot} />
      <Text style={styles.aiTagText}>{label}</Text>
    </View>
  );
}

// ── Progress bar ──────────────────────────────────────────────
export function ProgressBar({ value, max, color = colors.primary }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <View style={styles.progressWrap}>
      <View style={[styles.progressFill, { width: `${pct}%`, backgroundColor: color }]} />
    </View>
  );
}

// ── Divider ───────────────────────────────────────────────────
export function Divider({ label }) {
  return (
    <View style={styles.divider}>
      <View style={styles.dividerLine} />
      {label ? <Text style={styles.dividerLabel}>{label}</Text> : null}
      {label ? <View style={styles.dividerLine} /> : null}
    </View>
  );
}

// ── Chip ──────────────────────────────────────────────────────
export function Chip({ label, active, onPress }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.chip, active && styles.chipActive]}
      activeOpacity={0.7}
    >
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    padding: 14,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPrimary: { backgroundColor: colors.primary },
  btnGhost: { backgroundColor: 'transparent', borderWidth: 0.5, borderColor: colors.border },
  btnDisabled: { opacity: 0.45 },
  btnText: { color: '#fff', fontSize: fontSize.base, fontWeight: fontWeight.medium },
  btnTextGhost: { color: colors.textPrimary },

  inputWrap: { marginBottom: spacing.md },
  inputLabel: { fontSize: fontSize.sm, color: colors.textSecondary, marginBottom: 6 },
  input: {
    borderWidth: 0.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: 12,
    fontSize: fontSize.base,
    color: colors.textPrimary,
    backgroundColor: colors.backgroundSecondary,
  },
  inputError: { borderColor: colors.danger },
  inputErrorText: { fontSize: fontSize.xs, color: colors.danger, marginTop: 4 },

  card: {
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    borderWidth: 0.5,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },

  sectionTitle: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: spacing.sm,
    marginTop: spacing.xs,
  },

  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  badgeText: { fontSize: fontSize.xs, fontWeight: fontWeight.medium },

  aiTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.full,
    alignSelf: 'flex-start',
    marginBottom: spacing.sm,
  },
  aiDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.primary },
  aiTagText: { fontSize: fontSize.xs, color: colors.primaryDark, fontWeight: fontWeight.medium },

  progressWrap: {
    height: 8,
    backgroundColor: colors.borderLight,
    borderRadius: radius.full,
    overflow: 'hidden',
    marginVertical: 6,
  },
  progressFill: { height: 8, borderRadius: radius.full },

  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: spacing.lg, gap: spacing.sm },
  dividerLine: { flex: 1, height: 0.5, backgroundColor: colors.border },
  dividerLabel: { fontSize: fontSize.sm, color: colors.textSecondary },

  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: radius.full,
    borderWidth: 0.5,
    borderColor: colors.border,
    backgroundColor: 'transparent',
  },
  chipActive: { backgroundColor: colors.primaryLight, borderColor: '#5DCAA5' },
  chipText: { fontSize: fontSize.sm, color: colors.textSecondary },
  chipTextActive: { color: colors.primaryDark, fontWeight: fontWeight.medium },
});
