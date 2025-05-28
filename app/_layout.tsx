<<<<<<< HEAD
import { Stack } from 'expo-router';
=======
import { Stack } from "expo-router";
import './globals.css'
>>>>>>> 55734c13a51f55fbce1b22e412475f3ae698e908

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options ={{headerShown: false }} />
      <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
    </Stack>
  );
}
