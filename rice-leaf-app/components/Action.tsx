import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { CheckCircle2 } from 'lucide-react-native'

interface ActionProps {
  title: string;
  subtitle: string;
}

const Action = ({ title, subtitle }: ActionProps) => {
  return (
  <View className="flex-row items-start mb-4">
    <CheckCircle2 size={22} color="#16A34A" />
    <View className="ml-3">
      <Text className="text-base font-semibold text-gray-900">
        {title}
      </Text>
      <Text className="text-sm text-gray-500">{subtitle}</Text>
    </View>
  </View>
  )
}

export default Action

const styles = StyleSheet.create({})