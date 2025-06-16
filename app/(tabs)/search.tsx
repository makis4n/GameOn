import { db } from "@/Firebase-config"; // Adjust path as needed
import { router } from "expo-router";
import { collection, getDocs } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function search() {
  const [query, setQuery] = useState("");
  const [allUsers, setAllUsers] = useState<{ id: string; username: string }[]>(
    []
  );
  const [filteredUsers, setFilteredUsers] = useState<typeof allUsers>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const snapshot = await getDocs(collection(db, "users"));
      const users = snapshot.docs.map((doc) => ({
        id: doc.id,
        username: doc.data().username || "",
      }));
      setAllUsers(users);
    };

    fetchUsers();
  }, []);

  const handleSearch = (text: string) => {
    setQuery(text);
    const filtered = allUsers.filter((user) =>
      user.username.toLowerCase().startsWith(text.toLowerCase())
    );
    setFilteredUsers(filtered);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <TextInput
          placeholder="Search username..."
          placeholderTextColor="#888"
          value={query}
          onChangeText={handleSearch}
          style={styles.input}
        />

        <FlatList
          data={filteredUsers}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.item}
              onPress={() =>
                router.push({
                  pathname: "/user/[id]",
                  params: { id: item.id },
                })
              }
            >
              <Text style={styles.username}>{item.username}</Text>
            </TouchableOpacity>
          )}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff" },
  container: { padding: 20 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
    fontSize: 16,
  },
  item: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    marginVertical: 0,
  },
  username: {
    fontSize: 16,
    lineHeight: 16,
  },
});
