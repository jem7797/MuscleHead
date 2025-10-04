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
  const { username, email } = route.params;

  const handleChange = (text: string, index: number) => {
    if (text.length > 1) {
      const chars = text.split("").slice(0, 6);
      const newCode = [...code];
      chars.forEach((c, i) => {
        if (index + i < newCode.length) {
          newCode[index + i] = c;
        }
      });
      setCode(newCode);

      const nextIndex = Math.min(index + chars.length - 1, inputs.current.length - 1);
      inputs.current[nextIndex]?.focus();
      return;
    }

    const newCode = [...code];
    newCode[index] = text.slice(-1);
    setCode(newCode);

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

      // ✅ Navigate to IdentityBasics screen after confirmation
      navigation.navigate("ContinueSignUp", { username, email });

    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to confirm sign up");
    }
  };

  return (
    <LinearGradient
      colors={["#0c1525", "#182c54ff", "#020b1f"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.container}
    >
      <Text style={styles.headerText}>Enter the code sent to {email}</Text>

      <View style={styles.codeContainer}>
        {code.map((digit, index) => (
          <LinearGradient
            key={index}
            colors={["white", "white"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.lockBox}
          >
            <TextInput
              ref={(ref) => { inputs.current[index] = ref; }}
              style={styles.codeInput}
              keyboardType="number-pad"
              maxLength={6}
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
       
          <Text style={styles.buttonText}>Confirm</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  headerText: {
     color: "#ffffffff",
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 10,
    textShadowColor: "rgba(0, 0, 0, 0.7)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 6,
    top:-100
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
  
  buttonText: {
     color: "#ffffffff",
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
});

export default ConfirmSignUpScreen;
