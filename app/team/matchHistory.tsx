import { db } from "@/Firebase-config";
import { useLocalSearchParams } from "expo-router";
import { collection, getDocs, query, where } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function MatchHistory() {
  const { id } = useLocalSearchParams(); // `id` is the team name
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  interface Match {
    id: string;
    teamName: string;
    teamNameInvited: string;
    score: string;
    dateTime: string;
  }

  useEffect(() => {
    const fetchMatches = async () => {
      if (!id || typeof id !== "string") return;

      try {
        const listingsRef = collection(db, "listings");
        const q = query(listingsRef, where("status", "==", "completed"));
        const snapshot = await getDocs(q);

        const matchData: Match[] = snapshot.docs
          .map((doc) => ({ id: doc.id, ...(doc.data() as Omit<Match, "id">) }))
          .filter(
            (match) => match.teamName === id || match.teamNameInvited === id
          );

        setMatches(matchData);
      } catch (error) {
        console.error("Error fetching match history:", error);
      }

      setLoading(false);
    };

    fetchMatches();
  }, [id]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>{id} Match History</Text>
      {matches.length === 0 ? (
        <Text style={styles.noMatch}>No completed matches found.</Text>
      ) : (
        matches.map((match) => (
          <View key={match.id} style={styles.card}>
            <Text style={styles.text}>
              {match.teamName} vs {match.teamNameInvited}
            </Text>
            <Text style={styles.text}>Score: {match.score}</Text>
            <Text style={styles.date}>
              {new Date(match.dateTime).toLocaleString()}
            </Text>
          </View>
        ))
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f9f9f9" },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  text: {
    fontSize: 16,
    color: "#333",
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    color: "#666",
  },
  noMatch: {
    textAlign: "center",
    color: "#777",
    fontSize: 16,
  },
});
