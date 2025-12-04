import React, { useState, useRef } from "react";
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Animated } from "react-native";
import { ResizeMode, Video } from "expo-av";
import { useNavigation } from "@react-navigation/native";
import BackButton from "../Components/BackButton";
import PrimaryButton from "../Components/PrimaryButton";
import WeightPicker from "./HeightWeight Components/WeightPicker";
import HeightPicker from "./HeightWeight Components/HeightPicker";
import { useOnboarding } from "../Contexts/OnboardingContext";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const HeightWeight = () => {
  const navigation = useNavigation<any>();
  const { setHeight, setWeight } = useOnboarding();
  const [weight, setWeightLocal] = useState(150);
  const [heightFeet, setHeightFeet] = useState(5);
  const [heightInches, setHeightInches] = useState(10);
  const [step, setStep] = useState<'weight' | 'height'>('weight');
  const fadeAnim = useRef(new Animated.Value(1)).current;


  const handleContinue = () => {
    if (step === 'weight') {
      // Save weight to context before transitioning to height
      setWeight(weight);
      // Fade out weight section
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        // Switch to height after fade out
        setStep('height');
        fadeAnim.setValue(0);
        // Fade in height section
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start();
      });
    } else {
      // Final continue - save height to context, then navigate to ProfileSetUp screen
      setHeight(heightFeet, heightInches);
      navigation.navigate("ProfileSetUp");
    }
  };

  const handleBack = () => {
    if (step === 'height') {
      // Go back to weight step
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        setStep('weight');
        fadeAnim.setValue(0);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start();
      });
    } else {
      // Go back to previous screen
      navigation.goBack();
    }
  };

  return (
    <View style={styles.container}>
      {/* Background Video */}
      <Video
        source={require("../assets/PerfectDumbbells.mp4")}
        style={styles.video}
        resizeMode={ResizeMode.COVER}
        isLooping
        shouldPlay
        isMuted
      />

      {/* Overlay */}
      <View style={styles.overlay}>
        <BackButton
          color="#fff"
          style={styles.backButton}
          backgroundColor="rgba(0, 0, 0, 0.3)"
          onPress={handleBack}
        />

        <Animated.View style={{ opacity: fadeAnim, width: '100%', alignItems: 'center' }}>
          {step === 'weight' ? (
            <WeightPicker weight={weight} onWeightChange={setWeightLocal} />
          ) : (
            <HeightPicker
              heightFeet={heightFeet}
              heightInches={heightInches}
              onFeetChange={setHeightFeet}
              onInchesChange={setHeightInches}
            />
          )}
        </Animated.View>

        <PrimaryButton containerStyle={styles.primaryButton}
          label="Continue"
          variant="continue"
          onPress={handleContinue}
        />
      </View>
    </View>
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

  primaryButton:{
    marginTop: 35,
  }

});

export default HeightWeight;
