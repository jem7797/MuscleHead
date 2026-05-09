import React, { useRef } from "react";
import { TextInput, TouchableOpacity, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { borderSubtle, surfaceMuted, textPrimary } from "../../theme/colors";

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  isFocused: boolean;
  onFocus: () => void;
  onBlur: () => void;
  onSubmit?: () => void;
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  isFocused,
  onFocus,
  onBlur,
  onSubmit,
  placeholder = "Search users",
}) => {
  const inputRef = useRef<TextInput>(null);

  return (
    <Pressable
      onPress={() => inputRef.current?.focus()}
      style={[
        styles.searchBar,
        isFocused && styles.searchBarFocused,
      ]}
    >
      <Ionicons
        name="search"
        size={20}
        color={isFocused ? "#e85d04" : "#5a6a7e"}
      />
      <TextInput
        ref={inputRef}
        style={styles.searchInput}
        placeholder={placeholder}
        placeholderTextColor="#9aa6bd"
        value={value}
        onChangeText={onChangeText}
        onFocus={onFocus}
        onBlur={onBlur}
        returnKeyType="done"
        blurOnSubmit
        onSubmitEditing={onSubmit}
      />
      {value.length > 0 && (
        <TouchableOpacity
          onPress={() => onChangeText("")}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="close-circle" size={18} color="#9aa6bd" />
        </TouchableOpacity>
      )}
    </Pressable>
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
    backgroundColor: surfaceMuted,
    borderWidth: 1.5,
    borderColor: borderSubtle,
    gap: 10,
  },
  searchBarFocused: {
    borderColor: "#e85d04",
    shadowColor: "#e85d04",
    backgroundColor: "#363c48",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 14,
    elevation: 14,
  },
  searchInput: {
    flex: 1,
    minHeight: 24,
    fontSize: 15,
    color: textPrimary,
    paddingVertical: 4,
  },
});

export default SearchBar;

