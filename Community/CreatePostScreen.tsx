import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useNavigation } from "@react-navigation/native";
import BackButton from "../Components/BackButton";
import PrimaryButton from "../Components/PrimaryButton";
import NavBar from "../Components/NavBar";
import { getPresignedImageUrl, uploadImageToS3, createPost } from "../Services/postsApi";

const CreatePostScreen = () => {
  const navigation = useNavigation<any>();
  const [text, setText] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [posting, setPosting] = useState(false);

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
          await uploadImageToS3(uploadUrl, imageUri);
        } catch (uploadErr: any) {
          Alert.alert(
            "Upload failed",
            "Could not upload your photo. Please try again.",
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
        <TouchableOpacity
          style={styles.imageArea}
          onPress={handlePickImage}
          activeOpacity={0.8}
        >
          {imageUri ? (
            <View style={styles.imagePreview}>
              <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />
              <TouchableOpacity
                style={styles.removeImageBtn}
                onPress={(e) => {
                  e.stopPropagation();
                  handleRemoveImage();
                }}
              >
                <Ionicons name="close-circle" size={28} color="#1f2a44" />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="image-outline" size={40} color="#9aa6bd" />
              <Text style={styles.imagePlaceholderText}>Add photo (optional)</Text>
            </View>
          )}
        </TouchableOpacity>

        <TextInput
          style={styles.textArea}
          placeholder="Caption or text"
          placeholderTextColor="#9aa6bd"
          value={text}
          onChangeText={setText}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />

        <PrimaryButton
          label={posting ? "Posting..." : "Post"}
          onPress={handlePost}
          disabled={posting}
          containerStyle={styles.postButton}
        />
        </View>
      </ScrollView>

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
  imageArea: {
    width: "100%",
    aspectRatio: 16 / 9,
    backgroundColor: "#f5f6f8",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 20,
  },
  imagePlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#e8ecf4",
    borderRadius: 12,
  },
  imagePlaceholderText: {
    marginTop: 8,
    fontSize: 14,
    color: "#9aa6bd",
  },
  imagePreview: {
    flex: 1,
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  removeImageBtn: {
    position: "absolute",
    top: 8,
    right: 8,
  },
  textArea: {
    width: "100%",
    minHeight: 120,
    padding: 16,
    fontSize: 16,
    color: "#0f1724",
    backgroundColor: "#f5f6f8",
    borderRadius: 12,
    marginBottom: 24,
  },
  postButton: {
    alignSelf: "stretch",
  },
});

export default CreatePostScreen;
