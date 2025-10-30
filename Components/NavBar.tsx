import React from "react";
import { StyleSheet, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Feather from "@expo/vector-icons/Feather";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";


const NavBar = () => {
  return (
    <View style={styles.container}>
      <View style={styles.box}>
        <FontAwesome6 name="people-group" size={24} color="black" />
        <Feather name="search" size={24} color="black" />
        <View style={styles.weightCircle}>
          <Ionicons name="barbell-sharp" size={30} color="black" />
        </View>
        <MaterialIcons name="leaderboard" size={24} color="black" />
        <Ionicons name="person" size={24} color="black" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
  position: "absolute",
  bottom: 0,
  left: 0,
  right: 0,
  paddingVertical: 3,
  paddingBottom: 8, 
  borderTopWidth: 1, 
  borderColor: "#a2a2a282",
  backgroundColor: "#fff",
},

  box: {
    alignContent: "center",
    justifyContent: "space-around",
    flexDirection: "row",
    paddingTop: 3,
  },

  weightCircle: {
    backgroundColor: "#0966e8ff",
    borderRadius: 50,
    padding: 20,
    bottom: 25,
    elevation: 10,
    shadowColor: "#0e4087ff",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
});

export default NavBar;
