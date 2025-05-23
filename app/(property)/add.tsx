import { View, Text, TextInput, ScrollView, TouchableOpacity, SafeAreaView, Image } from 'react-native'
import React, { useState } from 'react'
import { router, useLocalSearchParams } from 'expo-router'
import database from '../../db'
import Property from '../../db/model/Property'
import { Ionicons } from '@expo/vector-icons'
import Header from '~/components/Header'
import ReferenceNumber from '~/components/ReferenceNumber'
import SelectPayer from '~/components/SelectPayer'
import DropdownComponent from '~/components/DropDown'
import { PROPERTY_TYPES } from '~/services/constants'
import StatusModal from '~/components/modals/Status'
import * as ImagePicker from 'expo-image-picker'
import { supabase } from '~/utils/supabase'

export default function Add() {
  const { payerId, payerName, payerAddress, payerPhone, payerTIN } = useLocalSearchParams();
  const [image, setImage] = useState<string | null>(null);

  const transformedPropertyTypes = PROPERTY_TYPES.map((type) => ({
    label: type,
    value: type,
  }))

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [errorModalVisible, setErrorModalVisible] = useState(false);

  const [propertyData, setPropertyData] = useState({
    property_ref_no: null,
    address: '',
    geolocation: '',
    current_assess_value: '',
    assess_payment: '',
    payment_expiry_date: '',
    type: '',
    notes: '',
    images: '',
    payer: payerId ? {
      id: payerId,
      name: payerName,
      address: payerAddress,
      phone: payerPhone,
      tin: payerTIN
    } : null,
  })

  const handleSubmit = async () => {
    try {
      // get the image extension
      const name = `public/${Date.now()}.${image.split('.').pop()}`

      const formData = new FormData();
        formData.append('file', {
          uri: image,
          name: name,
          type: 'image/jpeg',
        } as any);

      // upload the image
      const { data, error } = await supabase.storage.from('property-pics').upload(name, formData.get('file') as File, {
        cacheControl: '3600',
        upsert: false,
        contentType: 'image/jpeg'
      })

      console.log(data, error)

      const propertiesCollection = database.collections.get<Property>('properties')

      await database.write(async () => {
        await propertiesCollection.create((property: Property) => {
          property.propertyRefNo = propertyData.property_ref_no
          property.address = propertyData.address
          property.geolocation = propertyData.geolocation
          property.assessPayment = propertyData.assess_payment
          property.paymentExpiryDate = new Date(propertyData.payment_expiry_date).getTime()
          property.type = propertyData.type.value
          property.notes = propertyData.notes
          property.images = name
          property.ownerId = propertyData.payer.id
          property.lastModifiedDate = Date.now();
        })
      })
      setSuccessModalVisible(true);
    } catch (error) {
      setErrorModalVisible(true);
      console.error('Error creating property:', error)
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Enhanced Header with Shadow */}
      <Header
        text='Add Property'
        className="border-b border-gray-200 shadow-sm"
      />

      <ScrollView className="flex-1">
        <View className="px-6 pb-4">
          {/* Title Section */}
          <View className="mb-6">
            <Text className="text-gray-500 mt-1">Please fill in the information below</Text>
          </View>

          {/* Form Container - Added Card Style */}
          <View className="bg-white rounded-2xl shadow-md p-6 mb-6">
            {/* Property Reference */}
            <View className="mb-5">
              <Text className="text-gray-700 font-semibold mb-2 text-base">Property Reference</Text>
              <ReferenceNumber
                prefix="PROP"
                value={propertyData.property_ref_no}
                onChange={(text) => setPropertyData({ ...propertyData, property_ref_no: text })}
                editable={true}
                className="bg-gray-100" // Added background color
              />
            </View>

            {/* Payer to whom the property belong - Highlighted Section */}
            <View className="mb-5 bg-blue-50 p-4 rounded-xl">
              <Text className="text-blue-700 font-semibold mb-2 text-base">Owner</Text>
              <SelectPayer
                value={propertyData.payer}
                onVendorSelect={(vendor) => {
                  setPropertyData({
                    ...propertyData, payer: vendor
                  })
                }}
                className="bg-white rounded-lg" // Added styling for the selector
              />
            </View>

            {/* Address */}
            <View className="mb-5">
              <Text className="text-gray-700 font-semibold mb-2 text-base">Address</Text>
              <View className="flex-row items-start border border-gray-200 rounded-xl bg-white px-4 mb-1">
                <Ionicons name="location-outline" size={20} color="#4B5563" className="mt-3" />
                <TextInput
                  className="flex-1 py-3 px-3 text-gray-700"
                  value={propertyData.address}
                  onChangeText={(text) => setPropertyData({ ...propertyData, address: text })}
                  placeholder="Enter property address"
                  multiline
                  numberOfLines={2}
                  placeholderTextColor="#9CA3AF"
                />
              </View>
              <Text className="text-xs text-gray-500 ml-1">Full address including street, city and postal code</Text>
            </View>

            {/* Geolocation */}
            <View className="mb-5">
              <Text className="text-gray-700 font-semibold mb-2 text-base">Property Code</Text>
              <View className="flex-row items-center border border-gray-200 rounded-xl bg-white px-4">
                <Ionicons name="map-outline" size={20} color="#4B5563" />
                <TextInput
                  className="flex-1 py-3 px-3 text-gray-700"
                  value={propertyData.geolocation}
                  onChangeText={(text) => setPropertyData({ ...propertyData, geolocation: text })}
                  placeholder="Enter google plus code"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>
          </View>

          {/* Financial Details Section - Separate Card */}
          <View className="bg-white rounded-2xl shadow-md p-6 mb-6">
            <Text className="text-xl font-bold text-gray-800 mb-4">Financial Information</Text>

            {/* Assessed Payment */}
            <View className="mb-5">
              <Text className="text-gray-700 font-semibold mb-2 text-base">Current Assessed Value</Text>
              <View className="flex-row items-center border border-gray-200 rounded-xl bg-white px-4">
                <Ionicons name="cash-outline" size={20} color="#4B5563" />
                <TextInput
                  className="flex-1 py-3 px-3 text-gray-700"
                  value={propertyData.current_assess_value}
                  onChangeText={(text) => setPropertyData({ ...propertyData, current_assess_value: text })}
                  placeholder="Enter current assessed value"
                  keyboardType="numeric"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>

            {/* Assessed Payment */}
            <View className="mb-5">
              <Text className="text-gray-700 font-semibold mb-2 text-base">Assessed Payment</Text>
              <View className="flex-row items-center border border-gray-200 rounded-xl bg-white px-4">
                <Ionicons name="cash-outline" size={20} color="#4B5563" />
                <TextInput
                  className="flex-1 py-3 px-3 text-gray-700"
                  value={propertyData.assess_payment}
                  onChangeText={(text) => setPropertyData({ ...propertyData, assess_payment: text })}
                  placeholder="Enter assessed payment amount"
                  keyboardType="numeric"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>

            {/* Payment Expiry Date */}
            <View className="mb-5">
              <Text className="text-gray-700 font-semibold mb-2 text-base">Payment Due Date</Text>
              <View className="flex-row items-center border border-gray-200 rounded-xl bg-white px-4">
                <Ionicons name="calendar-outline" size={20} color="#4B5563" />
                <TextInput
                  className="flex-1 py-3 px-3 text-gray-700"
                  value={propertyData.payment_expiry_date}
                  onChangeText={(text) => setPropertyData({ ...propertyData, payment_expiry_date: text })}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>
          </View>

          {/* Property Details Section - Separate Card */}
          <View className="bg-white rounded-2xl shadow-md p-6 mb-6">
            <Text className="text-xl font-bold text-gray-800 mb-4">Property Specifications</Text>

            {/* Property Type with Radio Options */}
            <View className="mb-5">
              <Text className="text-gray-700 font-semibold mb-2 text-base">Property Type</Text>
              <DropdownComponent
                data={transformedPropertyTypes}
                onChange={(value) => setPropertyData({ ...propertyData, type: value })}
                placeholder="Select Type"
                isSearchable={false}
                initialValue={propertyData.type}
                leftIcon={<Ionicons name="business-outline" size={20} color="#4B5563" className='mr-3' />}
              />
            </View>

            {/* Notes */}
            <View className="mb-5">
              <Text className="text-gray-700 font-semibold mb-2 text-base">Notes</Text>
              <View className="flex-row items-start border border-gray-200 rounded-xl bg-white px-4">
                <Ionicons name="document-text-outline" size={20} color="#4B5563" className="mt-3" />
                <TextInput
                  className="flex-1 py-3 px-3 text-gray-700"
                  value={propertyData.notes}
                  onChangeText={(text) => setPropertyData({ ...propertyData, notes: text })}
                  placeholder="Enter property notes"
                  multiline
                  numberOfLines={4}
                  placeholderTextColor="#9CA3AF"
                  textAlignVertical="top"
                />
              </View>
            </View>

            {/* Images */}
            <View>
              <Text className="text-gray-700 font-semibold mb-2 text-base">Images</Text>
              <View className="p-4 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 mb-4 items-center justify-center">
                {!image && <><Ionicons name="images-outline" size={40} color="#6B7280" />
                  <Text className="text-gray-500 mt-2 text-center">No images selected</Text></>}
                {image && <Image source={{ uri: image }} className='w-40 h-40' />}
                <TouchableOpacity className="mt-3 bg-gray-200 rounded-lg px-4 py-2" onPress={pickImage}>
                  <Text className="text-gray-700 font-medium">Select Images</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Submit Button - Enhanced */}
          <TouchableOpacity
            className="bg-blue-600 rounded-xl p-4 mb-8 shadow-md"
            onPress={handleSubmit}
          >
            <View className="flex-row items-center justify-center space-x-2">
              <Text className="text-white text-center font-bold text-lg">Add Property</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
      {/* Success Modal */}
      <StatusModal
        visible={successModalVisible}
        type="success"
        title="Property Added Successfully!"
        message="The property has been added successfully."
        onClose={() => {
          setSuccessModalVisible(false);
          router.push(`/(property)/${propertyData.property_ref_no}`)
        }}
        autoCloseTime={5000} // Auto close after 5 seconds
      />

      {/* Error Modal */}
      <StatusModal
        visible={errorModalVisible}
        type="error"
        title="Property Creation Failed"
        message="We couldn't add your property. Please check your property details and try again."
        onClose={() => setErrorModalVisible(false)}
        autoCloseTime={0} // Don't auto close error modals
      />
    </SafeAreaView>
  )
}