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
import { PAYMENT_METHODS } from '~/services/constants';
import Header from '~/components/Header';
import DropdownComponent from '~/components/DropDown';
import DatePicker from '~/components/DatePicker';


const NewPaymentScreen = () => {
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [amount, setAmount] = useState('');
  const [reference, setReference] = useState(`PMT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
  const [date, setDate] = useState(new Date());
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);

  const modifiedPaymentMethods = PAYMENT_METHODS.map(method => ({
    label: method,
    value: method
  }))


  // Generate reference number on mount
  useEffect(() => {
    generateReference();
  }, []);

  // Generate unique reference number
  const generateReference = () => {
    const prefix = 'PMT';
    const year = new Date().getFullYear();
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    setReference(`${prefix}-${year}-${randomNum}`);
  };

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
        Alert.alert(
          'Location Acquired',
          `${address.street || ''} ${address.city || ''}, ${address.region || ''}`
        );
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
        payment.paymentType = paymentMethod;
        payment.location = location
      })
    }).then(() => {
      console.log('Payment saved successfully');

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
    <SafeAreaView className="flex-1 bg-background">
      <StatusBar backgroundColor="#2C3E50" barStyle="light-content" />
      <Header
        text="New Payment"
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView className="flex-1 px-4 py-4">
          {/* Vendor Search Section */}
          <View className="mb-6">
            <Text className="text-text font-bold mb-2">Payer</Text>
            <SelectPayer
              onVendorSelect={selectVendor}
            />

            {/* Selected Vendor Info */}
            {selectedVendor && (
              <View className="bg-primary/5 p-3 rounded-lg mt-3 border border-primary/20">
                <Text className="text-primary font-bold">{selectedVendor.name}</Text>
                <Text className="text-text/70 mt-1">TPIN: {selectedVendor.tpin}</Text>
                <Text className="text-text/70">{selectedVendor.address}</Text>
                <Text className="text-text/70">{selectedVendor.phoneNumber}</Text>
              </View>
            )}
          </View>

          {/* Payment Details Section */}
          <View className="mb-6">
            <Text className="text-text font-bold mb-2">Payment Details</Text>

            {/* Amount */}
            <View className="mb-4">
              <Text className="text-text/70 mb-1">Amount ($)</Text>
              <TextInput
                className="bg-white py-3 px-4 rounded-lg border border-gray-300 text-text"
                placeholder="0.00"
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
              />
            </View>

            {/* Reference Number */}
            <View className="mb-4">
              <Text className="text-text/70 mb-1">Reference Number</Text>
              <View className="flex-row items-center justify-between">
                <TextInput
                  className="bg-gray-200 py-3 px-4 rounded-lg border border-gray-300 text-text w-[85%]"
                  value={reference}
                  onChangeText={setReference}
                  editable={false}
                />
                <TouchableOpacity
                  className="bg-primary/10 p-3 rounded-lg"
                  onPress={generateReference}
                >
                  <Feather name="refresh-cw" size={20} color="#2C3E50" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Date */}
            <View className="mb-4">
              <Text className="text-text/70 mb-1">Due Date</Text>
              <View
                className='flex-row justify-between items-center'
              >
                <View
                  className="bg-gray-200 py-3 px-4 rounded-lg border border-gray-300 w-[85%]"
                >
                  <Text className="text-text">{formatDate(date)}</Text>
                </View>
                <DatePicker
                  activator={({ openPicker }) => (
                    <TouchableOpacity onPress={openPicker} className='bg-primary/10 rounded-md w-[12%] py-3 flex-row items-center justify-center'>
                      <Feather name="calendar" size={20} color="#2C3E50" />
                    </TouchableOpacity>
                  )}
                  onChange={setDate}
                  selectedDate={date}
                />
              </View>
            </View>

            {/* Payment Method */}
            <View className='mb-4'>
              <Text className="text-text/70 mb-1">Payment Method</Text>
              <DropdownComponent
                data={modifiedPaymentMethods}
                placeholder="Select Payment Method"
                isSearchable={false}
                onChange={(item) => {
                  setPaymentMethod(item.value);
                }}
              />
            </View>

            {/* Description */}
            <View className="mb-4">
              <Text className="text-text/70 mb-1">Description (Optional)</Text>
              <TextInput
                className="bg-white py-3 px-4 rounded-lg border border-gray-300 text-text"
                placeholder="Enter payment description"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            {/* Location */}
            <View>
              <Text className="text-text/70 mb-1">Location</Text>
              <TouchableOpacity
                className="bg-white py-3 px-4 rounded-lg border border-gray-300 flex-row justify-between items-center"
                onPress={getLocation}
                disabled={locationLoading}
              >
                <Text className="text-text">
                  {location ? 'Location recorded' : 'Get current location'}
                </Text>
                {locationLoading ? (
                  <ActivityIndicator size="small" color="#2C3E50" />
                ) : (
                  <Feather name="map-pin" size={20} color="#2C3E50" />
                )}
              </TouchableOpacity>
              {location && (
                <Text className="text-text/70 text-sm mt-1">
                  Lat: {location.latitude.toFixed(6)}, Long: {location.longitude.toFixed(6)}
                </Text>
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Submit Button */}
      <View className="p-4 bg-white border-t border-gray-200">
        <TouchableOpacity
          className="bg-secondary py-4 rounded-lg items-center"
          onPress={handleSubmitPayment}
        >
          <Text className="text-white font-bold text-lg">Record Payment</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default NewPaymentScreen;