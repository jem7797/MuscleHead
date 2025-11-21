import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Animated } from "react-native";

interface PrimaryButtonProps {
  onPress: () => void;
  label: string;
  variant?: "default" | "footer" | "continue" | "confirm";
  disabled?: boolean;
  animatedStyle?: Animated.AnimatedProps<any>;
  containerStyle?: any;
}

const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  onPress,
  label,
  variant = "default",
  disabled = false,
  animatedStyle,
  containerStyle,
}) => {
  const getButtonStyle = () => {
    switch (variant) {
      case "default":
        return styles.buttonDefault;
      case "footer":
        return styles.buttonFooter;
      case "continue":
        return styles.buttonContinue;
      case "confirm":
        return styles.buttonConfirm;
      default:
        return styles.buttonDefault;
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case "default":
        return styles.buttonTextDefault;
      case "footer":
        return styles.buttonTextFooter;
      case "continue":
        return styles.buttonTextContinue;
      case "confirm":
        return styles.buttonTextConfirm;
      default:
        return styles.buttonTextDefault;
    }
  };

  const buttonContent = (
    <TouchableOpacity
      style={[
        styles.button,
        getButtonStyle(),
        disabled && styles.buttonDisabled,
        containerStyle,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <Text style={[
        styles.buttonText,
        getTextStyle(),
        disabled && styles.buttonTextDisabled,
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  if (variant === "footer") {
    return (
      <View style={styles.footerContainer}>
        {buttonContent}
      </View>
    );
  }

  if (animatedStyle) {
    return (
      <Animated.View style={animatedStyle}>
        {buttonContent}
      </Animated.View>
    );
  }

  return buttonContent;
};

const styles = StyleSheet.create({
  footerContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#e8e8e8",
    backgroundColor: "white",
  },
  button: {
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#202c76",
  },
  buttonDefault: {
    backgroundColor: "#202c76",
  },
  buttonFooter: {
    backgroundColor: "#202c76",
  },
  buttonContinue: {
    backgroundColor: "#013cdee0",
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 14,
    shadowColor: "#3b6fb8",
    shadowOpacity: 0.8,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 10,
  },
  buttonConfirm: {
    backgroundColor: "#202c76",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  buttonTextDefault: {},
  buttonTextFooter: {},
  buttonTextContinue: {
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  buttonTextConfirm: {
    fontSize: 16,
    fontWeight: "600",
  },
  buttonTextDisabled: {
    opacity: 0.7,
  },
});

export default PrimaryButton;

