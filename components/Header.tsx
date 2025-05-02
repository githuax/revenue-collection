import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'

import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router';

type HeaderProps = {
    text: string;
    showBackButton?: boolean;
}

export default function Header({ text, showBackButton = true }: HeaderProps) {
    return (
        <View className='flex-row items-center p-4 bg-background'>
            {(router.canGoBack() && showBackButton) && <TouchableOpacity onPress={() => {
                router.back();
            }}>
                <Ionicons name="chevron-back" size={24} color="black" className='mr-3' />
            </TouchableOpacity>}
            <Text className='text-2xl font-bold tracking-wider'>{text}</Text>
        </View>
    )
}