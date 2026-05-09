import React, { useRef, useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Text,
  Dimensions,
} from "react-native";
import { Image } from "expo-image";
import { Video } from "expo-av";
import { useUser } from "../Contexts/UserContext";
import { accent, borderSubtle, surfaceElevated, textPrimary } from "../theme/colors";

const AnimatedImage = Animated.createAnimatedComponent(Image);

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
  // @ts-ignore
const WelcomeScreen = ({navigation}) => {
  const { isAuthenticated, isLoading } = useUser();

  // If already authenticated, go directly to main app (persistent login)
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigation.reset({
        index: 0,
        routes: [{ name: "WorkoutInputMainPage" }],
      });
    }
  }, [isLoading, isAuthenticated, navigation]);
  const translateY = useRef(new Animated.Value(0)).current;
  const loginOpacity = useRef(new Animated.Value(0)).current;
  const signInOpacity = useRef(new Animated.Value(0)).current;
  const videoRef = useRef(null);
  const [videoReady, setVideoReady] = useState(false);

  const startAnimations = () => {
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

    Animated.sequence([
      logoAnim,
      Animated.stagger(150, [loginAnim, signInAnim]),
    ]).start();
  };

  const handleVideoReady = () => {
    setVideoReady(true);
    startAnimations();
  };

  return (
    <View style={styles.container}>
      {/* add Static fallback image so it never flashes black
      <Image
        source={require("../assets/fallback.jpg")}
        style={styles.video}
        resizeMode="cover"
      /> */}

      {/* Background Video */}
      <Video
        ref={videoRef}
        source={require("../assets/WorkoutBackgroundVideo.mp4")}
        style={styles.video}
          // @ts-ignore
        resizeMode="cover"
        isLooping
        shouldPlay
        isMuted
        onReadyForDisplay={handleVideoReady}
      />

      {/* Logo */}
      <AnimatedImage
        source={require("../assets/MeatHeadLogo.png")}
        style={[styles.image, { transform: [{ translateY }] }]}
        contentFit="contain"
      />

      {/* Buttons */}
      <Animated.View style={[styles.buttonWrapper, { opacity: signInOpacity }]}>
        <TouchableOpacity style={styles.buttonLarge} onPress={() => navigation.navigate("SignUp") }>
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>
      </Animated.View>

      <Animated.View style={[styles.buttonWrapper, { opacity: loginOpacity }]}>
        <TouchableOpacity style={styles.buttonSmall} onPress={() => navigation.navigate("LogIn")}>
          <Text style={styles.buttonText}>Log In</Text>
        </TouchableOpacity>
      </Animated.View>

      
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    backgroundColor: "#000", // fallback background
  },
  video: {
    width: SCREEN_WIDTH * 1.1,
    height: SCREEN_HEIGHT * 1.1,
    position: "absolute",
    top: -(SCREEN_HEIGHT * 0.05),
    left: -(SCREEN_WIDTH * 0.1),
  },
  image: {
    width: 300,
    height: 300,
  },
  buttonWrapper: {
    marginTop: 24,
    alignItems: "center",
    top: 150
  },
  buttonLarge: {
    backgroundColor: accent,
    width: 260,
    height: 56,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonSmall: {
    backgroundColor: surfaceElevated,
    borderWidth: 1,
    borderColor: borderSubtle,
    width: 180,
    height: 47,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: textPrimary,
    fontSize: 18,
    fontWeight: "600",
  },
  buttonTextSmall: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
});

export default WelcomeScreen;
