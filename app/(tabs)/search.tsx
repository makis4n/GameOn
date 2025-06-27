import { db } from "@/Firebase-config";
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
  ScrollView,
} from "react-native";

export default function SearchScreen() {
  const [query, setQuery] = useState("");
  const [allUsers, setAllUsers] = useState<{ id: string; username: string }[]>(
    []
  );
  const [filteredUsers, setFilteredUsers] = useState<typeof allUsers>([]);
  const [allTeams, setAllTeams] = useState<{ id: string; name: string }[]>([]);
  const [filteredTeams, setFilteredTeams] = useState<typeof allTeams>([]);

  useEffect(() => {
    const fetchData = async () => {
      const userSnapshot = await getDocs(collection(db, "users"));
      const users = userSnapshot.docs.map((doc) => ({
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

    fetchData();
  }, []);

  const handleSearch = (text: string) => {
    setQuery(text);
    const lower = text.toLowerCase();

    if (lower.trim() === "") {
      // if search cleared, clear filtered results
      setFilteredUsers([]);
      setFilteredTeams([]);
      return;
    }

    setFilteredUsers(
      allUsers.filter((user) => user.username.toLowerCase().includes(lower))
    );
    setFilteredTeams(
      allTeams.filter((team) => team.name.toLowerCase().includes(lower))
    );
  };


  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.screenTitle}>Search</Text>

        <TextInput
          placeholder="Search users or teams..."
          placeholderTextColor="#999"
          value={query}
          onChangeText={handleSearch}
          style={styles.input}
        />

        <ScrollView
          contentContainerStyle={{ paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Users</Text>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <TouchableOpacity
                  key={user.id}
                  style={styles.item}
                  onPress={() =>
                    router.push({
                      pathname: "/user/[id]",
                      params: { id: user.id },
                    })
                  }
                >
                  <Text style={styles.itemText}>{user.username}</Text>
                </TouchableOpacity>
              ))
            ) : (
              query.length > 0 && <Text style={styles.empty}>No users found.</Text>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Teams</Text>
            {filteredTeams.length > 0 ? (
              filteredTeams.map((team) => (
                <TouchableOpacity
                  key={team.id}
                  style={styles.item}
                  onPress={() =>
                    router.push({
                      pathname: "/team/[id]",
                      params: { id: team.id },
                    })
                  }
                >
                  <Text style={styles.itemText}>{team.name}</Text>
                </TouchableOpacity>
              ))
            ) : (
              query.length > 0 && <Text style={styles.empty}>No teams found.</Text>
            )}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  container: {
    padding: 20,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: "#fff",
    marginBottom: 20,
    elevation: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#444",
    marginBottom: 8,
  },
  item: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#eee",
    elevation: 1,
  },
  itemText: {
    fontSize: 16,
    color: "#333",
  },
  empty: {
    color: "#888",
    fontStyle: "italic",
    marginLeft: 4,
    marginTop: 4,
  },
});
