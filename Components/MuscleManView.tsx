import React from "react";
import { StyleSheet, View, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import MuscleManFront from "./MuscleManFront";
import MuscleManBack from "./MuscleManBack";
import MuscleWomanFront from "./MuscleWomanFront";
import { useUser } from "../Contexts/UserContext";

interface MuscleManViewProps {
  isBack: boolean;
  size: number;
}

const MuscleManView: React.FC<MuscleManViewProps> = ({ isBack, size }) => {
  const navigation = useNavigation<any>();
  const { gender } = useUser();
  const MuscleFront = gender === "Female" ? MuscleWomanFront : MuscleManFront;

  if (isBack) {
    return (
      <View style={styles.muscleManWrapper}>
        <TouchableOpacity
          style={styles.muscleManContainerBack}
          onPress={() => navigation.navigate("MuscleDetail")}
          activeOpacity={0.9}
        >
          <MuscleManBack width={size} height={size} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.fullscreenIcon}
          onPress={() => navigation.navigate("MuscleDetail")}
          activeOpacity={0.7}
        >
          <Ionicons name="expand" size={16} color="#1f2a44" />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.muscleManWrapper}>
      <TouchableOpacity
        style={styles.muscleManContainerFront}
        onPress={() => navigation.navigate("MuscleDetail")}
        activeOpacity={0.9}
      >
        <MuscleFront width={size} height={size} />
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.fullscreenIcon}
        onPress={() => navigation.navigate("MuscleDetail")}
        activeOpacity={0.7}
      >
        <Ionicons name="expand" size={16} color="#1f2a44" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  muscleManWrapper: {
    flex: 0.5,
    position: "relative",
  },
  muscleManContainerFront: {
    flex: 1,
    alignItems: "center",
    paddingTop: 40,
    transform: [{ scaleX: 1.0 }, { scaleY: 1.0 }],
  },
  muscleManContainerBack: {
    flex: 1,
    alignItems: "center",
    paddingTop: 40,
    transform: [{ scaleX: 0.8 }, { scaleY: 1.0 }],
  },
  fullscreenIcon: {
    position: "absolute",
    bottom: 5,
    left: 275,
    padding: 6,
    zIndex: 100,
    elevation: 4,
  },
});

export default MuscleManView;
