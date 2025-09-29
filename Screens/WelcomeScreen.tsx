import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated, TouchableOpacity, Text, Dimensions } from "react-native";
import { Video } from "expo-av";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const WelcomeScreen = () => {
  const translateY = useRef(new Animated.Value(0)).current;
  const loginOpacity = useRef(new Animated.Value(0)).current;
  const signInOpacity = useRef(new Animated.Value(0)).current;
  const videoRef = useRef(null);

  useEffect(() => {
    const logoAnim = Animated.timing(translateY, {
      toValue: -150,
      duration: 600,
      useNativeDriver: true,
    });

    const loginAnim = Animated.timing(loginOpacity, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    });

    const signInAnim = Animated.timing(signInOpacity, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    });

    Animated.sequence([logoAnim, Animated.stagger(150, [loginAnim, signInAnim])]).start();
  }, [translateY, loginOpacity, signInOpacity]);

  return (
    <View style={styles.container}>
      {/* Video Background */}
      <Video
        ref={videoRef}
        source={require("../assets/WorkoutBackgroundVideo.mp4")}
        style={styles.video}
        resizeMode="cover"
        isLooping
        shouldPlay
        isMuted
      />

      {/* Logo */}
      <Animated.Image
        source={require("../assets/muscleheadtitle.png")}
        style={[styles.image, { transform: [{ translateY }] }]}
        resizeMode="contain"
      />

      {/* Buttons */}
      <Animated.View style={[styles.buttonWrapper, { opacity: loginOpacity }]}>
        <TouchableOpacity style={styles.buttonLarge}>
          <Text style={styles.buttonText}>Log In</Text>
        </TouchableOpacity>
      </Animated.View>

      <Animated.View style={[styles.buttonWrapper, { opacity: signInOpacity }]}>
        <TouchableOpacity style={styles.buttonSmall}>
          <Text style={styles.buttonTextSmall}>Sign Up</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", position: "relative" },
  video: {
  width: SCREEN_WIDTH * 1.1,      
  height: SCREEN_HEIGHT * 1.1,
  position: "absolute",
  top: -(SCREEN_HEIGHT * 0.05),   
  left: -(SCREEN_WIDTH * 0.2),    
},

  image: { width: 300, height: 300 },
  buttonWrapper: { marginTop: 24, alignItems: "center" },
  buttonLarge: {
    backgroundColor: "#890505ff",
    width: 260,
    height: 56,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonSmall: {
    backgroundColor: "#797676ff",
    width: 180,
    height: 47,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "600" },
  buttonTextSmall: { color: "#fff", fontSize: 14, fontWeight: "500" },
});

export default WelcomeScreen;
