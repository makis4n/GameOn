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
    marginBottom: 40,
  },
  button: {
    backgroundColor: "#007AFF",
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 20,
    marginHorizontal: 20,
  },
  secondaryButton: {
    backgroundColor: "#34C759",
  },
  buttonText: {
    textAlign: "center",
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
});
