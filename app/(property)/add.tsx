import { View, Text, TextInput, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native'
import React, { useState } from 'react'
import { router } from 'expo-router'
import database from '../../db'
import Property from '../../db/model/Property'
import Payer from '../../db/model/Payer'
import { Ionicons } from '@expo/vector-icons'
import Header from '~/components/Header'
import ReferenceNumber from '~/components/ReferenceNumber'
import SelectPayer from '~/components/SelectPayer'

export default function Add() {
  const [propertyData, setPropertyData] = useState({
    property_ref_no: '',
    address: '',
    geolocation: '',
    assess_payment: '',
    payment_expiry_date: '',
    type: '',
    notes: '',
    images: '',
    payer: null,
  })

  const handleSubmit = async () => {
    try {
      const propertiesCollection = database.collections.get<Property>('properties')
      const payersCollection = database.collections.get<Payer>('payers')

      // Get the owner (payer) - for now using a hardcoded ID
      const owner = await payersCollection.query().fetch();

      await database.write(async () => {
        await propertiesCollection.create((property: Property) => {
          property.propertyRefNo = propertyData.property_ref_no
          property.address = propertyData.address
          property.geolocation = propertyData.geolocation
          property.assessPayment = propertyData.assess_payment
          property.paymentExpiryDate = new Date(propertyData.payment_expiry_date).getTime()
          property.type = propertyData.type
          property.notes = propertyData.notes
          property.images = propertyData.images
          property.ownerId = propertyData.payer.id
        })
      })
      router.back()
    } catch (error) {
      console.error('Error creating property:', error)
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <Header
        text='Add Property'
      />
      <ScrollView className="flex-1">
        <View className="px-6 mb-4">


          {/* Form Container */}
          <View className="space-y-6 mb-4">
            {/* Property Reference */}
            <View className='mb-4'>
              <Text className="text-gray-700 font-medium mb-2">Property Reference Number</Text>
              <ReferenceNumber
                prefix="PROP"
                value={propertyData.property_ref_no}
                onChange={(text) => setPropertyData({ ...propertyData, property_ref_no: text })}
                editable={false}
              />
            </View>

            {/* Payer to whom the property belong */}
            <View className='mb-4'>
              <Text className='text-primary mb-2'>Belongs to</Text>
              <SelectPayer 
                onVendorSelect={(vendor) => {
                  setPropertyData({
                    ...propertyData, payer: vendor
                  })
                }}
              />
            </View>

            {/* Address */}
            <View>
              <Text className="text-gray-700 font-medium mb-2">Address</Text>
              <View className="flex-row items-start border border-gray-200 rounded-xl bg-gray-50 px-4 mb-4">
                <Ionicons name="location-outline" size={20} color="#6B7280" className="mt-3" />
                <TextInput
                  className="flex-1 py-3 px-3 text-gray-700"
                  value={propertyData.address}
                  onChangeText={(text) => setPropertyData({ ...propertyData, address: text })}
                  placeholder="Enter property address"
                  multiline
                  numberOfLines={2}
                />
              </View>
            </View>

            {/* Geolocation */}
            <View>
              <Text className="text-gray-700 font-medium mb-2">Geolocation</Text>
              <View className="flex-row items-center border border-gray-200 rounded-xl bg-gray-50 px-4 mb-4">
                <Ionicons name="map-outline" size={20} color="#6B7280" />
                <TextInput
                  className="flex-1 py-3 px-3 text-gray-700"
                  value={propertyData.geolocation}
                  onChangeText={(text) => setPropertyData({ ...propertyData, geolocation: text })}
                  placeholder="Enter geolocation coordinates"
                />
              </View>
            </View>

            {/* Assessment Payment */}
            <View>
              <Text className="text-gray-700 font-medium mb-2">Assessment Payment</Text>
              <View className="flex-row items-center border border-gray-200 rounded-xl bg-gray-50 px-4 mb-4">
                <Ionicons name="cash-outline" size={20} color="#6B7280" />
                <TextInput
                  className="flex-1 py-3 px-3 text-gray-700"
                  value={propertyData.assess_payment}
                  onChangeText={(text) => setPropertyData({ ...propertyData, assess_payment: text })}
                  placeholder="Enter assessment payment amount"
                  keyboardType="numeric"
                />
              </View>
            </View>

            {/* Payment Expiry Date */}
            <View>
              <Text className="text-gray-700 font-medium mb-2">Payment Expiry Date</Text>
              <View className="flex-row items-center border border-gray-200 rounded-xl bg-gray-50 px-4 mb-4">
                <Ionicons name="calendar-outline" size={20} color="#6B7280" />
                <TextInput
                  className="flex-1 py-3 px-3 text-gray-700"
                  value={propertyData.payment_expiry_date}
                  onChangeText={(text) => setPropertyData({ ...propertyData, payment_expiry_date: text })}
                  placeholder="YYYY-MM-DD"
                />
              </View>
            </View>

            {/* Property Type */}
            <View>
              <Text className="text-gray-700 font-medium mb-2">Property Type</Text>
              <View className="flex-row items-center border border-gray-200 rounded-xl bg-gray-50 px-4 mb-4">
                <Ionicons name="business-outline" size={20} color="#6B7280" />
                <TextInput
                  className="flex-1 py-3 px-3 text-gray-700"
                  value={propertyData.type}
                  onChangeText={(text) => setPropertyData({ ...propertyData, type: text })}
                  placeholder="e.g., Residential, Commercial"
                />
              </View>
            </View>

            {/* Notes */}
            <View>
              <Text className="text-gray-700 font-medium mb-2">Notes</Text>
              <View className="flex-row items-start border border-gray-200 rounded-xl bg-gray-50 px-4 mb-4">
                <Ionicons name="document-text-outline" size={20} color="#6B7280" className="mt-3" />
                <TextInput
                  className="flex-1 py-3 px-3 text-gray-700"
                  value={propertyData.notes}
                  onChangeText={(text) => setPropertyData({ ...propertyData, notes: text })}
                  placeholder="Enter property notes"
                  multiline
                  numberOfLines={4}
                />
              </View>
            </View>

            {/* Images */}
            <View>
              <Text className="text-gray-700 font-medium mb-2">Images (URLs)</Text>
              <View className="flex-row items-start border border-gray-200 rounded-xl bg-gray-50 px-4 mb-4">
                <Ionicons name="images-outline" size={20} color="#6B7280" className="mt-3" />
                <TextInput
                  className="flex-1 py-3 px-3 text-gray-700"
                  value={propertyData.images}
                  onChangeText={(text) => setPropertyData({ ...propertyData, images: text })}
                  placeholder="Enter image URLs (comma-separated)"
                  multiline
                  readOnly
                />
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              className="bg-blue-600 rounded-xl p-4 mt-8 shadow-sm mb-4"
              onPress={handleSubmit}
            >
              <View className="flex-row items-center justify-center space-x-2">
                <Ionicons name="add-circle-outline" size={24} color="white" />
                <Text className="text-white text-center font-semibold text-lg">Add Property</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}