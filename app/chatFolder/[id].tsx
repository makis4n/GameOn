import { auth, db } from "@/Firebase-config";
import { FontAwesome } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import {
  and,
  arrayUnion,
  collection,
  doc,
  onSnapshot,
  or,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Pressable,
  View,
  Platform,
  StyleSheet,
} from "react-native";
import { GiftedChat, IMessage } from "react-native-gifted-chat";
import { Text } from "react-native-paper";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

export default function ChatMessageScreen() {
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [conversationId, setConversationId] = useState<string>("");
  const { bottom, top } = useSafeAreaInsets();
  const { id, email } = useLocalSearchParams();
  const { currentUser } = auth;

  useEffect(() => {
    const q = query(
      collection(db, "conversations"),
      or(
        and(where("u1._id", "==", currentUser?.uid), where("u2._id", "==", id)),
        and(where("u2._id", "==", currentUser?.uid), where("u1._id", "==", id))
      )
    );

    const unsubscribe = onSnapshot(q, (snap) => {
      if (snap?.docs && snap?.docs.length > 0) {
        if (!conversationId) setConversationId(snap.docs[0].data()._id);
        setMessages([...snap.docs[0].data().messages]);
      }
    });

    return () => unsubscribe();
  }, []);

  const onSend = async (messages: IMessage[]) => {
    const previousMessages = [...messages];

    try {
      const conversationRef = conversationId
        ? doc(db, "conversations", conversationId)
        : doc(collection(db, "conversations"));

      let message = messages[0];
      const createdAt = Date.now();
      message.user = {
        _id: currentUser?.uid as string,
        name: currentUser?.email as string,
      };
      message.createdAt = createdAt;

      setMessages((prev: IMessage[]) =>
        GiftedChat.append(prev, [message], false)
      );

      if (!conversationId) {
        await setDoc(conversationRef, {
          u1: { _id: currentUser?.uid, email: currentUser?.email },
          u2: { _id: id, email },
          _id: conversationRef.id,
          messages: [message],
          createdAt,
          updatedAt: createdAt,
        });
        setConversationId(conversationRef.id);
      } else {
        await updateDoc(conversationRef, {
          updatedAt: createdAt,
          messages: arrayUnion(message),
        });
      }
    } catch (error) {
      alert("Unable to send message");
      setMessages(previousMessages);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={[styles.header, { paddingTop: 10}]}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={10}
          style={styles.backButton}
        >
          {({ pressed }) => (
            <FontAwesome
              name="chevron-left"
              size={24}
              color="black"
              style={{ opacity: pressed ? 0.5 : 1 }}
            />
          )}
        </Pressable>
        <Text
          numberOfLines={1}
          variant="titleLarge"
          style={styles.headerText}
          ellipsizeMode="tail"
        >
          {email}
        </Text>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <GiftedChat
          user={{
            _id: currentUser?.uid as string,
            name: currentUser?.email as string,
          }}
          messages={messages}
          onSend={onSend}
          renderAvatar={null}
          inverted={false}
          alwaysShowSend
          bottomOffset={bottom}
          keyboardShouldPersistTaps="handled"
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
    zIndex: 1,
  },
  backButton: {
    marginRight: 10,
  },
  headerText: {
    fontWeight: "bold",
    flex: 1,
  },
});
