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
  const [allTeams, setAllTeams] = useState<{ id: string; name: string }[]>([]);
  const [filteredTeams, setFilteredTeams] = useState<typeof allTeams>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const snapshot = await getDocs(collection(db, "users"));
      const users = snapshot.docs.map((doc) => ({
        id: doc.id,
        username: doc.data().username || "",
      }));
      setAllUsers(users);

      const teamSnapshot = await getDocs(collection(db, "teams"));
      const teams = teamSnapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name || "",
      }));
      setAllTeams(teams);
    };

    fetchUsers();
  }, []);

  const handleSearch = (text: string) => {
    setQuery(text);
    const lower = text.toLowerCase();
    setFilteredUsers(
      allUsers.filter((user) => user.username.toLowerCase().startsWith(lower))
    );
    setFilteredTeams(
      allTeams.filter((team) => team.name.toLowerCase().startsWith(lower))
    );
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
          keyExtractor={(item) => "user-" + item.id}
          ListHeaderComponent={<Text style={styles.sectionTitle}>Users</Text>}
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

        <FlatList
          data={filteredTeams}
          keyExtractor={(item) => "team-" + item.id}
          ListHeaderComponent={<Text style={styles.sectionTitle}>Teams</Text>}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.item}
              onPress={() =>
                router.push({
                  pathname: "/team/[id]",
                  params: { id: item.id },
                })
              }
            >
              <Text style={styles.username}>{item.name}</Text>
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 8,
    textDecorationLine: 'underline',
  },
});
