import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

interface PageHeaderProps {
  title: string;
  onBack?: () => void;
  rightComponent?: React.ReactNode;
  showBorder?: boolean;
  paddingTop?: number;
  paddingHorizontal?: number;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  onBack,
  rightComponent,
  showBorder = true,
  paddingTop,
  paddingHorizontal,
}) => {
  const navigation = useNavigation<any>();
  
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigation.goBack();
    }
  };

  return (
    <View style={[
      styles.header,
      showBorder && styles.headerWithBorder,
      paddingTop !== undefined && { paddingTop },
      paddingHorizontal !== undefined && { paddingHorizontal },
    ]}>
      <TouchableOpacity onPress={handleBack} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="#1f2a44" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>{title}</Text>
      <View style={styles.placeholder}>
        {rightComponent}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 60 : 50,
    paddingBottom: 16,
  },
  headerWithBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#e0e6f0",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1f2a44",
  },
  placeholder: {
    width: 40,
    alignItems: "flex-end",
  },
});

export default PageHeader;

