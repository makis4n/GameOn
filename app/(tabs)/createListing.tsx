import { router } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ListingOptions() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Create a Listing</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/listings/gameListing")}
      >
        <Text style={styles.buttonText}>Create Game</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.secondaryButton]}
        onPress={() => router.push("/listings/playerListing")}
      >
        <Text style={styles.buttonText}>Looking for Players</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: "#f9f9f9",
    justifyContent: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
<<<<<<< HEAD
    marginBottom: 40,
=======
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
    marginBottom: 20,
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
>>>>>>> 64f28bea5e66dea3b400468e4f6a71a2f28fb3b0
  },
  button: {
    backgroundColor: "#007AFF",
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 20,
    marginHorizontal: 20,
  },
<<<<<<< HEAD
  secondaryButton: {
    backgroundColor: "#34C759",
=======
  dateText: {
    marginTop: 5,
    fontSize: 16,
    color: "#555",
    marginBottom: 20,
    textAlign: "center"
>>>>>>> 64f28bea5e66dea3b400468e4f6a71a2f28fb3b0
  },
  buttonText: {
    textAlign: "center",
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
});
