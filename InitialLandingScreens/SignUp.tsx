import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { signUp, signOut, getCurrentUser } from "aws-amplify/auth";
import { useNavigation } from "@react-navigation/native";
import { useUser } from "../Contexts/UserContext";
import PrimaryButton from "../Components/PrimaryButton";
// Note: createUser will be called after email confirmation and sign-in
// when we have an authenticated session


const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const SignUpScreen = () => {
  const navigation = useNavigation();
  //@ts-ignore
  const {given_name, setgiven_name, setTempPasswordForSignup} = useUser();
  const [email, setEmail] = useState("");
  const [DOB, setDOB] = useState("");
  const [alias, setAlias] = useState("");
  const [password, setPassword] = useState("");

  // Automatically sign out any existing user when this screen loads
  // This allows testing signup multiple times without manual sign-out
  useEffect(() => {
    const clearExistingSession = async () => {
      try {
        // Check if a user is currently signed in
        const user = await getCurrentUser();
        if (user) {
          console.log("[SignUp] Existing user found, signing out...");
          await signOut();
          console.log("[SignUp] Successfully signed out existing user");
        }
      } catch (error: any) {
        // If getCurrentUser throws, no user is signed in - that's fine
        // Only log if it's an unexpected error
        if (error.name !== 'UserUnAuthenticatedException') {
          console.log("[SignUp] No existing user session (or error checking):", error.name);
        }
      }
    };

    clearExistingSession();
  }, []); // Run once when component mounts

/**
 * handleSignUp - Main sign up flow handler
 * 
 * This function orchestrates the complete sign up process:
 * 
 * STEP 1: Validate user input
 *   - Check that all required fields are filled
 * 
 * STEP 2: Sign up with AWS Cognito
 *   - Create the user account in AWS Cognito (authentication service)
 *   - Cognito handles password security, email verification, etc.
 *   - Returns a userId which is the "sub" (subject identifier)
 *   - This sub becomes our primary key in the database
 * 
 * STEP 3: Create user in our backend database
 *   - Send the username/alias to our backend API
 *   - Include the sub from Cognito as the primary key
 *   - Backend stores this in the database
 * 
 * STEP 4: Navigate to next screen
 *   - Move to email confirmation screen
 */
const handleSignUp = async () => {
  // STEP 1: Validate that all required fields are filled
  if (!given_name || !email || !DOB || !alias || !password) {
    Alert.alert("Error", "Please fill out all fields.");
    return;
  }

  try {
    // STEP 1.5: Ensure no user is signed in before attempting signup
    // This prevents "already signed in user" errors during testing
    try {
      const existingUser = await getCurrentUser();
      if (existingUser) {
        console.log("[SignUp] User already signed in, signing out before signup...");
        await signOut();
        console.log("[SignUp] Successfully signed out before signup");
        // Small delay to ensure sign-out completes
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } catch (checkError: any) {
      // If getCurrentUser throws, no user is signed in - that's fine
      if (checkError.name !== 'UserUnAuthenticatedException') {
        console.log("[SignUp] Error checking for existing user:", checkError.name);
      }
    }

    // STEP 2: Sign up with AWS Cognito
    // This creates the user account in AWS Cognito
    // IMPORTANT: When Cognito is configured with email alias (loginWith: { email: true }),
    // the username field CANNOT be an email format. We must use a unique username (alias)
    // and provide the email in userAttributes instead.
    // The response includes userId which is the "sub" (subject identifier from Cognito)
    const signUpResult = await signUp({
      username: alias, // Use alias as username (NOT email - email alias config prevents email in username field)
      password,
      options: {
        userAttributes: {
          email: email, // Email goes in userAttributes, not as username
          given_name: given_name,
          preferred_username: alias, // Also store alias as preferred_username attribute
        },
      },
    });

    // Extract userId and nextStep from the sign up result
    // userId from Cognito is the "sub" - this is our primary key
    // The sub is a unique identifier that AWS Cognito assigns to each user
    const sub = signUpResult.userId;
    const nextStep = signUpResult.nextStep;

    // Validate that we got a userId (sub) - this should always be present after sign up
    if (!sub) {
      throw new Error("Failed to get user ID from Cognito. Please try again.");
    }

    console.log("Cognito sign up successful. User ID (sub):", sub);
    console.log("Next step:", nextStep);

    // STEP 3: Store password temporarily in context for auto-login after email confirmation
    // Note: User creation in backend will happen after email confirmation and sign-in
    // when we have an authenticated session (ID token available)
    // This is more secure than passing it through navigation params
    setTempPasswordForSignup(password);
    
    // STEP 4: Navigate to email confirmation screen
    // The user needs to verify their email with the code Cognito sent
    // Password is stored in context, not passed through navigation params for security
    // Pass required data for user creation (will happen after sign-in)
    // @ts-ignore
    navigation.navigate("ConfirmSignUp", { 
      username: alias, 
      email, 
      given_name, 
      DOB 
    });
  } catch (error: any) {
    // Handle any errors during the sign up process
    console.error("Error during sign up:", error);
    console.error("Error name:", error?.name);
    console.error("Error message:", error?.message);
    console.error("Full error:", JSON.stringify(error, null, 2));
    
    // Special handling for "already signed in" error
    // Check multiple possible error formats
    const errorMessage = (error?.message || "").toLowerCase();
    const errorName = error?.name || "";
    const isAlreadySignedIn = 
      (errorMessage.includes("already") && errorMessage.includes("signed in")) ||
      errorMessage.includes("already a signed in user") ||
      errorName === "UserAlreadyAuthenticatedException" ||
      errorName === "AlreadyAuthenticatedException";
    
    if (isAlreadySignedIn) {
      console.log("[SignUp] User already signed in error detected, signing out...");
      try {
        // Sign out the existing user
        await signOut();
        console.log("[SignUp] Successfully signed out, please try signing up again");
        Alert.alert(
          "Already Signed In",
          "You were already signed in. We've signed you out. Please try signing up again.",
          [{ text: "OK" }]
        );
      } catch (signOutError: any) {
        console.error("[SignUp] Failed to sign out:", signOutError);
        Alert.alert(
          "Sign Up Failed",
          "You are already signed in. Please sign out first, then try again."
        );
      }
      return; // Don't show the generic error message
    }
    
    // For all other errors, show the error message
    Alert.alert("Sign Up Failed", error.message || "An error has occurred");
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
            <Text style={styles.headerText}>
              Let's start you with creating your account
            </Text>
          </View>

          <View style={styles.formBox}>
            <Text style={styles.label}>First Name</Text>
            <TextInput
              style={styles.input}
              placeholder="John"
              placeholderTextColor="#aaaaaaac"
              value={given_name}
              onChangeText={setgiven_name}
              autoCapitalize="words"
            />

            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="JohnDoe@email.com"
              placeholderTextColor="#aaaaaaac"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />

<Text style={styles.label}>Birth Year</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY"
              placeholderTextColor="#aaaaaaac"
              value={DOB}
              onChangeText={(text) => {
                // Only allow numeric input and limit to 4 digits
                const numericText = text.replace(/[^0-9]/g, '');
                if (numericText.length <= 4) {
                  setDOB(numericText);
                }
              }}
              keyboardType="numeric"
              maxLength={4}
            />

            <Text style={styles.label}>Username</Text>
            <TextInput
              style={styles.input}
              placeholder="Johnny7797"
              placeholderTextColor="#aaaaaaac"
              value={alias}
              onChangeText={setAlias}
              autoCapitalize="none"
            />

            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="#aaaaaaac"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            <PrimaryButton
              label="Sign Up"
              variant="continue"
              onPress={handleSignUp}
              containerStyle={styles.button}
            />
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
    width: 300,
    height: 300,
    top: -20,
  },
  headerContainer: {
    marginBottom: 100,
    top: -50,
    paddingHorizontal: 10,
    alignItems: "center",
  },
  headerText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "400",
    textAlign: "center",
    lineHeight: 28,
    textShadowColor: "rgba(0, 0, 0, 0.6)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
  formBox: {
    width: SCREEN_WIDTH * 0.85,
    padding: 20,
    borderRadius: 12,
    top: -120,
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
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  button: {
    backgroundColor: "#2255a7ff",
    marginTop: 24,
  },
});

export default SignUpScreen;
