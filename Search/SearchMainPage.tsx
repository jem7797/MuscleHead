import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import NavBar from "../Components/NavBar";
import SearchBar from "./SearchMainPage Components/SearchBar";
import SavedCollections from "./SearchMainPage Components/SavedCollections";

const SearchScreen = () => {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const savedCollections = [
    { title: "Strength Building", icon: "dumbbell" },
    { title: "Beginner Friendly", icon: "leaf" },
    { title: "At Home", icon: "home" },
  ];

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <SearchBar
            value={query}
            onChangeText={setQuery}
            isFocused={isFocused}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />
          <SavedCollections collections={savedCollections} />
        </ScrollView>
      </KeyboardAvoidingView>
      <NavBar />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 52,
    paddingBottom: 120,
  },
});

export default SearchScreen;


