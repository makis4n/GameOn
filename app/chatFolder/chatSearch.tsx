import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { TextInput, Text } from "react-native-paper";
import {
  FlatList,
  Keyboard,
  Pressable,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { router } from "expo-router";
import { FontAwesome } from "@expo/vector-icons";
import { auth, db } from "@/Firebase-config";

export default function SearchScreen() {
  const { top } = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<any[]>([]);

  const getSearchResults = async (text: string) => {
    text = text.toLowerCase();

    const usersRef = collection(db, "users");
    const q = query(
      usersRef,
      where("email", ">=", text),
      where("email", "<=", text + "\uf8ff"),
      where("email", "!=", auth.currentUser?.email)
    );
    const res = await getDocs(q);
    const users: any[] = [];
    res.docs.forEach((doc) => users.push(doc.data()));
    return users;
  };

  useEffect(() => {
    async function fetchUsers() {
      setUsers(await getSearchResults(searchQuery));
    }

    fetchUsers();
  }, [searchQuery]);

  const handleSubmit = async (text: string) => {
    setUsers(await getSearchResults(text));
  };

  return (
    <SafeAreaView style={[styles.container, { paddingTop: 10 }]}>
      <View style={styles.searchRow}>
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

        <TextInput
          mode="outlined"
          returnKeyType="search"
          placeholder="Search users by email..."
          dense
          autoFocus
          style={styles.searchInput}
          onChangeText={setSearchQuery}
          onSubmitEditing={(e) => handleSubmit(e.nativeEvent.text)}
        />
      </View>

      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={{ flex: 1 }}>
          {searchQuery ? (
            users.length === 0 ? (
              <View style={styles.emptyState}>
                <Text variant="titleLarge" style={styles.emptyText}>
                  No Users Found
                </Text>
              </View>
            ) : (
              <FlatList
                data={users}
                keyExtractor={(item) => item._id}
                contentContainerStyle={{ paddingBottom: 32 }}
                renderItem={({ item }) => (
                  <Pressable
                    onPress={() =>
                      router.navigate({
                        pathname: "/chatFolder/[id]",
                        params: { id: item._id, email: item.email },
                      })
                    }
                    style={({ pressed }) => [
                      styles.userItem,
                      { backgroundColor: pressed ? "#f0f0f0" : "#fff" },
                    ]}
                  >
                    <Text variant="titleMedium" style={styles.userText}>
                      {item.email}
                    </Text>
                  </Pressable>
                )}
              />
            )
          ) : (
            <View style={styles.emptyState}>
              <Text variant="titleLarge" style={styles.emptyText}>
                Search Users by Email
              </Text>
            </View>
          )}
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
    paddingHorizontal: 16,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    marginTop: 8,
  },
  backButton: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontWeight: "bold",
    color: "#777",
  },
  userItem: {
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderBottomColor: "#ddd",
    borderBottomWidth: 1,
  },
  userText: {
    fontWeight: "bold",
  },
});
