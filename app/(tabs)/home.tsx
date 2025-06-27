import { auth, db } from "@/Firebase-config";
import {
  createCalendarEvent,
  requestCalendarPermissions,
} from "@/hooks/addToCalendar";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { router } from "expo-router";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Home = () => {
  const [upcomingGame, setUpcomingGame] = useState<any | null>(null);
  const [gamesHappening, setGamesHappening] = useState<any[]>([]);
  const [playerListings, setPlayerListings] = useState<any[]>([]);
  const [notificationCount, setNotificationCount] = useState(0);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  useEffect(() => {
    const authInstance = getAuth();
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        alert("Permission to access location was denied");
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    })();

    let unsubNotif: () => void = () => {};
    let unsubListing: () => void = () => {};
    let unsubPlayerListings: () => void = () => {};

    const unsubAuth = onAuthStateChanged(authInstance, async (user) => {
      if (unsubNotif) unsubNotif();
      if (unsubListing) unsubListing();
      if (unsubPlayerListings) unsubPlayerListings();

      if (!user) {
        setNotificationCount(0);
        setUpcomingGame(null);
        setGamesHappening([]);
        setPlayerListings([]);
        return;
      }

      const notifQuery = query(
        collection(db, "notifications"),
        where("to", "==", user.uid),
        where("read", "==", false)
      );
      unsubNotif = onSnapshot(notifQuery, (snapshot) => {
        setNotificationCount(snapshot.size);
      });

      const listingQuery = query(
        collection(db, "listings"),
        where("userId", "==", user.uid)
      );
      unsubListing = onSnapshot(listingQuery, (snapshot) => {
        const now = new Date();

        const allListings = snapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .filter((listing: any) => new Date(listing.dateTime) > now);

        const accepted = allListings
          .filter((l: any) => l.status === "accepted")
          .sort(
            (a: any, b: any) =>
              new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()
          );

        const pending = allListings.filter(
          (l: any) =>
            l.status === "pending" &&
            (!l.teamNameInvited || l.teamNameInvited.trim() === "")
        );

        setUpcomingGame(accepted.length > 0 ? accepted[0] : null);
        setGamesHappening(pending);
      });

      const playerListingsQuery = query(
        collection(db, "player_listings"),
        where("status", "==", "open")
      );
      unsubPlayerListings = onSnapshot(playerListingsQuery, (snapshot) => {
        const listings = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPlayerListings(listings);
      });
    });

    return () => {
      unsubAuth();
      if (unsubNotif) unsubNotif();
      if (unsubListing) unsubListing();
      if (unsubPlayerListings) unsubPlayerListings();
    };
  }, []);

  function getDistanceFromLatLonInKm(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ) {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  }
  unsubPlayerListings = onSnapshot(playerListingsQuery, (snapshot) => {
    const listings = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    if (userLocation) {
      const nearbyListings = listings.filter((listing: any) => {
        if (listing.latitude && listing.longitude) {
          const distance = getDistanceFromLatLonInKm(
            userLocation.latitude,
            userLocation.longitude,
            listing.latitude,
            listing.longitude
          );
          return distance <= 10; // within 10 km radius
        }
        return false;
      });

      setPlayerListings(nearbyListings);
    } else {
      setPlayerListings(listings);
    }
  });
  const sendJoinRequest = async (listing: any) => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      if (!listing.userId) {
        alert("Error: Listing owner not found.");
        return;
      }

      const userDoc = await getDoc(doc(db, "users", currentUser.uid));
      const senderTeamName = userDoc.exists()
        ? userDoc.data().team || "A team"
        : "A team";

      await addDoc(collection(db, "notifications"), {
        title: "Request to join game",
        to: listing.userId,
        from: currentUser.uid,
        listingId: listing.id,
        teamId: "",
        teamNameInvited: senderTeamName,
        message: `${senderTeamName} wants to join your game.`,
        timestamp: new Date().toISOString(),
        status: "pending",
        read: false,
      });

      alert("Request sent!");
    } catch (error) {
      console.error("Failed to send request:", error);
      alert("Failed to send request. Check logs.");
    }
  };

  const sendJoinRequestForPlayer = async (listing: any) => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const userDoc = await getDoc(doc(db, "users", currentUser.uid));
      const senderName = userDoc.exists()
        ? userDoc.data().username || "Someone"
        : "Someone";

      await addDoc(collection(db, "notifications"), {
        title: "Request to join player listing",
        to: listing.createdBy,
        from: currentUser.uid,
        listingId: listing.id,
        teamId: "",
        teamNameInvited: "",
        message: `${senderName} wants to join your player listing for ${listing.teamName}.`,
        timestamp: new Date().toISOString(),
        status: "pending",
        read: false,
      });

      alert("Request sent!");
    } catch (error) {
      console.error("Failed to send request:", error);
      alert("Failed to send request. Check logs.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View style={styles.topRow}>
          <TouchableOpacity
            style={styles.teamButton}
            onPress={() => router.push("/homeFolder/teamPage")}
          >
            <Text style={styles.teamText}>Team</Text>
          </TouchableOpacity>

          <View style={styles.iconRow}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => router.push("/homeFolder/weatherforecast")}
            >
              <Ionicons name="cloud-outline" size={24} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.iconButton}
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
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Upcoming Game</Text>
          {upcomingGame ? (
            <View style={styles.card}>
              <Text style={styles.cardTitle} numberOfLines={1}>
                {upcomingGame.task}
              </Text>
              <Text style={styles.cardSub}>
                {upcomingGame.teamName} vs {upcomingGame.teamNameInvited}
              </Text>
              <Text style={styles.cardSub}>
                Location: {upcomingGame.location}
              </Text>
              <Text style={styles.cardSub}>
                Date: {new Date(upcomingGame.dateTime).toLocaleString()}
              </Text>
              <TouchableOpacity
                style={styles.requestButton}
                onPress={async () => {
                  try {
                    await requestCalendarPermissions();
                    const start = new Date(upcomingGame.dateTime);
                    const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
                    await createCalendarEvent(
                      `${upcomingGame.teamName} vs ${upcomingGame.teamNameInvited}`,
                      upcomingGame.location,
                      start,
                      end
                    );
                    alert("Game synced to calendar!");
                  } catch (error) {
                    console.error("Calendar error:", error);
                    alert("Failed to sync with calendar.");
                  }
                }}
              >
                <Text style={styles.requestButtonText}>Sync to Calendar</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <Text style={styles.emptyText}>No upcoming game</Text>
          )}
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Games Happening</Text>
          {gamesHappening.length > 0 ? (
            gamesHappening.map((game) => (
              <View key={game.id} style={styles.card}>
                <Text style={styles.cardTitle}>{game.task}</Text>
                <Text style={styles.cardSub}>Your Team: {game.teamName}</Text>
                <Text style={styles.cardSub}>Location: {game.location}</Text>
                <Text style={styles.cardSub}>
                  Date: {new Date(game.dateTime).toLocaleString()}
                </Text>
                <Text style={[styles.cardSub, { color: "#FF9500" }]}>
                  Status: Pending
                </Text>

                <TouchableOpacity
                  style={styles.requestButton}
                  onPress={() => sendJoinRequest(game)}
                >
                  <Text style={styles.requestButtonText}>Request to Join</Text>
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No active games</Text>
          )}
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Looking for players</Text>
          {playerListings.length > 0 ? (
            playerListings.map((listing) => (
              <View key={listing.id} style={styles.card}>
                <Text style={styles.cardTitle}>{listing.teamName}</Text>
                <Text style={styles.cardSub}>Location: {listing.location}</Text>
                <Text style={styles.cardSub}>
                  Description: {listing.description}
                </Text>
                <Text style={styles.cardSub}>
                  Positions Needed: {listing.positions?.join(", ")}
                </Text>
                <Text style={styles.cardSub}>
                  Date: {new Date(listing.dateTime).toLocaleString()}
                </Text>
                <TouchableOpacity
                  style={styles.requestButton}
                  onPress={() => sendJoinRequestForPlayer(listing)}
                >
                  <Text style={styles.requestButtonText}>Request to Join</Text>
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No player listings available</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  teamButton: {
    backgroundColor: "#FF3B30",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 4,
  },
  teamText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  notificationButton: {
    backgroundColor: "#FF3B30",
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 4,
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
  sectionContainer: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  card: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    shadowColor: "#ccc",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "500",
  },
  cardSub: {
    color: "#666",
    marginTop: 2,
  },
  emptyText: {
    color: "#999",
  },
  requestButton: {
    marginTop: 10,
    backgroundColor: "#007AFF",
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: "center",
  },
  requestButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  iconRow: {
    flexDirection: "row",
    gap: 8,
  },

  iconButton: {
    backgroundColor: "#FF3B30",
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 4,
    marginLeft: 8,
  },
});
