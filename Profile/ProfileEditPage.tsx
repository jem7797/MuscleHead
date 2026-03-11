import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  ScrollView,
  Switch,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import PageHeader from "../Components/PageHeader";
import PrimaryButton from "../Components/PrimaryButton";
import { useUser } from "../Contexts/UserContext";
import { pickAndUploadPfp } from "../Services/pfpUpload";
import PrivacyDropdown from "../MoreInfoScreens/ProfileSetUp Components/PrivacyDropdown";

/** ~100 words at ~5 chars/word */
const BIO_CHAR_LIMIT = 500;

const ProfileEditPage = () => {
  const navigation = useNavigation<any>();
  const {
    userId,
    username,
    bio,
    height,
    weight,
    isNatty,
    pfpLink,
    privacySetting,

    setPrivacySetting,
    updateProfile,
  } = useUser();

  const [editedUsername, setEditedUsername] = useState(username ?? "");
  const [editedBio, setEditedBio] = useState(bio ?? "");
  const [feet, setFeet] = useState("");
  const [inches, setInches] = useState("");
  const [editedWeight, setEditedWeight] = useState(weight != null ? String(weight) : "");
  const [editedNatty, setEditedNatty] = useState(isNatty ?? true);
  const [saving, setSaving] = useState(false);
  const [uploadingPfp, setUploadingPfp] = useState(false);
  const [pfpImgError, setPfpImgError] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedPrivacySetting, setSelectedPrivacySetting] = useState(privacySetting)

  const privacyOptions = [
    { value: "public", label: "Public", description: "All users can see you, your workouts, and your posts" },
    { value: "private", label: "Private", description: "Only people who you follow will see you, your workouts, and your posts" },
    { value: "hidden", label: "Hidden", description: "No one will see your profile, even on seach. Note: this option disables the posting and gym bro features" },
  ];


  const handleSelectPrivacy = (value: string) => {

    setSelectedPrivacySetting(value);
    

    setIsDropdownOpen(false);
  };

  useEffect(() => {
    if (height != null) {
      const f = Math.floor(height / 12);
      const i = height % 12;
      setFeet(String(f));
      setInches(String(i));
    }
  }, [height]);

  useEffect(() => setPfpImgError(false), [pfpLink]);

  const hasChanges =
    editedUsername.trim() !== (username ?? "").trim() ||
    editedBio.trim() !== (bio ?? "").trim() ||
    selectedPrivacySetting !== privacySetting ||
    (() => {
      const totalInches = parseInt(feet, 10) * 12 + parseInt(inches || "0", 10);
      return totalInches !== (height ?? 0);
    })() ||
    (parseFloat(editedWeight) || 0) !== (weight ?? 0) ||
    editedNatty !== (isNatty ?? true);

  const handlePfpPress = async () => {
    if (!userId || uploadingPfp) return;
    setUploadingPfp(true);
    try {
      const cloudFrontUrl = await pickAndUploadPfp(userId);
      if (cloudFrontUrl) {
        await updateProfile({ profilePicUrl: cloudFrontUrl });
      }
    } catch (e) {
      Alert.alert(
        "Upload failed",
        e instanceof Error ? e.message : "Could not upload profile picture. Please try again."
      );
    } finally {
      setUploadingPfp(false);
    }
  };

  const handleSave = async () => {
    if (!hasChanges) {
      navigation.goBack();
      return;
    }
    setSaving(true);
    try {
      const totalInches =
        Math.max(0, parseInt(feet, 10) || 0) * 12 +
        Math.max(0, Math.min(11, parseInt(inches, 10) || 0));
      const weightNum = parseFloat(editedWeight);
      const weightVal = isNaN(weightNum) || weightNum < 0 ? null : weightNum;

      await updateProfile({
        ...(editedUsername.trim() && { username: editedUsername.trim() }),
        bio: editedBio.trim(),
        height: totalInches > 0 ? totalInches : null,
        weight: weightVal,
        nattyStatus: editedNatty,
        privacySetting: selectedPrivacySetting,
        
      });
      navigation.goBack();
    } catch (e) {
      Alert.alert("Update failed", "Could not save your profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <PageHeader title="Edit profile" paddingTop={50} paddingHorizontal={16} />
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.centerContent}>
            <TouchableOpacity
              style={styles.profilePicture}
              onPress={handlePfpPress}
              disabled={uploadingPfp}
              accessibilityRole="button"
              accessibilityLabel="Change profile picture"
            >
              {uploadingPfp ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : pfpLink && !pfpImgError ? (
                <Image
                  source={{ uri: pfpLink }}
                  style={styles.profileImage}
                  onError={() => setPfpImgError(true)}
                />
              ) : (
                <>
                  <Ionicons name="person" color="#fff" size={48} />
                  <View style={styles.cameraPill}>
                    <Ionicons name="add" size={18} color="#fff" />
                  </View>
                </>
              )}
            </TouchableOpacity>

            <View style={styles.section}>
              <Text style={styles.label}>Username</Text>
            <TextInput
              style={styles.input}
              value={editedUsername}
              onChangeText={setEditedUsername}
              placeholder="Your username"
              placeholderTextColor="#9aa6bd"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Bio</Text>
            <TextInput
              style={[styles.input, styles.bioInput]}
              value={editedBio}
              onChangeText={(t) => setEditedBio(t.slice(0, BIO_CHAR_LIMIT))}
              placeholder="Tell others about yourself (max 100 words)"
              placeholderTextColor="#9aa6bd"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              maxLength={BIO_CHAR_LIMIT}
            />
            <Text style={styles.charCount}>
              {editedBio.length}/{BIO_CHAR_LIMIT}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Height</Text>
            <View style={styles.row}>
              <TextInput
                style={[styles.input, styles.shortInput]}
                value={feet}
                onChangeText={setFeet}
                placeholder="Ft"
                placeholderTextColor="#9aa6bd"
                keyboardType="number-pad"
              />
              <Text style={styles.unit}>ft</Text>
              <TextInput
                style={[styles.input, styles.shortInput]}
                value={inches}
                onChangeText={setInches}
                placeholder="In"
                placeholderTextColor="#9aa6bd"
                keyboardType="number-pad"
              />
              <Text style={styles.unit}>in</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Weight</Text>
            <View style={styles.row}>
              <TextInput
                style={[styles.input, styles.shortInput]}
                value={editedWeight}
                onChangeText={setEditedWeight}
                placeholder="0"
                placeholderTextColor="#9aa6bd"
                keyboardType="decimal-pad"
              />
              <Text style={styles.unit}>lb</Text>
            </View>
          </View>




          <View style={styles.section}>
            <View style={styles.switchRow}>
              <Text style={styles.label}>Natty status</Text>
              <Switch
                value={!editedNatty}
                onValueChange={(v) => setEditedNatty(!v)}
                trackColor={{ false: "#e0e6f0", true: "#202c76" }}
                thumbColor="#fff"
              />
            </View>
            <Text style={styles.hint}>
              {editedNatty ? "Natty" : "Not natty"}
            </Text>
          </View>
          </View>




<View style = {{paddingBottom: isDropdownOpen ? 170: 0}}>
          <PrivacyDropdown
            options={privacyOptions}
            selectedPrivacy={selectedPrivacySetting}
            isOpen={isDropdownOpen}
            onToggle={() => setIsDropdownOpen(!isDropdownOpen)}
            onSelect={handleSelectPrivacy}
          />

</View>



        </ScrollView>



        <PrimaryButton
          label={saving ? "Saving..." : "Save"}
          variant="footer"
          onPress={handleSave}
          disabled={saving}
        />
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  keyboardView: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 100,
    alignItems: "center",
  },
  centerContent: {
    alignItems: "center",
    width: "100%",
  },
  profilePicture: {
    width: 96,
    height: 96,
    overflow: "hidden",
    borderRadius: 48,
    borderWidth: 2,
    borderColor: "#e6eef8",
    backgroundColor: "#708090",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  profileImage: {
    width: "100%",
    height: "100%",
  },
  cameraPill: {
    position: "absolute",
    bottom: -8,
    alignSelf: "center",
    backgroundColor: "#1f2a44",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  section: {
    marginBottom: 24,
    width: "100%",
    maxWidth: 340,
    alignItems: "center",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2a44",
    marginBottom: 8,
  },
  input: {
    width: "100%",
    maxWidth: 340,
    backgroundColor: "#f5f7fb",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#1f2a44",
    borderWidth: 1,
    borderColor: "#e0e6f0",
  },
  bioInput: {
    minHeight: 100,
    paddingTop: 12,
  },
  charCount: {
    fontSize: 12,
    color: "#9aa6bd",
    marginTop: 4,
    alignSelf: "flex-end",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  shortInput: {
    width: 80,
    textAlign: "center",
  },
  unit: {
    fontSize: 15,
    color: "#5a6a7e",
    fontWeight: "500",
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  hint: {
    fontSize: 13,
    color: "#5a6a7e",
    marginTop: 6,
  },

  privacySettings:{
paddingBottom: 170,
},
},
);

export default ProfileEditPage;
