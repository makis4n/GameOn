import { auth, db } from "@/Firebase-config";
import { sendPushNotification } from "@/utils/sendPushNotification";
import { router, useLocalSearchParams } from "expo-router";
import { addDoc, collection, doc, getDoc, getDocs } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const UserProfile = () => {
  const { id } = useLocalSearchParams();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [inviting, setInviting] = useState(false);
  const [teamName, setTeamName] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isCreator, setIsCreator] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      const user = auth.currentUser;
      if (!id || !user) {
        return;
      }
      setCurrentUserId(user.uid);

      const docRef = doc(db, "users", id as string);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setProfile(docSnap.data());
      }
      const currentUserDoc = await getDoc(doc(db, "users", user.uid));
      const teamName = currentUserDoc.data()?.team;

      if (teamName) {
        const teamSnap = await getDoc(doc(db, "teams", teamName));
        if (teamSnap.exists()) {
          const teamData = teamSnap.data();
          if (teamData.createdBy === user.uid) {
            setIsCreator(true);
          }
        }
      }

      setLoading(false);
    };

    fetchProfile();
  }, [id]);

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </SafeAreaView>
    );
  }

  if (!profile) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>User Not Found</Text>
        <Text style={styles.message}>
          We couldn't find a user with that ID.
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>{profile.username}'s Profile</Text>

      <View style={styles.profileCard}>
        <Text style={styles.label}>Username:</Text>
        <Text style={styles.value}>{profile.username}</Text>

        <Text style={styles.label}>Age:</Text>
        <Text style={styles.value}>{profile.age}</Text>

        <Text style={styles.label}>Preferred Position:</Text>
        <Text style={styles.value}>{profile.position}</Text>

        <Text style={styles.label}>Team:</Text>
        <TouchableOpacity
          style={styles.value}
          onPress={async () => {
            if (!profile?.team) return;
            try {
              const snapshot = await getDocs(collection(db, "teams"));
              const matchingTeam = snapshot.docs.find(
                (doc) => doc.data().name === profile.team
              );

              if (matchingTeam) {
                router.push({
                  pathname: "/team/[id]",
                  params: { id: matchingTeam.id },
                });
              } else {
                alert("Team not found");
              }
            } catch (err) {
              console.error("Error fetching team:", err);
              alert("Something went wrong while finding the team.");
            }
          }}
        >
          <Text style={styles.value}>{profile?.team}</Text>
        </TouchableOpacity>
      </View>
      {isCreator && (
        <TouchableOpacity
          style={[
            styles.inviteButton,
            { backgroundColor: "#34C759", marginTop: 20 },
          ]}
          onPress={async () => {
            try {
              if (!id || !currentUserId) return;

              const toUserDoc = await getDoc(doc(db, "users", id as string));
              const fromUserDoc = await getDoc(doc(db, "users", currentUserId));

              if (!toUserDoc.exists() || !fromUserDoc.exists()) {
                alert("User data not found");
                return;
              }

              const toUserData = toUserDoc.data();
              const fromUserData = fromUserDoc.data();

              const expoPushToken = toUserData?.expoPushToken;
              const fromUsername = fromUserData?.username;

              await addDoc(collection(db, "notifications"), {
                title: "Invitation to Join",
                toUser: id,
                fromUser: currentUserId,
                type: "invite",
                teamName: teamName,
                timestamp: Date.now(),
                status: "pending",
                read: false,
              });

              if (expoPushToken) {
                await sendPushNotification(
                  expoPushToken,
                  "Team Invite",
                  `${fromUsername} has invited you to join ${teamName}`,
                  {
                    type: "invite",
                    team: teamName,
                    fromUser: currentUserId,
                  }
                );
              }

              alert("Invite sent!");
            } catch (err) {
              console.error("Failed to send invite:", err);
              alert("Failed to send invite.");
            }
          }}
        >
          <Text style={styles.inviteButtonText}>Invite to Team</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
};

export default UserProfile;

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
  message: {
    fontSize: 16,
    textAlign: "center",
    color: "#777",
  },
  profileCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
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
  inviteButton: {
    paddingVertical: 14,
    borderRadius: 8,
    marginBottom: 12,
  },
  inviteButtonText: {
    color: "#fff",
    fontWeight: "600",
    textAlign: "center",
    fontSize: 16,
  },
});
