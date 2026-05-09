import React from "react";
import { View, Text, StyleSheet } from "react-native";
import NavBar from "../Components/NavBar";
import { Entypo } from "@expo/vector-icons";
import { screenBackground, textSecondary } from "../theme/colors";

const HiddenSearchPage = () => {
  
    return (
      <View style={styles.container}>
        <View style={styles.content}>
  
          <View>
            <Entypo name="eye-with-line" size={120} color="red" />
          </View>
  
  
          <Text style={styles.title}>You are Hidden</Text>
          <Text style={styles.subtitle}>Hidden users can't access the feed, search, gym bro, or follow features. To enable these, update your privacy setting in Settings.</Text>
        </View>
  
        <NavBar />
      </View>
    );
  };
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: screenBackground,
    },
  
    content: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    title: {
      fontSize: 20,
      fontWeight: "600",
      color: "#e85d04",
    },
  
    subtitle:{
      textAlign: "center",
      marginTop: 20,
      fontSize: 14,
      fontWeight: "600",
      color: textSecondary,
    },
  });
  
export default HiddenSearchPage;
