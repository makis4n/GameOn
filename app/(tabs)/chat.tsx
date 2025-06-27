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
import { FlatList, Pressable, View } from "react-native";
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

    // conversations user is part of
    const q = query(
      collection(db, "conversations"),
      or(
        where("u1._id", "==", currentUser?.uid),
        where("u2._id", "==", currentUser?.uid)
      )
      // orderBy("updatedAt", "desc") //query requires indexes
    );

    const unsubscribe = onSnapshot(q, (snap) => {
      const convos: any[] = [];
      snap.forEach((doc) => convos.push(doc.data()));
      setConversations(convos);
    });

    return () => unsubscribe();
  }, []);

  // navigate to chat creation screen
  const createChat = () => router.push("/chatFolder/chatSearch");

  return (
    <SafeAreaView style={{ flex: 1, paddingTop: top }}>
      <View style={{ alignItems: "flex-end" }}>
        <Pressable
          onPress={createChat}
          style={{
            flexDirection: "row",
            padding: 10,
          }}
        >
          <FontAwesome name="pencil-square-o" size={26} color={"black"} />
        </Pressable>
      </View>
      <Text
        variant="headlineLarge"
        style={{ fontWeight: "bold", marginLeft: 10 }}
      >
        Messages
      </Text>
      
      {conversations.length > 0 ? (
        // Checks if user has conversations
        // If so, displays them in a FlatList
        <View style={{ marginTop: 10, flex: 1 }}>
          <FlatList
            keyExtractor={(item: any) => item._id}
            data={conversations}
            renderItem={({ item }) => {
              const oppositeUser =
                item.u1._id === currentUser?.uid ? item.u2 : item.u1;
              return (
                // Takes user to their chat with the opposite user
                <Pressable
                  onPress={() =>
                    router.navigate({
                      pathname: "/chatFolder/[id]",
                      params: {
                        id: oppositeUser._id,
                        email: oppositeUser.email,
                      },
                    })
                  }
                  style={{
                    paddingVertical: 5,
                    paddingHorizontal: 10,
                    borderTopColor: "gray",
                    borderBottomColor: "gray",
                    borderBottomWidth: 1,
                    borderTopWidth: 1,
                    height: 100,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Text
                    // Displays the email of the opposite user
                    // Date of the last message
                    // and the last message text
                      ellipsizeMode="tail"
                      variant="titleLarge"
                      style={{ fontWeight: "bold" }}
                    >
                      {oppositeUser.email}
                    </Text>
                    <Text variant="titleMedium">
                      {new Date(
                        item.messages[item.messages.length - 1].createdAt
                      ).toLocaleDateString()}
                    </Text>
                  </View>
                  <Text
                    variant="bodySmall"
                    style={{ paddingTop: 10 }}
                    numberOfLines={2}
                    ellipsizeMode="tail"
                  >
                    {item.messages[item.messages.length - 1].text}
                  </Text>
                </Pressable>
              );
            }}
          />
        </View>
      ) : (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text
            // If user has no texts, displays a message and button to create a chat
            variant="titleMedium"
            style={{ fontWeight: "bold", paddingBottom: 20 }}
          >
            You have no messages
          </Text>
          <Button mode="elevated" onPress={createChat}>
            Send Message
          </Button>
        </View>
      )}
    </SafeAreaView>
  );
}