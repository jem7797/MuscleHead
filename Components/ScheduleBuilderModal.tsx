import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { borderSubtle, screenBackground, surfaceElevated, surfaceMuted, textPrimary, textSecondary } from "../theme/colors";
import { Ionicons } from "@expo/vector-icons";
import PrimaryButton from "./PrimaryButton";

interface ScheduleBuilderModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (schedule: Record<string, string>) => void | Promise<void>;
  initialSchedule?: Record<string, string>;
  saving?: boolean;
}

const dayKeys = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const dayPlaceholders = [
  "Monday (ex. Push Day)",
  "Tuesday (ex. Pull Day)",
  "Wednesday (ex. Leg Day)",
  "Thursday (ex. Push Day)",
  "Friday (ex. Push Day)",
  "Saturday (ex. Rest Day)",
  "Sunday (ex. Rest Day)",
];

const ScheduleBuilderModal: React.FC<ScheduleBuilderModalProps> = ({
  visible,
  onClose,
  onSave,
  initialSchedule,
  saving = false,
}) => {
  const [schedule, setSchedule] = useState<Record<string, string>>(
    initialSchedule || {
      Monday: "",
      Tuesday: "",
      Wednesday: "",
      Thursday: "",
      Friday: "",
      Saturday: "",
      Sunday: "",
    }
  );

  // Update schedule when initialSchedule prop changes
  useEffect(() => {
    if (initialSchedule) {
      setSchedule(initialSchedule);
    }
  }, [initialSchedule]);

  const handleDayChange = (day: string, value: string) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: value,
    }));
  };

  const handleSave = async () => {
    await onSave(schedule);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.modalOverlay}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalHeaderText}>Schedule Builder</Text>
            <Pressable onPress={onClose} style={styles.closeScheduleBuilderButton}>
              <Ionicons name="close" size={22} color={textPrimary} />
            </Pressable>
          </View>

          <ScrollView
      
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={true}
          >
            <View style={styles.dayInputTable}>
              {dayKeys.map((day, index) => (
                <TextInput
                  key={day}
                  placeholder={dayPlaceholders[index]}
                  placeholderTextColor={textSecondary}
                  style={styles.dayText}
                  value={schedule[day]}
                  onChangeText={(value) => handleDayChange(day, value)}
                  returnKeyType="done"
                  blurOnSubmit
                />
              ))}
            </View>

            <PrimaryButton
              label={saving ? "Saving..." : "Save"}
              variant="default"
              onPress={handleSave}
              disabled={saving}
              containerStyle={styles.saveButton}
            />
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    marginTop: 155,
    flex: 1,
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: surfaceElevated,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 30,
  },
  modalHeader: {
    flexDirection: "row",
    marginBottom: 10,
    alignItems: "center",
    justifyContent: "space-between",
  },
  modalHeaderText: {
    alignSelf: "center",
    fontSize: 15,
    fontWeight: "700",
    color: textPrimary,
  },
  closeScheduleBuilderButton: {
    padding: 6,
  },

  dayInputTable:{
    flexDirection:"column",
    alignItems:"center",
  
  },

  dayText: {
    width: "100%",
    minHeight: 60,
    fontSize: 16,
    padding: 12,
    color: textPrimary,
    backgroundColor: surfaceMuted,
    borderColor: borderSubtle,
    borderWidth: 1,
    borderRadius: 14,
    marginBottom: 12,
  },


  saveButton: {
    alignSelf: "center",
    width: 100,
    height: 45,
  },
});

export default ScheduleBuilderModal;

