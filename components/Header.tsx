import { View, Text } from 'react-native'
import React from 'react'

type HeaderProps = {
    text: string;
}

export default function Header({ text }: HeaderProps) {
  return (
    <View className='flex-row items-center justify-between p-4 bg-white'>
      <Text className='text-2xl font-bold tracking-wider'>{ text }</Text>
    </View>
  )
}