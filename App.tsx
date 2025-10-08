import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import WelcomeScreen from "./InitialLandingScreens/WelcomeScreen";
import SignUp from "./InitialLandingScreens/SignUp";
import ConfirmSignUpScreen from "./InitialLandingScreens/ConfirmationOfSignUp";
import IdentityBasics from "./MoreInfoScreens/IdentityBasics"
import HeightWeight from "./MoreInfoScreens/HeightWeight";
import ContinueSignUp from "./InitialLandingScreens/ContinueSignUp"
import WorkoutInputMainPage from "./MainPage/WorkoutInputMainPage";
import { Amplify } from "aws-amplify";
import awsConfig from "./aws-exports";
import { UserProvider } from "./Contexts/UserContext";
//@ts-ignore
Amplify.configure(awsConfig);
const Stack = createNativeStackNavigator();

export default function App() {
  return (

    <UserProvider>
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{ headerShown: false }}
        initialRouteName="Welcome"
      >
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="SignUp" component={SignUp} />
        <Stack.Screen name="ConfirmSignUp" component={ConfirmSignUpScreen} />
        <Stack.Screen name = "ContinueSignUp" component={ContinueSignUp}/> 
        <Stack.Screen name = "IdentityBasics" component= {IdentityBasics}/>
        <Stack.Screen name="HeightWeight" component={HeightWeight}/>
        <Stack.Screen name= "WorkoutInputMainPage" component={WorkoutInputMainPage}/>
      </Stack.Navigator>
    </NavigationContainer>
    </UserProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(215, 215, 213, 1)",
    alignItems: "center",
    justifyContent: "center",
  },
});
