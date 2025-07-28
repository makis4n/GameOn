import { auth, db } from "@/Firebase-config";
import { sendPushNotification } from "@/utils/sendPushNotification";
import {
  addDoc,
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
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(
      collection(db, "notifications"),
      where("to", "==", user.uid)
    );

    const querySnapshot = await getDocs(q);
    const notifs = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setNotifications(notifs);
    setLoading(false);
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (notif: any, response: "accepted" | "rejected") => {
    try {
      await updateDoc(doc(db, "notifications", notif.id), {
        status: response,
        read: true,
      });

      let responseMessage = "";

      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const currentUserDoc = await getDoc(doc(db, "users", currentUser.uid));
      const currentUserName = currentUserDoc.exists()
        ? currentUserDoc.data().username || "A user"
        : "A user";

      if (response === "accepted") {
        if (notif.listingId) {
          const listingRef = doc(db, "listings", notif.listingId);
          const listingSnap = await getDoc(listingRef);

          if (listingSnap.exists()) {
            await updateDoc(listingRef, {
              status: "accepted",
              teamNameInvited: notif.teamNameInvited || "Opponent Team",
              read: true,
            });
          }

          responseMessage = `Your match request was accepted by ${currentUserName}`;
        } else if (notif.teamId) {
          await updateDoc(doc(db, "users", notif.to), {
            team: notif.teamId,
            read: true,
          });

          const teamDocRef = doc(db, "teams", notif.teamId);
          const teamDocSnap = await getDoc(teamDocRef);

          if (teamDocSnap.exists()) {
            const teamData = teamDocSnap.data();
            const updatedMembers = [
              ...new Set([...(teamData.members || []), notif.to]),
            ];

            await updateDoc(teamDocRef, {
              members: updatedMembers,
            });

            responseMessage = `Your request to join ${teamData.name} was accepted by ${currentUserName}`;
          } else {
            responseMessage = `Your request to join the team was accepted by ${currentUserName}`;
          }
        } else {
          responseMessage = `Your request was accepted by ${currentUserName}`;
        }
      } else if (response === "rejected") {
        responseMessage = notif.listingId
          ? `Your match request was rejected by ${currentUserName}`
          : `Your request to join the team was rejected by ${currentUserName}`;
      }

      if (notif.fromPushToken && responseMessage) {
        await sendPushNotification(
          notif.fromPushToken,
          "Request Update",
          responseMessage
        );
      }

      if (responseMessage) {
        await addDoc(collection(db, "notifications"), {
          to: notif.from,
          from: auth.currentUser?.uid,
          title: "Request Update",
          message: responseMessage,
          timestamp: Date.now(),
          type: "response",
          relatedNotificationId: notif.id,
          read: false,
          status: response,
        });
      }

      fetchNotifications();

      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notif.id ? { ...n, status: response, read: true } : n
        )
      );
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Something went wrong. Check logs.");
    }
  };

  const clearNotification = async (notifId: string) => {
    await deleteDoc(doc(db, "notifications", notifId));
    setNotifications((prev) => prev.filter((n) => n.id !== notifId));
  };

  const clearAllNotifications = async () => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(
      collection(db, "notifications"),
      where("to", "==", user.uid)
    );
    const snapshot = await getDocs(q);

    const deletePromises = snapshot.docs.map((docSnap) =>
      deleteDoc(doc(db, "notifications", docSnap.id))
    );

    await Promise.all(deletePromises);
    setNotifications([]);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Notifications</Text>
      <TouchableOpacity
        onPress={clearAllNotifications}
        style={styles.clearAllButton}
      >
        <Text style={styles.clearAllText}>Clear All</Text>
      </TouchableOpacity>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            disabled={true}
            style={[
              styles.notificationCard,
              { backgroundColor: item.read ? "#eee" : "#fff" },
            ]}
          >
            <Text style={styles.notifTitle}>{item.title || "Team Invite"}</Text>
            <Text style={styles.notifMessage}>{item.message}</Text>
            <Text style={styles.notifTime}>
              {new Date(item.timestamp).toLocaleString()}
            </Text>

            {item.status === "pending" && (
              <React.Fragment>
                <TouchableOpacity
                  style={[styles.button, styles.accept]}
                  onPress={() => markAsRead(item, "accepted")}
                >
                  <Text style={styles.buttonText}>Accept</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.reject]}
                  onPress={() => markAsRead(item, "rejected")}
                >
                  <Text style={styles.buttonText}>Reject</Text>
                </TouchableOpacity>
              </React.Fragment>
            )}

            {item.status === "accepted" && (
              <Text style={styles.statusText}>✅ Accepted</Text>
            )}
            {item.status === "rejected" && (
              <Text style={styles.statusText}>❌ Rejected</Text>
            )}
            <TouchableOpacity
              style={[styles.button, { backgroundColor: "#bbb", marginTop: 4 }]}
              onPress={() => clearNotification(item.id)}
            >
              <Text style={styles.buttonText}>Dismiss</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
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
  notificationCard: {
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 12,
  },
  notifTitle: {
    fontWeight: "bold",
    fontSize: 16,
  },
  notifMessage: {
    marginTop: 4,
    color: "#555",
  },
  notifTime: {
    marginTop: 6,
    fontSize: 12,
    color: "#999",
  },
  button: {
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  accept: {
    backgroundColor: "#4CAF50",
  },
  reject: {
    backgroundColor: "#F44336",
    marginTop: 4,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  statusText: {
    marginTop: 8,
    fontWeight: "600",
    color: "#555",
  },
  clearAllButton: {
    marginBottom: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "#007AFF",
    borderRadius: 8,
    alignSelf: "center",
  },

  clearAllText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
});
