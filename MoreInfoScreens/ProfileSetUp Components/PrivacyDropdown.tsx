import React from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface PrivacyOption {
  value: string;
  label: string;
  description: string;
}

interface PrivacyDropdownProps {
  options: PrivacyOption[];
  selectedPrivacy: string | null;
  isOpen: boolean;
  onToggle: () => void;
  onSelect: (value: string) => void;
}

const PrivacyDropdown: React.FC<PrivacyDropdownProps> = ({
  options,
  selectedPrivacy,
  isOpen,
  onToggle,
  onSelect,
}) => {
  const getSelectedLabel = () => {
    if (!selectedPrivacy) return "Select privacy setting";
    const option = options.find(opt => opt.value === selectedPrivacy);
    return option ? option.label : "Select privacy setting";
  };

  return (
    <View style={styles.dropdownContainer}>
      <TouchableOpacity 
        style={[
          styles.dropdownButton,
          selectedPrivacy && styles.dropdownButtonSelected
        ]} 
        onPress={onToggle}
      >
        <Text style={styles.dropdownButtonText}>{getSelectedLabel()}</Text>
        <Ionicons 
          name={isOpen ? "chevron-up" : "chevron-down"} 
          size={20} 
          color="#fff" 
        />
      </TouchableOpacity>

      {isOpen && (
        <View style={styles.dropdownList}>
          <ScrollView>
            {options.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.dropdownOption,
                  selectedPrivacy === option.value && styles.dropdownOptionSelected
                ]}
                onPress={() => onSelect(option.value)}
              >
                <Text style={styles.dropdownOptionLabel}>{option.label}</Text>
                <Text style={styles.dropdownOptionDescription}>{option.description}</Text>
                {selectedPrivacy === option.value && (
                  <Ionicons name="checkmark" size={20} color="#013cdeff" style={styles.checkIcon} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  dropdownContainer: {
    width: SCREEN_WIDTH * 0.85,
    zIndex: 1000,
    position: "relative",
    marginBottom: 24,
  },
  dropdownButton: {
    backgroundColor: "rgba(98, 98, 98, 0.67)",
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  dropdownButtonSelected: {
    borderColor: "#013cdeff",
  },
  dropdownButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
  },
  dropdownList: {
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    borderRadius: 14,
    maxHeight: 300,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    overflow: "hidden",
    position: "absolute",
    top: 52,
    width: "100%",
    zIndex: 1001,
    elevation: 10,
  },
  dropdownOption: {
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
    position: "relative",
  },
  dropdownOptionSelected: {
    backgroundColor: "rgba(1, 60, 222, 0.2)",
  },
  dropdownOptionLabel: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },
  dropdownOptionDescription: {
    color: "#aaa",
    fontSize: 13,
    lineHeight: 18,
    paddingRight: 30,
  },
  checkIcon: {
    position: "absolute",
    right: 18,
    top: 16,
  },
});

export default PrivacyDropdown;

