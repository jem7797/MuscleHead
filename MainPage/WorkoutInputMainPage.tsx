import React, { useMemo, useRef, useState } from "react";
import {
  StyleSheet,
  View,
  Dimensions,
  Animated,
  ActivityIndicator,
  Text,
} from "react-native";
import NavBar from "../Components/NavBar";
import ScheduleBuilderModal from "../Components/ScheduleBuilderModal";
import DayHeader from "../Components/DayHeader";
import MuscleManView from "../Components/MuscleManView";
import StatsRow from "../Components/StatsRow";
import AddWorkoutMenu from "../Components/AddWorkoutMenu";
import RotateButton from "../Components/RotateButton";
import { WorkedMusclesProvider } from "../Contexts/WorkedMusclesContext";
import { useGlobalWorkedMuscles } from "../Contexts/GlobalWorkedMusclesContext";
import { useUser } from "../Contexts/UserContext";

const { height } = Dimensions.get("window");

const WorkoutInputMainPage = () => {
  const { globalFrontWorked, globalBackWorked } = useGlobalWorkedMuscles();
  const { lifetimeWeightLifted, lifetimeGymTime, isProfileLoading } = useUser();
  const [isBack, setIsBack] = useState(false);
  const [showScheduleEditor, setShowScheduleEditor] = useState(false);
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
    [spinVal]
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
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
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
      <DayHeader
        dayName={dayName}
        workoutPlanForDay={workoutPlanForDay}
        onEditPress={toggleScheduleEditor}
      />

      {/* Content layer */}
      <WorkedMusclesProvider frontWorked={globalFrontWorked} backWorked={globalBackWorked}>
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

        <AddWorkoutMenu />
      </WorkedMusclesProvider>

      <RotateButton spin={spin} onRotate={handleRotate} />

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

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "white",
  },
  statsLoading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 130,
    paddingHorizontal: 16,
  },
  statsLoadingText: {
    fontSize: 14,
    color: "#51607a",
  },
});

export default WorkoutInputMainPage;
