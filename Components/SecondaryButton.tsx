import React from "react";
import { Text, TouchableOpacity, StyleSheet } from "react-native";

import { borderSubtle, surfaceMuted, textSecondary } from "../theme/colors";
interface SecondaryButtonProps {
  onPress: () => void;
  label: string;
  variant?: "outline" | "ghost";
  disabled?: boolean;
}

const SecondaryButton: React.FC<SecondaryButtonProps> = ({
  onPress,
  label,
  variant = "outline",
  disabled = false,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        styles[`button${variant.charAt(0).toUpperCase() + variant.slice(1)}`],
        disabled && styles.buttonDisabled,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <Text style={[
        styles.buttonText,
        styles[`buttonText${variant.charAt(0).toUpperCase() + variant.slice(1)}`],
        disabled && styles.buttonTextDisabled,
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonOutline: {
    backgroundColor: surfaceMuted,
    borderWidth: 1,
    borderColor: borderSubtle,
  },
  buttonGhost: {
    borderColor: "#3b6fb8",
    borderWidth: 2,
    paddingVertical: 12,
    paddingHorizontal: 50,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "500",
  },
  buttonTextOutline: {
    color: textSecondary,
  },
  buttonTextGhost: {
    color: "#ffffffff",
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  buttonTextDisabled: {
    opacity: 0.7,
  },
});

export default SecondaryButton;

