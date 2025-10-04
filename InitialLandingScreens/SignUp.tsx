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

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const SignUpScreen = () => {
  const navigation = useNavigation();
  const [given_name, setgiven_name] = useState("");
  const [email, setEmail] = useState("");
  const [alias, setAlias] = useState("");
  const [password, setPassword] = useState("");

  const handleSignUp = async () => {
    if (!given_name || !email || !alias || !password) {
      Alert.alert("Error", "Please fill out all fields.");
      return;
    }

    try {
      const { isSignUpComplete, userId, nextStep } = await signUp({
        username: alias, // use alias (username) for Cognito
        password,
        options: {
          userAttributes: {
            email,
            given_name,
            preferred_username: alias,
          },
        },
      });

      // @ts-ignore
      navigation.navigate("ConfirmSignUp", {username : alias, email});
    } catch (error : any) {
      console.log("error signing up", error);
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

            <TouchableOpacity style={styles.button} onPress={handleSignUp}>
              <Text style={styles.buttonText}>Sign Up</Text>
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
    top: -100,
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
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});

export default SignUpScreen;
