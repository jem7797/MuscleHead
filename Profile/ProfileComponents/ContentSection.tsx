import React from "react";
import { View, Text, StyleSheet } from "react-native";

/**
 * ContentSection Component
 * Displays posts content on the profile page
 */
const ContentSection: React.FC = () => {
  return (
    <View style={styles.contentSection}>
      <View style={styles.postsContent}>
        <Text style={styles.contentPlaceholder}>Posts</Text>
        {/* Add your posts grid/list here */}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  contentSection: {
    width: "90%",
    marginTop: 30,
    minHeight: 200,
  },
  postsContent: {
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

