import React from "react";
import { Text, TouchableOpacity, StyleSheet } from "react-native";

interface LoadMoreButtonProps {
  onPress?: () => void;
}

const LoadMoreButton: React.FC<LoadMoreButtonProps> = ({ onPress }) => {
  return (
    <TouchableOpacity style={styles.loadMoreButton} activeOpacity={0.75} onPress={onPress}>
      <Text style={styles.loadMoreText}>Load more</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  loadMoreButton: {
    alignSelf: "center",
    marginTop: 12,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "#1f2a44",
  },
  loadMoreText: {
    fontSize: 13,
    color: "#fff",
    fontWeight: "600",
  },
});

export default LoadMoreButton;

