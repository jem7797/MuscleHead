import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { signIn, signOut, getCurrentUser } from "aws-amplify/auth";
import { useNavigation } from "@react-navigation/native";
import { useUser } from "../Contexts/UserContext";
import PrimaryButton from "../Components/PrimaryButton";
import {
  accent,
  authGradientColors,
  borderSubtle,
  screenBackground,
  surfaceElevated,
  surfaceMuted,
  textPrimary,
  textSecondary,
} from "../theme/colors";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const LogInScreen = () => {
  const navigation = useNavigation();
  const { getAndSetUserSubId, refreshUserProfile } = useUser();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogIn = async () => {
    if (!username.trim() || !password) {
      Alert.alert("Error", "Please enter your username and password.");
      return;
    }

    setIsLoading(true);
    try {
      try {
        const existingUser = await getCurrentUser();
        if (existingUser) {
          await signOut();
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      } catch (e: any) {
        if (e?.name !== "UserUnAuthenticatedException") {
          // Ignore "no user" — we're good to sign in
        }
      }

      await signIn({
        username: username.trim(),
        password,
      });

      await getAndSetUserSubId();
      const { userId: sub } = await getCurrentUser();

      try {
        await refreshUserProfile(sub);
      } catch (profileError: any) {
        await signOut();
        const is403 = profileError?.status === 403;
        Alert.alert(
          "Access Denied",
          is403 ? (profileError?.message || "You do not meet the age requirements to use this app.") : (profileError?.message || "We couldn't load your profile. Please contact support."),
        );
        return;
      }

      navigation.reset({
        index: 0,
        routes: [{ name: "WorkoutInputMainPage" as never }],
      });
    } catch (error: any) {
      const errorName = error?.name || "";
      const errorMessage = error?.message || "";

      if (errorName === "UserNotConfirmedException") {
        Alert.alert(
          "Email Not Verified",
          "Please verify your email with the code we sent before signing in."
        );
        return;
      }
      if (errorName === "NotAuthorizedException") {
        Alert.alert("Invalid Credentials", "Incorrect username or password. Please try again.");
        return;
      }
      if (errorName === "UserNotFoundException") {
        Alert.alert("Account Not Found", "No account exists with this username. Sign up to create one.");
        return;
      }

      Alert.alert("Sign In Failed", errorMessage || "An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <LinearGradient
          colors={[...authGradientColors]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.mainContainer}
        >
          <Image
            source={require("../assets/MeatHeadLogoNoName.png")}
            style={styles.logo}
          />

          <View style={styles.headerContainer}>
            <Text style={styles.headerText}>Welcome back</Text>
            <Text style={styles.subHeaderText}>Sign in to continue</Text>
          </View>

          <View style={styles.formBox}>
            <Text style={styles.label}>Username</Text>
            <TextInput
              style={styles.input}
              placeholder="Your username"
              placeholderTextColor={textSecondary}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="done"
              blurOnSubmit
            />

            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor={textSecondary}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              returnKeyType="done"
              blurOnSubmit
            />

            <TouchableOpacity
              style={styles.forgotPasswordLink}
              onPress={() => navigation.navigate("ForgotPassword" as never)}
              activeOpacity={0.8}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            <PrimaryButton
              label={isLoading ? "Signing in..." : "Log In"}
              variant="continue"
              onPress={handleLogIn}
              disabled={isLoading}
              containerStyle={styles.button}
            />

            <TouchableOpacity
              style={styles.signUpLink}
              onPress={() => navigation.navigate("SignUp" as never)}
              activeOpacity={0.8}
            >
              <Text style={styles.signUpLinkText}>
                Don't have an account? <Text style={styles.signUpLinkBold}>Sign Up</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: screenBackground,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 200,
    height: 200,
    top: -20,
  },
  headerContainer: {
    marginBottom: 60,
    top: -30,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  headerText: {
    color: textPrimary,
    fontSize: 24,
    fontWeight: "600",
    textAlign: "center",
  },
  subHeaderText: {
    color: textSecondary,
    fontSize: 16,
    marginTop: 8,
  },
  formBox: {
    width: SCREEN_WIDTH * 0.85,
    padding: 20,
    borderRadius: 14,
    top: -80,
    backgroundColor: surfaceElevated,
    borderWidth: 1,
    borderColor: borderSubtle,
  },
  label: {
    color: textPrimary,
    marginTop: 12,
    marginBottom: 4,
    fontWeight: "600",
  },
  input: {
    backgroundColor: surfaceMuted,
    color: textPrimary,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: borderSubtle,
  },
  button: {
    marginTop: 16,
  },
  forgotPasswordLink: {
    alignSelf: "flex-end",
    marginTop: -4,
  },
  forgotPasswordText: {
    color: accent,
    fontSize: 13,
    fontWeight: "600",
  },
  signUpLink: {
    marginTop: 20,
    alignItems: "center",
  },
  signUpLinkText: {
    color: textSecondary,
    fontSize: 15,
  },
  signUpLinkBold: {
    color: accent,
    fontWeight: "600",
  },
});

export default LogInScreen;
