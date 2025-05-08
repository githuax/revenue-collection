import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'

const SectionHeader = ({ title, addButtonText, action }: { title: string, addButtonText: string, action: Function }) => {
    return (
        <View className='flex-row items-center justify-between mb-4'>
            <Text className='text-text text-xl'>{title}</Text>
            <TouchableOpacity className='bg-primary/10 rounded-full px-4 py-2 flex-row items-center' onPress={() => action()}>
                <Text className='text-primary font-semibold'>{addButtonText}</Text>
            </TouchableOpacity>
        </View>
    )
}

export default SectionHeader;