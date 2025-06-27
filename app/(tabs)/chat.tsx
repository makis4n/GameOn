import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { router } from "expo-router";
import {
  collection,
  onSnapshot,
  or,
  query,
  where,
} from "firebase/firestore";
import {
  FlatList,
  TouchableOpacity,
  View,
  StyleSheet,
  Dimensions,
} from "react-native";
import { useState, useEffect } from "react";
import { Text, Button } from "react-native-paper";
import { FontAwesome } from "@expo/vector-icons";
import { db, auth } from "@/Firebase-config";

export default function ChatList() {
  const { top } = useSafeAreaInsets();
  const { currentUser } = auth;

  const [conversations, setConversations] = useState<any[]>([]);

  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, "conversations"),
      or(
        where("u1._id", "==", currentUser?.uid),
        where("u2._id", "==", currentUser?.uid)
      )
    );

    const unsubscribe = onSnapshot(q, (snap) => {
      const convos: any[] = [];
      snap.forEach((doc) => convos.push(doc.data()));
      setConversations(convos);
    });

    return () => unsubscribe();
  }, []);

  const createChat = () => router.push("/chatFolder/chatSearch");

  const renderConversation = ({ item }: { item: any }) => {
    const oppositeUser =
      item.u1._id === currentUser?.uid ? item.u2 : item.u1;
    const lastMessage = item.messages[item.messages.length - 1];

    return (
      <TouchableOpacity
        onPress={() =>
          router.navigate({
            pathname: "/chatFolder/[id]",
            params: {
              id: oppositeUser._id,
              email: oppositeUser.email,
            },
          })
        }
        style={styles.chatCard}
      >
        <View style={styles.chatHeader}>
          <Text variant="titleMedium" style={styles.chatName} numberOfLines={1}>
            {oppositeUser.email}
          </Text>
          <Text style={styles.chatDate}>
            {new Date(lastMessage.createdAt).toLocaleDateString()}
          </Text>
        </View>
        <Text style={styles.chatMessage} numberOfLines={2} ellipsizeMode="tail">
          {lastMessage.text}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text variant="headlineMedium" style={styles.headerText}>
        Messages
      </Text>

      {conversations.length > 0 ? (
        <FlatList
          data={conversations}
          keyExtractor={(item: any) => item._id}
          renderItem={renderConversation}
          contentContainerStyle={{ paddingBottom: 80 }}
        />
      ) : (
        <View style={styles.emptyState}>
          <Text variant="titleMedium" style={styles.emptyText}>
            You have no messages
          </Text>
          <Button mode="elevated" onPress={createChat}>
            Start a Conversation
          </Button>
        </View>
      )}

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab} onPress={createChat}>
        <FontAwesome name="pencil-square-o" size={28} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    backgroundColor: "#f9f9f9",
  },
  headerText: {
    fontWeight: "bold",
    marginVertical: 12,
    marginLeft: 4,
  },
  chatCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  chatHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  chatName: {
    fontWeight: "bold",
    maxWidth: "70%",
  },
  chatDate: {
    fontSize: 12,
    color: "#888",
  },
  chatMessage: {
    marginTop: 6,
    color: "#333",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontWeight: "bold",
    marginBottom: 16,
  },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    backgroundColor: "#007AFF",
    padding: 16,
    borderRadius: 32,
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
  },
});
