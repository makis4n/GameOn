import { router, Stack } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';
import { useEffect } from 'react';
import { auth } from '../Firebase-config';
import './globals.css';

export default function RootLayout() {
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in, redirect to home screen
        router.replace('/(tabs)/home');
      } else {
        // No user is signed in, redirect to login screen
        router.replace('/');
      }
    });

    return () => unsubscribe(); // Cleanup on unmount
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
          headerShown: false 
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