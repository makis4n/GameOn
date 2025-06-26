import { auth, db } from "@/Firebase-config";
import { useLocalSearchParams } from "expo-router";
import { addDoc, collection, doc, getDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TeamPage() {
  const { id } = useLocalSearchParams();
  const [team, setTeam] = useState<any>(null);
  const [memberUsernames, setMemberUsernames] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [userTeamId, setUserTeamId] = useState<string | null>(null);

  useEffect(() => {
    const fetchTeam = async () => {
      const user = auth.currentUser;
      if (!user || !id) return;

      setUserId(user.uid);

      try {
        const teamDocRef = doc(db, "teams", id as string);
        const teamSnap = await getDoc(teamDocRef);
        if (!teamSnap.exists()) {
          console.log("Team not found");
          setLoading(false);
          return;
        }

        const teamData = teamSnap.data();
        setTeam(teamData);

        const usernames = await Promise.all(
          teamData.members.map(async (uid: string) => {
            const userDoc = await getDoc(doc(db, "users", uid));
            const userInfo = userDoc.data();
            return userInfo?.username || uid;
          })
        );
        setMemberUsernames(usernames);

        const userDocSnap = await getDoc(doc(db, "users", user.uid));
        const userTeam = userDocSnap.data()?.team;
        setUserTeamId(userTeam);
      } catch (err) {
        console.error("Error fetching team:", err);
      }

      setLoading(false);
    };

    fetchTeam();
  }, [id]);

  const requestToJoin = async () => {
    if (!userId || !team) return;

    try {
      await addDoc(collection(db, "notifications"), {
        to: team.createdBy,
        from: userId,
        teamId: id,
        teamName: team.name,
        message: "Request to join your team",
        timestamp: new Date().toISOString(),
        type: "join_request",
        status: "pending",
        read: false,
      });
      Alert.alert("Requested", "Join request sent to team owner.");
    } catch (err) {
      console.error("Failed to send request:", err);
      Alert.alert("Error", "Could not send join request.");
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </SafeAreaView>
    );
  }

  if (!team) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>Team not found.</Text>
      </SafeAreaView>
    );
  }

  const isCreator = auth.currentUser?.uid === team.createdBy;
  const isMember = team.members.includes(userId);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Team</Text>

      <View style={styles.profileCard}>
        <Text style={styles.label}>Team Name</Text>
        <Text style={styles.value}>{team?.name}</Text>

        <Text style={styles.label}>Members</Text>
        {memberUsernames.map((username: string, index: number) => (
          <Text key={index} style={styles.value}>
            {username}
            {team?.createdBy === team.members[index] ? " (Creator)" : ""}
          </Text>
        ))}
      </View>

      {!isMember && userTeamId !== team.name && (
        <TouchableOpacity
          style={[styles.button, { backgroundColor: "#007AFF" }]}
          onPress={requestToJoin}
        >
          <Text style={styles.buttonText}>Request to Join</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: "#f9f9f9",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 24,
    textAlign: "center",
    color: "#333",
  },
  profileCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 30,
  },
  label: {
    fontWeight: "600",
    color: "#555",
    marginTop: 10,
  },
  value: {
    fontSize: 16,
    color: "#000",
    marginTop: 2,
  },
  button: {
    paddingVertical: 14,
    borderRadius: 8,
    marginBottom: 12,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    textAlign: "center",
    fontSize: 16,
  },
});
