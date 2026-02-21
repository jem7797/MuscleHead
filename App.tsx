import { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Audio, InterruptionModeIOS } from "expo-av";

import WelcomeScreen from "./InitialLandingScreens/WelcomeScreen";
import SignUpScreen from "./InitialLandingScreens/SignUp";
import LogInScreen from "./InitialLandingScreens/LogIn";
import ConfirmSignUpScreen from "./InitialLandingScreens/ConfirmationOfSignUp";
import IdentityBasics from "./MoreInfoScreens/IdentityBasics"
import HeightWeight from "./MoreInfoScreens/HeightWeight";
import ProfileSetUp from "./MoreInfoScreens/ProfileSetUp";
import ContinueSignUp from "./InitialLandingScreens/ContinueSignUp"
import WorkoutInputMainPage from "./MainPage/WorkoutInputMainPage";
import AddWorkoutPage from "./MainPage/AddWorkoutPage";
import AddWorkoutTemplatePage from "./MainPage/AddWorkoutTemplatePage";
import ConfirmWorkoutPage from "./MainPage/ConfirmWorkoutPage";
import WorkoutStatsPage from "./MainPage/WorkoutStatsPage";
import CommunityScreen from "./Community";
import SearchScreen from "./Search/SearchMainPage";
import LeaderboardScreen from "./Leaderboard/LeaderboardMainPage";
import ProfileScreen from "./Profile/ProfileMain";
import ProfileEditPage from "./Profile/ProfileEditPage";
import UserProfileScreen from "./Profile/UserProfileScreen";
import MuscleDetailScreen from "./MuscleDetail/MuscleDetailScreen";
import { Amplify } from "aws-amplify";
import awsConfig from "./aws-exports";
import { UserProvider } from "./Contexts/UserContext";
import { WorkoutStatsProvider } from "./Contexts/WorkoutStatsContext";
import { MovementProvider } from "./Contexts/MovementContext";
import { GlobalWorkedMusclesProvider } from "./Contexts/GlobalWorkedMusclesContext";
import { OnboardingProvider } from "./Contexts/OnboardingContext";
import { WorkoutTemplateProvider } from "./Contexts/WorkoutTemplateContext";
import { RoutinesProvider } from "./Contexts/RoutinesContext";

//@ts-ignore
Amplify.configure(awsConfig);
const Stack = createNativeStackNavigator();

export default function App() {
  useEffect(() => {
    Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      interruptionModeIOS: InterruptionModeIOS.MixWithOthers,
      staysActiveInBackground: false,
    }).catch(() => {});
  }, []);

  return (
    <UserProvider>
      <WorkoutTemplateProvider>
      <RoutinesProvider>
      <OnboardingProvider>
      <MovementProvider>
      <WorkoutStatsProvider>
        <GlobalWorkedMusclesProvider>
          <NavigationContainer>
          <Stack.Navigator
            screenOptions={{ headerShown: false }}
            initialRouteName="Welcome"
          >
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="SignUp" component={SignUpScreen} />
            <Stack.Screen name="LogIn" component={LogInScreen} />
            <Stack.Screen name="ConfirmSignUp" component={ConfirmSignUpScreen} />
            <Stack.Screen name = "ContinueSignUp" component={ContinueSignUp}/> 
            <Stack.Screen name = "IdentityBasics" component= {IdentityBasics}/>
            <Stack.Screen name="HeightWeight" component={HeightWeight}/>
            <Stack.Screen name="ProfileSetUp" component={ProfileSetUp}/>
            <Stack.Screen name= "WorkoutInputMainPage" component={WorkoutInputMainPage} options={{ animation: "none" }} />
            <Stack.Screen name="ConfirmWorkout" component={ConfirmWorkoutPage} options={{ animation: "none" }} />
            <Stack.Screen name="AddWorkout" component={AddWorkoutPage} options={{ animation: "none" }} />
            <Stack.Screen name="WorkoutStats" component={WorkoutStatsPage} options={{ animation: "none" }} />
            <Stack.Screen name="AddWorkoutTemplate" component={AddWorkoutTemplatePage} options={{ animation: "none" }} />
            <Stack.Screen name="Community" component={CommunityScreen} options={{ animation: "none" }} />
            <Stack.Screen name="Search" component={SearchScreen} options={{ animation: "none" }} />
            <Stack.Screen name="Leaderboard" component={LeaderboardScreen} options={{ animation: "none" }} />
            <Stack.Screen name="Profile" component={ProfileScreen} options={{ animation: "none" }} />
            <Stack.Screen name="ProfileEdit" component={ProfileEditPage} options={{ animation: "none" }} />
            <Stack.Screen name="UserProfile" component={UserProfileScreen} options={{ animation: "none" }} />
            <Stack.Screen name="MuscleDetail" component={MuscleDetailScreen} options={{ animation: "none" }} />
          </Stack.Navigator>
        </NavigationContainer>
        </GlobalWorkedMusclesProvider>
      </WorkoutStatsProvider>
      </MovementProvider>
      </OnboardingProvider>
      </RoutinesProvider>
      </WorkoutTemplateProvider>
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
