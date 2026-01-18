import { StyleSheet, Text, View } from 'react-native'
import {Home,ShoppingBag,User, MessageCircle} from "lucide-react-native";

import React from 'react'
import { Tabs } from 'expo-router'

const _layout = () => {
  return (
    <Tabs 
      screenOptions={{
        tabBarActiveTintColor: '#2563EB',
        tabBarInactiveTintColor: '#6B7280',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderRadius: 50,
          marginHorizontal: 20,
          marginBottom: 36,
          height:52,
          position: 'absolute',
          overflow: 'hidden',
          borderWidth: 1,
          borderColor: '#bcbcc0'
        },
        tabBarLabelStyle: {
          fontSize: 12,
        },
      }}
    >

      <Tabs.Screen name="index" 
      options={{
         headerShown: false, 
         title: 'Home',
         tabBarStyle: { display: 'none' },
         tabBarIcon: ({ color }) => <Home size={20} color={color} /> 
        }}
      />
      <Tabs.Screen name="market" options={{ 
        headerShown: false, 
        title: 'Market', 
        tabBarIcon: ({ color }) => <ShoppingBag size={20} color={color} />
        }}/>

      <Tabs.Screen name="chat" 
        options={{ 
          headerShown: false, 
          title: 'Chat',
          tabBarStyle: { display: 'none' },
          tabBarIcon: ({ color }) => <MessageCircle size={20} color={color} />
          }}
      />

      <Tabs.Screen name="profile" options={{ 
        headerShown: false, 
        title: 'Profile' ,
        tabBarIcon: ({ color }) => <User size={20} color={color} />
        }} />

      <Tabs.Screen name="result" 
        options={{ 
          headerShown: false,
          href: null,
        }} 
      />
      
    </Tabs>
  )
}

export default _layout
