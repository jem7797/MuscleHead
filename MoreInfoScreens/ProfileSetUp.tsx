import { ResizeMode, Video } from "expo-av";
import React, { useState } from "react";
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, ScrollView, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";


const {width : SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get("window");

const ProfileSetUp = () => {
    const navigation = useNavigation<any>();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedPrivacy, setSelectedPrivacy] = useState<string | null>(null);

  const privacyOptions = [
    { value: "open", label: "Open", description: "All users can see you, your workouts, and your posts" },
    { value: "closeFriends", label: "Close Friends", description: "Only people who you follow will see you, your workouts, and your posts" },
    { value: "closed", label: "Closed", description: "No one will see anything from you" },
  ];


  const days = [
    {value: 1, day: "Monday"},
    {value: 2, day: "Tuesday"},
    {value: 3, day: "Wednesday"},
    {value: 4, day: "Thursday"},
    {value: 5, day: "Friday"},
    {value: 6, day: "Saturday"},
    {value: 7, day: "Sunday"},
  ]



  const getSelectedLabel = () => {
    if (!selectedPrivacy) return "Select privacy setting";
    const option = privacyOptions.find(opt => opt.value === selectedPrivacy);
    return option ? option.label : "Select privacy setting";
  };

  const handleSelectPrivacy = (value: string) => {
    setSelectedPrivacy(value);
    setIsDropdownOpen(false);
  };

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

          {/* Privacy Dropdown */}
          <View style={styles.dropdownContainer}>
      <TouchableOpacity 
        style={[
          styles.dropdownButton,
          selectedPrivacy && styles.dropdownButtonSelected
        ]} 
        onPress={() => setIsDropdownOpen(!isDropdownOpen)}
      >
        <Text style={styles.dropdownButtonText}>{getSelectedLabel()}</Text>
        <Ionicons 
          name={isDropdownOpen ? "chevron-up" : "chevron-down"} 
          size={20} 
          color="#fff" 
        />
      </TouchableOpacity>

      {isDropdownOpen && (
        <View style={styles.dropdownList}>
          <ScrollView>
            {privacyOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.dropdownOption,
                  selectedPrivacy === option.value && styles.dropdownOptionSelected
                ]}
                onPress={() => handleSelectPrivacy(option.value)}
              >
                <Text style={styles.dropdownOptionLabel}>{option.label}</Text>
                <Text style={styles.dropdownOptionDescription}>{option.description}</Text>
                {selectedPrivacy === option.value && (
                  <Ionicons name="checkmark" size={20} color="#013cdeff" style={styles.checkIcon} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
          </View>

          {/* Continue Button */}
          <TouchableOpacity
            style={styles.continueButton}
            onPress={() => navigation.navigate("WorkoutInputMainPage")} 
          >
            <Text style={styles.continueText}>Finish Set Up</Text>
          </TouchableOpacity>
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
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    zIndex: 1,
  },
  profilePicture: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    backgroundColor:"#708090",
    top: -260,
    alignItems: "center",
    justifyContent: "center",
  },

  AddProfilePictureText:{
    color: "#ffffff",
   fontSize: 15,
   fontWeight: "700",
    justifyContent: "center",
    alignSelf:"center",
    top: -250,

  },

  PrivacySettingText:{
      color: "#ffffff",
     fontSize: 20,
     fontWeight: "700",
      justifyContent: "center",
      alignSelf:"center",
      top: -200,
  },
  dropdownContainer: {
    width: SCREEN_WIDTH * 0.85,
    top: -200,
    zIndex: 1000,
    position: "relative",
  },
  dropdownButton: {
    backgroundColor: "rgba(98, 98, 98, 0.67)",
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  dropdownButtonSelected: {
    borderColor: "#013cdeff",
  },
  dropdownButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
  },
  dropdownList: {
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    borderRadius: 14,
    maxHeight: 300,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    overflow: "hidden",
    position: "absolute",
    top: 52,
    width: "100%",
    zIndex: 1001,
    elevation: 10,
  },
  dropdownOption: {
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
    position: "relative",
  },
  dropdownOptionSelected: {
    backgroundColor: "rgba(1, 60, 222, 0.2)",
  },
  dropdownOptionLabel: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },
  dropdownOptionDescription: {
    color: "#aaa",
    fontSize: 13,
    lineHeight: 18,
    paddingRight: 30,
  },
  checkIcon: {
    position: "absolute",
    right: 18,
    top: 16,
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
    marginTop: 30,
    zIndex: 1002,
    bottom: -260
  },
  continueText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
});

export default ProfileSetUp;