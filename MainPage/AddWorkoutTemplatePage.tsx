import React, { useState, useMemo } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Modal,
  FlatList,
  Alert,
} from "react-native";
import { screenBackground } from "../theme/colors";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import PageHeader from "../Components/PageHeader";
import PrimaryButton from "../Components/PrimaryButton";
import { useWorkoutTemplate } from "../Contexts/WorkoutTemplateContext";
import { useMovements } from "../Contexts/MovementContext";
import { useRoutines } from "../Contexts/RoutinesContext";
import { createWorkoutTemplate } from "../Services/workoutTemplateApi";

const DEFAULT_SETS = 3;
const DEFAULT_REPS = 10;

const AddWorkoutTemplatePage = () => {
  const navigation = useNavigation<any>();
  const { state, setName, setDefaultSets, addExercise, removeExercise, updateExercise, resetState } = useWorkoutTemplate();
  const { addRoutineOptimistically } = useRoutines();
  const { movements } = useMovements();
  const [showPicker, setShowPicker] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pickerSearch, setPickerSearch] = useState("");

  const movementById = useMemo(() => {
    const map: Record<number, string> = {};
    movements.forEach((m) => {
      map[m.id] = m.name;
    });
    return map;
  }, [movements]);

  const movementsByArea = useMemo(() => {
    const groups: Record<string, { id: number; name: string }[]> = {};
    movements.forEach((m) => {
      const area = m.areaOfActivation || "Other";
      if (!groups[area]) groups[area] = [];
      groups[area].push({ id: m.id, name: m.name });
    });
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  }, [movements]);

  const filteredMovementsByArea = useMemo(() => {
    const q = pickerSearch.trim().toLowerCase();
    if (!q) return movementsByArea;
    const byName = new Set(
      movements.filter((m) => m.name.toLowerCase().includes(q)).map((m) => m.id)
    );
    const byArea = new Set(
      movements
        .filter((m) => (m.areaOfActivation || "").toLowerCase().includes(q))
        .map((m) => m.id)
    );
    const ids = new Set([...byName, ...byArea]);
    const filtered = movements.filter((m) => ids.has(m.id));
    const groups: Record<string, { id: number; name: string }[]> = {};
    filtered.forEach((m) => {
      const area = m.areaOfActivation || "Other";
      if (!groups[area]) groups[area] = [];
      groups[area].push({ id: m.id, name: m.name });
    });
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  }, [movementsByArea, movements, pickerSearch]);

  const handleAddMovement = (exerciseId: number) => {
    addExercise({
      exerciseId,
      orderIndex: state.exercises.length,
      sets: state.sets,
      reps: DEFAULT_REPS,
    });
    setShowPicker(false);
    setPickerSearch("");
  };

  const handleClosePicker = () => {
    setShowPicker(false);
    setPickerSearch("");
  };

  const handleSave = async () => {
    const trimmedName = state.name.trim();
    if (!trimmedName) {
      Alert.alert("Missing name", "Please enter a template name.");
      return;
    }
    if (state.exercises.length === 0) {
      Alert.alert("No exercises", "Add at least one exercise to the template.");
      return;
    }
    setSaving(true);
    try {
      const created = await createWorkoutTemplate(trimmedName, state.sets, state.exercises);
      addRoutineOptimistically({
        id: created?.id,
        name: trimmedName,
        exercises: state.exercises,
      });
      resetState();
      navigation.goBack();
    } catch (e) {
      Alert.alert("Save failed", "Could not save template. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.mainContainer}>
      <PageHeader title="Add Workout Template" paddingTop={50} paddingHorizontal={16} />

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Template name</Text>
          <TextInput
            style={styles.textInput}
            placeholder="e.g. Push Day, Leg Day"
            placeholderTextColor="#999"
            value={state.name}
            onChangeText={setName}
            returnKeyType="done"
            blurOnSubmit
          />
        </View>

        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Default sets (for new exercises)</Text>
          <TextInput
            style={styles.textInput}
            placeholder="e.g. 3"
            placeholderTextColor="#999"
            value={String(state.sets)}
            onChangeText={(t) => {
              const n = parseInt(t, 10);
              if (!isNaN(n) && n >= 0) setDefaultSets(n);
              if (t === "") setDefaultSets(0);
            }}
            keyboardType="number-pad"
            returnKeyType="done"
            blurOnSubmit
          />
        </View>

        <Text style={styles.sectionTitle}>Exercises</Text>

        {state.exercises.map((ex) => (
          <View key={ex.orderIndex} style={styles.exerciseBox}>
            {state.exercises.length > 1 && (
              <TouchableOpacity
                onPress={() => removeExercise(ex.orderIndex)}
                style={styles.removeButton}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="trash-outline" size={18} color="#888" />
              </TouchableOpacity>
            )}
            <Text style={styles.exerciseName} numberOfLines={2}>
              {movementById[ex.exerciseId] ?? `Exercise #${ex.exerciseId}`}
            </Text>
            <View style={styles.targetRow}>
              <View style={styles.targetField}>
                <Text style={styles.targetLabel}>Sets</Text>
                <TextInput
                  style={styles.targetInput}
                  value={String(ex.sets)}
                  onChangeText={(t) => {
                    const n = parseInt(t, 10);
                    if (!isNaN(n) && n >= 0) updateExercise(ex.orderIndex, { sets: n });
                    if (t === "") updateExercise(ex.orderIndex, { sets: 0 });
                  }}
                  keyboardType="number-pad"
                  returnKeyType="done"
                  blurOnSubmit
                  placeholder="0"
                  placeholderTextColor="#999"
                />
              </View>
            </View>
          </View>
        ))}

        <TouchableOpacity onPress={() => setShowPicker(true)} style={styles.addButton}>
          <Ionicons name="add" size={18} color="#888" />
          <Text style={styles.addButtonText}>Add exercise</Text>
        </TouchableOpacity>
      </ScrollView>

      <PrimaryButton
        label={saving ? "Saving..." : "Save template"}
        variant="footer"
        onPress={handleSave}
        disabled={saving}
      />

      <Modal visible={showPicker} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Choose exercise</Text>
              <TouchableOpacity onPress={handleClosePicker} style={styles.modalClose}>
                <Ionicons name="close" size={24} color="#e85d04" />
              </TouchableOpacity>
            </View>
            <View style={styles.searchBarContainer}>
              <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search by exercise or muscle group (e.g. barbell row, abs)"
                placeholderTextColor="#999"
                value={pickerSearch}
                onChangeText={setPickerSearch}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="done"
                blurOnSubmit
              />
              {pickerSearch.length > 0 && (
                <TouchableOpacity onPress={() => setPickerSearch("")} style={styles.searchClear}>
                  <Ionicons name="close-circle" size={20} color="#999" />
                </TouchableOpacity>
              )}
            </View>
            <FlatList
              data={filteredMovementsByArea}
              keyExtractor={([area]) => area}
              renderItem={({ item: [area, items] }) => (
                <View style={styles.pickerSection}>
                  <Text style={styles.pickerAreaTitle}>{area}</Text>
                  {items.map((m) => (
                    <TouchableOpacity
                      key={m.id}
                      style={styles.pickerItem}
                      onPress={() => handleAddMovement(m.id)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.pickerItemText}>{m.name}</Text>
                      <Ionicons name="add-circle-outline" size={20} color="#e85d04" />
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              style={styles.pickerList}
              contentContainerStyle={styles.pickerListContent}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: screenBackground,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  inputSection: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 18,
    fontWeight: "600",
    color: "#e85d04",
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: "#fafafa",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#e85d04",
    borderWidth: 1,
    borderColor: "#e8e8e8",
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#e85d04",
    marginBottom: 12,
  },
  exerciseBox: {
    backgroundColor: "#fafafa",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e8e8e8",
    position: "relative",
  },
  removeButton: {
    position: "absolute",
    top: 8,
    right: 8,
    zIndex: 10,
  },
  exerciseName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#e85d04",
    marginBottom: 10,
    paddingRight: 28,
  },
  targetRow: {
    flexDirection: "row",
    gap: 16,
  },
  targetField: {
    flex: 1,
  },
  targetLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
    marginBottom: 4,
  },
  targetInput: {
    backgroundColor: screenBackground,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    fontSize: 15,
    color: "#e85d04",
    borderWidth: 1,
    borderColor: "#e0e6f0",
  },
  addButton: {
    backgroundColor: screenBackground,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#e8e8e8",
  },
  addButtonText: {
    color: "#666",
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: screenBackground,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e6f0",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#e85d04",
  },
  modalClose: {
    padding: 4,
  },
  searchBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 12,
    backgroundColor: "#fafafa",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e8e8e8",
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 15,
    color: "#e85d04",
  },
  searchClear: {
    padding: 4,
  },
  pickerList: {
    maxHeight: 400,
  },
  pickerListContent: {
    paddingBottom: 24,
  },
  pickerSection: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  pickerAreaTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#666",
    marginBottom: 8,
  },
  pickerItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: "#fafafa",
    borderRadius: 8,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: "#e8e8e8",
  },
  pickerItemText: {
    fontSize: 15,
    color: "#e85d04",
    flex: 1,
  },
});

export default AddWorkoutTemplatePage;
