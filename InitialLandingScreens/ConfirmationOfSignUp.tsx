import React, { useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  Platform,
} from "react-native";
import { confirmSignUp, signIn } from "aws-amplify/auth";
import { LinearGradient } from "expo-linear-gradient";
import PrimaryButton from "../Components/PrimaryButton";
import { useUser } from "../Contexts/UserContext";

// @ts-ignore
const ConfirmSignUpScreen = ({ route, navigation }) => {
  const [code, setCode] = useState(["", "", "", "", "", ""]); // 6-digit array
  const inputs = useRef<(TextInput | null)[]>([]);
  const { username, email } = route.params;
  //@ts-ignore
  const { getAndClearTempPassword } = useUser();

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
      
      // Validate code is complete
      if (finalCode.length !== 6) {
        Alert.alert("Invalid Code", "Please enter the complete 6-digit code.");
        return;
      }
      
      // Step 1: Confirm the sign up with the verification code
      console.log("Step 1: Confirming sign up with code...");
      try {
        await confirmSignUp({ username, confirmationCode: finalCode });
        console.log("Step 1: Sign up confirmed successfully");
      } catch (confirmError: any) {
        console.error("Step 1 FAILED - confirmSignUp error:", confirmError);
        console.error("Confirm error details:", {
          name: confirmError?.name,
          message: confirmError?.message,
          code: confirmError?.code,
          underlyingError: confirmError?.underlyingError,
        });
        
        // Check for specific error types
        if (confirmError?.name === 'CodeMismatchException') {
          Alert.alert("Invalid Code", "The verification code is incorrect. Please check and try again.");
          return;
        }
        if (confirmError?.name === 'ExpiredCodeException') {
          Alert.alert("Code Expired", "The verification code has expired. Please request a new one.");
          return;
        }
        if (confirmError?.name === 'NotAuthorizedException') {
          Alert.alert("Already Confirmed", "This account has already been confirmed. You can sign in now.");
          // Try to sign in anyway
        } else {
          throw confirmError; // Re-throw to be caught by outer catch
        }
      }
      
      // Step 2: Get password from context
      console.log("Step 2: Getting password from context...");
      const password = getAndClearTempPassword();
      if (!password) {
        throw new Error("Password not found. Please try signing up again.");
      }
      console.log("Step 2: Password retrieved successfully");
      
      // Step 3: Automatically sign in the user after successful confirmation
      console.log("Step 3: Signing in user...");
      try {
        await signIn({ username, password });
        console.log("Step 3: Sign in successful");
      } catch (signInError: any) {
        console.error("Step 3 FAILED - signIn error:", signInError);
        console.error("Sign in error details:", {
          name: signInError?.name,
          message: signInError?.message,
          code: signInError?.code,
          underlyingError: signInError?.underlyingError,
        });
        
        // Check for specific sign-in errors
        if (signInError?.name === 'NotAuthorizedException') {
          Alert.alert("Sign In Failed", "Invalid username or password. Please try again.");
          return;
        }
        if (signInError?.name === 'UserNotConfirmedException') {
          Alert.alert("Not Confirmed", "Please confirm your email first.");
          return;
        }
        throw signInError; // Re-throw to be caught by outer catch
      }
      
      // Step 4: Navigate to continue sign up screen
      console.log("Step 4: Navigating to ContinueSignUp...");
      navigation.navigate("ContinueSignUp", { username, email });

    } catch (err: any) {
      // Log the full error for debugging
      console.error("Error in handleConfirm:", err);
      console.error("Error name:", err?.name);
      console.error("Error message:", err?.message);
      console.error("Error code:", err?.code);
      console.error("Underlying error:", err?.underlyingError);
      console.error("Full error object:", JSON.stringify(err, null, 2));
      
      // Extract meaningful error message
      let errorMessage = "Failed to confirm sign up";
      
      if (err?.message) {
        errorMessage = err.message;
      } else if (err?.name) {
        errorMessage = `${err.name}: ${err.message || 'Unknown error'}`;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      
      Alert.alert("Error", errorMessage);
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

      <PrimaryButton
        label="Confirm"
        variant="continue"
        onPress={handleConfirm}
        containerStyle={styles.button}
      />
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
    shadowColor: "#3b6fb8",
    shadowOpacity: 0.8,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 10,
    marginBottom: 20,
  },
});

export default ConfirmSignUpScreen;
