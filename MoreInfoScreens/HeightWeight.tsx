import React, { useState, useRef } from "react";
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Animated } from "react-native";
import { ResizeMode, Video } from "expo-av";
import WheelPickerExpo from "react-native-wheel-picker-expo";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const HeightWeight = () => {
  const navigation = useNavigation<any>();
  const [weight, setWeight] = useState(150);
  const [heightFeet, setHeightFeet] = useState(5);
  const [heightInches, setHeightInches] = useState(10);
  const [step, setStep] = useState<'weight' | 'height'>('weight');
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const weightOptions = Array.from({ length: 300 }, (_, i) => i + 50); // 50–350
  const heightFeetOptions = Array.from({ length: 4 }, (_, i) => i + 4); // 4–7 feet
  const heightInchesOptions = Array.from({ length: 12 }, (_, i) => i); // 0–11 inches

  const handleContinue = () => {
    if (step === 'weight') {
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
      // Final continue - navigate to ProfileSetUp screen
      // TODO: Save weight and height data
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
        {/* Back Button */}
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>

        <Animated.View style={{ opacity: fadeAnim, width: '100%', alignItems: 'center' }}>
          {step === 'weight' ? (
            <>
              <Text style={styles.label}>Select Your Weight</Text>
              <View style={styles.wheelRow}>
                <View style={styles.wheelWrapper}>
                  <WheelPickerExpo
                    height={200}
                    width={120}
                    initialSelectedIndex={weightOptions.indexOf(weight)}
                    items={weightOptions.map((w) => ({ label: `${w} lbs`, value: w }))}
                    onChange={({ item }) => setWeight(item.value)}
                    backgroundColor="rgba(254, 253, 253, 0)"
                    selectedStyle={{ borderColor: "#3b6fb8", borderWidth: 2 }}
                  />
                </View>
              </View>
            </>
          ) : (
            <>
              <Text style={styles.label}>Select Your Height</Text>
              <View style={styles.wheelRow}>
                <View style={styles.wheelWrapper}>
                  <WheelPickerExpo
                    height={200}
                    width={120}
                    initialSelectedIndex={heightFeetOptions.indexOf(heightFeet)}
                    items={heightFeetOptions.map((h) => ({ label: `${h} ft`, value: h }))}
                    onChange={({ item }) => setHeightFeet(item.value)}
                    backgroundColor="rgba(254, 253, 253, 0)"
                    selectedStyle={{ borderColor: "#3b6fb8", borderWidth: 2 }}
                  />
                </View>
                <View style={styles.wheelWrapper}>
                  <WheelPickerExpo
                    height={200}
                    width={120}
                    initialSelectedIndex={heightInchesOptions.indexOf(heightInches)}
                    items={heightInchesOptions.map((i) => ({ label: `${i} in`, value: i }))}
                    onChange={({ item }) => setHeightInches(item.value)}
                    backgroundColor="rgba(254, 253, 253, 0)"
                    selectedStyle={{ borderColor: "#3b6fb8", borderWidth: 2 }}
                  />
                </View>
              </View>
            </>
          )}
        </Animated.View>

        <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
          <Text style={styles.continueText}>Continue</Text>
        </TouchableOpacity>
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
    padding: 10,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    borderRadius: 20,
  },
  label: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 40,
    textAlign: "center",
    textTransform: "uppercase",
  },
  wheelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-evenly",
    width: SCREEN_WIDTH * 0.9,
  },
  wheelWrapper: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 12,
    overflow: "hidden",
  },
  resultText: {
    marginTop: 30,
    color: "#fff",
    fontSize: 26,
    fontWeight: "700",
  },
  continueButton: {
    backgroundColor: "#013cdee0",
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 14,
    shadowColor: "#3b6fb8",
    shadowOpacity: 0.8,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 10,
    marginTop: 50,
  },
   continueText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
});

export default HeightWeight;
