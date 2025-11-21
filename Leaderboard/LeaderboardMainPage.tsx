import React from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Platform,
} from "react-native";
import NavBar from "../Components/NavBar";
import TabRow from "./LeaderboardMainPage Components/TabRow";
import PodiumContainer from "./LeaderboardMainPage Components/PodiumContainer";
import LeaderboardRow from "./LeaderboardMainPage Components/LeaderboardRow";
import LoadMoreButton from "./LeaderboardMainPage Components/LoadMoreButton";

const LeaderboardScreen = () => {
  const leaderboardData = [
    { rank: 1, username: "IronTitan", score: 9820, change: "+120" },
    { rank: 2, username: "FlexQueen", score: 9685, change: "+98" },
    { rank: 3, username: "MassBuilder", score: 9520, change: "+75" },
    { rank: 4, username: "CardioKing", score: 9250, change: "+60" },
    { rank: 5, username: "RepMachine", score: 9080, change: "+48" },
    { rank: 6, username: "ZenLifter", score: 9015, change: "+42" },
    { rank: 7, username: "CoreCrusher", score: 8940, change: "+37" },
    { rank: 8, username: "MorningPump", score: 8805, change: "+28" },
  ];

  const tabs = ["Global", "Friends"];
  const activeTab = "Global";
  const topThree = leaderboardData.slice(0, 3);
  const restOfData = leaderboardData.slice(3);

  return (
    <View style={styles.container}>
      <TabRow tabs={tabs} activeTab={activeTab} />
      <PodiumContainer topThree={topThree} />
      <ScrollView
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {restOfData.map((entry) => (
          <LeaderboardRow
            key={entry.rank}
            rank={entry.rank}
            username={entry.username}
            score={entry.score}
            change={entry.change}
          />
        ))}
        <LoadMoreButton />
      </ScrollView>
      <NavBar />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    paddingHorizontal: 24,
  },
  listContent: {
    paddingTop: 24,
    paddingBottom: 120,
    gap: 12,
  },
});

export default LeaderboardScreen;


