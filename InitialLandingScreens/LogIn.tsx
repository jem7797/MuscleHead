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
          colors={["#0c1525", "#182c54ff", "#020b1f"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.mainContainer}
        >
          <Image
            source={require("../assets/AlternateMuscleHeadLogo.png")}
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
              placeholderTextColor="#aaaaaaac"
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
              placeholderTextColor="#aaaaaaac"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              returnKeyType="done"
              blurOnSubmit
            />

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
    backgroundColor: "#141414e9",
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
    color: "#fff",
    fontSize: 24,
    fontWeight: "600",
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.6)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
  subHeaderText: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 16,
    marginTop: 8,
    textShadowColor: "rgba(0, 0, 0, 0.4)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  formBox: {
    width: SCREEN_WIDTH * 0.85,
    padding: 20,
    borderRadius: 12,
    top: -80,
  },
  label: {
    color: "#fff",
    marginTop: 12,
    marginBottom: 4,
    fontWeight: "600",
  },
  input: {
    backgroundColor: "#44434373",
    color: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
    fontSize: 16,
  },
  button: {
    marginTop: 24,
  },
  signUpLink: {
    marginTop: 20,
    alignItems: "center",
  },
  signUpLinkText: {
    color: "rgba(255, 255, 255, 0.85)",
    fontSize: 15,
  },
  signUpLinkBold: {
    color: "#5b9aff",
    fontWeight: "600",
  },
});

export default LogInScreen;
