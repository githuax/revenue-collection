import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator,
  SafeAreaView,
  StatusBar
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';

// Mock data for vendors
const MOCK_VENDORS = [
  { id: '1', name: 'TechSolutions Inc.', phone: '123-456-7890', status: 'Active', taxId: 'TX12345', balance: 2500 },
  { id: '2', name: 'Green Grocery Ltd', phone: '234-567-8901', status: 'Active', taxId: 'TX23456', balance: 1200 },
  { id: '3', name: 'Fitness First', phone: '345-678-9012', status: 'Inactive', taxId: 'TX34567', balance: 0 },
  { id: '4', name: 'Books & Beyond', phone: '456-789-0123', status: 'Active', taxId: 'TX45678', balance: 3200 },
  { id: '5', name: 'Office Supplies Co.', phone: '567-890-1234', status: 'Active', taxId: 'TX56789', balance: 4500 },
  { id: '6', name: 'Elite Electronics', phone: '678-901-2345', status: 'Inactive', taxId: 'TX67890', balance: 750 },
  { id: '7', name: 'Urban Clothing', phone: '789-012-3456', status: 'Active', taxId: 'TX78901', balance: 1800 },
  { id: '8', name: 'Fresh Foods Market', phone: '890-123-4567', status: 'Active', taxId: 'TX89012', balance: 2100 },
  { id: '9', name: 'Pet Paradise', phone: '901-234-5678', status: 'Active', taxId: 'TX90123', balance: 950 },
  { id: '10', name: 'Hardware Haven', phone: '012-345-6789', status: 'Inactive', taxId: 'TX01234', balance: 0 },
];

const VendorScreen = () => {
  const [vendors, setVendors] = useState([]);
  const [filteredVendors, setFilteredVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  
  useEffect(() => {
    // Simulate API fetch
    setTimeout(() => {
      setVendors(MOCK_VENDORS);
      setFilteredVendors(MOCK_VENDORS);
      setLoading(false);
    }, 1000);
  }, []);

  // Filter vendors based on search query and active filter
  useEffect(() => {
    let result = vendors;
    
    if (searchQuery) {
      result = result.filter(vendor => 
        vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vendor.taxId.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (activeFilter !== 'All') {
      result = result.filter(vendor => vendor.status === activeFilter);
    }
    
    setFilteredVendors(result);
  }, [searchQuery, activeFilter, vendors]);

  const filterOptions = ['All', 'My Payers'];

  const renderVendorItem = ({ item }) => (
    <TouchableOpacity 
      className="bg-white rounded-lg p-4 mb-3 shadow-sm border border-gray-100"
    >
      <View className="flex-row justify-between items-center">
        <View className="flex-1">
          <Text className="text-text text-lg font-semibold">{item.name}</Text>
          <Text className="text-text/70 mt-1">Tax ID: {item.taxId}</Text>
          <Text className="text-text/70 mt-1">Phone: {item.phone}</Text>
          <View className="flex-row items-center mt-2">
            <View 
              className={`px-2 py-1 rounded-full ${
                item.status === 'Active' ? 'bg-success/20' : 'bg-error/20'
              }`}
            >
              <Text 
                className={`text-xs ${
                  item.status === 'Active' ? 'text-success' : 'text-error'
                }`}
              >
                {item.status}
              </Text>
            </View>
          </View>
        </View>
        <View className="items-end">
          <Text className="text-primary-dark font-bold">${item.balance.toLocaleString()}</Text>
          <TouchableOpacity className="mt-2" onPress={() => console.log('View vendor details')}>
            <Feather name="chevron-right" size={20} color="#2C3E50" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-background">
      <StatusBar backgroundColor="#2C3E50" barStyle="light-content" />
      
      {/* Header */}
      {/* <View className="bg-primary py-4 px-4">
        <Text className="text-white text-xl font-bold">Vendors</Text>
        <Text className="text-white/80 text-sm">Manage your vendor list</Text>
      </View> */}
      
      {/* Search Bar */}
      <View className="px-4 pt-4 pb-2">
        <View className="flex-row items-center bg-white rounded-lg px-3 py-2">
          <Feather name="search" size={20} color="#8896A6" />
          <TextInput
            className="flex-1 ml-2 text-text"
            placeholder="Search payers by name or tax ID"
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
      </View>
      
      {/* Filter Pills */}
      <View className="px-4 py-3">
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={filterOptions}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setActiveFilter(item)}
              className={`px-4 py-2 mr-2 rounded-full border ${
                activeFilter === item 
                  ? 'bg-primary' 
                  : 'bg-gray-100'
              }`}
            >
              <Text 
                className={`${
                  activeFilter === item 
                    ? 'text-white' 
                    : 'text-text'
                }`}
              >
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>
      
      {/* Vendor List */}
      <View className="flex-1 px-4 py-3">
        {loading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#2C3E50" />
            <Text className="text-text mt-2">Loading payers...</Text>
          </View>
        ) : filteredVendors.length === 0 ? (
          <View className="flex-1 justify-center items-center">
            <Feather name="alert-circle" size={50} color="#8896A6" />
            <Text className="text-text text-lg mt-4">No payers found</Text>
            <Text className="text-text/70 text-center mt-2">
              Try adjusting your search or filters to find what you're looking for
            </Text>
          </View>
        ) : (
          <>
            <Text className="text-text mb-3">
              {filteredVendors.length} {filteredVendors.length === 1 ? 'vendor' : 'vendors'} found
            </Text>
            <FlatList
              data={filteredVendors}
              keyExtractor={(item) => item.id}
              renderItem={renderVendorItem}
              showsVerticalScrollIndicator={false}
            />
          </>
        )}
      </View>
      
      {/* Add Vendor FAB */}
      <TouchableOpacity 
        className="absolute bottom-6 right-6 bg-secondary rounded-full w-16 h-16 justify-center items-center shadow-lg"
        onPress={() => {
          router.push('/(vendor)/add');
        }}
      >
        <Feather name="plus" size={24} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default VendorScreen;