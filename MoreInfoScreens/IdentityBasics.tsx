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
import { Video, ResizeMode } from "expo-av";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import BackButton from "../Components/BackButton";
import PrimaryButton from "../Components/PrimaryButton";
import GenderSelector from "./IdentityBasics Components/GenderSelector";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const IdentityBasics = () => {
  const videoRef = useRef(null);
  const [videoReady, setVideoReady] = useState(false);
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState<string | null>(null);
  const navigation = useNavigation<any>();

  // Animation value for continue button
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const handleVideoReady = () => {
    setVideoReady(true);
  };

  // Format date input as MM/DD/YYYY
  const formatDateInput = (text: string) => {
    // Remove all non-digits
    const numbers = text.replace(/\D/g, '');
    
    // Format as MM/DD/YYYY
    if (numbers.length <= 2) {
      return numbers;
    } else if (numbers.length <= 4) {
      return `${numbers.slice(0, 2)}/${numbers.slice(2)}`;
    } else {
      return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}/${numbers.slice(4, 8)}`;
    }
  };

  const handleDateChange = (text: string) => {
    const formatted = formatDateInput(text);
    setDateOfBirth(formatted);
  };

  // Animate button fade in/out when both inputs are filled
  useEffect(() => {
    if (dateOfBirth && dateOfBirth.length === 10 && gender) {
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
  }, [dateOfBirth, gender]);

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
            resizeMode={ResizeMode.COVER}
            isLooping
            shouldPlay
            isMuted
            onReadyForDisplay={handleVideoReady}
          />

          {/* Overlay Content */}
          <View style={styles.overlay}>
            <BackButton
              color="#fff"
              style={styles.backButton}
              backgroundColor="rgba(0, 0, 0, 0.3)"
            />

            {/* Date of Birth Input */}
            <View style={styles.ageWrapper}>
              <Text style={styles.label}>Date of Birth?</Text>
              <TextInput
                value={dateOfBirth}
                onChangeText={handleDateChange}
                keyboardType="numeric"
                placeholder="MM/DD/YYYY"
                placeholderTextColor="#777"
                style={styles.input}
                returnKeyType="done"
                onSubmitEditing={Keyboard.dismiss}
                maxLength={10}
              />
            </View>

            <GenderSelector
              selectedGender={gender}
              onSelect={(g) => setGender(g)}
            />

            <PrimaryButton
              label="Continue"
              variant="continue"
              onPress={() => navigation.navigate("HeightWeight")}
              animatedStyle={[styles.continueWrapper, { opacity: fadeAnim }]}
            />
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
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 10,
    borderRadius: 20,
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
  continueWrapper: {
    marginTop: 50,
  },
});

export default IdentityBasics;
