import React from "react";
import { StyleSheet, View, TouchableOpacity, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface RotateButtonProps {
  spin: Animated.AnimatedInterpolation<string | number>;
  onRotate: () => void;
}

const RotateButton: React.FC<RotateButtonProps> = ({ spin, onRotate }) => {
  return (
    <View style={styles.overlay} pointerEvents="box-none">
      <Animated.View
        style={[styles.rotateBtn, { transform: [{ rotate: spin }] }]}
      >
        <TouchableOpacity
          onPress={onRotate}
          accessibilityRole="button"
          accessibilityLabel="Rotate to front/back view"
          hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
        >
          <Ionicons name="swap-horizontal" size={26} color="#e85d04" />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
  },
  rotateBtn: {
    position: "absolute",
    top: 50,
    right: 20,
    backgroundColor: "#C4C4C4",
    borderRadius: 22,
    padding: 10,
    elevation: 6,
    zIndex: 1200,
  },
});

export default RotateButton;

