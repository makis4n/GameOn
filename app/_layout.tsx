"@/Firebase-config";
import { auth } from "@/Firebase-config";
import { router, Stack } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect } from "react";
import "./globals.css";

export default function RootLayout() {
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.replace("/(tabs)/home");
      } else {
        router.replace("/(auth)/login");
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <Stack>
      <Stack.Screen 
        name="index" 
        options={{
          headerShown: false 
        }} 
      />
      <Stack.Screen 
        name="(tabs)" 
        options={{
          headerShown: true,
          title: '',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="modal" 
        options={{ 
          presentation: 'modal' 
        }} 
      />
      <Stack.Screen
        name="signout"
        options={{
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="homeFolder"
        options={{
          headerShown: true,
          title: '',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="modal" 
        options={{ 
          presentation: 'modal' 
        }} 
      />

    </Stack>
  );
}
