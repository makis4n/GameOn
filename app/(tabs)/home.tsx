import { db } from "@/Firebase-config";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { getAuth } from "firebase/auth";
import {
  collection,
  getDocs,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const home = () => {
  const [upcomingGame, setUpcomingGame] = useState<any | null>(null);
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    const fetchUpcomingGame = async () => {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) return;

      const q = query(
        collection(db, "listings"),
        where("userId", "==", user.uid),
        where("status", "==", "accepted")
      );

      const snapshot = await getDocs(q);
      const now = new Date();

      const upcoming = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((listing: any) => new Date(listing.dateTime) > now)
        .sort(
          (a: any, b: any) =>
            new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()
        );

      if (upcoming.length > 0) {
        setUpcomingGame(upcoming[0]);
      } else {
        setUpcomingGame(null);
      }
    };

    const listenForUnreadNotifications = () => {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) return;

      const q = query(
        collection(db, "notifications"),
        where("to", "==", user.uid),
        where("read", "==", false)
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        setNotificationCount(snapshot.size);
      });

      return unsubscribe;
    };

    fetchUpcomingGame();
    const unsubscribeNotif = listenForUnreadNotifications();

    return () => {
      if (unsubscribeNotif) unsubscribeNotif();
    };
  }, []);
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.rowButtons}>
        <TouchableOpacity
          style={styles.teamButton}
          onPress={() => router.push("/homeFolder/teamPage")}
        >
          <Text style={styles.teamText}>Team</Text>
        </TouchableOpacity>
        <View style={{ padding: 16 }}>
          <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 8,}}>
            Upcoming Games
          </Text>
          {upcomingGame ? (
            <View
              style={{
                backgroundColor: "#fff",
                padding: 12,
                borderRadius: 8,
                shadowColor: "#ccc",
                shadowOpacity: 0.3,
                shadowOffset: { width: 0, height: 2 },
                shadowRadius: 4,
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: "500" }}>
                {upcomingGame.task}
              </Text>
              <Text style={{ color: "#666" }}>
                {upcomingGame.teamName} vs {upcomingGame.teamNameInvited}
              </Text>
              <Text style={{ color: "#666" }}>
                Location: {upcomingGame.location}
              </Text>
              <Text style={{ color: "#666" }}>
                Date: {new Date(upcomingGame.dateTime).toLocaleString()}
              </Text>
            </View>
          ) : (
            <Text style={{ color: "#999", textAlign: "center" }}>No Upcoming Games</Text>
          )}
        </View>
        <TouchableOpacity
          style={styles.notificationButton}
          onPress={() => router.push("/homeFolder/notifications")}
        >
          <View style={{ position: "relative" }}>
            <Ionicons name="notifications-outline" size={24} color="#fff" />
            {notificationCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{notificationCount}</Text>
              </View>
            )}
          </View>
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
