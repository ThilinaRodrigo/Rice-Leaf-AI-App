import { Text, View } from 'react-native'
import React from 'react'

interface FactorProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

const Factor = ({ icon, label, value }: FactorProps) => {
  return (
    <View className="bg-gray-50 w-[31%] px-2 py-3.5 rounded-xl items-center justify-center">
      {icon}
      <Text 
        className="text-xs font-medium text-gray-500 mt-2 text-center w-full" 
        numberOfLines={1} 
        adjustsFontSizeToFit 
        minimumFontScale={0.75}
      >
        {label}
      </Text>
      <Text 
        className="font-bold text-gray-900 mt-1 text-center w-full text-xs" 
        numberOfLines={2}
        adjustsFontSizeToFit
        minimumFontScale={0.8}
      >
        {value}
      </Text>
    </View>
  )
}

export default Factor
