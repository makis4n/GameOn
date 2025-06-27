import { auth, db } from "@/Firebase-config";
import { router } from "expo-router";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
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
  const [team, setTeam] = useState<any>(null);
  const [memberUsernames, setMemberUsernames] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [teamDocId, setTeamDocId] = useState<string | null>(null);

  useEffect(() => {
    const fetchTeam = async () => {
      const user = auth.currentUser;
      if (!user) return;

      setUserId(user.uid);
      try {
        const userDocRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userDocRef);
        const userData = userSnap.data();

        if (!userData?.team) {
          console.log("User is not part of a team");
          setLoading(false);
          return;
        }
        const q = query(
          collection(db, "teams"),
          where("name", "==", userData.team)
        );
        const querySnap = await getDocs(q);

        if (!querySnap.empty) {
          const teamDoc = querySnap.docs[0];
          const teamData = teamDoc.data();
          setTeam(teamData);
          setTeamDocId(teamDoc.id);

          const usernames = await Promise.all(
            teamData.members.map(async (uid: string) => {
              const userDoc = await getDoc(doc(db, "users", uid));
              const userInfo = userDoc.data();
              return userInfo?.username || uid;
            })
          );
          setMemberUsernames(usernames);
        } else {
          console.log("Team not found");
        }
      } catch (err) {
        console.error("Error fetching team:", err);
      }

      setLoading(false);
    };

    fetchTeam();
  }, []);

  const deleteTeam = async () => {
    if (!teamDocId || !userId) return;

    Alert.alert("Delete Team", "Are you sure you want to delete this team?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await Promise.all(
              team.members.map(async (memberId: string) => {
                await updateDoc(doc(db, "users", memberId), {
                  team: null,
                });
              })
            );
            await deleteDoc(doc(db, "teams", teamDocId));

            Alert.alert("Deleted", "Team has been deleted.");
            setTeam(null);
          } catch (err) {
            console.error("Failed to delete team:", err);
            Alert.alert("Error", "Could not delete team.");
          }
        },
      },
    ]);
  };

  const leaveTeam = async () => {
    if (!teamDocId || !userId) return;

    Alert.alert("Leave Team", "Are you sure you want to leave this team?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Leave",
        style: "destructive",
        onPress: async () => {
          try {
            const updatedMembers = team.members.filter(
              (id: string) => id !== userId
            );

            await updateDoc(doc(db, "teams", teamDocId), {
              members: updatedMembers,
            });

            await updateDoc(doc(db, "users", userId), {
              team: null,
            });

            Alert.alert("Left", "You have left the team.");
            setTeam(null);
          } catch (err) {
            console.error("Failed to leave team:", err);
            Alert.alert("Error", "Could not leave team.");
          }
        },
      },
    ]);
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
        <Text style={styles.title}>You are not in a team.</Text>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: "#007AFF" }]}
          onPress={() => router.push("/homeFolder/createTeam")}
        >
          <Text style={styles.buttonText}>Create or Join a Team</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const isCreator = auth.currentUser?.uid === team.createdBy;

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
      {isCreator ? (
        <TouchableOpacity
          style={[styles.button, { backgroundColor: "#FF3B30" }]}
          onPress={deleteTeam}
        >
          <Text style={styles.buttonText}>Delete Team</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={[styles.button, { backgroundColor: "#FF9500" }]}
          onPress={leaveTeam}
        >
          <Text style={styles.buttonText}>Leave Team</Text>
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
