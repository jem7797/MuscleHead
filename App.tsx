import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import {
  NavigationContainer,
  createNavigationContainerRef,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Audio, InterruptionModeIOS } from "expo-av";

import WelcomeScreen from "./InitialLandingScreens/WelcomeScreen";
import SignUpScreen from "./InitialLandingScreens/SignUp";
import LogInScreen from "./InitialLandingScreens/LogIn";
import ForgotPasswordScreen from "./InitialLandingScreens/ForgotPassword";
import ConfirmSignUpScreen from "./InitialLandingScreens/ConfirmationOfSignUp";
import IdentityBasics from "./MoreInfoScreens/IdentityBasics";
import HeightWeight from "./MoreInfoScreens/HeightWeight";
import ProfileSetUp from "./MoreInfoScreens/ProfileSetUp";
import ContinueSignUp from "./InitialLandingScreens/ContinueSignUp";
import WorkoutInputMainPage from "./MainPage/WorkoutInputMainPage";
import AddWorkoutPage from "./MainPage/AddWorkoutPage";
import AddWorkoutTemplatePage from "./MainPage/AddWorkoutTemplatePage";
import RoutineDetailPage from "./MainPage/RoutineDetailPage";
import ActiveWorkoutPage from "./MainPage/ActiveWorkoutPage";
import ConfirmWorkoutPage from "./MainPage/ConfirmWorkoutPage";
import WorkoutStatsPage from "./MainPage/WorkoutStatsPage";
import WorkoutDetailPage from "./MainPage/WorkoutDetailPage";
import CommunityScreen from "./Community";
import CreatePostScreen from "./Community/CreatePostScreen";
import FriendsListScreen from "./Community/FriendsListScreen";
import SearchScreen from "./Search/SearchMainPage";
import NotificationCenterScreen from "./Notifications /NotificationsPage";
import ProfileScreen from "./Profile/ProfileMain";
import ProfileEditPage from "./Profile/ProfileEditPage";
import AccoladesScreen from "./Profile/AccoladesScreen";
import UserProfileScreen from "./Profile/UserProfileScreen";
import FollowListScreen from "./Profile/FollowListScreen";
import FollowRequestsScreen from "./Profile/FollowRequestsScreen";
import MuscleDetailScreen from "./MuscleDetail/MuscleDetailScreen";
import LiveSessionScreen from "./Live/LiveSessionScreen";
import HiddenFeed from "./Community/HiddenFeed";
import HiddenSearch from "./Search/HiddenSearchPage";
import MultiplayerWaitingScreen from "./Live/MultiplayerWaitingScreen";

import "@aws-amplify/react-native";
import { Amplify } from "aws-amplify";
import awsConfig from "./aws-exports";
import { UserProvider } from "./Contexts/UserContext";
import { WorkoutStatsProvider } from "./Contexts/WorkoutStatsContext";
import { MovementProvider } from "./Contexts/MovementContext";
import { GlobalWorkedMusclesProvider } from "./Contexts/GlobalWorkedMusclesContext";
import { OnboardingProvider } from "./Contexts/OnboardingContext";
import { WorkoutTemplateProvider } from "./Contexts/WorkoutTemplateContext";
import { RoutinesProvider } from "./Contexts/RoutinesContext";
import { WorkoutsProvider } from "./Contexts/WorkoutsContext";
import { AchievementProvider } from "./Contexts/AchievementContext";
import { InviteProvider } from "./Contexts/InviteContext";
import AchievementToast from "./Components/AchievementToast";
import InviteToast from "./Components/InviteToast";
import InviteNotification from "./Components/InviteNotification";
import { isSupabaseConfigured, supabase } from "./lib/supabase";
import { screenBackground } from "./theme/colors";

//@ts-ignore
Amplify.configure(awsConfig);
const Stack = createNativeStackNavigator();
const navigationRef = createNavigationContainerRef();

