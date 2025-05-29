import FontAwesome from '@expo/vector-icons/MaterialCommunityIcons';
import { Tabs } from 'expo-router'
import React from 'react'

const _layout = () => {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: 'blue' }}>
      <Tabs.Screen 
        name='home'
        options={{
          title: 'Home',
          headerShown: false,
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="home" color={color}/>
        }}
        />
        <Tabs.Screen 
        name='search'
        options={{
          title: 'Search',
          headerShown: false,
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="magnify" color={color}/>
        }}
        />
        <Tabs.Screen 
        name='createListing'
        options={{
          title: 'List',
          headerShown: false,
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="plus" color={color}/>
        }}
        />
        <Tabs.Screen 
        name='chat'
        options={{
          title: 'Chat',
          headerShown: false,
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="message" color={color}/>
        }}
        />
        <Tabs.Screen 
        name='profile'
        options={{
          title: 'Profile',
          headerShown: false,
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="account" color={color}/>
        }}
        />
    </Tabs>
  )
}

export default _layout