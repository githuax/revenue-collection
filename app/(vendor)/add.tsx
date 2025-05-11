import { View, Text, TouchableOpacity, ScrollView } from 'react-native'
import React, { useState } from 'react'

import Header from '~/components/Header'
import TextInput from '~/components/TextInput'
import Switch from '~/components/Switch'
import Select from '~/components/Select'
import StatusModal from '~/components/modals/Status'

import database, { payersCollection } from '~/db'
import Payer from '~/db/model/Payer'
import { router } from 'expo-router'
import { BUSINESS_TYPES } from '~/services/constants'
import useAuthStore from '~/store/authStore'
import { Feather, Ionicons } from '@expo/vector-icons'

export default function Add() {
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [tin, setTin] = useState<string>('');
  const [isPropertyOwner, setIsPropertyOwner] = useState<boolean>(false);
  const [isVendor, setIsVendor] = useState<boolean>(false);
  const [selectedBusinessTypes, setSelectedBusinessTypes] = useState<string[]>([]);

  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [errorModalVisible, setErrorModalVisible] = useState(false);

  const businessTypeOptions = BUSINESS_TYPES.map((type) => ({
    label: type,
    value: type,
  }));

  const handleBusinessTypeChange = (selectedValues: string[]) => {
    setSelectedBusinessTypes(selectedValues);
  };

  const addPayer = () => {
    database.write(async () => {
      await payersCollection.create((payer: Payer) => {
        payer.firstName = firstName;
        payer.lastName = lastName;
        payer.email = email;
        payer.phone = phone;
        payer.tin = tin;
        payer.propertyOwner = isPropertyOwner;
        payer.vendor = isVendor;
        payer.businessType = selectedBusinessTypes;
        payer.createdBy = useAuthStore.getState().userData?.id;
        payer.updatedAt = Date.now();
      })
    }).then(() => {
      setSuccessModalVisible(true);
    }).catch((error) => {
      console.log(error)
      setErrorModalVisible(true);
    })
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Enhanced Header with Shadow */}
      <Header
        text='Add Payer'
        className="border-b border-gray-200 shadow-sm"
      />

      <ScrollView className="flex-1">
        <View className='p-6 pt-0'>
          {/* Title Section */}
          <View className="mb-6">
            <Text className="text-gray-500 mt-1">Enter the details of the new payer</Text>
          </View>

          {/* Personal Information Card */}
          <View className="bg-white rounded-2xl shadow-md p-6 mb-6">
            <Text className="text-xl font-bold text-gray-800 mb-4">Personal Details</Text>

            {/* Name Section */}
            <View className="flex-row space-x-4 mb-4">
              <View className="flex-1">
                <TextInput
                  label='First Name'
                  placeholder='First Name'
                  value={firstName}
                  onChangeText={(text) => { setFirstName(text) }}
                  onSubmitEditing={() => { }}
                  autoCapitalize='words'
                  autoCorrect={false}
                  keyboardType='default'
                  className="border border-gray-200 rounded-xl bg-white px-4 py-3 mb-1"
                  placeholderTextColor="#9CA3AF"
                />
                <Text className="text-xs text-gray-500 ml-1">Legal first name</Text>
              </View>

              <View className="flex-1">
                <TextInput
                  label='Last Name'
                  placeholder='Last Name'
                  value={lastName}
                  onChangeText={(text => { setLastName(text) })}
                  onSubmitEditing={() => { }}
                  autoCapitalize='words'
                  autoCorrect={false}
                  keyboardType='default'
                  className="border border-gray-200 rounded-xl bg-white px-4 py-3 mb-1"
                  placeholderTextColor="#9CA3AF"
                />
                <Text className="text-xs text-gray-500 ml-1">Legal last name</Text>
              </View>
            </View>

            {/* Contact Information */}
            <View className="mb-4">
              <Text className="text-gray-700 font-semibold mb-2 text-base">Contact Information</Text>

              <View className="mb-4">
                <TextInput
                  icon={<Ionicons name="call-outline" size={20} color="#4B5563" />}
                  placeholder='Phone'
                  value={phone}
                  onChangeText={(text => { setPhone(text) })}
                  onSubmitEditing={() => { }}
                  autoCapitalize='none'
                  autoCorrect={false}
                  keyboardType='phone-pad'
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View className="mb-4">
                <TextInput
                  icon={<Feather name="map-pin" size={20} color="#4B5563" />}
                  placeholder='Location'
                  value={location}
                  onChangeText={(text => { setLocation(text) })}
                  onSubmitEditing={() => { }}
                  autoCapitalize='none'
                  autoCorrect={false}
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View>
                <TextInput
                  icon={<Ionicons name="mail-outline" size={20} color="#4B5563" />}
                  placeholder='Email'
                  value={email}
                  onChangeText={(text => { setEmail(text) })}
                  onSubmitEditing={() => { }}
                  autoCapitalize='none'
                  autoCorrect={false}
                  keyboardType='email-address'
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>
          </View>

          {/* Payer Types Card */}
          <View className="bg-white rounded-2xl shadow-md p-6 mb-6">
            <Text className="text-xl font-bold text-gray-800 mb-4">Payer Types</Text>

            {/* Property Owner Switch */}
            <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
              <View className="flex-row items-center">
                <Ionicons name="home-outline" size={24} color="#4B5563" className="mr-2" />
                <View>
                  <Text className="text-gray-700 font-semibold">Property Owner</Text>
                  <Text className="text-gray-500 text-xs">This payer owns properties</Text>
                </View>
              </View>
              <Switch
                value={isPropertyOwner}
                onValueChange={(value => { setIsPropertyOwner(value) })}
                trackColor={{ false: "#DBEAFE", true: "#93C5FD" }}
                thumbColor={isPropertyOwner ? "#3B82F6" : "#E5E7EB"}
              />
            </View>

            {/* Vendor Switch */}
            <View className="flex-row items-center justify-between py-3">
              <View className="flex-row items-center">
                <Ionicons name="briefcase-outline" size={24} color="#4B5563" className="mr-2" />
                <View>
                  <Text className="text-gray-700 font-semibold">Vendor</Text>
                  <Text className="text-gray-500 text-xs">This payer provides services</Text>
                </View>
              </View>
              <Switch
                value={isVendor}
                onValueChange={(value => { setIsVendor(value) })}
                trackColor={{ false: "#DBEAFE", true: "#93C5FD" }}
                thumbColor={isVendor ? "#3B82F6" : "#E5E7EB"}
              />
            </View>
          </View>

          {/* Business Information Card */}
          <View className="bg-white rounded-2xl shadow-md p-6 mb-6">
            <Text className="text-xl font-bold text-gray-800 mb-4">Business Information</Text>

            {/* TIN Field */}
            <View className="mb-5">
              <TextInput
                icon={<Ionicons name="card-outline" size={20} color="#4B5563" />}
                placeholder='Tax Identification Number'
                value={tin}
                onChangeText={(text => { setTin(text) })}
                onSubmitEditing={() => { }}
                autoCapitalize='words'
                autoCorrect={false}
                keyboardType='default'
                className="flex-1 py-3 px-3 text-gray-700"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            {/* Business Type Dropdown */}
            <View className="mb-5">
              <Text className="text-gray-700 font-semibold mb-2 text-base">Business Type</Text>
              <View className="border border-gray-200 rounded-xl overflow-hidden">
                <Select
                  options={businessTypeOptions}
                  onChange={handleBusinessTypeChange}
                  className="bg-white px-4 py-3"
                />
              </View>
            </View>
          </View>

          {/* Save button */}
          <TouchableOpacity
            className='bg-blue-600 rounded-xl p-4 mb-8 shadow-md'
            onPress={addPayer}
          >
            <View className="flex-row items-center justify-center space-x-2">
              <Text className='text-white text-center font-bold text-lg'>Save Payer</Text>
            </View>
          </TouchableOpacity>

          {/* Success Modal */}
          <StatusModal
            visible={successModalVisible}
            type="success"
            title="Payer Added Successfully!"
            message="The payer has been added successfully."
            onClose={() => {
              setSuccessModalVisible(false);
              router.back();
            }}
            autoCloseTime={5000} // Auto close after 5 seconds
          />

          {/* Error Modal */}
          <StatusModal
            visible={errorModalVisible}
            type="error"
            title="Payment Failed"
            message="We couldn't process your payment. Please check your payment details and try again."
            onClose={() => setErrorModalVisible(false)}
            autoCloseTime={0} // Don't auto close error modals
          />
        </View>
      </ScrollView>
    </View>
  )
}