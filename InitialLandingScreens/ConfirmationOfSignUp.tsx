import React, { useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
} from "react-native";
import { confirmSignUp } from "aws-amplify/auth";
import { LinearGradient } from "expo-linear-gradient";

// @ts-ignore
const ConfirmSignUpScreen = ({ route, navigation }) => {
  const [code, setCode] = useState(["", "", "", "", "", ""]); // 6-digit array
  const inputs = useRef<(TextInput | null)[]>([]);
  const { username, email } = route.params; // 👈 grab both

  const handleChange = (text: string, index: number) => {
    // If user pastes multiple characters
    if (text.length > 1) {
      const chars = text.split("").slice(0, 6); // keep max 6 chars
      const newCode = [...code];
      chars.forEach((c, i) => {
        if (index + i < newCode.length) {
          newCode[index + i] = c;
        }
      });
      setCode(newCode);

      // move focus to the last filled box
      const nextIndex = Math.min(index + chars.length - 1, inputs.current.length - 1);
      inputs.current[nextIndex]?.focus();
      return;
    }

    // Normal single-character input
    const newCode = [...code];
    newCode[index] = text.slice(-1); // last char only
    setCode(newCode);

    // Move focus logic
    if (text && index < inputs.current.length - 1) {
      inputs.current[index + 1]?.focus();
    }
    if (!text && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleConfirm = async () => {
    try {
      const finalCode = code.join("");
      await confirmSignUp({ username, confirmationCode: finalCode });
      Alert.alert("Success", "Your account has been confirmed!");
      // TODO: Navigate to login screen
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to confirm sign up");
    }
  };

  return (
    <LinearGradient
      colors={["#323232ff", "#182c54ff"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.container}
    >
      <Text style={styles.headerText}>Enter the code sent to {email}</Text>

      <View style={styles.codeContainer}>
        {code.map((digit, index) => (
          <LinearGradient
            key={index}
            colors={["#d9d9d9", "#a0a0a0", "#5c5c5c"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.lockBox}
          >
            <TextInput
            //@ts-ignore
              ref={(ref) => (inputs.current[index] = ref)}
              style={styles.codeInput}
              keyboardType="number-pad"
              maxLength={6} // allow paste of full code
              value={digit}
              onChangeText={(text) => handleChange(text, index)}
              placeholder=""
              placeholderTextColor="#333"
              caretHidden={Platform.OS === "android"}
            />
          </LinearGradient>
        ))}
      </View>

      <TouchableOpacity style={styles.button} onPress={handleConfirm}>
        <LinearGradient
          colors={["#3b6fb8", "#244f9b"]}
          style={styles.buttonGradient}
        >
          <Text style={styles.buttonText}>Confirm</Text>
        </LinearGradient>
      </TouchableOpacity>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  headerText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "500",
    textAlign: "center",
    marginBottom: 30,
    top: -150,
  },
  codeContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 40,
  },
  lockBox: {
    width: 55,
    height: 65,
    marginHorizontal: 6,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.4,
    shadowOffset: { width: 2, height: 4 },
    shadowRadius: 6,
    elevation: 6,
  },
  codeInput: {
    width: "100%",
    height: "100%",
    textAlign: "center",
    fontSize: 26,
    fontWeight: "700",
    color: "#0c1525",
    textShadowColor: "rgba(255,255,255,0.7)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 0,
  },
  button: {
    width: 180,
    borderRadius: 12,
    overflow: "hidden",
  },
  buttonGradient: {
    paddingVertical: 12,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
  },
});

export default ConfirmSignUpScreen;
