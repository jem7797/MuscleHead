import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Modal,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useNavigation } from "@react-navigation/native";
import BackButton from "../Components/BackButton";
import PrimaryButton from "../Components/PrimaryButton";
import NavBar from "../Components/NavBar";
import { getPresignedImageUrl, uploadImageToS3, createPost } from "../Services/postsApi";
import { Image } from "expo-image";

const CAPTION_MAX_LENGTH = 300;

const CreatePostScreen = () => {
  const navigation = useNavigation<any>();
  const [text, setText] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [posting, setPosting] = useState(false);
  const [cameraPreviewUri, setCameraPreviewUri] = useState<string | null>(null);

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "Camera roll access is required to add a photo.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets?.[0]?.uri) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Camera access required",
        "Please enable camera access in Settings to take a photo.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Open Settings", onPress: () => Linking.openSettings() },
        ]
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets?.[0]?.uri) {
      setCameraPreviewUri(result.assets[0].uri);
    }
  };

  const handleRetakePhoto = () => {
    setCameraPreviewUri(null);
    setTimeout(() => handleTakePhoto(), 100);
  };

  const handleUsePhoto = () => {
    if (cameraPreviewUri) {
      setImageUri(cameraPreviewUri);
      setCameraPreviewUri(null);
    }
  };

  const handleRemoveImage = () => setImageUri(null);

  const handlePost = async () => {
    const caption = text.trim();
    if (!caption && !imageUri) {
      Alert.alert("Add content", "Add a caption or photo to post.");
      return;
    }

    setPosting(true);
    let objectKey: string | null = null;

    try {
      if (imageUri) {
        const { uploadUrl, objectKey: key } = await getPresignedImageUrl();
        objectKey = key;
        try {
          await uploadImageToS3(uploadUrl, imageUri, objectKey);
        } catch (uploadErr: unknown) {
          const msg = uploadErr instanceof Error ? uploadErr.message : "Could not upload your photo. Please try again.";
          Alert.alert(
            "Upload failed",
            msg,
            [{ text: "Retry", onPress: () => handlePost() }, { text: "Cancel" }]
          );
          setPosting(false);
          return;
        }
      }

      await createPost(caption || "", objectKey);
      setText("");
      setImageUri(null);
      navigation.goBack();
    } catch (e: any) {
      const status = e?.status;
      if (status === 401) {
        Alert.alert(
          "Session expired",
          "Please sign in again to post.",
          [{ text: "OK", onPress: () => navigation.navigate("LogIn") }]
        );
      } else if (status === 400) {
        Alert.alert("Invalid post", e?.message || "Please check your post and try again.");
      } else {
        Alert.alert(
          "Post failed",
          e?.message || "Something went wrong. Please try again.",
          objectKey
            ? [
                { text: "Retry", onPress: () => handlePost() },
                { text: "Cancel" },
              ]
            : undefined
        );
      }
    } finally {
      setPosting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.header}>
        <BackButton />
        <Text style={styles.title}>New Post</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.formContainer}>
        {imageUri ? (
          <TouchableOpacity style={styles.imagePreviewWrapper} onPress={handlePickImage} activeOpacity={0.9}>
            <Image source={{ uri: imageUri }} style={styles.imagePreview} contentFit="cover" />
            <TouchableOpacity style={styles.removeImageBtn} onPress={handleRemoveImage}>
              <Text style={styles.removeImageBtnText}>✕ Remove</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        ) : (
          <>
            <TouchableOpacity
              style={styles.uploadZone}
              onPress={handlePickImage}
              activeOpacity={0.8}
            >
              <Ionicons name="image-outline" size={48} color="#9aa6bd" />
              <Text style={styles.uploadZonePrimary}>Add a photo</Text>
              <Text style={styles.uploadZoneSecondary}>optional</Text>
            </TouchableOpacity>
            <View style={styles.pillButtonRow}>
              <TouchableOpacity style={styles.pillButton} onPress={handleTakePhoto} activeOpacity={0.7}>
                <Text style={styles.pillButtonText}>📷 Take Photo</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.pillButton} onPress={handlePickImage} activeOpacity={0.7}>
                <Text style={styles.pillButtonText}>🖼 Photo Library</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        <View style={styles.captionWrapper}>
          <TextInput
            style={styles.textArea}
            placeholder="What's on your mind?"
            placeholderTextColor="#9aa6bd"
            value={text}
            onChangeText={setText}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
            maxLength={CAPTION_MAX_LENGTH}
          />
          <Text style={styles.charCounter}>{text.length}/{CAPTION_MAX_LENGTH}</Text>
        </View>

        <PrimaryButton
          label={posting ? "Posting..." : "Post"}
          onPress={handlePost}
          disabled={posting}
          containerStyle={[
            styles.postButton,
            !text.trim() && !imageUri && styles.postButtonDimmed,
          ]}
        />
        </View>
      </ScrollView>

      <Modal
        visible={!!cameraPreviewUri}
        transparent
        animationType="fade"
        onRequestClose={() => setCameraPreviewUri(null)}
      >
        <View style={styles.cameraPreviewOverlay}>
          {cameraPreviewUri && (
            <Image source={{ uri: cameraPreviewUri }} style={styles.cameraPreviewImage} contentFit="contain" />
          )}
          <View style={styles.cameraPreviewActions}>
            <TouchableOpacity style={styles.cameraPreviewBtn} onPress={handleRetakePhoto}>
              <Text style={styles.cameraPreviewBtnText}>Retake</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.cameraPreviewBtn, styles.cameraPreviewBtnPrimary]} onPress={handleUsePhoto}>
              <Text style={styles.cameraPreviewBtnTextPrimary}>Use Photo</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <NavBar />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingTop: 52,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e8ecf4",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#0f1724",
  },
  headerSpacer: {
    width: 40,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    paddingBottom: 120,
  },
  formContainer: {
    width: "100%",
    maxWidth: 400,
    alignSelf: "center",
  },
  uploadZone: {
    width: "100%",
    minHeight: 160,
    backgroundColor: "#f8f9fc",
    borderRadius: 16,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#e0e6f0",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  uploadZonePrimary: {
    fontSize: 17,
    fontWeight: "600",
    color: "#1f2a44",
    marginTop: 12,
  },
  uploadZoneSecondary: {
    fontSize: 14,
    color: "#9aa6bd",
    marginTop: 4,
  },
  pillButtonRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 28,
  },
  pillButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: "#e8ecf4",
    borderRadius: 20,
    alignItems: "center",
  },
  pillButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1f2a44",
  },
  imagePreviewWrapper: {
    width: "100%",
    aspectRatio: 16 / 9,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 28,
    backgroundColor: "#f5f6f8",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  imagePreview: {
    width: "100%",
    height: "100%",
  },
  removeImageBtn: {
    position: "absolute",
    top: 12,
    right: 12,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 8,
  },
  removeImageBtnText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#fff",
  },
  captionWrapper: {
    width: "100%",
    marginBottom: 28,
    position: "relative",
  },
  textArea: {
    width: "100%",
    minHeight: 140,
    padding: 16,
    paddingBottom: 36,
    fontSize: 16,
    color: "#0f1724",
    backgroundColor: "#f8f9fc",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  charCounter: {
    position: "absolute",
    bottom: 12,
    right: 16,
    fontSize: 12,
    color: "#9aa6bd",
  },
  postButton: {
    alignSelf: "stretch",
    borderRadius: 14,
    overflow: "hidden",
  },
  postButtonDimmed: {
    opacity: 0.5,
  },
  cameraPreviewOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  cameraPreviewImage: {
    width: "100%",
    flex: 1,
  },
  cameraPreviewActions: {
    flexDirection: "row",
    gap: 16,
    paddingBottom: 48,
    paddingHorizontal: 24,
  },
  cameraPreviewBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#4a4a4a",
    alignItems: "center",
  },
  cameraPreviewBtnPrimary: {
    backgroundColor: "#202c76",
  },
  cameraPreviewBtnText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  cameraPreviewBtnTextPrimary: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
});

export default CreatePostScreen;
