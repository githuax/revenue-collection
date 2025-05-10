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
  Share
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { router, useLocalSearchParams } from 'expo-router';

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

const PaymentDisplayScreen = () => {
  const { paymentId } = useLocalSearchParams();
  const [payment, setPayment] = useState(null);
  const [payer, setPayer] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  
  // Editable fields
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
  }));

  // Fetch payment data
  useEffect(() => {
    fetchPaymentData();
  }, [paymentId]);

  const fetchPaymentData = async () => {
    try {
      setIsLoading(true);
      const paymentRecord = await database.get<Payment>('payments').find(paymentId);
      
      if (paymentRecord) {
        setPayment(paymentRecord);
        
        // Get payer info
        const payerRecord = await database.get('payers').find(paymentRecord.payer_id);
        setPayer(payerRecord);
        
        // Set form fields for potential editing
        setSelectedVendor({
          value: payerRecord.id,
          id: payerRecord.id,
          name: payerRecord.name,
          address: payerRecord.address,
          phoneNumber: payerRecord.phoneNumber,
          tpin: payerRecord.tpin,
        });
        
        setInvoice(paymentRecord.invoice);
        setAmount(paymentRecord.amount.toString());
        setReference(paymentRecord.ref_no);
        setPaymentMethod(paymentRecord.paymentMethod);
        setDescription(paymentRecord.notes);
        
        if (paymentRecord.location) {
          setLocation(paymentRecord.location);
          getAddressFromCoordinates(paymentRecord.location);
        }
      } else {
        Alert.alert('Error', 'Payment not found');
        router.back();
      }
    } catch (error) {
      console.error('Error fetching payment:', error);
      Alert.alert('Error', 'Failed to load payment details');
    } finally {
      setIsLoading(false);
    }
  };

  const getAddressFromCoordinates = async (coords) => {
    try {
      const geocode = await Location.reverseGeocodeAsync({
        latitude: coords.latitude,
        longitude: coords.longitude
      });

      if (geocode && geocode.length > 0) {
        const address = geocode[0];
        setLocationText(`${address.street || ''} ${address.city || ''}, ${address.region || ''}`);
      }
    } catch (error) {
      console.error('Error getting address:', error);
      setLocationText('Location available');
    }
  };

  // Get current location
  const getLocation = async () => {
    if (!isEditing) return;
    
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
      getAddressFromCoordinates(currentLocation.coords);
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Failed to get current location');
    } finally {
      setLocationLoading(false);
    }
  };

  // Handle vendor selection
  const selectVendor = (vendor) => {
    if (!isEditing) return;
    setSelectedVendor(vendor);
  };

  // Format date to string
  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Format timestamp to date and time
  const formatDateTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Handle update payment
  const handleUpdatePayment = async () => {
    if (!selectedVendor) {
      Alert.alert('Error', 'Please select a vendor');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    try {
      await database.write(async () => {
        const paymentToUpdate = await database.get<Payment>('payments').find(paymentId);
        
        await paymentToUpdate.update(payment => {
          payment.amount = parseFloat(amount);
          payment.paymentMethod = paymentMethod;
          payment.location = location;
          payment.invoice = invoice;
          payment.payer_id = selectedVendor.id;
          payment.status = DB_SYNC_STATUS.PENDING;
          payment.notes = description;
        });
      });

      // Show success message
      Alert.alert(
        'Payment Updated',
        `Payment of $${amount} has been updated successfully.`,
        [
          {
            text: 'OK',
            onPress: () => {
              setIsEditing(false);
              fetchPaymentData(); // Refresh data
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error updating payment:', error);
      Alert.alert('Error', 'Failed to update payment');
    }
  };

  // Handle delete payment
  const handleDeletePayment = () => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this payment?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await database.write(async () => {
                const paymentToDelete = await database.get<Payment>('payments').find(paymentId);
                await paymentToDelete.destroyPermanently();
              });
              
              Alert.alert('Success', 'Payment deleted successfully');
              router.back();
            } catch (error) {
              console.error('Error deleting payment:', error);
              Alert.alert('Error', 'Failed to delete payment');
            }
          }
        }
      ]
    );
  };

  // Share payment details
  const sharePayment = async () => {
    if (!payment || !payer) return;
    
    try {
      await Share.share({
        message: `Payment Details\n\nRef: ${payment.ref_no}\nAmount: $${payment.amount}\nPaid to: ${payer.name}\nMethod: ${payment.paymentMethod}\nDate: ${formatDateTime(payment.createdDate)}\n${payment.notes ? `Notes: ${payment.notes}` : ''}`
      });
    } catch (error) {
      console.error('Error sharing payment:', error);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="mt-4 text-gray-600">Loading payment details...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar backgroundColor="#2C3E50" barStyle="light-content" />
      <Header
        text={isEditing ? "Edit Payment" : "Payment Details"}
        className="border-b border-gray-200 shadow-sm"
        leftComponent={
          <TouchableOpacity onPress={() => router.back()} className="p-2">
            <Feather name="arrow-left" size={24} color="#2C3E50" />
          </TouchableOpacity>
        }
        rightComponent={
          isEditing ? (
            <TouchableOpacity onPress={() => setIsEditing(false)} className="p-2">
              <Feather name="x" size={24} color="#2C3E50" />
            </TouchableOpacity>
          ) : (
            <View className="flex-row">
              <TouchableOpacity onPress={sharePayment} className="p-2 mr-2">
                <Feather name="share-2" size={24} color="#2C3E50" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setIsEditing(true)} className="p-2">
                <Feather name="edit" size={24} color="#2C3E50" />
              </TouchableOpacity>
            </View>
          )
        }
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView className="flex-1">
          <View className="p-6 pt-0">
            {/* Status Badge */}
            {!isEditing && (
              <View className="flex-row justify-between items-center mb-4">
                <View className="flex-row items-center">
                  <Feather name="clock" size={16} color="#4B5563" />
                  <Text className="text-gray-600 ml-2">
                    Created: {payment && formatDateTime(payment.createdDate)}
                  </Text>
                </View>
                <View className={`px-3 py-1 rounded-full ${payment?.status === DB_SYNC_STATUS.SYNCED ? 'bg-green-100' : 'bg-yellow-100'}`}>
                  <Text className={`text-sm font-medium ${payment?.status === DB_SYNC_STATUS.SYNCED ? 'text-green-700' : 'text-yellow-700'}`}>
                    {payment?.status === DB_SYNC_STATUS.SYNCED ? 'Synced' : 'Pending'}
                  </Text>
                </View>
              </View>
            )}

            {/* Payer Information Card */}
            <View className="bg-white rounded-2xl shadow-md p-6 mb-6">
              <View className="flex-row items-center justify-between mb-4">
                <View className="flex-row items-center">
                  <Feather name="user" size={22} color="#2C3E50" />
                  <Text className="text-gray-800 font-bold ml-2 text-lg">Payer Information</Text>
                </View>
              </View>

              {/* Payer Selection (only visible in edit mode) */}
              {isEditing ? (
                <SelectPayer
                  onVendorSelect={selectVendor}
                  value={selectedVendor}
                  className="mb-3"
                />
              ) : null}

              {/* Selected Vendor Info */}
              {(payer || selectedVendor) && (
                <View className="bg-blue-50 p-4 rounded-xl mt-3 border border-blue-200">
                  <Text className="text-blue-700 font-bold text-base">
                    {isEditing ? selectedVendor?.name : payer?.name}
                  </Text>
                  <View className="flex-row items-center mt-2">
                    <Feather name="credit-card" size={14} color="#4B5563" />
                    <Text className="text-gray-600 ml-2">
                      TPIN: {isEditing ? selectedVendor?.tpin : payer?.tpin}
                    </Text>
                  </View>
                  <View className="flex-row items-center mt-1">
                    <Feather name="map-pin" size={14} color="#4B5563" />
                    <Text className="text-gray-600 ml-2">
                      {isEditing ? selectedVendor?.address : payer?.address}
                    </Text>
                  </View>
                  <View className="flex-row items-center mt-1">
                    <Feather name="phone" size={14} color="#4B5563" />
                    <Text className="text-gray-600 ml-2">
                      {isEditing ? selectedVendor?.phoneNumber : payer?.phoneNumber}
                    </Text>
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

              {/* Reference Number */}
              <View className="mb-5">
                <Text className="text-gray-700 font-semibold mb-2">Reference Number</Text>
                {isEditing ? (
                  <ReferenceNumber
                    prefix="PMT"
                    value={reference}
                    onChange={setReference}
                    editable={false}
                    className="bg-gray-100"
                  />
                ) : (
                  <View className="flex-row items-center border border-gray-200 rounded-xl bg-gray-50 px-4 py-3">
                    <Feather name="hash" size={20} color="#4B5563" />
                    <Text className="text-gray-700 ml-3 font-medium">{payment?.ref_no}</Text>
                  </View>
                )}
              </View>

              {/* Amount */}
              <View className="mb-5">
                <Text className="text-gray-700 font-semibold mb-2">Amount</Text>
                {isEditing ? (
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
                ) : (
                  <View className="flex-row items-center border border-gray-200 rounded-xl bg-gray-50 px-4 py-3">
                    <Feather name="dollar-sign" size={20} color="#4B5563" />
                    <Text className="text-gray-700 ml-3 font-medium">${payment?.amount.toFixed(2)}</Text>
                  </View>
                )}
              </View>

              {/* Payment Method */}
              <View className="mb-5">
                <Text className="text-gray-700 font-semibold mb-2">Payment Method</Text>
                {isEditing ? (
                  <View className="border border-gray-200 rounded-xl overflow-hidden">
                    <DropdownComponent
                      data={modifiedPaymentMethods}
                      placeholder="Select Payment Method"
                      isSearchable={false}
                      value={modifiedPaymentMethods.find(m => m.value === paymentMethod)}
                      onChange={(item) => {
                        setPaymentMethod(item.value);
                      }}
                      className="bg-white"
                    />
                  </View>
                ) : (
                  <View className="flex-row items-center border border-gray-200 rounded-xl bg-gray-50 px-4 py-3">
                    <Feather name="credit-card" size={20} color="#4B5563" />
                    <Text className="text-gray-700 ml-3">{payment?.paymentMethod}</Text>
                  </View>
                )}
              </View>

              {/* Description */}
              <View className="mb-5">
                <Text className="text-gray-700 font-semibold mb-2">Description</Text>
                {isEditing ? (
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
                ) : (
                  <View className="border border-gray-200 rounded-xl bg-gray-50 px-4 py-3">
                    <Text className="text-gray-700">
                      {payment?.notes || "No description provided"}
                    </Text>
                  </View>
                )}
              </View>

              {/* Location */}
              <View className="mb-3">
                <Text className="text-gray-700 font-semibold mb-2">Location</Text>
                {isEditing ? (
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
                ) : (
                  <View className="flex-row items-center border border-gray-200 rounded-xl bg-gray-50 px-4 py-3">
                    <Feather name="map-pin" size={20} color="#4B5563" />
                    <Text className="text-gray-700 ml-3">{locationText}</Text>
                  </View>
                )}
                
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

              {isEditing ? (
                <SelectInvoice
                  onInvoiceSelect={(value) => {
                    setInvoice(value.id);
                  }}
                  payerId={selectedVendor ? selectedVendor.id : undefined}
                  selectedInvoiceId={invoice}
                  className="bg-white rounded-lg"
                />
              ) : (
                <View className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  {payment?.invoice ? (
                    <Text className="text-gray-700">Invoice #{payment.invoice}</Text>
                  ) : (
                    <Text className="text-gray-500 italic">No invoice linked</Text>
                  )}
                </View>
              )}
            </View>

            {/* Action Buttons */}
            {isEditing ? (
              <View className="flex-row space-x-4 mb-8">
                <TouchableOpacity
                  className="bg-red-500 rounded-xl p-4 flex-1 shadow-md"
                  onPress={handleDeletePayment}
                >
                  <View className="flex-row items-center justify-center">
                    <Feather name="trash-2" size={20} color="white" />
                    <Text className="text-white font-bold text-base ml-2">Delete</Text>
                  </View>
                </TouchableOpacity>
                
                <TouchableOpacity
                  className="bg-blue-600 rounded-xl p-4 flex-1 shadow-md"
                  onPress={handleUpdatePayment}
                >
                  <View className="flex-row items-center justify-center">
                    <Feather name="check" size={20} color="white" />
                    <Text className="text-white font-bold text-base ml-2">Save Changes</Text>
                  </View>
                </TouchableOpacity>
              </View>
            ) : null}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default PaymentDisplayScreen;