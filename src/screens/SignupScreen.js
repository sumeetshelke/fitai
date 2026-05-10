import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Alert } from 'react-native';
import { colors, spacing, radius } from '../theme';
import { useApp } from '../context/AppContext';
import * as backend from '../services/backend';

export default function SignupScreen({ navigation }) {
  const { applyUser } = useApp();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  function validate() {
    const e = {};
    if (!name.trim()) e.name = 'Please enter your name';
    if (!email.includes('@')) e.email = 'Enter a valid email';
    if (password.length < 6) e.password = 'Password must be at least 6 characters';
    if (password !== confirm) e.confirm = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSignup() {
    if (!validate()) return;

    setSubmitting(true);
    try {
      const user = await backend.signup({ name, email, password });
      applyUser(user);
      navigation.navigate('Onboarding');
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
        <Text style={styles.title}>Create account</Text>
        <Text style={styles.sub}>Join thousands of gym rats tracking their journey with AI.</Text>

        <Field label="Full name" value={name} onChangeText={setName} placeholder="Your name" error={errors.name} />
        <Field label="Email address" value={email} onChangeText={setEmail} placeholder="you@email.com" keyboardType="email-address" error={errors.email} />
        <Field label="Password" value={password} onChangeText={setPassword} placeholder="Min 6 characters" secureTextEntry error={errors.password} />
        <Field label="Confirm password" value={confirm} onChangeText={setConfirm} placeholder="Repeat password" secureTextEntry error={errors.confirm} />
        {errors.form && <Text style={[styles.errorText, { marginBottom: 12 }]}>{errors.form}</Text>}

        <TouchableOpacity style={[styles.primaryBtn, submitting && { opacity: 0.7 }]} onPress={handleSignup} disabled={submitting}>
          <Text style={styles.primaryBtnText}>{submitting ? 'Creating account...' : 'Create account'}</Text>
        </TouchableOpacity>

        <Text style={styles.switchText}>
          Already have an account?{' '}
          <Text style={styles.link} onPress={() => navigation.navigate('Login')}>Sign in</Text>
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function Field({ label, error, ...props }) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput style={[styles.input, error && styles.inputError]} autoCapitalize="none" {...props} />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.xl, paddingTop: spacing.lg },
  backBtn: { marginBottom: 20 },
  backText: { fontSize: 16, color: colors.textSecondary },
  title: { fontSize: 22, fontWeight: '600', color: colors.textPrimary, marginBottom: 6 },
  sub: { fontSize: 13, color: colors.textSecondary, marginBottom: 24, lineHeight: 20 },
  label: { fontSize: 12, color: colors.textSecondary, marginBottom: 6 },
  input: { borderWidth: 0.5, borderColor: colors.border, borderRadius: radius.md, padding: 12, fontSize: 14, backgroundColor: colors.backgroundSecondary, color: colors.textPrimary },
  inputError: { borderColor: colors.error },
  errorText: { fontSize: 11, color: colors.error, marginTop: 4 },
  primaryBtn: { backgroundColor: colors.primary, padding: 16, borderRadius: radius.md, alignItems: 'center', marginTop: 8 },
  primaryBtnText: { color: colors.white, fontSize: 15, fontWeight: '600' },
  switchText: { textAlign: 'center', fontSize: 13, color: colors.textSecondary, marginTop: 20 },
  link: { color: colors.primary, fontWeight: '500' },
});
