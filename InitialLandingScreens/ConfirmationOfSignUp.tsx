import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  Platform,
  TouchableOpacity,
} from "react-native";
import {
  confirmSignUp,
  signIn,
  signOut,
  getCurrentUser,
  resendSignUpCode,
} from "aws-amplify/auth";
import { LinearGradient } from "expo-linear-gradient";
import PrimaryButton from "../Components/PrimaryButton";
import { useUser } from "../Contexts/UserContext";
import { createUser } from "../Services/userApi";


// @ts-ignore
const ConfirmSignUpScreen = ({ route, navigation }) => {
  const [code, setCode] = useState(["", "", "", "", "", ""]); // 6-digit array
  const inputs = useRef<(TextInput | null)[]>([]);
  const { username, email, given_name, birthDate, height, weight } = route.params || {};
  //@ts-ignore
  const { getAndClearTempPassword, setIsAuth, changeUsername} = useUser();
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isResending, setIsResending] = useState(false);

  


  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleResendCode = async () => {
    if (!username || isResending || resendCooldown > 0) return;
    setIsResending(true);
    try {
      await resendSignUpCode({ username });
      setResendCooldown(45);
      Alert.alert("Code Sent", "A new verification code has been sent.");
    } catch (error: any) {
      const name = error?.name ?? "";
      if (name === "LimitExceededException" || name === "TooManyRequestsException") {
        Alert.alert("Please Wait", "Too many attempts. Try again shortly.");
      } else if (name === "UserNotFoundException") {
        Alert.alert("Account Not Found", "We couldn't find this account. Please sign up again.");
      } else {
        Alert.alert("Resend Failed", error?.message || "Could not resend code. Try again.");
      }
    } finally {
      setIsResending(false);
    }
  };

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
      try {
        await confirmSignUp({ username, confirmationCode: finalCode });
      } catch (confirmError: any) {
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
      const password = getAndClearTempPassword();
      if (!password) {
        throw new Error("Password not found. Please try signing up again.");
      }
      
      // Step 3: Automatically sign in the user after successful confirmation
      try {
        await signIn({ username, password });
      } catch (signInError: any) {
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
      
      // Step 4: Create user in backend database (now we have authenticated session with ID token)
      try {
        // Get the user's sub ID from Cognito (now that we're authenticated)
        const { userId: sub } = await getCurrentUser();
        
        if (!sub) {
          throw new Error("Failed to get user ID from Cognito.");
        }
        
        // Create user in backend (include height/weight if provided from sign up)
        const optionalFields =
          height != null && weight != null
            ? { height: Number(height), weight: Number(weight) }
            : undefined;
        await createUser(username, sub, email, given_name, birthDate, optionalFields);
        setIsAuth(true);
        
       
      } catch (createUserError: any) {
        await signOut();
        setIsAuth(false);
        const is403 = createUserError?.status === 403;
        Alert.alert(
          "Account Not Created",
          is403 ? (createUserError?.message || "You do not meet the age requirements to use this app.") : (createUserError?.message || "We couldn't create your account. Please contact support."),
          [{ text: "OK", onPress: () => navigation.navigate("SignUp" as never) }]
        );
        return;
      }

      // Step 5: Navigate to continue sign up screen
      navigation.navigate("ContinueSignUp", { username, email });

    } catch (err: any) {
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
              returnKeyType="done"
              blurOnSubmit
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

      <View style={styles.resendContainer}>
        <TouchableOpacity
          onPress={handleResendCode}
          disabled={isResending || resendCooldown > 0}
          activeOpacity={0.8}
        >
          <Text style={[styles.resendText, (isResending || resendCooldown > 0) && styles.resendTextDisabled]}>
            {isResending
              ? "Resending..."
              : resendCooldown > 0
                ? `Resend code in ${resendCooldown}s`
                : "Resend verification code"}
          </Text>
        </TouchableOpacity>
      </View>
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
  resendContainer: {
    marginTop: -6,
  },
  resendText: {
    color: "#8eb8ff",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  resendTextDisabled: {
    color: "#9fb0c9",
  },
});

export default ConfirmSignUpScreen;
