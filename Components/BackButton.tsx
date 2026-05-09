import React from "react";
import { TouchableOpacity, StyleSheet, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

interface BackButtonProps {
  onPress?: () => void;
  color?: string;
  size?: number;
  style?: ViewStyle;
  backgroundColor?: string;
}

const BackButton: React.FC<BackButtonProps> = ({
  onPress,
  color = "#e85d04",
  size = 24,
  style,
  backgroundColor,
}) => {
  const navigation = useNavigation<any>();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      navigation.goBack();
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={[
        styles.backButton,
        backgroundColor && { backgroundColor },
        style,
      ]}
    >
      <Ionicons name="arrow-back" size={size} color={color} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  backButton: {
    padding: 8,
  },
});

export default BackButton;

