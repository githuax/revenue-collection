import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Button
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { router } from 'expo-router';

import database from '~/db';
import Payment from '~/db/model/Payment';
import SelectPayer from '~/components/SelectPayer';
import { DB_SYNC_STATUS, PAYMENT_METHODS } from '~/services/constants';
import Header from '~/components/Header';
import DropdownComponent from '~/components/DropDown';
import DatePicker from '~/components/DatePicker';
import ReferenceNumber from '~/components/ReferenceNumber';
import SelectInvoice from '~/components/SelectInvoice';
import useAuthStore from '~/store/authStore';

const NewPaymentScreen = () => {
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [invoice, setInvoice] = useState(null);
  const [amount, setAmount] = useState('');
  const [reference, setReference] = useState('');
  const [date, setDate] = useState(new Date());
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState(null);
  const [locationText, setLocationText] = useState('Get current location');
  const [locationLoading, setLocationLoading] = useState(false);

  const modifiedPaymentMethods = PAYMENT_METHODS.map(method => ({
    label: method,
    value: method
  }))

  // Get current location on mount
  useEffect(() => {
    getLocation();
  }, []);

  // Get current location
  const getLocation = async () => {
    setLocationLoading(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Permission to access location was denied');
        return;
      }

      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation.coords);

      // Get address from coordinates (geocoding)
      const geocode = await Location.reverseGeocodeAsync({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude
      });

      if (geocode && geocode.length > 0) {
        const address = geocode[0];
        setLocationText(`${address.street || ''} ${address.city || ''}, ${address.region || ''}`);
      }
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Failed to get current location');
    } finally {
      setLocationLoading(false);
    }
  };

  // Handle vendor selection
  const selectVendor = (vendor) => {
    setSelectedVendor(vendor);
  };

  // Handle payment submission
  const handleSubmitPayment = async () => {
    if (!selectedVendor) {
      Alert.alert('Error', 'Please select a vendor');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    database.write(async () => {
      const payment = await database.get<Payment>('payments').create(payment => {
        payment.amount = parseFloat(amount);
        payment.paymentMethod = paymentMethod;
        payment.location = location
        payment.invoice = invoice;
        payment.payer_id = selectedVendor.id;
        payment.status = DB_SYNC_STATUS.PENDING;
        payment.createdBy = useAuthStore.getState().userData?.id || '';
        payment.createdDate = new Date();
        payment.notes = description;
        payment.ref_no = reference;
      })
    }).then(() => {

      // Show success message
      Alert.alert(
        'Payment Recorded',
        `Payment of $${amount} to has been recorded successfully.`,
        [
          {
            text: 'OK',
            onPress: () => {
              router.back()
            }
          }
        ]
      );
    }).catch((error) => {
      console.error('Error saving payment:', error);
      Alert.alert('Error', 'Failed to record payment');
    })
  };

  // Format date to string
  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar backgroundColor="#2C3E50" barStyle="light-content" />
      <Header
        text="New Payment"
        className="border-b border-gray-200 shadow-sm"
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView className="flex-1">
          <View className="p-6 pt-0">
            {/* Title Section */}
            <View className="mb-6">
              <Text className="text-gray-500 mt-1">Record a new payment transaction</Text>
            </View>

            {/* Payer Selection Card */}
            <View className="bg-white rounded-2xl shadow-md p-6 mb-6">
              <View className="flex-row items-center mb-4">
                <Feather name="user" size={22} color="#2C3E50" />
                <Text className="text-gray-800 font-bold ml-2 text-lg">Payer Information</Text>
              </View>

              {/* Payer Selection */}
              <SelectPayer
                onVendorSelect={selectVendor}
                className="mb-3"
              />

              {/* Selected Vendor Info */}
              {selectedVendor && (
                <View className="bg-blue-50 p-4 rounded-xl mt-3 border border-blue-200">
                  <Text className="text-blue-700 font-bold text-base">{selectedVendor.name}</Text>
                  <View className="flex-row items-center mt-2">
                    <Feather name="credit-card" size={14} color="#4B5563" />
                    <Text className="text-gray-600 ml-2">TPIN: {selectedVendor.tpin}</Text>
                  </View>
                  <View className="flex-row items-center mt-1">
                    <Feather name="map-pin" size={14} color="#4B5563" />
                    <Text className="text-gray-600 ml-2">{selectedVendor.address}</Text>
                  </View>
                  <View className="flex-row items-center mt-1">
                    <Feather name="phone" size={14} color="#4B5563" />
                    <Text className="text-gray-600 ml-2">{selectedVendor.phoneNumber}</Text>
                  </View>
                </View>
              )}
            </View>

            {/* Payment Details Card */}
            <View className="bg-white rounded-2xl shadow-md p-6 mb-6">
              <View className="flex-row items-center mb-4">
                <Feather name="dollar-sign" size={22} color="#2C3E50" />
                <Text className="text-gray-800 font-bold ml-2 text-lg">Payment Details</Text>
              </View>

              {/* Amount */}
              <View className="mb-5">
                <Text className="text-gray-700 font-semibold mb-2">Amount</Text>
                <View className="flex-row items-center border border-gray-200 rounded-xl bg-white px-4">
                  <Feather name="dollar-sign" size={20} color="#4B5563" />
                  <TextInput
                    className="flex-1 py-3 px-3 text-gray-700"
                    placeholder="0.00"
                    value={amount}
                    onChangeText={setAmount}
                    keyboardType="numeric"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
              </View>

              {/* Reference Number */}
              <View className="mb-5">
                <Text className="text-gray-700 font-semibold mb-2">Reference Number</Text>
                <ReferenceNumber
                  prefix="PMT"
                  value={reference}
                  onChange={setReference}
                  editable={false}
                  className="bg-gray-100"
                />
                <Text className="text-xs text-gray-500 ml-1 mt-1">Auto-generated unique payment reference</Text>
              </View>

              {/* Due Date */}
              {/* <View className="mb-5">
                <Text className="text-gray-700 font-semibold mb-2">Due Date</Text>
                <View className="flex-row justify-between items-center">
                  <View className="flex-row items-center border border-gray-200 rounded-xl bg-white px-4 py-3 flex-1 mr-2">
                    <Feather name="calendar" size={20} color="#4B5563" />
                    <Text className="text-gray-700 ml-3">{formatDate(date)}</Text>
                  </View>
                  <DatePicker
                    activator={({ openPicker }) => (
                      <TouchableOpacity
                        onPress={openPicker}
                        className="bg-blue-100 rounded-xl w-12 h-12 flex-row items-center justify-center"
                      >
                        <Feather name="calendar" size={24} color="#3B82F6" />
                      </TouchableOpacity>
                    )}
                    onChange={setDate}
                    selectedDate={date}
                  />
                </View>
              </View> */}

              {/* Payment Method */}
              <View className="mb-5">
                <Text className="text-gray-700 font-semibold mb-2">Payment Method</Text>
                <View className="border border-gray-200 rounded-xl overflow-hidden">
                  <DropdownComponent
                    data={modifiedPaymentMethods}
                    placeholder="Select Payment Method"
                    isSearchable={false}
                    onChange={(item) => {
                      setPaymentMethod(item.value);
                    }}
                    className="bg-white"
                  />
                </View>
              </View>

              {/* Description */}
              <View className="mb-5">
                <Text className="text-gray-700 font-semibold mb-2">Description (Optional)</Text>
                <View className="flex-row items-start border border-gray-200 rounded-xl bg-white px-4">
                  <Feather name="file-text" size={20} color="#4B5563" className="mt-3" />
                  <TextInput
                    className="flex-1 py-3 px-3 text-gray-700"
                    placeholder="Enter payment description"
                    value={description}
                    onChangeText={setDescription}
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
              </View>

              {/* Location */}
              <View>
                <Text className="text-gray-700 font-semibold mb-2">Location</Text>
                <TouchableOpacity
                  className="flex-row items-center border border-gray-200 rounded-xl bg-white px-4 py-3 justify-between"
                  onPress={getLocation}
                  disabled={locationLoading}
                >
                  <View className="flex-row items-center">
                    <Feather name="map-pin" size={20} color="#4B5563" />
                    <Text className="text-gray-700 ml-3">
                      {locationText}
                    </Text>
                  </View>
                  {locationLoading && (
                    <ActivityIndicator size="small" color="#3B82F6" />
                  )}
                </TouchableOpacity>
                {location && (
                  <View className="flex-row items-center mt-2">
                    <Feather name="info" size={14} color="#4B5563" />
                    <Text className="text-gray-500 text-sm ml-1">
                      Lat: {location.latitude.toFixed(6)}, Long: {location.longitude.toFixed(6)}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Invoice Card */}
            <View className="bg-white rounded-2xl shadow-md p-6 mb-6">
              <View className="flex-row items-center mb-4">
                <Feather name="file-text" size={22} color="#2C3E50" />
                <Text className="text-gray-800 font-bold ml-2 text-lg">Invoice</Text>
              </View>

              <SelectInvoice
                onInvoiceSelect={(value) => {
                  setInvoice(value.id);
                }}
                payerId={selectedVendor ? selectedVendor.id : undefined}
                className="bg-white rounded-lg"
              />
            </View>

            <TouchableOpacity
              className="bg-blue-600 rounded-xl p-4 mb-8 shadow-md"
              onPress={handleSubmitPayment}
            >
              <View className="flex-row items-center justify-center space-x-2">
                {/* <Feather name="check-circle" size={24} color="white" /> */}
                <Text className="text-white font-bold text-lg ml-2">Record Payment</Text>
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
};

export default NewPaymentScreen;