import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const home = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.rowButtons}>
        <TouchableOpacity
          style={styles.teamButton}
          onPress={() => router.push("/homeFolder/teamPage")}
        >
          <Text style={styles.teamText}>Team</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.notificationButton}
          onPress={() => router.push("/homeFolder/notifications")}
        >
          <View style={{ position: "relative" }}>
            <Ionicons name="notifications-outline" size={24} color="#fff" />
            <View style={styles.badge}>
              <Text style={styles.badgeText}>3</Text>{" "}
            </View>
          </View>
        </TouchableOpacity>
      </View>
      <View style={styles.contentContainer}>
        <TouchableOpacity
          style={styles.createTeamButton}
          onPress={() => router.push("/homeFolder/createTeam")}
        >
          <Text style={styles.createTeamText}>Create Team</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default home;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  rowButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    paddingTop: 8,
    backgroundColor: "#f9f9f9",
  },
  contentContainer: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },
  createTeamButton: {
    backgroundColor: "#FF3B30",
    paddingVertical: 14,
    borderRadius: 8,
  },
  createTeamText: {
    color: "#fff",
    fontWeight: "600",
    textAlign: "center",
    fontSize: 16,
  },
  teamButton: {
    backgroundColor: "#FF3B30",
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 4,
    alignSelf: "flex-start",
    marginTop: 0,
    marginBottom: 12,
  },
  teamText: {
    color: "#fff",
    fontWeight: "600",
    textAlign: "center",
    fontSize: 14,
  },
  notificationButton: {
    backgroundColor: "#FF3B30",
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 4,
    alignSelf: "flex-end",
    marginTop: 0,
    marginBottom: 12,
  },
  notificationText: {
    color: "#fff",
    fontWeight: "600",
    textAlign: "center",
    fontSize: 14,
  },
  badge: {
    position: "absolute",
    right: -6,
    top: -6,
    backgroundColor: "white",
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FF3B30",
  },
  badgeText: {
    color: "#FF3B30",
    fontSize: 12,
    fontWeight: "bold",
  },
});
