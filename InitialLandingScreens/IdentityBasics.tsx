import React, { useRef, useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  Animated,
} from "react-native";
import { Video } from "expo-av";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const IdentityBasics = () => {
  const videoRef = useRef(null);
  const [videoReady, setVideoReady] = useState(false);
  const [age, setAge] = useState("");
  const [gender, setGender] = useState<string | null>(null);
  const navigation = useNavigation();

  // Animation value for continue button
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const handleVideoReady = () => {
    setVideoReady(true);
  };

  // Animate button fade in/out when both inputs are filled
  useEffect(() => {
    if (age && gender) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [age, gender]);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={styles.container}>
          {/* Background Video */}
          <Video
            ref={videoRef}
            source={require("../assets/FixedBenchPress.mp4")}
            style={styles.video}
            resizeMode="cover"
            isLooping
            shouldPlay
            isMuted
            onReadyForDisplay={handleVideoReady}
          />

          {/* Overlay Content */}
          <View style={styles.overlay}>
            {/* Age Input */}
            <View style={styles.ageWrapper}>
              <Text style={styles.label}>How old are you?</Text>
              <TextInput
                value={age}
                onChangeText={setAge}
                keyboardType="numeric"
                placeholder="Enter age"
                placeholderTextColor="#777"
                style={styles.input}
                returnKeyType="done"
                onSubmitEditing={Keyboard.dismiss}
              />
            </View>

            {/* Gender Selection */}
            <Text style={[styles.label, { marginBottom: 25 }]}>
              Select your gender
            </Text>
            <View style={styles.genderWrapper}>
              {/* Male */}
              <TouchableOpacity
                style={[
                  styles.genderButton,
                  gender === "Male" && styles.maleSelected,
                ]}
                onPress={() => setGender("Male")}
              >
                <Ionicons
                  name="male"
                  size={50}
                  color={gender === "Male" ? "#fff" : "#999"}
                />
                <Text
                  style={[
                    styles.genderText,
                    gender === "Male" && styles.genderTextSelected,
                  ]}
                >
                  Male
                </Text>
              </TouchableOpacity>

              {/* Female */}
              <TouchableOpacity
                style={[
                  styles.genderButton,
                  gender === "Female" && styles.femaleSelected,
                ]}
                onPress={() => setGender("Female")}
              >
                <Ionicons
                  name="female"
                  size={50}
                  color={gender === "Female" ? "#fff" : "#999"}
                />
                <Text
                  style={[
                    styles.genderText,
                    gender === "Female" && styles.genderTextSelected,
                  ]}
                >
                  Female
                </Text>
              </TouchableOpacity>

              
            </View>

            {/* Continue Button (Animated Fade In) */}
            <Animated.View style={[styles.continueWrapper, { opacity: fadeAnim }]}>
              <TouchableOpacity
                style={styles.continueButton}
                // onPress={() => navigation.navigate("NextScreen")} // replace with your next screen
              >
                <Text style={styles.continueText}>Continue</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
    backgroundColor: "#000",
  },
  video: {
    width: SCREEN_WIDTH * 1.1,
    height: SCREEN_HEIGHT * 1.1,
    position: "absolute",
    top: -(SCREEN_HEIGHT * 0.05),
    left: -(SCREEN_WIDTH * 0.1),
  },
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  ageWrapper: {
    width: SCREEN_WIDTH * 0.75,
    marginBottom: 60,
    alignItems: "center",
  },
  label: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 12,
    textAlign: "center",
    textTransform: "uppercase",
  },
  input: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 14,
    color: "#fff",
    fontSize: 20,
    textAlign: "center",
    width: "100%",
    fontWeight: "600",
    letterSpacing: 0.5,
    shadowColor: "#000",
    shadowOpacity: 0.5,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
  },
  genderWrapper: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    width: SCREEN_WIDTH * 0.9,
  },
  genderButton: {
    alignItems: "center",
    padding: 20,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.08)",
    width: 100,
  },
  maleSelected: {
    backgroundColor: "#3b6fb8",
    shadowColor: "#3b6fb8",
    shadowOpacity: 1,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
  },
  femaleSelected: {
    backgroundColor: "#e75480",
    shadowColor: "#ff8ab7",
    shadowOpacity: 1,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
  },
  otherSelected: {
    backgroundColor: "#888",
    shadowColor: "#fff",
    shadowOpacity: 1,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
  },
  genderText: {
    marginTop: 8,
    color: "#aaa",
    fontSize: 15,
    fontWeight: "500",
    letterSpacing: 0.5,
  },
  genderTextSelected: {
    color: "#fff",
    fontWeight: "700",
  },
  continueWrapper: {
    marginTop: 50,
  },
  continueButton: {
    backgroundColor: "#3b6fb8",
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 14,
    shadowColor: "#3b6fb8",
    shadowOpacity: 0.8,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 10,
  },
  continueText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
});

export default IdentityBasics;
