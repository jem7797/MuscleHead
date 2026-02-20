import React from "react";
import { Text, StyleSheet } from "react-native";

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
    fontSize: 13,
    lineHeight: 20,
    color: "#5a6a7e",
    maxWidth: 360,
  },
});

export default BioSection;

