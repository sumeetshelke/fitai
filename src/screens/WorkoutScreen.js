import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, TouchableOpacity, TextInput, Modal } from 'react-native';
import { colors, spacing, radius } from '../theme';
import { useApp } from '../context/AppContext';

export default function WorkoutScreen() {
  const { workouts, setWorkouts, addWorkout, updateWorkout } = useApp();
  const [modalVisible, setModalVisible] = useState(false);
  const [exerciseName, setExerciseName] = useState('');
  const [sets, setSets] = useState([{ reps: '', weight: '', done: false }]);

  function addSet() { setSets(prev => [...prev, { reps: '', weight: '', done: false }]); }

  async function saveWorkout() {
    if (!exerciseName.trim()) return;
    await addWorkout({ exercise: exerciseName, sets: sets.filter(s => s.reps) });
    setModalVisible(false);
    setExerciseName(''); setSets([{ reps: '', weight: '', done: false }]);
  }

  function toggleSet(wIdx, sIdx) {
    const nextWorkouts = workouts.map((w, wi) => wi !== wIdx ? w : {
      ...w, sets: w.sets.map((s, si) => si !== sIdx ? s : { ...s, done: !s.done })
    });
    setWorkouts(nextWorkouts);
    const nextWorkout = nextWorkouts[wIdx];
    updateWorkout(nextWorkout.id, { sets: nextWorkout.sets }).catch(() => {});
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Workout</Text>
        <Text style={styles.sub}>{workouts.length} exercise{workouts.length !== 1 ? 's' : ''} logged today</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {workouts.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🏋️</Text>
            <Text style={styles.emptyText}>No exercises logged yet</Text>
            <Text style={styles.emptySub}>Tap the button below to start tracking</Text>
          </View>
        )}
        {workouts.map((w, wIdx) => {
          const done = w.sets.filter(s => s.done).length;
          return (
            <View key={wIdx} style={styles.card}>
              <View style={styles.exerciseHeader}>
                <Text style={styles.exerciseName}>{w.exercise}</Text>
                <View style={[styles.badge, done === w.sets.length ? styles.badgeGreen : styles.badgeAmber]}>
                  <Text style={[styles.badgeText, done === w.sets.length ? styles.badgeTextGreen : styles.badgeTextAmber]}>
                    {done === w.sets.length ? 'Done' : `${done}/${w.sets.length} sets`}
                  </Text>
                </View>
              </View>
              <View style={styles.setHeader}>
                <Text style={[styles.setCol, { flex: 0.5 }]}>Set</Text>
                <Text style={styles.setCol}>Reps</Text>
                <Text style={styles.setCol}>Weight (kg)</Text>
                <Text style={[styles.setCol, { flex: 0.5 }]}>Done</Text>
              </View>
              {w.sets.map((s, sIdx) => (
                <View key={sIdx} style={styles.setRow}>
                  <Text style={[styles.setVal, { flex: 0.5, color: colors.textSecondary }]}>{sIdx + 1}</Text>
                  <Text style={styles.setVal}>{s.reps || '—'}</Text>
                  <Text style={styles.setVal}>{s.weight ? s.weight + ' kg' : '—'}</Text>
                  <TouchableOpacity style={[styles.checkBtn, s.done && styles.checkBtnDone, { flex: 0.5 }]} onPress={() => toggleSet(wIdx, sIdx)}>
                    <Text style={{ color: s.done ? colors.white : colors.textSecondary, fontSize: 12 }}>{s.done ? '✓' : '○'}</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          );
        })}
      </ScrollView>

      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <Text style={styles.fabText}>+ Add exercise</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setModalVisible(false)}>
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Log exercise</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.closeBtn}>✕</Text>
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={{ padding: spacing.xl }} keyboardShouldPersistTaps="handled">
            <Text style={styles.fieldLabel}>Exercise name</Text>
            <TextInput style={styles.input} value={exerciseName} onChangeText={setExerciseName} placeholder="e.g. Bench press, Squats, Deadlift" />

            <Text style={[styles.fieldLabel, { marginTop: 18 }]}>Sets</Text>
            {sets.map((set, i) => (
              <View key={i} style={styles.setInputRow}>
                <Text style={styles.setNumLabel}>Set {i + 1}</Text>
                <TextInput style={[styles.input, { flex: 1 }]} value={set.reps} onChangeText={v => setSets(prev => prev.map((s, idx) => idx === i ? { ...s, reps: v } : s))} placeholder="Reps" keyboardType="numeric" />
                <TextInput style={[styles.input, { flex: 1 }]} value={set.weight} onChangeText={v => setSets(prev => prev.map((s, idx) => idx === i ? { ...s, weight: v } : s))} placeholder="kg" keyboardType="numeric" />
              </View>
            ))}
            <TouchableOpacity style={styles.addSetBtn} onPress={addSet}>
              <Text style={styles.addSetBtnText}>+ Add set</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveBtn} onPress={saveWorkout}>
              <Text style={styles.saveBtnText}>Save exercise</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { padding: spacing.xl, paddingBottom: spacing.md, borderBottomWidth: 0.5, borderColor: colors.border },
  title: { fontSize: 18, fontWeight: '500', color: colors.textPrimary },
  sub: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  scroll: { padding: spacing.xl, paddingBottom: 100 },
  emptyState: { alignItems: 'center', paddingTop: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 16, fontWeight: '500', color: colors.textPrimary },
  emptySub: { fontSize: 13, color: colors.textSecondary, marginTop: 6 },
  card: { backgroundColor: colors.background, borderWidth: 0.5, borderColor: colors.border, borderRadius: radius.lg, padding: 14, marginBottom: 12 },
  exerciseHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  exerciseName: { fontSize: 15, fontWeight: '500', color: colors.textPrimary },
  badge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 99 },
  badgeGreen: { backgroundColor: '#EAF3DE' },
  badgeAmber: { backgroundColor: '#FAEEDA' },
  badgeText: { fontSize: 11, fontWeight: '500' },
  badgeTextGreen: { color: '#27500A' },
  badgeTextAmber: { color: '#633806' },
  setHeader: { flexDirection: 'row', marginBottom: 6 },
  setCol: { flex: 1, fontSize: 11, color: colors.textSecondary, fontWeight: '500' },
  setRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderTopWidth: 0.5, borderColor: colors.border },
  setVal: { flex: 1, fontSize: 14, color: colors.textPrimary },
  checkBtn: { width: 28, height: 28, borderRadius: 14, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  checkBtnDone: { backgroundColor: colors.primary, borderColor: colors.primary },
  fab: { position: 'absolute', bottom: 24, alignSelf: 'center', backgroundColor: colors.primary, paddingHorizontal: 28, paddingVertical: 14, borderRadius: 99, elevation: 6, shadowColor: colors.primary, shadowOpacity: 0.4, shadowRadius: 12, shadowOffset: { width: 0, height: 4 } },
  fabText: { color: colors.white, fontSize: 14, fontWeight: '600' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.xl, borderBottomWidth: 0.5, borderColor: colors.border },
  modalTitle: { fontSize: 17, fontWeight: '600', color: colors.textPrimary },
  closeBtn: { fontSize: 18, color: colors.textSecondary, padding: 4 },
  fieldLabel: { fontSize: 12, color: colors.textSecondary, marginBottom: 6 },
  input: { borderWidth: 0.5, borderColor: colors.border, borderRadius: radius.md, padding: 12, fontSize: 14, backgroundColor: colors.backgroundSecondary, color: colors.textPrimary },
  setInputRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  setNumLabel: { fontSize: 13, color: colors.textSecondary, width: 40 },
  addSetBtn: { borderWidth: 0.5, borderColor: colors.border, borderStyle: 'dashed', borderRadius: radius.md, padding: 12, alignItems: 'center', marginBottom: 16 },
  addSetBtnText: { fontSize: 13, color: colors.textSecondary },
  saveBtn: { backgroundColor: colors.primary, padding: 14, borderRadius: radius.md, alignItems: 'center' },
  saveBtnText: { color: colors.white, fontWeight: '600', fontSize: 14 },
});
