import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Dimensions, StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const ContinueSignUp = ({ navigation }) => {
  return (
    <LinearGradient
      colors={["#0c1525", "#182c54ff", "#020b1f"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.mainContainer}
    >
      <View style={styles.content}>
        {/* ✅ Checkmark Animation Placeholder */}
        <Ionicons name="checkmark-circle" size={90} color="#3b6fb8" style={styles.iconGlow} />
        <Text style={styles.headerText}>Your account was created!</Text>
        <Text style={styles.subText}>
          Jump right in or tell us more to personalize your experience. 
        </Text>

        {/* ✅ Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate("MainApp")}
          >
            <Text style={styles.primaryButtonText}>Continue</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.navigate("IdentityBasics")}
          >
            <Text style={styles.secondaryButtonText}>Add More Info</Text>
          </TouchableOpacity>
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
    paddingVertical: 14,
    paddingHorizontal: 60,
    borderRadius: 12,
    shadowColor: "#3b6fb8",
    shadowOpacity: 0.8,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 10,
    marginBottom: 20,
  },
  primaryButtonText: {
    color: "#ffffffff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  secondaryButton: {
    borderColor: "#3b6fb8",
    borderWidth: 2,
    paddingVertical: 12,
    paddingHorizontal: 50,
    borderRadius: 12,
  },
  secondaryButtonText: {
    color: "#ffffffff",
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
});

export default ContinueSignUp;
