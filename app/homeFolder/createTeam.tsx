import { auth, db } from "@/Firebase-config";
import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import React, { useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TeamPage() {
  const [teamName, setTeamName] = useState("");

  const createTeam = async () => {
    const userId = auth.currentUser?.uid;
    const trimmedTeamName = teamName.trim();
    if (!userId || !trimmedTeamName)
      return Alert.alert("Error", "Missing team name or user.");

    try {
      const teamRef = query(
        collection(db, "teams"),
        where("name", "==", teamName.trim())
      );
      const teamSnapshot = await getDocs(teamRef);
      if (!teamSnapshot.empty) {
        return Alert.alert("Team Exists", "Please choose a different name");
      }
      await setDoc(doc(db, "teams", trimmedTeamName), {
        name: trimmedTeamName,
        members: [userId],
        createdBy: userId,
      });
      await updateDoc(doc(db, "users", userId), {
        team: trimmedTeamName,
      });
      Alert.alert("Team Created", `"${teamName} has been created!`);
      setTeamName("");
    } catch (err) {
      Alert.alert("Error", "Failed to create team.");
      console.error(err);
    }
  };

  const joinTeam = async () => {
    const userId = auth.currentUser?.uid;
    if (!userId || !teamName)
      return Alert.alert("Error", "Missing team name or user.");

    try {
      const teamQuery = query(
        collection(db, "teams"),
        where("name", "==", teamName)
      );
      const teamSnap = await getDocs(teamQuery);

      if (teamSnap.empty)
        return Alert.alert("Not Found", "No team with this name found.");

      const teamDoc = teamSnap.docs[0];
      const teamData = teamDoc.data();

      if (teamData.members.includes(userId)) {
        return Alert.alert("Info", "You're already a member of this team.");
      }

      await updateDoc(doc(db, "teams", teamDoc.id), {
        members: [...teamData.members, userId],
      });

      await updateDoc(doc(db, "users", userId), {
        team: teamName.trim(),
      });

      Alert.alert("Success", `You joined "${teamName}"`);
      setTeamName("");
    } catch (err) {
      Alert.alert("Error", "Failed to join team.");
      console.error(err);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Create or Join a Team</Text>
      <TextInput
        placeholder="Enter Team Name"
        placeholderTextColor="#888"
        value={teamName}
        onChangeText={setTeamName}
        style={styles.input}
      />

      <TouchableOpacity style={styles.button} onPress={createTeam}>
        <Text style={styles.buttonText}>Create Team</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button]}
        onPress={joinTeam}
      >
        <Text style={styles.buttonText}>Join Team</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 24,
    textAlign: "center",
    color: "#333",
  },
  input: {
    height: 48,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#007AFF",
    paddingVertical: 14,
    borderRadius: 8,
    marginBottom: 12,
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
    textAlign: "center",
    fontSize: 16,
  },
});
