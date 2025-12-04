import { ResizeMode, Video } from "expo-av";
import React, { useState } from "react";
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import PrimaryButton from "../Components/PrimaryButton";
import PrivacyDropdown from "./ProfileSetUp Components/PrivacyDropdown";
import ToggleGroup from "./ProfileSetUp Components/ToggleGroup";


const {width : SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get("window");

const ProfileSetUp = () => {
    const navigation = useNavigation<any>();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedPrivacy, setSelectedPrivacy] = useState<string | null>(null);
  const [isNatty, setIsNatty] = useState(true);
  const [showWeight, setShowWeight] = useState(true);
  const [showHeight, setShowHeight] = useState(true);
  const [statTracking, setStatTracking] = useState(true);


  const privacyOptions = [
    { value: "public", label: "Public", description: "All users can see you, your workouts, and your posts" },
    { value: "friendsOnly", label: "Friends Only", description: "Only people who you follow will see you, your workouts, and your posts" },
    { value: "private", label: "Private", description: "Only you will see your workouts and leaderboard position" },
  ];



  const handleSelectPrivacy = (value: string) => {
    setSelectedPrivacy(value);
    setIsDropdownOpen(false);
  };

  const toggleToggles = [
    {

      label: "Natty Status",
      description: "Toggle on if you train naturally, off if you are enhanced",
      value: isNatty,
      onValueChange: setIsNatty,
    },

    {
      label: "Show Weight",
      description: "Allow others to see your weight on your profile",
      value: showWeight,
      onValueChange: setShowWeight,
    },
    {
      label: "Show Height",
      description: "Allow others to see your height on your profile",
      value: showHeight,
      onValueChange: setShowHeight,
    },
    {
      label: "Stat Tracking",
      description: "Allow MuscleHead to track your workout data to place you on leaderboards, track progress, and more",
      value: statTracking,
      onValueChange: setStatTracking,
    },
  ];

  return (
    <View style={styles.container}>
        <Video
          source={require("../assets/PerfectSquat.mp4")}
          style={styles.video}
          resizeMode={ResizeMode.COVER}
          isLooping
          shouldPlay
          isMuted
        />

        {/* Overlay Content */}
        <View style={styles.overlay}>
          <TouchableOpacity style={styles.profilePicture}>
            <Ionicons name="add" color="#fff" size={40} />
          </TouchableOpacity>
          <Text style={styles.AddProfilePictureText}>Add Profile Picture</Text>

          <PrivacyDropdown
            options={privacyOptions}
            selectedPrivacy={selectedPrivacy}
            isOpen={isDropdownOpen}
            onToggle={() => setIsDropdownOpen(!isDropdownOpen)}
            onSelect={handleSelectPrivacy}
          />

          <ToggleGroup toggles={toggleToggles} />

          <PrimaryButton
            label="Finish Set Up"
            variant="continue"
            onPress={() => navigation.navigate("WorkoutInputMainPage")}
            containerStyle={styles.continueButton}
          />
        </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },
  text: {
    color: "#fff",
    fontSize: 24,
  },
  video: {
    width: SCREEN_WIDTH * 1.1,
    height: SCREEN_HEIGHT * 1.1,
    position: "absolute",
    top: -(SCREEN_HEIGHT * 0.05),
    left: -(SCREEN_WIDTH * 0.1),
    zIndex: 0,
  },
  overlay: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    width: "100%",
    zIndex: 1,
    paddingTop: SCREEN_HEIGHT * 0.12,
    paddingBottom: 40,
  },
  profilePicture: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    backgroundColor:"#708090",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    borderColor: "rgba(255,255,255,0.4)",
  },

  AddProfilePictureText:{
    color: "#ffffff",
   fontSize: 15,
   fontWeight: "700",
    justifyContent: "center",
    alignSelf:"center",
    marginBottom: 28,
  },

  PrivacySettingText:{
      color: "#ffffff",
     fontSize: 20,
     fontWeight: "700",
      justifyContent: "center",
      alignSelf:"center",
      top: -200,
  },
  continueButton: {
    marginTop: 10,
    zIndex: 1002,
  },
});

export default ProfileSetUp;