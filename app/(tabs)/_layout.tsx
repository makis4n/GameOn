import { Tabs } from 'expo-router'
import React from 'react'

const _layout = () => {
  return (
    <Tabs>
      <Tabs.Screen 
        name='home'
        options={{
          title: 'Home',
          headerShown: false
        }}
        />
        <Tabs.Screen 
        name='search'
        options={{
          title: 'Search',
          headerShown: false
        }}
        />
        <Tabs.Screen 
        name='createListing'
        options={{
          title: 'List',
          headerShown: false
        }}
        />
        <Tabs.Screen 
        name='chat'
        options={{
          title: 'Chat',
          headerShown: false
        }}
        />
        <Tabs.Screen 
        name='profile'
        options={{
          title: 'Profile',
          headerShown: false
        }}
        />
    </Tabs>
  )
}

export default _layout