import { View, Text } from 'react-native'
import React from 'react'
import { useLocalSearchParams } from 'expo-router'

export default function PropertyDetails() {
    const { id } = useLocalSearchParams();

    return (
        <View>
            <Text>PropertyDetails</Text>
        </View>
    )
}