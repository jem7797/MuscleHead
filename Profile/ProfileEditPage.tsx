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
import {
  accent,
  accentBright,
  borderSubtle,
  screenBackground,
  surfaceMuted,
  textPrimary,
  textSecondary,
} from "../theme/colors";
import { LinearGradient } from "expo-linear-gradient";
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

const SWITCH_TRACK_OFF = "#4c525f";
const SWITCH_THUMB = "#ffffff";

const profileSwitchProps = {
  trackColor: { false: SWITCH_TRACK_OFF, true: accent },
  thumbColor: SWITCH_THUMB,
  ios_backgroundColor: SWITCH_TRACK_OFF,
};

const ProfileEditPage = () => {
  const navigation = useNavigation<any>();
  const {
    userId,
    username,
    bio,
    height,
    weight,
    isNatty,
    gender,
    pfpLink,
    privacySetting,
    setPrivacySetting,
    updateProfile,
    refreshUserProfile,
  } = useUser();

  const [editedUsername, setEditedUsername] = useState(username ?? "");
  const [editedBio, setEditedBio] = useState(bio ?? "");
  const [feet, setFeet] = useState("");
  const [inches, setInches] = useState("");
  const [editedWeight, setEditedWeight] = useState(
    weight != null ? String(weight) : ""
  );
  const [editedNatty, setEditedNatty] = useState(isNatty ?? true);
  // true => Male, false => Female
  const [editedGender, setEditedGender] = useState(
    (gender ?? "Male") === "Male"
  );
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

  useEffect(() => {
    setEditedNatty(isNatty ?? true);
  }, [isNatty]);

  useEffect(() => {
    setEditedGender((gender ?? "Male") === "Male");
  }, [gender]);

  const hasChanges =
    editedUsername.trim() !== (username ?? "").trim() ||
    editedBio.trim() !== (bio ?? "").trim() ||
    selectedPrivacySetting !== privacySetting ||
    (() => {
      const totalInches = parseInt(feet, 10) * 12 + parseInt(inches || "0", 10);
      return totalInches !== (height ?? 0);
    })() ||
    (parseFloat(editedWeight) || 0) !== (weight ?? 0) ||
    editedNatty !== (isNatty ?? true) ||
    (editedGender ? "Male" : "Female") !== (gender ?? "Male");

  const handlePfpPress = async () => {
    if (!userId || uploadingPfp) return;
    setUploadingPfp(true);
    try {
      const objectKey = await pickAndUploadPfp(userId);
      if (objectKey) {
        await updateProfile({ profilePicUrl: objectKey });
        await refreshUserProfile(userId);
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
        gender: editedGender ? "Male" : "Female",
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
            <LinearGradient
              colors={[accent, accentBright]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.avatarRing}
            >
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
            </LinearGradient>

            <View style={styles.section}>
              <Text style={styles.label}>Username</Text>
            <TextInput
              style={styles.input}
              value={editedUsername}
              onChangeText={setEditedUsername}
              placeholder="Your username"
              placeholderTextColor={textSecondary}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="done"
              blurOnSubmit
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Bio</Text>
            <TextInput
              style={[styles.input, styles.bioInput]}
              value={editedBio}
              onChangeText={(t) => setEditedBio(t.slice(0, BIO_CHAR_LIMIT))}
              placeholder="Tell others about yourself (max 100 words)"
              placeholderTextColor={textSecondary}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              returnKeyType="done"
              blurOnSubmit
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
                placeholderTextColor={textSecondary}
                keyboardType="number-pad"
                returnKeyType="done"
                blurOnSubmit
              />
              <Text style={styles.unit}>ft</Text>
              <TextInput
                style={[styles.input, styles.shortInput]}
                value={inches}
                onChangeText={setInches}
                placeholder="In"
                placeholderTextColor={textSecondary}
                keyboardType="number-pad"
                returnKeyType="done"
                blurOnSubmit
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
                placeholderTextColor={textSecondary}
                keyboardType="decimal-pad"
                returnKeyType="done"
                blurOnSubmit
              />
              <Text style={styles.unit}>lb</Text>
            </View>
          </View>




          <View style={styles.section}>
            <Text style={styles.groupLabel}>Preferences</Text>
            <View style={styles.preferencesCard}>
              <View style={styles.preferenceRow}>
                <View style={styles.preferenceText}>
                  <Text style={styles.preferenceTitle}>Natty status</Text>
                  <Text style={styles.preferenceValue}>
                    {editedNatty ? "Natty" : "Not natty"}
                  </Text>
                </View>
                <Switch
                  value={editedNatty}
                  onValueChange={setEditedNatty}
                  {...profileSwitchProps}
                />
              </View>
              <View style={styles.preferenceDivider} />
              <View style={styles.preferenceRow}>
                <View style={styles.preferenceText}>
                  <Text style={styles.preferenceTitle}>Gender</Text>
                  <Text style={styles.preferenceValue}>
                    {editedGender ? "Male" : "Female"}
                  </Text>
                </View>
                <Switch
                  value={editedGender}
                  onValueChange={setEditedGender}
                  {...profileSwitchProps}
                />
              </View>
            </View>
          </View>

          <View style={[styles.section, { paddingBottom: isDropdownOpen ? 170 : 0 }]}>
            <PrivacyDropdown
              options={privacyOptions}
              selectedPrivacy={selectedPrivacySetting}
              isOpen={isDropdownOpen}
              onToggle={() => setIsDropdownOpen(!isDropdownOpen)}
              onSelect={handleSelectPrivacy}
            />
          </View>
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
    backgroundColor: screenBackground,
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
  },
  centerContent: {
    width: "100%",
    maxWidth: 340,
    alignSelf: "center",
  },
  avatarRing: {
    borderRadius: 51,
    padding: 3,
    marginBottom: 24,
    alignSelf: "center",
  },
  profilePicture: {
    width: 96,
    height: 96,
    overflow: "hidden",
    borderRadius: 48,
    backgroundColor: surfaceMuted,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  profileImage: {
    width: "100%",
    height: "100%",
  },
  cameraPill: {
    position: "absolute",
    bottom: -8,
    alignSelf: "center",
    backgroundColor: accent,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  section: {
    marginBottom: 24,
    width: "100%",
    alignSelf: "stretch",
  },
  groupLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: textPrimary,
    marginBottom: 10,
    alignSelf: "stretch",
  },
  preferencesCard: {
    width: "100%",
    backgroundColor: surfaceMuted,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: borderSubtle,
    overflow: "hidden",
  },
  preferenceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 12,
  },
  preferenceText: {
    flex: 1,
    minWidth: 0,
  },
  preferenceTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: textPrimary,
    marginBottom: 2,
  },
  preferenceValue: {
    fontSize: 13,
    color: textSecondary,
  },
  preferenceDivider: {
    height: 1,
    backgroundColor: borderSubtle,
    marginHorizontal: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: textPrimary,
    alignSelf: "stretch",
    marginBottom: 8,
  },
  input: {
    width: "100%",
    maxWidth: 340,
    backgroundColor: surfaceMuted,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: textPrimary,
    borderWidth: 1,
    borderColor: borderSubtle,
  },
  bioInput: {
    minHeight: 100,
    paddingTop: 12,
  },
  charCount: {
    fontSize: 12,
    color: textSecondary,
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
    color: textSecondary,
    fontWeight: "500",
  },
},
);

export default ProfileEditPage;
