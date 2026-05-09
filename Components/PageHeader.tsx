import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { borderSubtle, surfaceMuted, textPrimary } from "../theme/colors";

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
        <Ionicons name="arrow-back" size={22} color={textPrimary} />
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
    borderBottomColor: borderSubtle,
  },
  backButton: {
    padding: 8,
    backgroundColor: surfaceMuted,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: borderSubtle,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: 0.4,
    color: textPrimary,
  },
  placeholder: {
    minWidth: 40,
    alignItems: "flex-end",
    justifyContent: "center",
  },
});

export default PageHeader;

