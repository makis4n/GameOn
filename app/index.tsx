import { router } from "expo-router";
import { Pressable, Text, View, Image } from "react-native";
import '@/app/globals.css';
import {images} from "@/constants/images";

export default function Index() {
  return (
    <View className="flex-1 justify-center items-center">

      <Image source={images.logo} style={{ width: 100, height: 100 }} />
      <Text className="text-4xl text-primary font-bold mt-4">Ready to GameOn?</Text>
      <Pressable onPress={() => router.push("/login")}>
        <Text style={{ fontSize: 20 }}>Login</Text>
      </Pressable>
    </View>
  );
}