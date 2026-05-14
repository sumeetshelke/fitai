import React, { useState } from 'react';
import { Alert, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { colors, radius, spacing } from '../theme';
import * as backend from '../services/backend';

export default function ForgotPasswordScreen({ navigation, route }) {
  const [email, setEmail] = useState(route.params?.email || '');
  const [resetCode, setResetCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [codeRequested, setCodeRequested] = useState(false);
  const [message, setMessage] = useState('');

  async function requestCode() {
    if (!email.includes('@')) {
      Alert.alert('Check email', 'Enter the email address for your account.');
      return;
    }

    setSubmitting(true);
    try {
      const result = await backend.requestPasswordReset(email);
      setCodeRequested(true);
      setMessage(result.resetCode ? `Reset code: ${result.resetCode}` : result.message);
    } catch (error) {
      Alert.alert('Reset failed', error.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function savePassword() {
    if (!resetCode.trim()) {
      Alert.alert('Missing code', 'Enter the reset code.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Weak password', 'Password must be at least 6 characters.');
      return;
    }
    if (password !== confirm) {
      Alert.alert('Passwords do not match', 'Re-enter the same password.');
      return;
    }

    setSubmitting(true);
    try {
      await backend.resetPassword({ email, resetCode, password });
      Alert.alert('Password updated', 'Please sign in with your new password.', [
        { text: 'OK', onPress: () => navigation.navigate('Login') },
      ]);
    } catch (error) {
      Alert.alert('Reset failed', error.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Reset password</Text>
        <Text style={styles.sub}>Enter your account email, then use the reset code to create a new password.</Text>

        <Text style={styles.label}>Email address</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="you@email.com"
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TouchableOpacity style={[styles.primaryBtn, submitting && styles.disabled]} onPress={requestCode} disabled={submitting}>
          <Text style={styles.primaryBtnText}>{submitting ? 'Please wait...' : 'Get reset code'}</Text>
        </TouchableOpacity>

        {message ? <Text style={styles.message}>{message}</Text> : null}

        {codeRequested && (
          <View style={styles.resetArea}>
            <Text style={styles.label}>Reset code</Text>
            <TextInput style={styles.input} value={resetCode} onChangeText={setResetCode} placeholder="6 digit code" keyboardType="numeric" />

            <Text style={[styles.label, { marginTop: 14 }]}>New password</Text>
            <TextInput style={styles.input} value={password} onChangeText={setPassword} placeholder="Min 6 characters" secureTextEntry />

            <Text style={[styles.label, { marginTop: 14 }]}>Confirm password</Text>
            <TextInput style={styles.input} value={confirm} onChangeText={setConfirm} placeholder="Repeat password" secureTextEntry />

            <TouchableOpacity style={[styles.primaryBtn, submitting && styles.disabled]} onPress={savePassword} disabled={submitting}>
              <Text style={styles.primaryBtnText}>Update password</Text>
            </TouchableOpacity>
          </View>
        )}
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
  sub: { fontSize: 13, color: colors.textSecondary, marginBottom: 24, lineHeight: 20 },
  label: { fontSize: 12, color: colors.textSecondary, marginBottom: 6 },
  input: { borderWidth: 0.5, borderColor: colors.border, borderRadius: radius.md, padding: 12, fontSize: 14, backgroundColor: colors.backgroundSecondary, color: colors.textPrimary },
  primaryBtn: { backgroundColor: colors.primary, padding: 16, borderRadius: radius.md, alignItems: 'center', marginTop: 16 },
  disabled: { opacity: 0.7 },
  primaryBtnText: { color: colors.white, fontSize: 15, fontWeight: '600' },
  message: { marginTop: 14, color: colors.primaryDark, backgroundColor: colors.primaryLight, borderRadius: radius.md, padding: 12, fontSize: 13 },
  resetArea: { marginTop: 18 },
});
