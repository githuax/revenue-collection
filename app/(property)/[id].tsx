import { View, Text, TextInput, ScrollView, TouchableOpacity, SafeAreaView, Alert, ActivityIndicator, Share, Image } from 'react-native'
import React, { useEffect, useState } from 'react'
import { router, useLocalSearchParams } from 'expo-router'
import database, { payersCollection, propertiesCollection } from '../../db'
import Property from '../../db/model/Property'
import Payer from '../../db/model/Payer'
import { Ionicons, Feather } from '@expo/vector-icons'
import Header from '~/components/Header'
import ReferenceNumber from '~/components/ReferenceNumber'
import SelectPayer from '~/components/SelectPayer'
import DropdownComponent from '~/components/DropDown'
import { PROPERTY_TYPES } from '~/services/constants'
import { Q } from '@nozbe/watermelondb'
import { supabase } from '~/utils/supabase'

export default function PropertyDisplayScreen() {
  const { id } = useLocalSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [property, setProperty] = useState(null);
  const [owner, setOwner] = useState(null);

  const transformedPropertyTypes = PROPERTY_TYPES.map((type) => ({
    label: type,
    value: type,
  }));

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
    payer: null,
  });

  // Fetch property data
  useEffect(() => {
    fetchPropertyData();
  }, [id]);

  const fetchPropertyData = async () => {
    try {
      setIsLoading(true);
      const propertyRecord = await propertiesCollection.query(
        Q.where('property_ref_no', id)
      ).fetch().then(records => records[0]);
      
      if (propertyRecord) {
        setProperty(propertyRecord);
        
        // Get owner info
        const ownerRecord = await payersCollection.query(
          Q.where('id', propertyRecord.ownerId)
        ).fetch().then(records => records[0]);
        setOwner(ownerRecord);
        
        // Format date from timestamp to YYYY-MM-DD
        let formattedDate = '';
        if (propertyRecord.paymentExpiryDate) {
          const date = new Date(propertyRecord.paymentExpiryDate);
          formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        }

        let image = ''
        if(propertyRecord.images) {
          const { data } = supabase.storage
              .from('property-pics')
              .getPublicUrl(propertyRecord.images);

            image = data.publicUrl
        }

        // Set form fields for potential editing
        setPropertyData({
          property_ref_no: propertyRecord.propertyRefNo,
          address: propertyRecord.address || '',
          geolocation: propertyRecord.geolocation || '',
          current_assess_value: propertyRecord.currentAssessValue ? propertyRecord.currentAssessValue.toString() : '',
          assess_payment: propertyRecord.assessPayment ? propertyRecord.assessPayment.toString() : '',
          payment_expiry_date: `${formattedDate}`,
          type: PROPERTY_TYPES.find(type => type === propertyRecord.type) || '',
          notes: propertyRecord.notes || '',
          images: image,
          payer: ownerRecord ? {
            id: ownerRecord.id,
            name: ownerRecord.name,
            address: ownerRecord.address,
            phoneNumber: ownerRecord.phoneNumber,
            tpin: ownerRecord.tpin,
          } : null,
        });
      } else {
        Alert.alert('Error', 'Property not found');
        router.back();
      }
    } catch (error) {
      console.error('Error fetching property:', error);
      Alert.alert('Error', 'Failed to load property details');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle update property
  const handleUpdateProperty = async () => {
    if (!propertyData.payer) {
      Alert.alert('Error', 'Please select an owner');
      return;
    }

    if (!propertyData.address) {
      Alert.alert('Error', 'Please enter an address');
      return;
    }

    try {
      await database.write(async () => {
        const propertyToUpdate = await propertiesCollection.query(
          Q.where('property_ref_no', propertyData.property_ref_no)
        ).fetch().then(records => records[0]);
        
        await propertyToUpdate.update(property => {
          property.propertyRefNo = propertyData.property_ref_no;
          property.address = propertyData.address;
          property.geolocation = propertyData.geolocation;
          property.currentAssessValue = propertyData.current_assess_value ? parseFloat(propertyData.current_assess_value) : 0;
          property.assessPayment = propertyData.assess_payment ? parseFloat(propertyData.assess_payment) : 0;
          property.paymentExpiryDate = propertyData.payment_expiry_date ? new Date(propertyData.payment_expiry_date).getTime() : null;
          property.type = propertyData.type.value || propertyData.type;
          property.notes = propertyData.notes;
          property.images = propertyData.images;
          property.ownerId = propertyData.payer.id;
          property.lastModifiedDate = Date.now();
        });
      });

      Alert.alert(
        'Property Updated',
        'Property details have been updated successfully.',
        [
          {
            text: 'OK',
            onPress: () => {
              setIsEditing(false);
              fetchPropertyData(); // Refresh data
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error updating property:', error);
      Alert.alert('Error', 'Failed to update property');
    }
  };

  // Handle delete property
  const handleDeleteProperty = () => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this property?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await database.write(async () => {
                const propertyToDelete = await database.get<Property>('properties').find(id);
                await propertyToDelete.destroyPermanently();
              });
              
              Alert.alert('Success', 'Property deleted successfully');
              router.back();
            } catch (error) {
              console.error('Error deleting property:', error);
              Alert.alert('Error', 'Failed to delete property');
            }
          }
        }
      ]
    );
  };

  // Share property details
  const shareProperty = async () => {
    if (!property || !owner) return;
    
    try {
      const dueDate = property.paymentExpiryDate ? new Date(property.paymentExpiryDate).toLocaleDateString() : 'Not set';
      
      await Share.share({
        message: `Property Details\n\nRef: ${property.propertyRefNo}\nOwner: ${owner.name}\nAddress: ${property.address}\nType: ${property.type}\nAssessed Payment: $${property.assessPayment || 0}\nPayment Due: ${dueDate}\n${property.notes ? `Notes: ${property.notes}` : ''}`
      });
    } catch (error) {
      console.error('Error sharing property:', error);
    }
  };

  // Format date for display
  const formatDate = (timestamp) => {
    if (!timestamp) return 'Not set';
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="mt-4 text-gray-600">Loading property details...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <Header
        text={isEditing ? 'Edit Property' : 'Property Details'}
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
              <TouchableOpacity onPress={shareProperty} className="p-2 mr-2">
                <Feather name="share-2" size={24} color="#2C3E50" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setIsEditing(true)} className="p-2">
                <Feather name="edit" size={24} color="#2C3E50" />
              </TouchableOpacity>
            </View>
          )
        }
      />

      <ScrollView className="flex-1">
        <View className="px-6 pb-4">
          {/* Property Reference Badge */}
          <View className="my-4 flex-row justify-between items-center">
            <View className="bg-blue-100 rounded-full px-4 py-1">
              <Text className="text-blue-700 font-medium">Ref: {property?.propertyRefNo}</Text>
            </View>
            
            <View className="bg-green-100 rounded-full px-4 py-1">
              <Text className="text-green-700 font-medium">{property?.type}</Text>
            </View>
          </View>

          {/* Form Container - Basic Information */}
          <View className="bg-white rounded-2xl shadow-md p-6 mb-6">
            <Text className="text-xl font-bold text-gray-800 mb-4">Basic Information</Text>

            {/* Property Reference */}
            {isEditing && (
              <View className="mb-5">
                <Text className="text-gray-700 font-semibold mb-2 text-base">Property Reference</Text>
                <ReferenceNumber
                  prefix="PROP"
                  value={propertyData.property_ref_no}
                  onChange={(text) => setPropertyData({ ...propertyData, property_ref_no: text })}
                  editable={false}
                  className="bg-gray-100"
                />
              </View>
            )}

            {/* Payer to whom the property belong */}
            <View className="mb-5">
              <Text className="text-gray-700 font-semibold mb-2 text-base">Owner</Text>
              {isEditing ? (
                <SelectPayer
                  value={propertyData.payer}
                  onVendorSelect={(vendor) => {
                    setPropertyData({
                      ...propertyData, payer: vendor
                    });
                  }}
                  className="bg-white rounded-lg"
                />
              ) : (
                <View className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                  <Text className="text-blue-700 font-bold text-base">{owner?.firstName} {owner?.lastName}</Text>
                  {owner?.tin && (
                    <View className="flex-row items-center mt-2">
                      <Feather name="credit-card" size={14} color="#4B5563" />
                      <Text className="text-gray-600 ml-2">TPIN: {owner.tin}</Text>
                    </View>
                  )}
                  {owner?.address && (
                    <View className="flex-row items-center mt-1">
                      <Feather name="map-pin" size={14} color="#4B5563" />
                      <Text className="text-gray-600 ml-2">{owner.address}</Text>
                    </View>
                  )}
                  {owner?.phoneNumber && (
                    <View className="flex-row items-center mt-1">
                      <Feather name="phone" size={14} color="#4B5563" />
                      <Text className="text-gray-600 ml-2">{owner.phoneNumber}</Text>
                    </View>
                  )}
                </View>
              )}
            </View>

            {/* Address */}
            <View className="mb-5">
              <Text className="text-gray-700 font-semibold mb-2 text-base">Address</Text>
              {isEditing ? (
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
              ) : (
                <View className="border border-gray-200 rounded-xl bg-gray-50 p-4">
                  <View className="flex-row">
                    <Ionicons name="location-outline" size={20} color="#4B5563" />
                    <Text className="text-gray-700 ml-2">{property?.address || 'No address provided'}</Text>
                  </View>
                </View>
              )}
              {isEditing && (
                <Text className="text-xs text-gray-500 ml-1">Full address including street, city and postal code</Text>
              )}
            </View>

            {/* Geolocation */}
            <View className="mb-1">
              <Text className="text-gray-700 font-semibold mb-2 text-base">Property Code</Text>
              {isEditing ? (
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
              ) : (
                <View className="border border-gray-200 rounded-xl bg-gray-50 p-4">
                  <View className="flex-row">
                    <Ionicons name="map-outline" size={20} color="#4B5563" />
                    <Text className="text-gray-700 ml-2">{property?.geolocation || 'No code provided'}</Text>
                  </View>
                </View>
              )}
            </View>
          </View>

          {/* Financial Details Section */}
          <View className="bg-white rounded-2xl shadow-md p-6 mb-6">
            <Text className="text-xl font-bold text-gray-800 mb-4">Financial Information</Text>

            {/* Current Assessed Value */}
            <View className="mb-5">
              <Text className="text-gray-700 font-semibold mb-2 text-base">Current Assessed Value</Text>
              {isEditing ? (
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
              ) : (
                <View className="border border-gray-200 rounded-xl bg-gray-50 p-4">
                  <View className="flex-row">
                    <Ionicons name="cash-outline" size={20} color="#4B5563" />
                    <Text className="text-gray-700 ml-2">
                      {property?.currentAssessValue ? property.currentAssessValue.toFixed(2) : '0.00'} GMD
                    </Text>
                  </View>
                </View>
              )}
            </View>

            {/* Assessed Payment */}
            <View className="mb-5">
              <Text className="text-gray-700 font-semibold mb-2 text-base">Assessed Payment</Text>
              {isEditing ? (
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
              ) : (
                <View className="border border-gray-200 rounded-xl bg-gray-50 p-4">
                  <View className="flex-row">
                    <Ionicons name="cash-outline" size={20} color="#4B5563" />
                    <Text className="text-gray-700 ml-2">
                      {property?.assessPayment ? property.assessPayment : '0.00'} GMD
                    </Text>
                  </View>
                </View>
              )}
            </View>

            {/* Payment Expiry Date */}
            <View>
              <Text className="text-gray-700 font-semibold mb-2 text-base">Payment Due Date</Text>
              {isEditing ? (
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
              ) : (
                <View className="border border-gray-200 rounded-xl bg-gray-50 p-4">
                  <View className="flex-row">
                    <Ionicons name="calendar-outline" size={20} color="#4B5563" />
                    <Text className="text-gray-700 ml-2">
                      {formatDate(property?.paymentExpiryDate)}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </View>

          {/* Property Details Section */}
          <View className="bg-white rounded-2xl shadow-md p-6 mb-6">
            <Text className="text-xl font-bold text-gray-800 mb-4">Property Specifications</Text>

            {/* Property Type */}
            <View className="mb-5">
              <Text className="text-gray-700 font-semibold mb-2 text-base">Property Type</Text>
              {isEditing ? (
                <DropdownComponent 
                  data={transformedPropertyTypes}
                  onChange={(value) => setPropertyData({ ...propertyData, type: value })}
                  placeholder="Select Type"
                  isSearchable={false}
                  value={transformedPropertyTypes.find(type => type.value === propertyData.type)}
                  leftIcon={<Ionicons name="business-outline" size={20} color="#4B5563" className='mr-3'/>}
                />
              ) : (
                <View className="border border-gray-200 rounded-xl bg-gray-50 p-4">
                  <View className="flex-row">
                    <Ionicons name="business-outline" size={20} color="#4B5563" />
                    <Text className="text-gray-700 ml-2">{property?.type || 'Not specified'}</Text>
                  </View>
                </View>
              )}
            </View>

            {/* Notes */}
            <View className="mb-5">
              <Text className="text-gray-700 font-semibold mb-2 text-base">Notes</Text>
              {isEditing ? (
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
              ) : (
                <View className="border border-gray-200 rounded-xl bg-gray-50 p-4">
                  <Text className="text-gray-700">
                    {property?.notes || 'No notes provided'}
                  </Text>
                </View>
              )}
            </View>

            {/* Images */}
            <View>
              <Text className="text-gray-700 font-semibold mb-2 text-base">Images</Text>
              <View className="p-4 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 mb-4 items-center justify-center">
                {!property?.images ? 
                  <> 
                    <Ionicons name="images-outline" size={40} color="#6B7280" />
                    <Text className="text-gray-500 mt-2 text-center">No images available</Text>
                    </> : 
                    <Image source={{uri: propertyData.images}} className='h-20 w-20' />
                }
                {isEditing && (
                  <TouchableOpacity className="mt-3 bg-gray-200 rounded-lg px-4 py-2">
                    <Text className="text-gray-700 font-medium">Select Images</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          {isEditing ? (
            <View className="flex-row space-x-4 mb-8">
              <TouchableOpacity
                className="bg-red-500 rounded-xl p-4 flex-1 shadow-md"
                onPress={handleDeleteProperty}
              >
                <View className="flex-row items-center justify-center">
                  <Feather name="trash-2" size={20} color="white" />
                  <Text className="text-white font-bold text-base ml-2">Delete</Text>
                </View>
              </TouchableOpacity>
              
              <TouchableOpacity
                className="bg-blue-600 rounded-xl p-4 flex-1 shadow-md"
                onPress={handleUpdateProperty}
              >
                <View className="flex-row items-center justify-center">
                  <Feather name="check" size={20} color="white" />
                  <Text className="text-white font-bold text-base ml-2">Save Changes</Text>
                </View>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              className="bg-blue-500 rounded-xl p-4 mb-8 shadow-md"
              onPress={() => setIsEditing(true)}
            >
              <View className="flex-row items-center justify-center">
                <Feather name="edit-2" size={20} color="white" />
                <Text className="text-white font-bold text-base ml-2">Edit Property</Text>
              </View>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}