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
import { KeyboardAvoidingView, Platform, Pressable, View } from "react-native";
import { GiftedChat, IMessage } from "react-native-gifted-chat";
import { Text } from "react-native-paper";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

export default function ChatMessageScreen() {
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [conversationId, setConversationId] = useState<string>("");
  const { top, bottom } = useSafeAreaInsets();
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
      if (snap?.docs?.length > 0) {
        const data = snap.docs[0].data();
        setConversationId(data._id);
        setMessages(data.messages);
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
      message.user = {
        _id: currentUser?.uid as string,
        name: currentUser?.email as string,
      };

      const createdAt = Date.now();
      message._id = message._id;
      message.createdAt = createdAt;

      setMessages((prev) => GiftedChat.append(prev, [message], false));

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
    <SafeAreaView style={{ flex: 1 }}>
      {/* Header outside the keyboard avoiding view */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          padding: 10,
          borderBottomWidth: 1,
          borderBottomColor: "#ccc",
        }}
      >
        <Pressable onPress={() => router.back()}>
          {({ pressed }) => (
            <FontAwesome
              name="chevron-left"
              size={25}
              color="black"
              style={{ opacity: pressed ? 0.5 : 1 }}
            />
          )}
        </Pressable>
        <Text
          style={{ marginLeft: 20, fontWeight: "bold" }}
          variant="titleMedium"
          numberOfLines={1}
        >
          {email}
        </Text>
      </View>

      {/* Chat section */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
      >
        <View style={{ flex: 1 }}>
          <GiftedChat
            messages={messages}
            user={{
              _id: currentUser?.uid as string,
              name: currentUser?.email as string,
            }}
            onSend={onSend}
            inverted={false}
            alwaysShowSend
            keyboardShouldPersistTaps="handled"
            bottomOffset={bottom}
            renderAvatar={null}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
