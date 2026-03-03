import React, { useMemo, useRef, useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Dimensions,
  Animated,
  ActivityIndicator,
  Text,
  ScrollView,
} from "react-native";
import NavBar from "../Components/NavBar";
import ScheduleBuilderModal from "../Components/ScheduleBuilderModal";
import DayHeader from "../Components/DayHeader";
import MuscleManView from "../Components/MuscleManView";
import StatsRow from "../Components/StatsRow";
import RoutineCardsSection from "../Components/RoutineCardsSection";
import WorkoutCardsSection from "../Components/WorkoutCardsSection";
import AddWorkoutMenu from "../Components/AddWorkoutMenu";
import RotateButton from "../Components/RotateButton";
import { WorkedMusclesProvider } from "../Contexts/WorkedMusclesContext";
import { useGlobalWorkedMuscles } from "../Contexts/GlobalWorkedMusclesContext";
import { useUser } from "../Contexts/UserContext";
import { useRoutines } from "../Contexts/RoutinesContext";
import { useWorkouts } from "../Contexts/WorkoutsContext";
import { useNavigation, useFocusEffect } from "@react-navigation/native";

const { height } = Dimensions.get("window");

const WorkoutInputMainPage = () => {
  const navigation = useNavigation<any>();
  const { globalFrontWorked, globalBackWorked } = useGlobalWorkedMuscles();
  const { lifetimeWeightLifted, lifetimeGymTime, isProfileLoading } = useUser();
  const [isBack, setIsBack] = useState(false);
  const [showScheduleEditor, setShowScheduleEditor] = useState(false);
  const { routines, isLoading: routinesLoading, fetchRoutines } = useRoutines();
  const {
    workouts,
    isLoading: workoutsLoading,
    isLoadingMore: workoutsLoadingMore,
    hasMore: workoutsHasMore,
    totalElements: workoutsTotal,
    fetchWorkouts,
    loadMoreWorkouts,
  } = useWorkouts();

  useEffect(() => {
    if (routines.length === 0) {
      fetchRoutines();
    }
  }, [fetchRoutines]);

  useFocusEffect(
    React.useCallback(() => {
      fetchRoutines();
      fetchWorkouts();
    }, [fetchRoutines, fetchWorkouts]),
  );

  const [schedule, setSchedule] = useState<Record<string, string>>({
    Monday: "",
    Tuesday: "",
    Wednesday: "",
    Thursday: "",
    Friday: "",
    Saturday: "",
    Sunday: "",
  });

  const toggleScheduleEditor = () => setShowScheduleEditor((s) => !s);

  const handleScheduleSave = (newSchedule: Record<string, string>) => {
    setSchedule(newSchedule);
  };

  const spinVal = useRef(new Animated.Value(0)).current;
  const spin = useMemo(
    () =>
      spinVal.interpolate({
        inputRange: [0, 1],
        outputRange: ["0deg", "180deg"],
      }),
    [spinVal],
  );

  const handleRotate = () => {
    Animated.sequence([
      Animated.timing(spinVal, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(spinVal, {
        toValue: 0,
        duration: 0,
        useNativeDriver: true,
      }),
    ]).start();
    setIsBack((s) => !s);
  };

  const size = height * 0.4;
  const totalWeightLiftedLbs = lifetimeWeightLifted ?? 0;
  const totalGymMinutes = lifetimeGymTime ?? 0;
  const totalHours = Math.floor(totalGymMinutes / 60);
  const totalMinutes = Math.floor(totalGymMinutes % 60);

  const dayName = new Date().toLocaleDateString(undefined, { weekday: "long" });
  const dayIndex = new Date().getDay(); // 0=Sun ... 6=Sat

  // Get workout plan for current day from schedule, or use default
  const workoutPlanForDay = (() => {
    const dayNames = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const currentDayName = dayNames[dayIndex];
    const savedPlan = schedule[currentDayName];

    if (savedPlan && savedPlan.trim() !== "") {
      return savedPlan;
    }

    // Default fallback
    switch (dayIndex) {
      case 1: // Monday
        return "Push Day";
      case 2: // Tuesday
        return "Pull Day";
      case 3: // Wednesday
        return "Leg Day";
      case 4: // Thursday
        return "Push Day";
      case 5: // Friday
        return "Pull Day";
      default: // Saturday(6) & Sunday(0)
        return "Off";
    }
  })();

  return (
    <View style={styles.mainContainer}>
      <View style={styles.fixedTopBar} pointerEvents="box-none">
        <AddWorkoutMenu />
        <RotateButton spin={spin} onRotate={handleRotate} />
      </View>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <DayHeader
          dayName={dayName}
          workoutPlanForDay={workoutPlanForDay}
          onEditPress={toggleScheduleEditor}
        />

        <WorkedMusclesProvider
          frontWorked={globalFrontWorked}
          backWorked={globalBackWorked}
        >
          <MuscleManView isBack={isBack} size={size} />

          {isProfileLoading ? (
            <View style={styles.statsLoading}>
              <ActivityIndicator size="small" color="#1f2a44" />
              <Text style={styles.statsLoadingText}>Loading stats...</Text>
            </View>
          ) : (
            <StatsRow
              totalWeightLiftedLbs={totalWeightLiftedLbs}
              totalHours={totalHours}
              totalMinutes={totalMinutes}
            />
          )}

          <RoutineCardsSection
            routines={routines}
            isLoading={routinesLoading}
            onRoutinePress={(routine) => {
              if (routine.id != null) {
                navigation.navigate("RoutineDetail", { routineId: routine.id });
              }
            }}
          />

          <WorkoutCardsSection
            workouts={workouts}
            isLoading={workoutsLoading}
            isLoadingMore={workoutsLoadingMore}
            hasMore={workoutsHasMore}
            totalElements={workoutsTotal}
            onWorkoutPress={(workout) => {
              if (workout.id != null) {
                navigation.navigate("WorkoutDetail", { sessionId: workout.id });
              }
            }}
            onLoadMore={loadMoreWorkouts}
          />
        </WorkedMusclesProvider>
      </ScrollView>

      <ScheduleBuilderModal
        visible={showScheduleEditor}
        onClose={toggleScheduleEditor}
        onSave={handleScheduleSave}
        initialSchedule={schedule}
      />

      <NavBar />
    </View>
  );
};

const NAV_BAR_PADDING = 80;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "white",
  },
  fixedTopBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 100,
    zIndex: 1000,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: NAV_BAR_PADDING,
  },
  statsLoading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 16,
    paddingHorizontal: 16,
  },
  statsLoadingText: {
    fontSize: 14,
    color: "#51607a",
  },
});

export default WorkoutInputMainPage;
