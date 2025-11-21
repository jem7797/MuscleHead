import React from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
} from "react-native";
import NavBar from "../Components/NavBar";
import PageHeader from "../Components/PageHeader";

const AddRoutinePage = () => {

  return (
    <View style={styles.mainContainer}>
      <PageHeader title="Add Routine" />

      {/* Content */}
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <Text style={styles.placeholderText}>Add your routine here</Text>
        {/* Add your routine input components here */}
      </ScrollView>

      <NavBar />
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "white",
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    flexGrow: 1,
  },
  placeholderText: {
    fontSize: 16,
    color: "#51607a",
    textAlign: "center",
  },
});

export default AddRoutinePage;

