import { db } from "@/Firebase-config";
import { FontAwesome } from "@expo/vector-icons";
import { router } from "expo-router";
import { getAuth } from "firebase/auth";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  setDoc,
  where,
} from "firebase/firestore";
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
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import DateTimePickerModal from "react-native-modal-datetime-picker";

export default function GameListing() {
  const [task, setTask] = useState("");
  const [listing, setListing] = useState<any[]>([]);
  const [location, setLocation] = useState("");
  const [opponentSearch, setOpponentSearch] = useState("");
  const [selectedOpponentTeam, setSelectedOpponentTeam] = useState<any>(null);
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const auth = getAuth();
  const user = auth.currentUser;
  const listingsCollection = collection(db, "listings");
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [dateTime, setDateTime] = useState(new Date());

  const showDatePicker = () => setDatePickerVisibility(true);
  const hideDatePicker = () => setDatePickerVisibility(false);

  const handleConfirm = (date: Date) => {
    setDateTime(date);
    hideDatePicker();
  };

  useEffect(() => {
    fetchListings();
  }, [user]);

  const fetchListings = async () => {
    if (!user) return;

    const q = query(listingsCollection, where("userId", "==", user.uid));
    const data = await getDocs(q);
    const now = new Date();

    const validListings = [];
    for (const docSnap of data.docs) {
      const docData = docSnap.data();
      const listingDate = new Date(docData.dateTime);

      if (listingDate <= now && !docData.score) {
        await setDoc(
          doc(db, "listings", docSnap.id),
          {
            status: "awaiting_score",
          },
          { merge: true }
        );
      } else if (listingDate <= now) {
        await deleteDoc(doc(db, "listings", docSnap.id));
      } else {
        validListings.push({ ...docData, id: docSnap.id });
      }
    }

    setListing(validListings);
  };

  const addListing = async () => {
    if (!user) return console.log("No user logged in");

    const teamsRef = collection(db, "teams");
    const q = query(teamsRef, where("createdBy", "==", user.uid));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      alert("Only team owners can create listings.");
      return;
    }

    const userTeamDoc = querySnapshot.docs[0];
    const userTeamData = userTeamDoc.data();
    const userTeamName = userTeamData.name;

    const newListingRef = await addDoc(listingsCollection, {
      task,
      location,
      userId: user.uid,
      dateTime: dateTime.toISOString(),
      teamName: userTeamName,
      status: "pending",
    });

    if (selectedOpponentTeam) {
      const ownerUid = selectedOpponentTeam.createdBy;
      await addDoc(collection(db, "notifications"), {
        title: "Invitation to join game",
        to: ownerUid,
        from: user.uid,
        listingId: newListingRef.id,
        teamId: selectedOpponentTeam.id,
        teamNameInvited: selectedOpponentTeam.name,
        message: `You've been invited to a game by ${userTeamName}`,
        timestamp: new Date().toISOString(),
        status: "pending",
        read: false,
      });
    }
    setTask("");
    setLocation("");
    setOpponentSearch("");
    setSelectedOpponentTeam(null);
    fetchListings();
  };

  const deleteListing = async (id: string) => {
    await deleteDoc(doc(db, "listings", id));
    fetchListings();
  };

  const searchTeamByName = async (text: string) => {
    const teamsRef = collection(db, "teams");
    const q = query(
      teamsRef,
      where("name", ">=", text),
      where("name", "<=", text + "\uf8ff")
    );

    const querySnapshot = await getDocs(q);
    const results = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setSearchResults(results);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          activeOpacity={0.6}
        >
          <FontAwesome name="chevron-left" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.mainTitle}>Create Game Listing</Text>
        <TextInput
          placeholder="Game Title"
          placeholderTextColor="#aaa"
          value={task}
          onChangeText={setTask}
          style={styles.input}
        />
        <View style={{ zIndex: 999, position: "relative" }}>
          <GooglePlacesAutocomplete
            placeholder="Location"
            onPress={(data, details = null) => {
              const selectedLocation =
                details?.formatted_address ?? data.description ?? "";
              setLocation(selectedLocation);
            }}
            fetchDetails={true}
            predefinedPlaces={[]}
            textInputProps={{
              placeholderTextColor: "#aaa",
            }}
            minLength={0}
            query={{
              key: "AIzaSyAWnKeb325HTl4yMkLwdbzC8EkbOZK1JQg",
              language: "en",
              components: "country:sg",
            }}
            onFail={(error) => console.log(error)}
            styles={{
              container: { flex: 0, zIndex: 999 },
              textInput: {
                height: 50,
                borderColor: "gray",
                borderWidth: 1,
                borderRadius: 10,
                paddingHorizontal: 5,
                marginRight: 10,
                backgroundColor: "white",
                marginBottom: 10,
              },
              listView: {
                maxHeight: 250,
                zIndex: 100,
              },
            }}
          />
          {location ? (
            <Text style={{ marginTop: 8, color: "#666" }}>
              Selected: {location}
            </Text>
          ) : null}
        </View>
        <TextInput
          placeholder="Opponent Team (Optional)"
          placeholderTextColor="#aaa"
          value={opponentSearch}
          onChangeText={(text) => {
            setOpponentSearch(text);
            if (text.trim() === "") {
              setSearchResults([]);
            } else {
              searchTeamByName(text);
            }
          }}
          style={styles.input}
        />

        {searchResults.length > 0 && (
          <View style={{ marginBottom: 10 }}>
            {searchResults.map((team) => (
              <TouchableOpacity
                key={team.id}
                onPress={() => {
                  setSelectedOpponentTeam(team);
                  setOpponentSearch(team.name);
                  setSearchResults([]);
                }}
                style={{
                  padding: 8,
                  backgroundColor:
                    selectedOpponentTeam?.id === team.id ? "#cce5ff" : "#eee",
                  borderRadius: 5,
                  marginVertical: 2,
                }}
              >
                <Text style={{ fontSize: 14 }}>{team.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {selectedOpponentTeam && (
          <Text style={{ marginBottom: 10, color: "#4CAF50", fontSize: 13 }}>
            Selected Team: {selectedOpponentTeam.name}
          </Text>
        )}

        <TouchableOpacity style={styles.dateButton} onPress={showDatePicker}>
          <Text style={styles.buttonText}>Pick Date</Text>
        </TouchableOpacity>
        <Text style={styles.dateText}>
          Selected: {dateTime.toLocaleString()}
        </Text>

        <TouchableOpacity style={styles.dateButton} onPress={addListing}>
          <Text style={styles.buttonText}>Create Listing</Text>
        </TouchableOpacity>

        <FlatList
          data={listing}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.todoContainer}>
              <View style={{ flex: 1, alignItems: "flex-start" }}>
                <Text style={styles.taskText}>{item.task}</Text>

                {item.teamName && (
                  <Text style={styles.vsText}>
                    {item.teamName}
                    {item.teamNameInvited
                      ? ` vs ${item.teamNameInvited}`
                      : item.status === "pending"
                      ? " (Pending opponent confirmation)"
                      : ""}
                  </Text>
                )}
                <Text style={styles.dateText}>Location: {item.location}</Text>
                <Text style={styles.dateText}>
                  Game Time: {new Date(item.dateTime).toLocaleString()}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.button}
                onPress={() => deleteListing(item.id)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          )}
        />
        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="datetime"
          date={dateTime}
          onConfirm={handleConfirm}
          onCancel={hideDatePicker}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f8f9fa",
    justifyContent: "center",
    alignContent: "center",
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    marginTop: -30,
    textAlign: "center",
    color: "#333",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  input: {
    height: 50,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 5,
    marginRight: 10,
    backgroundColor: "white",
    marginBottom: 10,
  },
  dateButton: {
    padding: 10,
    borderRadius: 10,
    backgroundColor: "#007AFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#26A69A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  addButton: {
    marginTop: 10,
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#FFA726",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#FFA726",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 5,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  todoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#ffffff",
    padding: 15,
    borderRadius: 10,
    marginVertical: 5,
    shadowColor: "#ccc",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 2,
  },
  button: {
    padding: 10,
    borderRadius: 10,
    backgroundColor: "#EF5350",
    alignItems: "center",
    justifyContent: "center",
  },
  dateText: {
    marginTop: 5,
    fontSize: 16,
    color: "#555",
    marginBottom: 15,
    textAlign: "left",
  },
  taskText: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  vsText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#444",
    marginTop: 4,
  },
  backButton: {
    padding: 10,
    alignSelf: "flex-start",
    marginBottom: 10,
    paddingLeft: -10,
  },
});
