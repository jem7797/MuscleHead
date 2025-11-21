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
import { Ionicons } from "@expo/vector-icons";
import PrimaryButton from "./PrimaryButton";

interface ScheduleBuilderModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (schedule: Record<string, string>) => void;
  initialSchedule?: Record<string, string>;
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

  const handleSave = () => {
    onSave(schedule);
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
              <Ionicons name="close" size={22} color="#1f2a44" />
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
                  placeholderTextColor="#565757"
                  style={styles.dayText}
                  value={schedule[day]}
                  onChangeText={(value) => handleDayChange(day, value)}
                />
              ))}
            </View>

            <PrimaryButton
              label="Save"
              variant="default"
              onPress={handleSave}
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
    backgroundColor: "#fff",
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
    color: "#080808",
    borderColor: "#202c76",
    borderWidth: 2,
    borderRadius: 20,
    marginBottom: 12,
    
  },


  saveButton: {
    alignSelf: "center",
    width: 100,
    height: 45,
  },
});

export default ScheduleBuilderModal;

