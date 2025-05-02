import { View, Text } from 'react-native'
import React from 'react'

type ChipStyle = {
    background: string;
    text: string;
}

const styles: Record<string, ChipStyle> = {
    completed: {
        background: 'bg-green-500',
        text: 'text-white'
    },
    pending: {
        background: 'bg-yellow-500',
        text: 'text-white'
    },
    error: {
        background: 'bg-red-500',
        text: 'text-white'
    },
    refunded: {
        background: 'bg-blue-500',
        text: 'text-white'
    },
    active: {
        background: 'bg-green-500',
        text: 'text-white'
    },
    inActive: {
        background: 'bg-gray-500',
        text: 'text-white'
    },
}

type ChipProps = {
    text: string;
    style: 'completed' | 'pending' | 'error' | 'refunded' | 'active' | 'inActive';
}

export default function Chip({
    text,
    style
}: ChipProps) {
  return (
    <View className={`px-3 py-1 rounded-full ${styles[style].background}`}>
      <Text className={`${styles[style].text}`}>{ text }</Text>
    </View>
  )
}