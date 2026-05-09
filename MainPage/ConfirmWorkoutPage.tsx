import React from "react";
import {
  StyleSheet,
  View,
  Text,
} from "react-native";
import { screenBackground } from "../theme/colors";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import PageHeader from "../Components/PageHeader";
import PrimaryButton from "../Components/PrimaryButton";
import SecondaryButton from "../Components/SecondaryButton";

const ConfirmWorkoutPage = () => {
  const navigation = useNavigation<any>();

  return (
    <View style={styles.mainContainer}>
      <PageHeader title="Start Workout" paddingTop={50} paddingHorizontal={16} />
      <View style={styles.content}>
        <View style={styles.confirmContainer}>
          <Ionicons name="fitness" size={80} color="#e85d04" style={styles.icon} />
          <Text style={styles.title}>Ready to Work Out?</Text>
          <Text style={styles.description}>
            Start your training session and track your progress in real-time.
          </Text>
          
          <View style={styles.buttonContainer}>
            <PrimaryButton
              label="Start Workout"
              variant="confirm"
              onPress={() => navigation.replace("AddWorkout")}
            />
            <SecondaryButton
              label="Cancel"
              variant="outline"
              onPress={() => navigation.goBack()}
            />
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: screenBackground,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  confirmContainer: {
    alignItems: "center",
    width: "100%",
  },
  icon: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#e85d04",
    marginBottom: 12,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 40,
    lineHeight: 24,
  },
  buttonContainer: {
    width: "100%",
    gap: 12,
  },
});

export default ConfirmWorkoutPage;

