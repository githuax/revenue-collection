import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import {
    Ionicons,
    MaterialCommunityIcons
} from '@expo/vector-icons'
import { router } from 'expo-router'

export default function DashboardActionTiles() {
  return (
    <View className="p-4 pt-0 bg-gray-100">
      {/* Action Tiles Section */}
      <Text className="text-xl font-bold text-gray-800 mb-4 mt-2">Quick Actions</Text>
      <View className="flex-row flex-wrap justify-between">
        {/* Add Payer Tile */}
        <TouchableOpacity className="bg-white rounded-xl shadow p-4 mb-4 w-[48%]"
            onPress={() => {
                router.push('/(vendor)/add')
            }}
        >
          <View className="items-center">
            <View className="bg-blue-100 p-3 rounded-full mb-2">
              <MaterialCommunityIcons name="account-plus" size={24} color="#3b82f6" />
            </View>
            <Text className="text-sm font-medium text-gray-800">Add Payer</Text>
          </View>
        </TouchableOpacity>
        
        {/* Add Invoice Tile */}
        <TouchableOpacity className="bg-white rounded-xl shadow p-4 mb-4 w-[48%]"
            onPress={() => {
                router.push('/(new_payments)/invoice')
            }}
        >
          <View className="items-center">
            <View className="bg-purple-100 p-3 rounded-full mb-2">
              <MaterialCommunityIcons name="file-plus" size={24} color="#a855f7" />
            </View>
            <Text className="text-sm font-medium text-gray-800">Add Invoice</Text>
          </View>
        </TouchableOpacity>
        
        {/* Add Payment Tile */}
        <TouchableOpacity className="bg-white rounded-xl shadow p-4 mb-4 w-[48%]"
            onPress={() => {
                router.push('/(new_payments)')
            }}
        >
          <View className="items-center">
            <View className="bg-green-100 p-3 rounded-full mb-2">
              <MaterialCommunityIcons name="cash-plus" size={24} color="#22c55e" />
            </View>
            <Text className="text-sm font-medium text-gray-800">Add Payment</Text>
          </View>
        </TouchableOpacity>
        
        {/* Add Property Tile */}
        <TouchableOpacity className="bg-white rounded-xl shadow p-4 mb-4 w-[48%]"
            onPress={() => {
                router.push('/(property)/add')
            }}
        >
          <View className="items-center">
            <View className="bg-amber-100 p-3 rounded-full mb-2">
              <MaterialCommunityIcons name="home-plus" size={24} color="#f59e0b" />
            </View>
            <Text className="text-sm font-medium text-gray-800">Add Property</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  )
}