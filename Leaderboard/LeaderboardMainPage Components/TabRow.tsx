import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

interface TabRowProps {
  tabs: string[];
  activeTab: string;
  onTabChange?: (tab: string) => void;
}

const TabRow: React.FC<TabRowProps> = ({ tabs, activeTab, onTabChange }) => {
  return (
    <View style={styles.tabRow}>
      {tabs.map((tab) => {
        const isActive = tab === activeTab;
        return (
          <TouchableOpacity
            key={tab}
            style={[styles.tabButton, isActive && styles.tabButtonActive]}
            activeOpacity={0.8}
            onPress={() => onTabChange?.(tab)}
          >
            <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
              {tab}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  tabRow: {
    flexDirection: "row",
    marginTop: 24,
    backgroundColor: "#e6ebf5",
    borderRadius: 18,
    padding: 4,
    gap: 6,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 14,
    alignItems: "center",
  },
  tabButtonActive: {
    backgroundColor: "#1f2a44",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  tabText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#5a6a7e",
  },
  tabTextActive: {
    color: "#fff",
    fontWeight: "600",
  },
});

export default TabRow;

