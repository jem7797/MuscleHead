import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import NavBar from "../Components/NavBar";

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
              value={query}
              onChangeText={setQuery}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              returnKeyType="search"
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={() => setQuery("")}>
                <Ionicons name="close-circle" size={18} color="#9aa6bd" />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Saved Collections</Text>
            <View style={styles.collectionRow}>
              {savedCollections.map((collection) => (
                <TouchableOpacity
                  key={collection.title}
                  style={styles.collectionCard}
                  activeOpacity={0.85}
                >
                  <View style={styles.collectionIcon}>
                    <FontAwesome5
                      name={collection.icon as any}
                      size={18}
                      color="#1f2a44"
                    />
                  </View>
                  <Text style={styles.collectionText}>{collection.title}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
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
  titleHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  screenTitle: {
    fontSize: 26,
    fontWeight: "700",
    color: "#1f2a44",
    marginTop: 5,
  },
  titleAccent: {
    height: 6,
    width: 48,
    borderRadius: 3,
    backgroundColor: "#1f2a44",
    opacity: 0.8,
  },
  subtitle: {
    marginTop: 6,
    fontSize: 14,
    color: "#5a6a7e",
  },
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
  section: {
    marginTop: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0f1724",
    marginBottom: 16,
  },
  collectionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  collectionCard: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: "#f4f7ff",
    borderWidth: 1,
    borderColor: "#d6def0",
    gap: 10,
    shadowColor: "#1f2a44",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  collectionIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(31,42,68,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  collectionText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1f2a44",
  },
});

export default SearchScreen;


