import React from "react";
import { StyleSheet, View, Dimensions } from "react-native";
import NavBar from "../Components/NavBar";
import MuscleManFront from "../Components/MuscleManFront";
const { height } = Dimensions.get("window");

const WorkoutInputMainPage = () => {
  
  return (
    <View style={styles.mainContainer}>
      <View style={styles.muscleManContainer}>
        <MuscleManFront width={height * 0.4} height={height * 0.4}   worked={[
  "innerforearms"
  ]} />
      </View>
      <NavBar/>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "white",
  },
  muscleManContainer: {
    flex: 0.5, // Takes up upper half of screen
    alignItems: "center",
    paddingTop: 110,
    transform: [{ scaleX: 1.5 }, {scaleY: 1.2}],
  },
});

export default WorkoutInputMainPage;
