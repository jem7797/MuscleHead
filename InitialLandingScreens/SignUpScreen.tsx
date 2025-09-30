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
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const SignUpScreen = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [alias, setAlias] = useState("");
  const [password, setPassword] = useState("");

  const handleSignUp = () => {
    // You can call your AWS Cognito sign up function here
    if (!name || !alias || !password) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    console.log("Sign Up Info:", { name, alias, password });
    // Example: call Cognito API here
  };

  return (
    <LinearGradient
    colors={['#141414e9', '#204582ff']}
    start={{x: 0, y: 0}}
    end ={{x:0, y: 1}}
      style={styles.mainContainer}
    >
      <Image
        source={require("../assets/AlternateMuscleHeadLogo.jpg")}
        style={styles.logo}
      />

      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>
          Let's start you with creating your account
        </Text>
      </View>

      <View style={styles.formBox}>
        <Text style={styles.label}>Full Name</Text>
        <TextInput
          style={styles.input}
          placeholder="John Doe"
          placeholderTextColor="#aaa"
          value={name}
          onChangeText={setName}
        />
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="John Doe"
          placeholderTextColor="#aaa"
          value={name}
          onChangeText={setName}
        />

        <Text style={styles.label}>Username</Text>
        <TextInput
          style={styles.input}
          placeholder="Johnny"
          placeholderTextColor="#aaa"
          value={alias}
          onChangeText={setAlias}
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="••••••••"
          placeholderTextColor="#aaa"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity style={styles.button} onPress={handleSignUp}>
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
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
  },
  button: {
    backgroundColor: "#3B82F6",
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
