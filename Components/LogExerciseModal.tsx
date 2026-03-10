import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import PrimaryButton from "./PrimaryButton";

interface LogExerciseModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: {
    exerciseName: string;
    sets: number;
    reps: number;
    weight: number | null;
  }) => Promise<void>;
}

const LogExerciseModal: React.FC<LogExerciseModalProps> = ({
  visible,
  onClose,
  onSubmit,
}) => {
  const [exerciseName, setExerciseName] = useState("");
  const [sets, setSets] = useState("");
  const [reps, setReps] = useState("");
  const [weight, setWeight] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    const trimmedName = exerciseName.trim();
    if (!trimmedName) {
      Alert.alert("Required", "Exercise name is required.");
      return;
    }

    const setsNum = parseInt(sets, 10);
    const repsNum = parseInt(reps, 10);
    const weightNum = weight.trim() ? parseFloat(weight) : null;

    if (isNaN(setsNum) || setsNum < 1) {
      Alert.alert("Invalid", "Sets must be at least 1.");
      return;
    }
    if (isNaN(repsNum) || repsNum < 0) {
      Alert.alert("Invalid", "Reps must be 0 or greater.");
      return;
    }
    if (weightNum !== null && (isNaN(weightNum) || weightNum < 0)) {
      Alert.alert("Invalid", "Weight must be 0 or greater.");
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        exerciseName: trimmedName,
        sets: setsNum,
        reps: repsNum,
        weight: weightNum,
      });
      setExerciseName("");
      setSets("");
      setReps("");
      setWeight("");
      onClose();
    } catch (e) {
      Alert.alert(
        "Error",
        e instanceof Error ? e.message : "Failed to log exercise."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting) onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={handleClose}
        />
        <View style={styles.modal}>
          <Text style={styles.title}>Log Exercise</Text>

          <Text style={styles.label}>Exercise name *</Text>
          <TextInput
            style={styles.input}
            value={exerciseName}
            onChangeText={setExerciseName}
            placeholder="e.g. Bench Press"
            placeholderTextColor="#9aa6bd"
            autoCapitalize="words"
          />

          <Text style={styles.label}>Sets</Text>
          <TextInput
            style={styles.input}
            value={sets}
            onChangeText={setSets}
            placeholder="3"
            placeholderTextColor="#9aa6bd"
            keyboardType="number-pad"
          />

          <Text style={styles.label}>Reps</Text>
          <TextInput
            style={styles.input}
            value={reps}
            onChangeText={setReps}
            placeholder="10"
            placeholderTextColor="#9aa6bd"
            keyboardType="number-pad"
          />

          <Text style={styles.label}>Weight (lb, optional)</Text>
          <TextInput
            style={styles.input}
            value={weight}
            onChangeText={setWeight}
            placeholder="135"
            placeholderTextColor="#9aa6bd"
            keyboardType="decimal-pad"
          />

          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleClose}
              disabled={submitting}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <PrimaryButton
              label={submitting ? "Logging..." : "Log"}
              onPress={handleSubmit}
              disabled={submitting}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modal: {
    width: "90%",
    maxWidth: 360,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1f2a44",
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#5a6a7e",
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#f5f7fb",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#1f2a44",
    borderWidth: 1,
    borderColor: "#e0e6f0",
    marginBottom: 16,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  cancelText: {
    fontSize: 16,
    color: "#5a6a7e",
    fontWeight: "500",
  },
});

export default LogExerciseModal;
