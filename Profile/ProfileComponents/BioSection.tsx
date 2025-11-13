import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

/**
 * BioSection Component
 * Displays user bio with expand/collapse functionality
 */
interface BioSectionProps {
  bio: string;
  showFullBio: boolean;
  onToggleBio: () => void;
}

const BioSection: React.FC<BioSectionProps> = ({ bio, showFullBio, onToggleBio }) => {
  return (
    <TouchableOpacity onPress={onToggleBio} activeOpacity={0.8}>
      <Text style={styles.bio} numberOfLines={showFullBio ? undefined : 2}>
        {bio}
      </Text>
      <Text style={styles.seeMoreText}>
        {showFullBio ? "Show less" : "See more"}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  bio: {
    marginTop: 16,
    textAlign: "center",
    fontSize: 13,
    lineHeight: 20,
    color: "#5a6a7e",
    maxWidth: 360,
  },
  seeMoreText: {
    marginTop: 6,
    color: "#1f2a44",
    fontWeight: "600",
    textAlign: "center",
  },
});

export default BioSection;

