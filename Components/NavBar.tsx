import React from "react";
import { StyleSheet, View, TouchableOpacity, Image } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import Feather from "@expo/vector-icons/Feather";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useUser } from "../Contexts/UserContext";
const NavBar = () => {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { pfpLink } = useUser();
  const [pfpError, setPfpError] = React.useState(false);
  React.useEffect(() => setPfpError(false), [pfpLink]);
  const showPfp = pfpLink && !pfpError;
  const active = route.name;
  return (
    <View style={styles.container}>
      <View style={styles.box}>
        <TouchableOpacity onPress={() => navigation.navigate("Community")}> 
          <View style={active === "Community" ? styles.highlightCircle : undefined}>
            <FontAwesome6 name="people-group" size={24} color={active === "Community" ? "#fff" : "black"} />
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("Search")}>
          <View style={active === "Search" ? styles.highlightCircle : undefined}>
            <Feather name="search" size={24} color={active === "Search" ? "#fff" : "black"} />
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("WorkoutInputMainPage")}>
          <View style={active === "WorkoutInputMainPage" ? styles.highlightCircle : undefined}>
            <Ionicons name="barbell-sharp" size={30} color={active === "WorkoutInputMainPage" ? "#fff" : "black"} />
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("Notifications")}> 
          <View style={active === "Notifications" ? styles.highlightCircle : undefined}>
            <Ionicons name="notifications" size={24} color={active === "Notifications" ? "#fff" : "black"} />
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("Profile")}> 
          <View style={active === "Profile" ? styles.highlightCircle : undefined}>
            {showPfp ? (
              <Image
                source={{ uri: pfpLink }}
                style={styles.profileIcon}
                onError={() => setPfpError(true)}
              />
            ) : (
              <Ionicons name="person" size={24} color={active === "Profile" ? "#fff" : "black"} />
            )}
          </View>
        </TouchableOpacity>
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

  highlightCircle: {
    backgroundColor: "#202c76",
    borderRadius: 40,
    padding: 15,
    bottom: 25,
    elevation: 10,
    shadowColor: "#202c76",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  profileIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
});

export default NavBar;
