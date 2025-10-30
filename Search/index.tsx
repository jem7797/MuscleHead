import React from "react";
import { View, Text, StyleSheet } from "react-native";
import NavBar from "../Components/NavBar";

const SearchScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Search</Text>
      <NavBar />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  text: {
    fontSize: 20,
    color: "#1f2a44",
  },
});

export default SearchScreen;


