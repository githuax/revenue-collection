import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  StatusBar
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { payersCollection } from '~/db';
import { withObservables } from '@nozbe/watermelondb/react';
import Header from '~/components/Header';
import SearchBar from '~/components/SearchBar';

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

const renderVendorItem = ({ item }) => {
  return (
    <TouchableOpacity
      className="bg-white rounded-lg p-4 mb-3 shadow-sm border border-gray-100"
      onPress={() => {
        router.push(`/(vendor)/${item.taxId}`)
      }}
    >
      <View className="flex-row justify-between items-start">
        <View className="flex-1">
          <Text className="text-text text-lg font-semibold">{item.name}</Text>
          <Text className="text-text/70 mt-1">Tax ID: {item.taxId}</Text>
          <Text className="text-text/70 mt-1">Phone: {item.phone}</Text>
          <View className="flex-row items-center mt-2">
            <View
              className={`px-2 py-1 rounded-full ${item.status === 'Active' ? 'bg-success/20' : 'bg-error/20'
                }`}
            >
              <Text
                className={`text-xs ${item.status === 'Active' ? 'text-success' : 'text-error'
                  }`}
              >
                {item.status}
              </Text>
            </View>
          </View>
        </View>
        <View className="items-start">
          <Text className="text-primary-dark font-bold">${(item.balance || '').toLocaleString()}</Text>
          <TouchableOpacity className="mt-2" onPress={() => {

          }}>
            <Feather name="chevron-right" size={20} color="#2C3E50" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  )
};

const VendorScreen = () => {
  const [filterActive, setFilterActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  const filterOptions = ['All', 'My Payers'];

  return (
    <SafeAreaView className="flex-1 bg-background">
      <StatusBar backgroundColor="#2C3E50" barStyle="light-content" />
      <Header
        text='Payers'
        showBackButton={false}
      />

      {/* Search Bar */}
      <SearchBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filterActive={filterActive}
        setFilterActive={setFilterActive}
      />

      {/* Filter Pills */}
      <View className="px-4 py-3">
        {/* <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={filterOptions}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setActiveFilter(item)}
              className={`px-4 py-2 mr-2 rounded-full border ${activeFilter === item
                ? 'bg-primary'
                : 'bg-gray-100'
                }`}
            >
              <Text
                className={`${activeFilter === item
                  ? 'text-white'
                  : 'text-text'
                  }`}
              >
                {item}
              </Text>
            </TouchableOpacity>
          )}
        /> */}
      </View>

      {/* Vendor List */}
      <View className="flex-1 px-4 py-3">
        <EnhancedPayerList
          searchQuery={searchQuery}
        />
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

const PayersList = ({
  searchQuery,
  payers
}) => {
  const [filteredVendors, setFilteredVendors] = useState(payers);

  useEffect(() => {
    let result = payers;

    result = result.map((payer) => ({
      id: payer.id,
      name: payer.firstName + ' ' + payer.lastName,
      phone: payer.phone,
      status: payer.propertyOwner ? 'Active' : 'Inactive',
      taxId: payer.tin,
      balance: 0,
    }));

    if (searchQuery) {
      result = result.filter(payer =>
        payer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payer.taxId.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredVendors(result);
  }, [searchQuery, payers]);

  return (
    <>
      {false ? (
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
            {filteredVendors.length} {filteredVendors.length === 1 ? 'payer' : 'payers'} found
          </Text>
          <FlatList
            data={filteredVendors}
            keyExtractor={(item) => item.id}
            renderItem={renderVendorItem}
            showsVerticalScrollIndicator={false}
          />
        </>
      )}
    </>
  )
}

const enhance = withObservables([], () => ({
  payers: payersCollection.query().observeWithColumns(
    payersCollection.schema.columnArray.map((column) => column.name),
  ),
}));

const EnhancedPayerList = enhance(PayersList);

export default VendorScreen;