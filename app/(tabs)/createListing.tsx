import { db } from "@/Firebase-config";
import { getAuth } from "firebase/auth";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
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
import DateTimePickerModal from "react-native-modal-datetime-picker";

export default function CreateListing() {
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

      if (listingDate <= now) {
        await deleteDoc(doc(db, "listings", docSnap.id));
      } else {
        validListings.push({ ...docData, id: docSnap.id });
      }
    }

    setListing(validListings);
  };

  const addListing = async () => {
    if (!user) return console.log("No user logged in");

    const newListingRef = await addDoc(listingsCollection, {
      task,
      location,
      userId: user.uid,
      dateTime: dateTime.toISOString(),
    });

    if (selectedOpponentTeam) {
      const ownerUid = selectedOpponentTeam.createdBy;
      await addDoc(collection(db, "notifications"), {
        to: ownerUid,
        from: user.uid,
        listingId: newListingRef.id,
        teamId: selectedOpponentTeam.id,
        message: `You've been invited to a game by ${user.email}`,
        timestamp: new Date().toISOString(),
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
        <Text style={styles.mainTitle}>Create Game Listing</Text>
        <View style={styles.inputRow}>
          <TextInput
            placeholder="Title"
            placeholderTextColor="#aaa"
            value={task}
            onChangeText={setTask}
            style={styles.input}
          />
          <TextInput
            placeholder="Location"
            placeholderTextColor="#aaa"
            value={location}
            onChangeText={setLocation}
            style={styles.input}
          />
          <TouchableOpacity style={styles.dateButton} onPress={showDatePicker}>
            <Text style={styles.buttonText}>Pick Date</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.dateText}>
          Selected: {dateTime.toLocaleString()}
        </Text>
        <TouchableOpacity style={styles.addButton} onPress={addListing}>
          <Text style={styles.buttonText}>Create</Text>
        </TouchableOpacity>

        <FlatList
          data={listing}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.todoContainer}>
              <View style={{ flex: 1 }}>
                <Text style={styles.taskText}>{item.task}</Text>
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
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    marginRight: 10,
    backgroundColor: "white",
  },
  dateButton: {
    padding: 10,
    borderRadius: 10,
    backgroundColor: "#26A69A",
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
    fontSize: 14,
    color: "#555",
  },
  taskText: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
});
