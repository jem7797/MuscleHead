import React, { useState } from "react";
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from "react-native";
import { Video } from "expo-av";
import WheelPickerExpo from "react-native-wheel-picker-expo";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const HeightWeight = () => {
  const [weight, setWeight] = useState(150);

  const weightOptions = Array.from({ length: 300 }, (_, i) => i + 50); // 50–350

  return (
    <View style={styles.container}>
      {/* Background Video */}
      <Video
        source={require("../assets/PerfectDumbbells.mp4")}
        style={styles.video}
        resizeMode="cover"
        isLooping
        shouldPlay
        isMuted
      />

      {/* Overlay */}
      <View style={styles.overlay}>
        <Text style={styles.label}>Select Your Weight</Text>

        <View style={styles.wheelRow}>
          {/* Weight Wheel */}
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

     <TouchableOpacity style ={styles.continueButton}>
        <Text style = {styles.continueText}>Continue</Text>
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
    top: 50
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
