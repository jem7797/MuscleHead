import React from "react";
import { Text, StyleSheet } from "react-native";
import { textSecondary } from "../../theme/colors";

/**
 * BioSection Component
 * Displays user bio
 */
interface BioSectionProps {
  bio: string;
}

const BioSection: React.FC<BioSectionProps> = ({ bio }) => {
  return <Text style={styles.bio}>{bio}</Text>;
};

const styles = StyleSheet.create({
  bio: {
    marginTop: 16,
    textAlign: "center",
    fontSize: 14,
    lineHeight: 22,
    color: textSecondary,
    maxWidth: 360,
    letterSpacing: 0.15,
  },
});

export default BioSection;

