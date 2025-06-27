import { auth } from "@/Firebase-config";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SignOutScreen() {
  const [hasSignedOut, setHasSignedOut] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user && hasSignedOut) {
        router.replace("/login");
      }
    return unsubscribe;
  }, [hasSignedOut]);

  const handleSignOut = async () => {
    try {
      // No need to track unsubscribe here if handled properly in pages

      setHasSignedOut(true);
      await auth.signOut();
    } catch (error) {
      console.error("Sign out failed:", error);
      alert("Failed to sign out. Please try again.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Are you sure you want to sign out?</Text>
      <TouchableOpacity style={styles.button} onPress={handleSignOut}>
        <Text style={styles.buttonText}>Sign Out</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 24,
    color: "#333",
    textAlign: "center",
  },
  button: {
    backgroundColor: "#FF3B30",
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 8,
    elevation: 2,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
    textAlign: "center",
  },
});
