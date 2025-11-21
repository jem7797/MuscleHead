import React from "react";
import { View, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  isFocused: boolean;
  onFocus: () => void;
  onBlur: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  isFocused,
  onFocus,
  onBlur,
}) => {
  return (
    <View
      style={[
        styles.searchBar,
        isFocused && styles.searchBarFocused,
      ]}
    >
      <Ionicons
        name="search"
        size={20}
        color={isFocused ? "#1f2a44" : "#5a6a7e"}
      />
      <TextInput
        style={styles.searchInput}
        placeholder="Search MuscleHead"
        placeholderTextColor="#9aa6bd"
        value={value}
        onChangeText={onChangeText}
        onFocus={onFocus}
        onBlur={onBlur}
        returnKeyType="search"
      />
      {value.length > 0 && (
        <TouchableOpacity onPress={() => onChangeText("")}>
          <Ionicons name="close-circle" size={18} color="#9aa6bd" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  searchBar: {
    marginTop: 24,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 18,
    backgroundColor: "#f1f4fc",
    borderWidth: 1.5,
    borderColor: "#d1d9ee",
    gap: 10,
  },
  searchBarFocused: {
    borderColor: "#1f2a44",
    shadowColor: "#1f2a44",
    backgroundColor: "#e7ecff",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 14,
    elevation: 14,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#0f1724",
  },
});

export default SearchBar;

