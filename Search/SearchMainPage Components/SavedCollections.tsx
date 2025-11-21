import React from "react";
import { View, Text, StyleSheet } from "react-native";
import CollectionCard from "./CollectionCard";

interface Collection {
  title: string;
  icon: string;
}

interface SavedCollectionsProps {
  collections: Collection[];
}

const SavedCollections: React.FC<SavedCollectionsProps> = ({ collections }) => {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Saved Collections</Text>
      <View style={styles.collectionRow}>
        {collections.map((collection) => (
          <CollectionCard
            key={collection.title}
            title={collection.title}
            icon={collection.icon}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginTop: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0f1724",
    marginBottom: 16,
  },
  collectionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
});

export default SavedCollections;

