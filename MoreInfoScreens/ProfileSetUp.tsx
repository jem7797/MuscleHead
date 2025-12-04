import { ResizeMode, Video } from "expo-av";
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import PrimaryButton from "../Components/PrimaryButton";
import PrivacyDropdown from "./ProfileSetUp Components/PrivacyDropdown";
import ToggleGroup from "./ProfileSetUp Components/ToggleGroup";
import { useOnboarding } from "../Contexts/OnboardingContext";
import { updateUser } from "../Services/userApi";
import { getCurrentUserSub } from "../Services/apiConfig";


const {width : SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get("window");

const ProfileSetUp = () => {
    const navigation = useNavigation<any>();
  const { 
    onboardingData, 
    setPrivacySetting, 
    setShowWeight, 
    setShowHeight, 
    setStatTracking, 
    setIsNatty,
    resetOnboardingData 
  } = useOnboarding();
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Ensure onboardingData exists with all required properties (safety check)
  // Merge with defaults to ensure all properties exist even if onboardingData is partial
  const defaultOnboardingData = {
    gender: null,
    heightFeet: null,
    heightInches: null,
    weight: null,
    privacy_setting: null,
    show_weight: null,
    show_height: null,
    stat_tracking: null,
    isNatty: null,
  };
  
  const safeOnboardingData = {
    ...defaultOnboardingData,
    ...(onboardingData || {}),
  };
  
  // Initialize context values with defaults if they're null (on first load)
  useEffect(() => {
    // Use optional chaining and check for both null and undefined
    if (safeOnboardingData?.isNatty == null) {
      setIsNatty(true);
    }
    if (safeOnboardingData?.show_weight == null) {
      setShowWeight(true);
    }
    if (safeOnboardingData?.show_height == null) {
      setShowHeight(true);
    }
    if (safeOnboardingData?.stat_tracking == null) {
      setStatTracking(true);
    }
  }, []); // Only run on mount
  
  // Use context values, with local state as fallback for UI
  const selectedPrivacy = safeOnboardingData.privacy_setting ?? null;
  const isNatty = safeOnboardingData.isNatty ?? true;
  const showWeight = safeOnboardingData.show_weight ?? true;
  const showHeight = safeOnboardingData.show_height ?? true;
  const statTracking = safeOnboardingData.stat_tracking ?? true;


  const privacyOptions = [
    { value: "public", label: "Public", description: "All users can see you, your workouts, and your posts" },
    { value: "friendsOnly", label: "Friends Only", description: "Only people who you follow will see you, your workouts, and your posts" },
    { value: "private", label: "Private", description: "Only you will see your workouts and leaderboard position" },
  ];



  const handleSelectPrivacy = (value: string) => {
    setPrivacySetting(value);
    setIsDropdownOpen(false);
  };

  const handleFinishSetUp = async () => {
    // Validate that privacy setting is selected
    if (!selectedPrivacy) {
      Alert.alert("Required Field", "Please select a privacy setting before continuing.");
      return;
    }

    setIsSaving(true);

    try {
      // Get the current user's sub ID
      const sub = await getCurrentUserSub();
      if (!sub) {
        throw new Error("Unable to get user information. Please try signing in again.");
      }

      // Calculate total height in inches
      const totalHeightInches = safeOnboardingData.heightFeet && safeOnboardingData.heightInches
        ? (safeOnboardingData.heightFeet * 12) + safeOnboardingData.heightInches
        : null;

      // Build the update payload with all onboarding data
      const updateData: Record<string, any> = {};

      if (safeOnboardingData.gender) {
        updateData.gender = safeOnboardingData.gender;
      }

      if (totalHeightInches !== null) {
        updateData.height = totalHeightInches;
      }

      if (safeOnboardingData.weight !== null && safeOnboardingData.weight !== undefined) {
        updateData.weight = safeOnboardingData.weight;
      }

      if (selectedPrivacy) {
        updateData.privacy_setting = selectedPrivacy;
      }

      // Use context values or fallback to defaults (true) if null
      updateData.show_weight = safeOnboardingData.show_weight ?? true;
      updateData.show_height = safeOnboardingData.show_height ?? true;
      updateData.stat_tracking = safeOnboardingData.stat_tracking ?? true;
      
      // Note: isNatty might need to map to a backend field - adjust field name if needed
      updateData.isNatty = safeOnboardingData.isNatty ?? true;

      // Make the API call to update user
      await updateUser(sub, updateData);

      // Clear onboarding data from context
      resetOnboardingData();

      // Navigate to main app
      navigation.navigate("WorkoutInputMainPage");
    } catch (error: any) {
      console.error("Error saving profile data:", error);
      Alert.alert(
        "Save Failed",
        error.message || "Failed to save your profile. Please check your connection and try again.",
        [
          {
            text: "Retry",
            onPress: handleFinishSetUp,
          },
          {
            text: "Cancel",
            style: "cancel",
          },
        ]
      );
    } finally {
      setIsSaving(false);
    }
  };

  const toggleToggles = [
    {
      label: "Natty Status",
      description: "Toggle on if you train naturally, off if you are enhanced",
      value: isNatty,
      onValueChange: (value: boolean) => {
        setIsNatty(value);
      },
    },
    {
      label: "Show Weight",
      description: "Allow others to see your weight on your profile",
      value: showWeight,
      onValueChange: (value: boolean) => {
        setShowWeight(value);
      },
    },
    {
      label: "Show Height",
      description: "Allow others to see your height on your profile",
      value: showHeight,
      onValueChange: (value: boolean) => {
        setShowHeight(value);
      },
    },
    {
      label: "Stat Tracking",
      description: "Allow MuscleHead to track your workout data to place you on leaderboards, track progress, and more",
      value: statTracking,
      onValueChange: (value: boolean) => {
        setStatTracking(value);
      },
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
            label={isSaving ? "Saving..." : "Finish Set Up"}
            variant="continue"
            onPress={handleFinishSetUp}
            disabled={isSaving}
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