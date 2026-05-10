import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { colors, spacing, radius } from '../theme';
import { useApp } from '../context/AppContext';
import * as backend from '../services/backend';

export default function LoginScreen({ navigation }) {
  const { applyUser } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  async function handleLogin() {
    const e = {};
    if (!email.includes('@')) e.email = 'Enter a valid email';
    if (!password) e.password = 'Password is required';
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    setSubmitting(true);
    try {
      const user = await backend.login({ email, password });
      applyUser(user);
      navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
    } catch (error) {
      setErrors({ form: error.message });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.sub}>Sign in to continue your fitness journey.</Text>

        <Text style={styles.label}>Email address</Text>
        <TextInput style={[styles.input, errors.email && styles.inputError]} value={email} onChangeText={setEmail} placeholder="you@email.com" keyboardType="email-address" autoCapitalize="none" />
        {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

        <Text style={[styles.label, { marginTop: 14 }]}>Password</Text>
        <TextInput style={[styles.input, errors.password && styles.inputError]} value={password} onChangeText={setPassword} placeholder="Your password" secureTextEntry />
        {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
        {errors.form && <Text style={[styles.errorText, { marginTop: 10 }]}>{errors.form}</Text>}

        <TouchableOpacity style={styles.forgotBtn}>
          <Text style={styles.forgotText}>Forgot password?</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.primaryBtn, submitting && { opacity: 0.7 }]} onPress={handleLogin} disabled={submitting}>
          <Text style={styles.primaryBtnText}>{submitting ? 'Signing in...' : 'Sign in'}</Text>
        </TouchableOpacity>

        <Text style={styles.switchText}>
          New here?{' '}
          <Text style={styles.link} onPress={() => navigation.navigate('Signup')}>Create account</Text>
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.xl, paddingTop: spacing.lg },
  backBtn: { marginBottom: 20 },
  backText: { fontSize: 16, color: colors.textSecondary },
  title: { fontSize: 22, fontWeight: '600', color: colors.textPrimary, marginBottom: 6 },
  sub: { fontSize: 13, color: colors.textSecondary, marginBottom: 24 },
  label: { fontSize: 12, color: colors.textSecondary, marginBottom: 6 },
  input: { borderWidth: 0.5, borderColor: colors.border, borderRadius: radius.md, padding: 12, fontSize: 14, backgroundColor: colors.backgroundSecondary, color: colors.textPrimary },
  inputError: { borderColor: colors.error },
  errorText: { fontSize: 11, color: colors.error, marginTop: 4 },
  forgotBtn: { alignSelf: 'flex-end', marginTop: 8, marginBottom: 20 },
  forgotText: { fontSize: 12, color: colors.primary },
  primaryBtn: { backgroundColor: colors.primary, padding: 16, borderRadius: radius.md, alignItems: 'center' },
  primaryBtnText: { color: colors.white, fontSize: 15, fontWeight: '600' },
  switchText: { textAlign: 'center', fontSize: 13, color: colors.textSecondary, marginTop: 20 },
  link: { color: colors.primary, fontWeight: '500' },
});
