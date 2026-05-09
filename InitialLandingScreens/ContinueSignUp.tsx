import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useUser } from "../Contexts/UserContext";
import PrimaryButton from "../Components/PrimaryButton";
import { accent, authGradientColors, screenBackground, textPrimary, textSecondary } from "../theme/colors";

//@ts-ignore
const ContinueSignUp = ({ navigation }) => {
  //@ts-ignore
  const { given_name } = useUser();

  return (
    <LinearGradient
      colors={[...authGradientColors]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.mainContainer}
    >
      <View style={styles.content}>
        {/* Checkmark Animation Placeholder */}
        <Ionicons name="checkmark-circle" size={90} color={accent} style={styles.iconGlow} />
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
    backgroundColor: screenBackground,
  },
  content: {
    alignItems: "center",
    paddingHorizontal: 25,
  },
  iconGlow: {
    textShadowColor: accent,
    textShadowRadius: 25,
    marginBottom: 30,
  },
  headerText: {
    color: textPrimary,
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 10,
  },
  subText: {
    color: textSecondary,
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 50,
  },
  buttonContainer: {
    width: "100%",
    alignItems: "center",
  },
  primaryButton: {
    marginBottom: 20,
  },
});

export default ContinueSignUp;
