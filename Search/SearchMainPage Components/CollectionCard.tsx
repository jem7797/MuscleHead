import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";

interface CollectionCardProps {
  title: string;
  icon: string;
  onPress?: () => void;
}

const CollectionCard: React.FC<CollectionCardProps> = ({ title, icon, onPress }) => {
  return (
    <TouchableOpacity
      style={styles.collectionCard}
      activeOpacity={0.85}
      onPress={onPress}
    >
      <View style={styles.collectionIcon}>
        <FontAwesome5 name={icon as any} size={18} color="#1f2a44" />
      </View>
      <Text style={styles.collectionText}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  collectionCard: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: "#f4f7ff",
    borderWidth: 1,
    borderColor: "#d6def0",
    gap: 10,
    shadowColor: "#1f2a44",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  collectionIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(31,42,68,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  collectionText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1f2a44",
  },
});

export default CollectionCard;

