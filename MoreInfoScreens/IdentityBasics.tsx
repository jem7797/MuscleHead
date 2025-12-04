import React, { useRef, useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  Animated,
} from "react-native";
import { Video, ResizeMode } from "expo-av";
import { useNavigation } from "@react-navigation/native";
import BackButton from "../Components/BackButton";
import PrimaryButton from "../Components/PrimaryButton";
import GenderSelector from "./IdentityBasics Components/GenderSelector";
import { useOnboarding } from "../Contexts/OnboardingContext";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const IdentityBasics = () => {
  const videoRef = useRef(null);
  const [videoReady, setVideoReady] = useState(false);
  const { onboardingData, setGender } = useOnboarding();
  const gender = onboardingData.gender;
  const navigation = useNavigation<any>();

  // Animation value for continue button
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const handleVideoReady = () => {
    setVideoReady(true);
  };

  // Animate button fade in/out when gender is selected
  useEffect(() => {
    if (gender) {
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
  }, [gender]);

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

            <GenderSelector
              selectedGender={gender}
              onSelect={(g) => {
                setGender(g);
              }}
            />

            <PrimaryButton
              label="Continue"
              variant="continue"
              onPress={() => {
                // Gender is already saved in context via onSelect
                navigation.navigate("HeightWeight");
              }}
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
  continueWrapper: {
    marginTop: 50,
  },
});

export default IdentityBasics;
