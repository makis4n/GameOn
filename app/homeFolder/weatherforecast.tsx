import SGWeather from "@/app/SGWeather"; // Adjust path if needed
import React from "react";
import { ScrollView, StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const WeatherPage = () => {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Singapore Weather</Text>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <SGWeather />
      </ScrollView>
    </SafeAreaView>
  );
};

export default WeatherPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    padding: 16,
    color: "#333",
  },
  scrollContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
});
