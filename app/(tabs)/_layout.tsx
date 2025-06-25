import FontAwesome from '@expo/vector-icons/MaterialCommunityIcons';
import { Tabs, router } from 'expo-router'
import { doc, getDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react'
import { db, auth } from '@/Firebase-config';
import { onAuthStateChanged } from 'firebase/auth';
import { ActivityIndicator } from "react-native";

export default function Layout() {
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const profileDoc = await getDoc(doc(db, "users", user.uid));
        if (!profileDoc.exists()) {
          router.replace("/createProfile");
        }
      } else {
        router.replace("/");
      }

      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  if (isLoading) {
    return (
      <ActivityIndicator
        size="large"
        color="#007AFF"
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      />
    );
  }

  return (
    <Tabs screenOptions={{ 
      tabBarActiveTintColor: 'blue',
      }}>
      <Tabs.Screen 
        name='home'
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="home" color={color}/>
        }}
        />
        <Tabs.Screen 
        name='search'
        options={{
          title: 'Search',
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="magnify" color={color}/>
        }}
        />
        <Tabs.Screen 
        name='createListing'
        options={{
          title: 'List',
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="plus" color={color}/>
        }}
        />
        <Tabs.Screen 
        name='chat'
        options={{
          title: 'Chats',
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="message" color={color}/>
        }}
        />
        <Tabs.Screen 
        name='profile'
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="account" color={color}/>
        }}
        />
    </Tabs>
  )
}