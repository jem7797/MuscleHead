import React, { useState } from "react";
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
import { signUp } from "aws-amplify/auth";
import { useNavigation } from "@react-navigation/native";
import { useUser } from "../Contexts/UserContext";
import PrimaryButton from "../Components/PrimaryButton";
// Import our new user API service
import { createUser } from "../Services/userApi";


const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const SignUpScreen = () => {
  const navigation = useNavigation();
  //@ts-ignore
  const {given_name, setgiven_name} = useUser();
  const [email, setEmail] = useState("");
  const [DOB, setDOB] = useState("");
  const [alias, setAlias] = useState("");
  const [password, setPassword] = useState("");

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

    // STEP 3: Create user in our backend database
    // Now that we have the sub from Cognito, we can create the user record in our database
    // We're sending all required fields:
    //   - sub_id: The Cognito user ID (UUID format, primary key in our database)
    //   - username: The alias the user chose (e.g., "Johnny7797")
    //   - email: The user's email address
    //   - first_name: The user's first name
    //   - birth_year: The user's birth year (as integer)
    //   - height: Default height in inches (will be updated later when user provides it)
    //   - weight: Default weight in pounds (will be updated later when user provides it)
    // Note: Height and weight are collected later in the flow (HeightWeight screen),
    // so we use default values here. The user record should be updated after HeightWeight screen.
    try {
      // Default values: 70 inches (5'10") and 150 lbs
      // These will be updated when the user completes the HeightWeight screen
      const defaultHeight = 70; // inches
      const defaultWeight = 150; // pounds
      const userData = await createUser(alias, sub, email, given_name, DOB, {
        height: defaultHeight,
        weight: defaultWeight,
      });
      console.log("User created in backend database:", userData);
    } catch (error: any) {
      // If backend creation fails, log it but don't block the flow
      // The user is already created in Cognito, so they can still verify their email
      // We might want to retry this later or handle it differently
      console.error("Failed to create user in backend:", error.message);
      // You might want to show a warning here, but not block navigation
      Alert.alert(
        "Warning",
        "Account created but there was an issue saving your profile. Please contact support."
      );
    }

    // STEP 4: Navigate to email confirmation screen
    // The user needs to verify their email with the code Cognito sent
    // Pass the alias (username) since that's what Cognito uses for confirmation
    // @ts-ignore
    navigation.navigate("ConfirmSignUp", { username: alias, email });
  } catch (error: any) {
    // Handle any errors during the sign up process
    console.error("Error during sign up:", error);
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
