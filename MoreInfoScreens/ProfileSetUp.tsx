import { ResizeMode, Video } from "expo-av";
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import PrimaryButton from "../Components/PrimaryButton";
import PrivacyDropdown from "./ProfileSetUp Components/PrivacyDropdown";
import ToggleGroup from "./ProfileSetUp Components/ToggleGroup";
import { useOnboarding } from "../Contexts/OnboardingContext";
import { updateUser, getUser, createUser } from "../Services/userApi";
import { getCurrentUserSub } from "../Services/apiConfig";
import { fetchAuthSession, fetchUserAttributes } from "aws-amplify/auth";


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
    { value: "private", label: "Private", description: "Only you will see your workouts and notifications" },
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
      // Step 1: Verify user is authenticated and refresh session if needed
      console.log("[ProfileSetUp] Verifying authentication...");
      let session;
      try {
        session = await fetchAuthSession({ forceRefresh: true });
        // API requires ID token (not access token) - ID token has 'aud' claim needed by backend
        if (!session.tokens?.idToken) {
          throw new Error("No ID token available. Please sign in again.");
        }
        console.log("[ProfileSetUp] Authentication verified - ID token available");
        // Log token preview for debugging
        const idToken = session.tokens.idToken;
        const tokenStr = typeof idToken === 'string' ? idToken : String(idToken);
        const preview = tokenStr.length > 20 
          ? `${tokenStr.substring(0, 10)}...${tokenStr.substring(tokenStr.length - 10)}`
          : tokenStr;
        console.log(`[ProfileSetUp] ID token preview: ${preview}`);
      } catch (authError: any) {
        console.error("[ProfileSetUp] Authentication check failed:", authError);
        throw new Error("You are not signed in. Please sign in and try again.");
      }

      // Step 2: Get the current user's sub ID
      const sub = await getCurrentUserSub();
      if (!sub) {
        throw new Error("Unable to get user information. Please try signing in again.");
      }
      console.log("[ProfileSetUp] User sub retrieved:", sub);

      // Step 2.5: Get required user attributes from Cognito (needed for backend validation)
      // The backend requires these fields even for updates, so we fetch them from Cognito
      let userAttributes;
      try {
        userAttributes = await fetchUserAttributes();
        console.log("[ProfileSetUp] User attributes retrieved from Cognito");
      } catch (attrError: any) {
        console.error("[ProfileSetUp] Failed to fetch user attributes:", attrError);
        throw new Error("Unable to retrieve user information. Please try signing in again.");
      }

      // Extract required fields from Cognito attributes
      // Note: Cognito stores these with attribute names like 'email', 'given_name', 'preferred_username'
      const email = userAttributes.email;
      const firstName = userAttributes.given_name;
      const username = userAttributes.preferred_username || userAttributes['custom:alias'] || userAttributes.username;

      // Validate we have basic required fields from Cognito
      if (!email || !firstName || !username) {
        throw new Error("Missing required user information. Please contact support.");
      }

      // Try to get birth_year from existing backend user record
      // If user doesn't exist, we'll need to create them with all required fields
      let birthYear: number | null = null;
      let existingUser = null;
      try {
        existingUser = await getUser(sub);
        birthYear = existingUser.birth_year;
        console.log("[ProfileSetUp] Existing user found in backend, birth_year:", birthYear);
      } catch (getUserError: any) {
        // User doesn't exist yet - this is OK, we'll need to include birth_year when creating/updating
        console.log("[ProfileSetUp] User not found in backend (may need to be created)");
        
        // If DOB is not available from backend, we can't proceed without it
        // For now, throw an error - the user should have been created during signup
        throw new Error("User profile not found. Please try signing out and signing in again, or contact support.");
      }
      
      if (!birthYear || birthYear < 1920) {
        throw new Error("Invalid birth year in user profile. Please contact support.");
      }

      // Calculate total height in inches
      const totalHeightInches = safeOnboardingData.heightFeet && safeOnboardingData.heightInches
        ? (safeOnboardingData.heightFeet * 12) + safeOnboardingData.heightInches
        : null;

      // Build the update payload with all onboarding data
      // Include required fields from Cognito (backend validation requires these even for updates)
      const updateData: Record<string, any> = {
        email: email,
        first_name: firstName,
        username: username,
        birth_year: birthYear,
      };

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
      description: "Allow MeatHead to track your workout data to send you notifications, track progress, and more",
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