export default function App() {
  const [isSupabaseAuthReady, setIsSupabaseAuthReady] = useState(
    !isSupabaseConfigured(),
  );

  useEffect(() => {
    Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      interruptionModeIOS: InterruptionModeIOS.MixWithOthers,
      staysActiveInBackground: false,
    }).catch(() => {});
  }, []);

  useEffect(() => {
    let cancelled = false;
    if (!isSupabaseConfigured()) {
      setIsSupabaseAuthReady(true);
      return;
    }

    supabase.auth
      .signInAnonymously()
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setIsSupabaseAuthReady(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (!isSupabaseAuthReady) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#e85d04" />
      </View>
    );
  }

  return (
    <UserProvider>
      <WorkoutTemplateProvider>
        <RoutinesProvider>
          <WorkoutsProvider>
            <OnboardingProvider>
              <MovementProvider>
                <WorkoutStatsProvider>
                  <GlobalWorkedMusclesProvider>
                    <AchievementProvider>
                    <InviteProvider>
                    <View style={styles.appRoot}>
                    <NavigationContainer ref={navigationRef}>
                      <Stack.Navigator
                        screenOptions={{
                          headerShown: false,
                          contentStyle: { backgroundColor: screenBackground },
                        }}
                        initialRouteName="Welcome"
                      >
                        <Stack.Screen
                          name="Welcome"
                          component={WelcomeScreen}
                        />
                        <Stack.Screen name="SignUp" component={SignUpScreen} />
                        <Stack.Screen name="LogIn" component={LogInScreen} />
                        <Stack.Screen
                          name="ForgotPassword"
                          component={ForgotPasswordScreen}
                        />
                        <Stack.Screen
                          name="ConfirmSignUp"
                          component={ConfirmSignUpScreen}
                        />
                        <Stack.Screen
                          name="ContinueSignUp"
                          component={ContinueSignUp}
                        />
                        <Stack.Screen
                          name="IdentityBasics"
                          component={IdentityBasics}
                        />
                        <Stack.Screen
                          name="HeightWeight"
                          component={HeightWeight}
                        />
                        <Stack.Screen
                          name="ProfileSetUp"
                          component={ProfileSetUp}
                        />
                        <Stack.Screen
                          name="WorkoutInputMainPage"
                          component={WorkoutInputMainPage}
                          options={{ animation: "none" }}
                        />
                        <Stack.Screen
                          name="ConfirmWorkout"
                          component={ConfirmWorkoutPage}
                          options={{ animation: "none" }}
                        />
                        <Stack.Screen
                          name="AddWorkout"
                          component={AddWorkoutPage}
                          options={{ animation: "none" }}
                        />
                        <Stack.Screen
                          name="WorkoutStats"
                          component={WorkoutStatsPage}
                          options={{ animation: "none" }}
                        />
                        <Stack.Screen
                          name="WorkoutDetail"
                          component={WorkoutDetailPage}
                          options={{ animation: "none" }}
                        />
                        <Stack.Screen
                          name="AddWorkoutTemplate"
                          component={AddWorkoutTemplatePage}
                          options={{ animation: "none" }}
                        />
                        <Stack.Screen
                          name="RoutineDetail"
                          component={RoutineDetailPage}
                          options={{ animation: "none" }}
                        />
                        <Stack.Screen
                          name="ActiveWorkout"
                          component={ActiveWorkoutPage}
                          options={{ animation: "none" }}
                        />
                        <Stack.Screen
                          name="Community"
                          component={CommunityScreen}
                          options={{ animation: "none" }}
                        />
                         <Stack.Screen
                          name="hiddenFeed"
                          component={HiddenFeed}
                          options={{ animation: "none" }}
                        />

                          <Stack.Screen
                          name="hiddenSearch"
                          component={HiddenSearch}
                          options={{ animation: "none" }}
                        />
                        <Stack.Screen
                          name="FriendsList"
                          component={FriendsListScreen}
                          options={{ animation: "none" }}
                        />
                        <Stack.Screen
                          name="CreatePost"
                          component={CreatePostScreen}
                          options={{ animation: "none" }}
                        />
                        <Stack.Screen
                          name="Search"
                          component={SearchScreen}
                          options={{ animation: "none" }}
                        />
                        <Stack.Screen
                          name="Notifications"
                          component={NotificationCenterScreen}
                          options={{ animation: "none" }}
                        />
                        <Stack.Screen
                          name="Profile"
                          component={ProfileScreen}
                          options={{ animation: "none" }}
                        />
                        <Stack.Screen
                          name="ProfileEdit"
                          component={ProfileEditPage}
                          options={{ animation: "none" }}
                        />
                        <Stack.Screen
                          name="Accolades"
                          component={AccoladesScreen}
                          options={{ animation: "none" }}
                        />
                        <Stack.Screen
                          name="UserProfile"
                          component={UserProfileScreen}
                          options={{ animation: "none" }}
                        />
                        <Stack.Screen
                          name="FollowList"
                          component={FollowListScreen}
                          options={{ animation: "none" }}
                        />
                        <Stack.Screen
                          name="FollowRequests"
                          component={FollowRequestsScreen}
                          options={{ animation: "none" }}
                        />
                        <Stack.Screen
                          name="MuscleDetail"
                          component={MuscleDetailScreen}
                          options={{ animation: "none" }}
                        />
                        <Stack.Screen
                          name="LiveSession"
                          component={LiveSessionScreen}
                          options={{ animation: "none" }}
                        />

                        <Stack.Screen
                        name = "MultiplayerWaitingScreen"
                        component={MultiplayerWaitingScreen}
                        />


                      </Stack.Navigator>
                    </NavigationContainer>
                      <AchievementToast navigationRef={navigationRef} />
                      <InviteToast navigationRef={navigationRef} />
                      <InviteNotification />
                    </View>
                    </InviteProvider>
                    </AchievementProvider>
                  </GlobalWorkedMusclesProvider>
                </WorkoutStatsProvider>
              </MovementProvider>
            </OnboardingProvider>
          </WorkoutsProvider>
        </RoutinesProvider>
      </WorkoutTemplateProvider>
    </UserProvider>
  );
}

const styles = StyleSheet.create({
  appRoot: {
    flex: 1,
    backgroundColor: screenBackground,
  },
  container: {
    flex: 1,
    backgroundColor: "rgba(215, 215, 213, 1)",
    alignItems: "center",
    justifyContent: "center",
  },
});
