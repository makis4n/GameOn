import { auth, db } from "@/Firebase-config";
import axios from "axios";
import { addDoc, collection, doc, getDoc } from "firebase/firestore";
import { SetStateAction, useEffect, useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import "react-native-get-random-values";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PlayerListing() {
  const [teamName, setTeamName] = useState("");
  const [description, setDescription] = useState("");
  const [positions, setPositions] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(true);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [dateTime, setDateTime] = useState(new Date());

  useEffect(() => {
    const fetchTeam = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const userDoc = await getDoc(doc(db, "users", user.uid));
      const teamId = userDoc.data()?.team;
      if (teamId) {
        const teamDoc = await getDoc(doc(db, "teams", teamId));
        setTeamName(teamDoc.data()?.name || "");
      }

      setLoading(false);
    };

    fetchTeam();
  }, []);

  const showDatePicker = () => setDatePickerVisibility(true);
  const hideDatePicker = () => setDatePickerVisibility(false);
  const handleConfirm = (date: SetStateAction<Date>) => {
    setDateTime(date);
    hideDatePicker();
  };

  const createListing = async () => {
    const user = auth.currentUser;
    if (!user || !teamName || !description || !positions || !location) {
      Alert.alert("Missing info", "Please fill in all fields.");
      return;
    }

    try {
      const apiKey = "AIzaSyAWnKeb325HTl4yMkLwdbzC8EkbOZK1JQg";
      const response = await axios.get(
        "https://maps.googleapis.com/maps/api/geocode/json",
        {
          params: {
            address: location,
            key: apiKey,
          },
        }
      );

      const results = response.data.results;
      if (results.length === 0) {
        Alert.alert(
          "Location not found",
          "Please enter a valid location name."
        );
        return;
      }

      const { lat, lng } = results[0].geometry.location;

      await addDoc(collection(db, "player_listings"), {
        teamName,
        location,
        latitude: lat,
        longitude: lng,
        description,
        positions: positions.split(",").map((p) => p.trim()),
        createdBy: user.uid,
        timestamp: new Date().toISOString(),
        status: "open",
        dateTime: dateTime.toISOString(),
      });

      Alert.alert("Success", "Player listing created.");
      setDescription("");
      setPositions("");
      setLocation("");
    } catch (err) {
      console.error("Error creating listing:", err);
      Alert.alert("Error", "Could not create listing.");
    }
  };

  if (loading)
    return (
      <SafeAreaView>
        <Text>Loading...</Text>
      </SafeAreaView>
    );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Create Player Listing</Text>

      <Text style={styles.label}>Team Name</Text>
      <Text style={styles.value}>{teamName}</Text>
      <View style={{ zIndex: 1, flex: 0.5 }}>
        <GooglePlacesAutocomplete
          placeholder="Search"
          onPress={(data, details = null) => {
            const selectedLocation =
              details?.formatted_address ?? data.description ?? "";
            setLocation(selectedLocation);
          }}
          fetchDetails={true}
          predefinedPlaces={[]}
          textInputProps={{}}
          minLength={0}
          query={{
            key: "AIzaSyAWnKeb325HTl4yMkLwdbzC8EkbOZK1JQg",
            language: "en",
            components: "country:sg",
          }}
          onFail={(error) => console.log(error)}
          styles={{
            container: { flex: 0 },
            textInput: {
              borderWidth: 1,
              borderColor: "#ccc",
              borderRadius: 8,
              padding: 10,
              color: "#555",
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
      <Text style={styles.label}>Description</Text>
      <TextInput
        style={styles.input}
        placeholder="Describe your team or what you're looking for..."
        value={description}
        onChangeText={setDescription}
        multiline
      />

      <Text style={styles.label}>Positions Needed</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Striker, Midfielder"
        value={positions}
        onChangeText={setPositions}
      />

      <TouchableOpacity style={styles.button} onPress={showDatePicker}>
        <Text style={styles.buttonText}>Pick Date</Text>
      </TouchableOpacity>
      <Text style={styles.dateText}>Selected: {dateTime.toLocaleString()}</Text>

      <TouchableOpacity style={styles.button} onPress={createListing}>
        <Text style={styles.buttonText}>Create Listing</Text>
      </TouchableOpacity>

      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="datetime"
        date={dateTime}
        onConfirm={handleConfirm}
        onCancel={hideDatePicker}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: "#fff" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 24 },
  label: { fontWeight: "600", marginTop: 12 },
  value: { marginBottom: 12, color: "#333" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 14,
    borderRadius: 8,
    marginTop: 10,
  },
  buttonText: {
    textAlign: "center",
    color: "#fff",
    fontWeight: "600",
  },
  dateText: {
    marginTop: 8,
    fontSize: 16,
    color: "#555",
    textAlign: "center",
  },
});
