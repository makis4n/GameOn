import { router } from "expo-router";
import { Pressable, Text, View, Image, TouchableOpacity, StyleSheet } from "react-native";
import '@/app/globals.css';
import {images} from "@/constants/images";

export default function Index() {
  return (
    <View className="flex-1 justify-center items-center">

      <Image source={images.logo} style={{ width: 100, height: 100 }} />
      <Text className="text-4xl text-primary font-bold mt-4">Ready to GameOn?</Text>
      <TouchableOpacity style={styles.button} onPress={() => router.push("/login")}>
        <Text style={styles.buttonText}>Let's Go!</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  
  button: {
    backgroundColor: "#007AFF",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
    width: 100
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  }
});
