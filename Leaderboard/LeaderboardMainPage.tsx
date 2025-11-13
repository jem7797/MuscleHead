import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import NavBar from "../Components/NavBar";

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

  return (
    <View style={styles.container}>
     

      <View style={styles.tabRow}>
        {tabs.map((tab) => {
          const isActive = tab === activeTab;
          return (
            <TouchableOpacity
              key={tab}
              style={[styles.tabButton, isActive && styles.tabButtonActive]}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                {tab}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.podiumContainer}>
        <View style={styles.podiumCard}>
          <View style={[styles.podiumBadge, styles.podiumBadgeSecond]}>
            <Text style={styles.podiumRank}>2</Text>
          </View>
          <Text style={styles.podiumName}>FlexQueen</Text>
          <Text style={styles.podiumScore}>9,685 pts</Text>
        </View>

        <View style={[styles.podiumCard, styles.podiumCardFirst]}>
          <View style={[styles.podiumBadge, styles.podiumBadgeFirst]}>
            <Text style={styles.podiumRank}>1</Text>
          </View>
          <Text style={[styles.podiumName, styles.podiumNamePrimary]}>IronTitan</Text>
          <Text style={[styles.podiumScore, styles.podiumScorePrimary]}>9,820 pts</Text>
        </View>

        <View style={styles.podiumCard}>
          <View style={[styles.podiumBadge, styles.podiumBadgeThird]}>
            <Text style={styles.podiumRank}>3</Text>
          </View>
          <Text style={styles.podiumName}>MassBuilder</Text>
          <Text style={styles.podiumScore}>9,520 pts</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {leaderboardData.map((entry) => (
          <TouchableOpacity key={entry.rank} style={styles.row} activeOpacity={0.7}>
            <View style={styles.rankBadge}>
              <Text style={styles.rankText}>{entry.rank}</Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.username}>{entry.username}</Text>
              <Text style={styles.score}>{entry.score.toLocaleString()} pts</Text>
            </View>

            <View style={styles.changeBadge}>
              <Ionicons name="arrow-up" size={12} color="#1f2a44" />
              <Text style={styles.changeText}>{entry.change}</Text>
            </View>
          </TouchableOpacity>
        ))}
        <TouchableOpacity style={styles.loadMoreButton} activeOpacity={0.75}>
          <Text style={styles.loadMoreText}>Load more</Text>
        </TouchableOpacity>
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0f1724",
  },
  infoButton: {
    padding: 6,
    borderRadius: 12,
    backgroundColor: "#e6ebf5",
  },
  subtitleRow: {
    marginTop: 6,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  subtitle: {
    fontSize: 13,
    color: "#5a6a7e",
  },
  streakBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#1f2a44",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  streakText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  tabRow: {
    flexDirection: "row",
    marginTop: 24,
    backgroundColor: "#e6ebf5",
    borderRadius: 18,
    padding: 4,
    gap: 6,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 14,
    alignItems: "center",
  },
  tabButtonActive: {
    backgroundColor: "#1f2a44",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  tabText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#5a6a7e",
  },
  tabTextActive: {
    color: "#fff",
    fontWeight: "600",
  },
  podiumContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: 28,
    gap: 12,
  },
  podiumCard: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 18,
    borderRadius: 20,
    backgroundColor: "#f4f6fa",
    borderWidth: 1,
    borderColor: "#e0e5ef",
    gap: 8,
  },
  podiumCardFirst: {
    paddingVertical: 24,
    borderColor: "#1f2a44",
    backgroundColor: "#1f2a44",
    transform: [{ translateY: -10 }],
  },
  podiumBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  podiumBadgeFirst: {
    backgroundColor: "#1f2a44",
  },
  podiumBadgeSecond: {
    backgroundColor: "#2e3d66",
  },
  podiumBadgeThird: {
    backgroundColor: "#41517e",
  },
  podiumRank: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  podiumName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0f1724",
  },
  podiumScore: {
    fontSize: 12,
    color: "#5a6a7e",
  },
  podiumNamePrimary: {
    color: "#fff",
  },
  podiumScorePrimary: {
    color: "#dfe5ff",
  },
  listContent: {
    paddingTop: 24,
    paddingBottom: 120,
    gap: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: "#f9fafc",
    borderWidth: 1,
    borderColor: "#d9e0f3",
    gap: 14,
    shadowColor: "#1f2a44",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#1f2a44",
    alignItems: "center",
    justifyContent: "center",
  },
  rankText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
  userInfo: {
    flex: 1,
  },
  username: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0f1724",
  },
  score: {
    fontSize: 12,
    color: "#5a6a7e",
    marginTop: 2,
  },
  changeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#d9e0f3",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  changeText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#1f2a44",
  },
  loadMoreButton: {
    alignSelf: "center",
    marginTop: 12,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "#1f2a44",
  },
  loadMoreText: {
    fontSize: 13,
    color: "#fff",
    fontWeight: "600",
  },
});

export default LeaderboardScreen;


