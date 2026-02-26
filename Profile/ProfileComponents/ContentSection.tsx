import React from "react";
import { View, StyleSheet } from "react-native";
import ProfilePostsSection from "./ProfilePostsSection";

interface ContentSectionProps {
  subId?: string;
  currentUserId?: string | null;
}

/**
 * ContentSection Component
 * Displays posts/texts tabs and content on the profile page (own profile)
 */
const ContentSection: React.FC<ContentSectionProps> = ({
  subId,
  currentUserId,
}) => {
  if (!subId) return null;
  return (
    <View style={styles.contentSection}>
      <ProfilePostsSection subId={subId} currentUserId={currentUserId} />
    </View>
  );
};

const styles = StyleSheet.create({
  contentSection: {
    width: "90%",
    marginTop: 30,
  },
});

export default ContentSection;

