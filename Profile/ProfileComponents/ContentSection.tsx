import React from "react";
import { View, Text, StyleSheet } from "react-native";

/**
 * ContentSection Component
 * Displays content that switches between Posts and Progress Pictures based on active tab
 * This component handles the conditional rendering of different content views
 */
interface ContentSectionProps {
  activeTab: "posts" | "progress";
}

const ContentSection: React.FC<ContentSectionProps> = ({ activeTab }) => {
  return (
    <View style={styles.contentSection}>
      {activeTab === "posts" ? (
        <View style={styles.postsContent}>
          <Text style={styles.contentPlaceholder}>Posts Content</Text>
          {/* Add your posts grid/list here */}
        </View>
      ) : (
        <View style={styles.progressContent}>
          <Text style={styles.contentPlaceholder}>Progress Pictures Content</Text>
          {/* Add your progress pictures grid here */}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  contentSection: {
    width: "90%",
    marginTop: 20,
    minHeight: 200,
  },
  postsContent: {
    width: "100%",
  },
  progressContent: {
    width: "100%",
  },
  contentPlaceholder: {
    textAlign: "center",
    color: "#9ca3af",
    fontSize: 14,
    marginTop: 20,
  },
});

export default ContentSection;

