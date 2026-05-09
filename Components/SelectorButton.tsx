import React from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from "react-native";

import { borderSubtle, surfaceMuted, textSecondary } from "../theme/colors";
interface SelectorButtonProps {
  options: string[];
  selected: string | null;
  onSelect: (option: string) => void;
  title?: string;
  showTitle?: boolean;
  horizontal?: boolean;
  containerStyle?: any;
  buttonStyle?: any;
  activeButtonStyle?: any;
  textStyle?: any;
  activeTextStyle?: any;
}

const SelectorButton: React.FC<SelectorButtonProps> = ({
  options,
  selected,
  onSelect,
  title,
  showTitle = true,
  horizontal = true,
  containerStyle,
  buttonStyle,
  activeButtonStyle,
  textStyle,
  activeTextStyle,
}) => {
  if (!options || options.length === 0) {
    return null;
  }

  const buttonContent = options.map((option) => (
    <TouchableOpacity
      key={option}
      style={[
        styles.selectorButton,
        selected === option && styles.selectorButtonActive,
        buttonStyle,
        selected === option && activeButtonStyle,
      ]}
      onPress={() => onSelect(option)}
    >
      <Text
        style={[
          styles.selectorButtonText,
          selected === option && styles.selectorButtonTextActive,
          textStyle,
          selected === option && activeTextStyle,
        ]}
      >
        {option}
      </Text>
    </TouchableOpacity>
  ));

  return (
    <View style={[styles.section, containerStyle]}>
      {showTitle && title && (
        <Text style={styles.sectionTitle}>{title}</Text>
      )}
      {horizontal ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.selectorScroll}>
          {buttonContent}
        </ScrollView>
      ) : (
        <View style={styles.verticalContainer}>
          {buttonContent}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#e85d04",
    marginBottom: 8,
  },
  selectorScroll: {
    marginHorizontal: -12,
    paddingHorizontal: 16,
  },
  verticalContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  selectorButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: surfaceMuted,
    marginRight: 8,
    borderWidth: 1,
    borderColor: borderSubtle,
  },
  selectorButtonActive: {
    backgroundColor: "#e85d04",
    borderColor: "#e85d04",
  },
  selectorButtonText: {
    fontSize: 13,
    fontWeight: "500",
    color: textSecondary,
  },
  selectorButtonTextActive: {
    color: "#fff",
  },
});

export default SelectorButton;

