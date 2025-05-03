import { View, Text, TextInput, TouchableOpacity } from 'react-native'
import React from 'react'
import { Feather } from '@expo/vector-icons'

export default function SearchBar({
    searchText,
    searchQuery,
    setSearchQuery,
    filterActive,
    setFilterActive
}) {
    return (
        <View className="px-4 pb-2 flex-row justify-between items-center">
            <View className="flex-row items-center bg-white rounded-lg px-3 py-2 w-[88%] shadow-sm">
                <Feather name="search" size={20} color="#8896A6" />
                <TextInput
                    className="flex-1 ml-2 text-gray-800"
                    placeholder={searchText || "Search..."}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholderTextColor="#8896A6"
                />
                {searchQuery ? (
                    <TouchableOpacity onPress={() => setSearchQuery('')}>
                        <Feather name="x" size={20} color="#8896A6" />
                    </TouchableOpacity>
                ) : null}
            </View>

            <TouchableOpacity
                className={`rounded-lg p-2 flex-row items-center justify-center shadow-sm ${filterActive ? 'bg-blue-500' : 'bg-white'}`}
                onPress={() => setFilterActive(!filterActive)}
            >
                <Feather
                    name="sliders"
                    size={20}
                    color={filterActive ? "#FFFFFF" : "#2C3E50"}
                />

            </TouchableOpacity>
        </View>
    )
}