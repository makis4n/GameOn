import { auth, db } from "@/Firebase-config";
import { FontAwesome } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface Match {
  id: string;
  teamName: string;
  teamNameInvited: string;
  location?: string;
  dateTime: string;
  score?: string;
}

export default function Activities() {
  const [matchHistory, setMatchHistory] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMatchHistory = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const teamId = userDoc.data()?.team;
        if (!teamId) return;

        const teamDoc = await getDoc(doc(db, "teams", teamId));
        const teamName = teamDoc.data()?.name;
        if (!teamName) return;
        const q1 = query(
          collection(db, "listings"),
          where("status", "==", "completed"),
          where("teamName", "==", teamName)
        );

        const q2 = query(
          collection(db, "listings"),
          where("status", "==", "completed"),
          where("teamNameInvited", "==", teamName)
        );

        const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)]);

        const combined: Match[] = [...snap1.docs, ...snap2.docs]
          .map((docSnap) => {
            const data = docSnap.data();
            return {
              id: docSnap.id,
              teamName: data.teamName,
              teamNameInvited: data.teamNameInvited,
              location: data.location,
              dateTime: data.dateTime,
              score: data.score,
            };
          })
          .sort(
            (a, b) =>
              new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime()
          );

        setMatchHistory(combined);
      } catch (error) {
        console.error("Error fetching match history:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMatchHistory();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <FontAwesome name="chevron-left" size={24} color="black" />
      </TouchableOpacity>

      <Text style={styles.title}>Match History</Text>

      {matchHistory.length === 0 ? (
        <Text style={styles.emptyText}>No completed matches yet.</Text>
      ) : (
        <FlatList
          data={matchHistory}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>
                {item.teamName} vs {item.teamNameInvited}
              </Text>
              <Text style={styles.cardSub}>
                Location: {item.location || "N/A"}
              </Text>
              <Text style={styles.cardSub}>
                Date: {new Date(item.dateTime).toLocaleString()}
              </Text>
              {item.score && (
                <Text style={[styles.cardSub, { fontWeight: "bold" }]}>
                  Score: {item.score}
                </Text>
              )}
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f9f9f9",
  },
  backButton: {
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
  },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 6,
  },
  cardSub: {
    color: "#555",
  },
  emptyText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: "#999",
  },
});
