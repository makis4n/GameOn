import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";
import '@/app/globals.css';

export default function Index() {
  return (
    <View className="flex-1 justify-center items-center">
  
      <Text className="text-5xl text-primary font-bold">Hello Cheng Leong</Text>
      <Pressable onPress={() => router.push("/login")}>
        <Text style={{ fontSize: 20 }}>Go to Login</Text>
      </Pressable>
    </View>
  );
}