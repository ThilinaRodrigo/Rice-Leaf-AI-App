import { StyleSheet, Text, View } from 'react-native'
import React from 'react'

interface FactorProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

const Factor = ({ icon, label, value }: FactorProps) => {
  return (
  <View className="bg-gray-50 w-[30%] p-4 rounded-xl items-center">
    {icon}
    <Text className="text-sm text-gray-500 mt-2">{label}</Text>
    <Text className="font-bold text-gray-900 mt-1">{value}</Text>
  </View>
  )
}

export default Factor
