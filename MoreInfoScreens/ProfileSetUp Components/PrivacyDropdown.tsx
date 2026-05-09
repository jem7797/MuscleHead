import React from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  accent,
  borderSubtle,
  surfaceElevated,
  textPrimary,
  textSecondary,
} from "../../theme/colors";
import { muscleFigureShadowStyles } from "../../theme/muscleFigureShadow";

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
    <View style={[styles.dropdownOuter, muscleFigureShadowStyles.wrapper]}>
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
          color={textPrimary}
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
                  <Ionicons name="checkmark" size={20} color={accent} style={styles.checkIcon} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  dropdownOuter: {
    width: SCREEN_WIDTH * 0.85,
    alignSelf: "center",
    marginBottom: 24,
    zIndex: 1000,
  },
  dropdownContainer: {
    width: "100%",
    position: "relative",
  },
  dropdownButton: {
    backgroundColor: surfaceElevated,
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 2,
    borderColor: borderSubtle,
  },
  dropdownButtonSelected: {
    borderColor: accent,
  },
  dropdownButtonText: {
    color: textPrimary,
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
  },
  dropdownList: {
    backgroundColor: surfaceElevated,
    borderRadius: 14,
    maxHeight: 300,
    borderWidth: 1,
    borderColor: borderSubtle,
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
    backgroundColor: "rgba(232, 93, 4, 0.12)",
  },
  dropdownOptionLabel: {
    color: textPrimary,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },
  dropdownOptionDescription: {
    color: textSecondary,
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

