import React, { useState, useEffect, useRef } from 'react';
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
  Modal
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';

import database from '~/db';
import Payment from '~/db/model/Payment';

// Mock data for vendors
const MOCK_VENDORS = [
  { id: '1', name: 'TechSolutions Inc.', tpin: 'TP12345', phoneNumber: '555-123-4567', address: '123 Tech Blvd, Silicon Valley' },
  { id: '2', name: 'Green Grocery Ltd', tpin: 'TP23456', phoneNumber: '555-234-5678', address: '456 Green St, Farmville' },
  { id: '3', name: 'Fitness First', tpin: 'TP34567', phoneNumber: '555-345-6789', address: '789 Fitness Ave, Gymtown' },
  { id: '4', name: 'Books & Beyond', tpin: 'TP45678', phoneNumber: '555-456-7890', address: '101 Reader Lane, Bookville' },
  { id: '5', name: 'Office Supplies Co.', tpin: 'TP56789', phoneNumber: '555-567-8901', address: '234 Office Park, Stationery City' },
];

// Payment methods
const PAYMENT_METHODS = [
  'Cash', 'Bank Transfer', 'Mobile Money', 'Credit Card', 'Check'
];

const NewPaymentScreen = ({ navigation }) => {
  // State for form fields
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [amount, setAmount] = useState('');
  const [reference, setReference] = useState(`PMT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
  const [date, setDate] = useState(new Date());
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  
  // State for camera
  const [hasCameraPermission, setHasCameraPermission] = useState(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [showCamera, setShowCamera] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [showPaymentMethodPicker, setShowPaymentMethodPicker] = useState(false);
  
  // Search results
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  // Generate reference number on mount
  useEffect(() => {
    generateReference();
  }, []);

  // Request camera permissions
  useEffect(() => {
    (async () => {
      const { status } = await requestPermission();
      setHasCameraPermission(status === 'granted');
    })();
  }, []);

  // Search function
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setSearchResults([]);
      setSearching(false);
      return;
    }
    
    setSearching(true);
    // Simulate API search
    setTimeout(() => {
      const results = MOCK_VENDORS.filter(vendor => 
        vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vendor.tpin.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vendor.phoneNumber.includes(searchQuery)
      );
      setSearchResults(results);
      setSearching(false);
    }, 500);
  }, [searchQuery]);

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
    setSearchQuery(vendor.name);
    setSearchResults([]);
  };

  // Handle payment submission
  const handleSubmitPayment = async () => {
    // if (!selectedVendor) {
    //   Alert.alert('Error', 'Please select a vendor');
    //   return;
    // }
    
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }
    
    // Create payment object
    // const payment = {
    //   vendorId: selectedVendor.id,
    //   vendorName: selectedVendor.name,
    //   amount: parseFloat(amount),
    //   reference: reference,
    //   date: date.toISOString().split('T')[0],
    //   method: paymentMethod,
    //   description: description,
    //   location: location ? {
    //     latitude: location.latitude,
    //     longitude: location.longitude
    //   } : null,
    //   status: 'Completed',
    //   timestamp: new Date().toISOString()
    // };

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

  // Render the camera
  const renderCamera = () => {
    
  };

  // Render payment method picker
  const renderPaymentMethodPicker = () => {
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={showPaymentMethodPicker}
        onRequestClose={() => setShowPaymentMethodPicker(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-xl">
            <View className="p-4 border-b border-gray-200">
              <Text className="text-lg font-bold text-text">Select Payment Method</Text>
            </View>
            
            <ScrollView className="max-h-80">
              {PAYMENT_METHODS.map((method) => (
                <TouchableOpacity
                  key={method}
                  className={`p-4 border-b border-gray-100 flex-row justify-between ${
                    paymentMethod === method ? 'bg-primary/10' : ''
                  }`}
                  onPress={() => {
                    setPaymentMethod(method);
                    setShowPaymentMethodPicker(false);
                  }}
                >
                  <Text className="text-text">{method}</Text>
                  {paymentMethod === method && (
                    <Feather name="check" size={20} color="#2C3E50" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            <TouchableOpacity
              className="p-4 bg-gray-100"
              onPress={() => setShowPaymentMethodPicker(false)}
            >
              <Text className="text-primary font-bold text-center">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <StatusBar backgroundColor="#2C3E50" barStyle="light-content" />
      
      {/* Header */}
      <View className="bg-primary py-4 px-4 flex-row justify-between items-center">
        <View>
          <Text className="text-white text-xl font-bold">New Payment</Text>
          <Text className="text-white/80 text-sm">Record a new payment</Text>
        </View>
        <TouchableOpacity 
          onPress={() => router.back()}
          className="p-2"
        >
          <Feather name="x" size={24} color="white" />
        </TouchableOpacity>
      </View>
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView className="flex-1 px-4 py-4">
          {/* Vendor Search Section */}
          <View className="mb-6">
            <Text className="text-text font-bold mb-2">Payer</Text>
            <View className="relative">
              <View className="flex-row items-center bg-white rounded-lg border border-gray-300">
                <TextInput
                  className="flex-1 py-3 px-4 text-text"
                  placeholder="Search by name, TPIN or phone number"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
                <View className="flex-row">
                  {searchQuery ? (
                    <TouchableOpacity 
                      className="p-3" 
                      onPress={() => {
                        setSearchQuery('');
                        setSelectedVendor(null);
                      }}
                    >
                      <Feather name="x" size={20} color="#8896A6" />
                    </TouchableOpacity>
                  ) : null}
                  <TouchableOpacity 
                    className="p-3" 
                    onPress={() => {
                      if (hasCameraPermission) {
                        // setShowCamera(true);
                        router.push('/(new_payments)/camera')
                        setScanned(false);
                      } else {
                        Alert.alert('Permission Required', 'Camera permission is required to scan QR codes');
                      }
                    }}
                  >
                    <Feather name="camera" size={20} color="#2C3E50" />
                  </TouchableOpacity>
                </View>
              </View>
              
              {/* Search Results */}
              {searchResults.length > 0 && (
                <View className="absolute top-full left-0 right-0 bg-white rounded-lg mt-1 border border-gray-300 shadow-md z-20">
                  {searchResults.map((vendor) => (
                    <TouchableOpacity
                      key={vendor.id}
                      className="p-3 border-b border-gray-100 z-10"
                      onPress={() => selectVendor(vendor)}
                    >
                      <Text className="text-text font-medium">{vendor.name}</Text>
                      <Text className="text-text/70 text-sm">TPIN: {vendor.tpin}</Text>
                      <Text className="text-text/70 text-sm">{vendor.phoneNumber}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              
              {searching && (
                <View className="absolute top-full left-0 right-0 bg-white rounded-lg mt-1 border border-gray-300 p-3 items-center">
                  <ActivityIndicator size="small" color="#2C3E50" />
                  <Text className="text-text/70 mt-1">Searching...</Text>
                </View>
              )}
            </View>
            
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
              <View className="flex-row items-center">
                <TextInput
                  className="bg-white py-3 px-4 rounded-lg border border-gray-300 text-text flex-1 mr-2"
                  value={reference}
                  onChangeText={setReference}
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
              <Text className="text-text/70 mb-1">Date</Text>
              <TouchableOpacity 
                className="bg-white py-3 px-4 rounded-lg border border-gray-300 flex-row justify-between items-center"
                onPress={() => console.log('Open date picker')}
              >
                <Text className="text-text">{formatDate(date)}</Text>
                <Feather name="calendar" size={20} color="#2C3E50" />
              </TouchableOpacity>
            </View>
            
            {/* Payment Method */}
            <View className="mb-4">
              <Text className="text-text/70 mb-1">Payment Method</Text>
              <TouchableOpacity 
                className="bg-white py-3 px-4 rounded-lg border border-gray-300 flex-row justify-between items-center"
                onPress={() => setShowPaymentMethodPicker(true)}
              >
                <Text className="text-text">{paymentMethod}</Text>
                <Feather name="chevron-down" size={20} color="#2C3E50" />
              </TouchableOpacity>
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
      
      
      
      {/* Payment Method Picker */}
      {renderPaymentMethodPicker()}
    </SafeAreaView>
  );
};

export default NewPaymentScreen;