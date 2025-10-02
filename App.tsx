import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import WelcomeScreen from "./InitialLandingScreens/WelcomeScreen";
import SignUpScreen from "./InitialLandingScreens/SignUpScreen";
import ConfirmSignUpScreen from "./InitialLandingScreens/ConfirmationOfSignUp";
import IdentityBasics from "./InitialLandingScreens/IdentityBasics"
import HeightWeight from "./InitialLandingScreens/HeightWeight";
import { Amplify } from "aws-amplify";
import awsConfig from "./aws-exports";
//@ts-ignore
Amplify.configure(awsConfig);
const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{ headerShown: false }}
        initialRouteName="Welcome"
      >
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="ConfirmSignUp" component={ConfirmSignUpScreen} />
        <Stack.Screen name = "IdentityBasics" component= {IdentityBasics}/>
        <Stack.Screen name="HeightWeight" component={HeightWeight}/>
      </Stack.Navigator>
    </NavigationContainer>
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
