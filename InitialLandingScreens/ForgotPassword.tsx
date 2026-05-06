import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { confirmResetPassword, resetPassword } from "aws-amplify/auth";
import PrimaryButton from "../Components/PrimaryButton";

const ForgotPasswordScreen = ({ navigation }: any) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [username, setUsername] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const trimmedUsername = useMemo(() => username.trim(), [username]);

  const handleSendCode = async () => {
    if (!trimmedUsername) {
      Alert.alert("Missing Username", "Enter your username or email first.");
      return;
    }

    setIsLoading(true);
    try {
      await resetPassword({ username: trimmedUsername });
      Alert.alert("Code Sent", "We sent a password reset code.");
      setStep(2);
    } catch (error: any) {
      const name = error?.name ?? "";
      if (name === "UserNotFoundException") {
        Alert.alert("Account Not Found", "No account exists with that username/email.");
      } else if (name === "LimitExceededException" || name === "TooManyRequestsException") {
        Alert.alert("Too Many Attempts", "Please wait a moment and try again.");
      } else {
        Alert.alert("Could Not Send Code", error?.message || "Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmReset = async () => {
    if (!trimmedUsername || !code.trim() || !newPassword || !confirmPassword) {
      Alert.alert("Missing Fields", "Please complete all fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Password Mismatch", "New password and confirmation must match.");
      return;
    }
    if (newPassword.length < 8) {
      Alert.alert("Weak Password", "Use at least 8 characters.");
      return;
    }

    setIsLoading(true);
    try {
      await confirmResetPassword({
        username: trimmedUsername,
        confirmationCode: code.trim(),
        newPassword,
      });
      Alert.alert("Password Updated", "You can now sign in with your new password.", [
        { text: "OK", onPress: () => navigation.navigate("LogIn") },
      ]);
    } catch (error: any) {
      const name = error?.name ?? "";
      if (name === "CodeMismatchException") {
        Alert.alert("Invalid Code", "The verification code is incorrect.");
      } else if (name === "ExpiredCodeException") {
        Alert.alert("Code Expired", "Please request a new reset code.");
      } else if (name === "InvalidPasswordException") {
        Alert.alert("Invalid Password", error?.message || "Password does not meet requirements.");
      } else {
        Alert.alert("Reset Failed", error?.message || "Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <LinearGradient
          colors={["#0c1525", "#182c54ff", "#020b1f"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.container}
        >
          <Text style={styles.title}>Recover Password</Text>
          <Text style={styles.subtitle}>
            {step === 1
              ? "Enter your username/email and we will send a reset code."
              : "Enter the code and your new password."}
          </Text>

          <View style={styles.form}>
            <Text style={styles.label}>Username or Email</Text>
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={setUsername}
              placeholder="yourusername"
              placeholderTextColor="#aaaaaaac"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isLoading}
            />

            {step === 2 ? (
              <>
                <Text style={styles.label}>Verification Code</Text>
                <TextInput
                  style={styles.input}
                  value={code}
                  onChangeText={setCode}
                  placeholder="123456"
                  placeholderTextColor="#aaaaaaac"
                  keyboardType="number-pad"
                  editable={!isLoading}
                />

                <Text style={styles.label}>New Password</Text>
                <TextInput
                  style={styles.input}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder="••••••••"
                  placeholderTextColor="#aaaaaaac"
                  secureTextEntry
                  editable={!isLoading}
                />

                <Text style={styles.label}>Confirm New Password</Text>
                <TextInput
                  style={styles.input}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="••••••••"
                  placeholderTextColor="#aaaaaaac"
                  secureTextEntry
                  editable={!isLoading}
                />
              </>
            ) : null}

            <PrimaryButton
              label={isLoading ? "Please wait..." : step === 1 ? "Send Code" : "Update Password"}
              variant="continue"
              onPress={step === 1 ? handleSendCode : handleConfirmReset}
              disabled={isLoading}
              containerStyle={styles.button}
            />

            {step === 2 ? (
              <TouchableOpacity onPress={handleSendCode} disabled={isLoading}>
                <Text style={styles.linkText}>Resend code</Text>
              </TouchableOpacity>
            ) : null}

            <TouchableOpacity onPress={() => navigation.navigate("LogIn")} disabled={isLoading}>
              <Text style={styles.linkText}>Back to Log In</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 20 },
  title: { color: "#fff", fontSize: 28, fontWeight: "700", marginBottom: 8 },
  subtitle: {
    color: "rgba(255,255,255,0.82)",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 22,
  },
  form: { width: "100%", maxWidth: 380 },
  label: { color: "#fff", marginTop: 10, marginBottom: 6, fontWeight: "600" },
  input: {
    backgroundColor: "#44434373",
    color: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 10,
    fontSize: 16,
  },
  button: { marginTop: 12, marginBottom: 16 },
  linkText: {
    color: "#8eb8ff",
    textAlign: "center",
    marginTop: 10,
    fontSize: 14,
    fontWeight: "600",
  },
});

export default ForgotPasswordScreen;
