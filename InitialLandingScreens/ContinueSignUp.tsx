import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useUser } from "../Contexts/UserContext";
import PrimaryButton from "../Components/PrimaryButton";

//@ts-ignore
const ContinueSignUp = ({ navigation }) => {
  //@ts-ignore
  const { given_name } = useUser();

  return (
    <LinearGradient
      colors={["#0c1525", "#182c54ff", "#020b1f"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.mainContainer}
    >
      <View style={styles.content}>
        {/* Checkmark Animation Placeholder */}
        <Ionicons name="checkmark-circle" size={90} color="#3b6fb8" style={styles.iconGlow} />
        <Text style={styles.headerText}>Congrats, {given_name}, your account was created!</Text>
        <Text style={styles.subText}>
          Let's personalize your experience.
        </Text>

        <View style={styles.buttonContainer}>
          <PrimaryButton
            label="Continue"
            variant="continue"
            onPress={() => navigation.navigate("IdentityBasics")}
            containerStyle={styles.primaryButton}
          />
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    alignItems: "center",
    paddingHorizontal: 25,
  },
  iconGlow: {
    textShadowColor: "#3b6fb8",
    textShadowRadius: 25,
    marginBottom: 30,
  },
  headerText: {
    color: "#ffffffff",
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 10,
    textShadowColor: "rgba(0, 0, 0, 0.7)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 6,
  },
  subText: {
    color: "#fffafaff",
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 50,
    opacity: 0.9,
  },
  buttonContainer: {
    width: "100%",
    alignItems: "center",
  },
  primaryButton: {
    backgroundColor: "#3b6fb8",
    shadowColor: "#3b6fb8",
    shadowOpacity: 0.8,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 10,
    marginBottom: 20,
  },
});

export default ContinueSignUp;
