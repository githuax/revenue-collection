import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Modal,
  ScrollView
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';

import database from '~/db';

// Mock data for payments
const MOCK_PAYMENTS = [
  { id: '1', vendorName: 'TechSolutions Inc.', amount: 1200, date: '2025-04-15', status: 'Completed', method: 'Bank Transfer', reference: 'PMT-2025-001' },
  { id: '2', vendorName: 'Green Grocery Ltd', amount: 780, date: '2025-04-12', status: 'Completed', method: 'Credit Card', reference: 'PMT-2025-002' },
  { id: '3', vendorName: 'Office Supplies Co.', amount: 1500, date: '2025-04-10', status: 'Pending', method: 'Check', reference: 'PMT-2025-003' },
  { id: '4', vendorName: 'Books & Beyond', amount: 450, date: '2025-04-08', status: 'Completed', method: 'Cash', reference: 'PMT-2025-004' },
  { id: '5', vendorName: 'Urban Clothing', amount: 920, date: '2025-04-05', status: 'Failed', method: 'Bank Transfer', reference: 'PMT-2025-005' },
  { id: '6', vendorName: 'Fresh Foods Market', amount: 650, date: '2025-04-02', status: 'Completed', method: 'Credit Card', reference: 'PMT-2025-006' },
  { id: '7', vendorName: 'Elite Electronics', amount: 2300, date: '2025-03-28', status: 'Completed', method: 'Bank Transfer', reference: 'PMT-2025-007' },
  { id: '8', vendorName: 'TechSolutions Inc.', amount: 1800, date: '2025-03-25', status: 'Completed', method: 'Check', reference: 'PMT-2025-008' },
  { id: '9', vendorName: 'Pet Paradise', amount: 540, date: '2025-03-21', status: 'Pending', method: 'Bank Transfer', reference: 'PMT-2025-009' },
  { id: '10', vendorName: 'Hardware Haven', amount: 1100, date: '2025-03-18', status: 'Completed', method: 'Credit Card', reference: 'PMT-2025-010' },
];

const getPayments = async () => {
  const payments = await database.collections.get('payments').query().fetch();
  return payments;
}

const PaymentRecordScreen = () => {
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({
    amount: '',
    method: '',
    reference: '',
    status: ''
  });
  
  useEffect(() => {
    getPayments().then(data => {
      console.log('Fetched payments:', data);
    })

    // Simulate API fetch
    setTimeout(() => {
      setPayments(MOCK_PAYMENTS);
      setFilteredPayments(MOCK_PAYMENTS);
      setLoading(false);
    }, 1000);
  }, []);

  // Filter payments based on search query and active filter
  useEffect(() => {
    let result = payments;
    
    if (searchQuery) {
      result = result.filter(payment => 
        payment.vendorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payment.reference.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (activeFilter !== 'All') {
      result = result.filter(payment => payment.status === activeFilter);
    }
    
    setFilteredPayments(result);
  }, [searchQuery, activeFilter, payments]);

  const filterOptions = ['All', 'Completed', 'Pending', 'Failed'];

  const getStatusColor = (status) => {
    switch(status) {
      case 'Completed':
        return { bg: 'bg-success/20', text: 'text-success' };
      case 'Pending':
        return { bg: 'bg-warning/20', text: 'text-warning' };
      case 'Failed':
        return { bg: 'bg-error/20', text: 'text-error' };
      default:
        return { bg: 'bg-gray-200', text: 'text-text' };
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const handleViewPayment = (payment) => {
    setSelectedPayment(payment);
    setModalVisible(true);
    setEditMode(false);
  };

  const handleEditPayment = () => {
    setEditMode(true);
    setEditData({
      amount: selectedPayment.amount.toString(),
      method: selectedPayment.method,
      reference: selectedPayment.reference,
      status: selectedPayment.status
    });
  };

  const handleSaveEdit = () => {
    const updatedPayment = {
      ...selectedPayment,
      amount: parseFloat(editData.amount),
      method: editData.method,
      reference: editData.reference,
      status: editData.status
    };

    const updatedPayments = payments.map(payment => 
      payment.id === updatedPayment.id ? updatedPayment : payment
    );

    setPayments(updatedPayments);
    setSelectedPayment(updatedPayment);
    setEditMode(false);
  };

  const renderPaymentItem = ({ item }) => {
    const statusStyle = getStatusColor(item.status);
    
    return (
      <TouchableOpacity 
        className="bg-white rounded-lg p-4 mb-3 shadow-sm border border-gray-100"
        onPress={() => handleViewPayment(item)}
      >
        <View className="flex-row justify-between items-start">
          <View className="flex-1">
            <Text className="text-text text-lg font-semibold">{item.vendorName}</Text>
            <Text className="text-text/70 mt-1">Ref: {item.reference}</Text>
            <Text className="text-text/70 mt-1">{formatDate(item.date)}</Text>
            <View className="flex-row items-center mt-2">
              <Text className="text-text/70 mr-2">{item.method}</Text>
              <View className={`px-2 py-1 rounded-full ${statusStyle.bg}`}>
                <Text className={`text-xs ${statusStyle.text}`}>{item.status}</Text>
              </View>
            </View>
          </View>
          <View className="items-end">
            <Text className="text-primary-dark font-bold">${item.amount.toLocaleString()}</Text>
            <TouchableOpacity className="mt-2">
              <Feather name="chevron-right" size={20} color="#2C3E50" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderPaymentModal = () => {
    if (!selectedPayment) return null;
    
    const statusStyle = getStatusColor(selectedPayment.status);
    
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-xl p-5 h-3/4">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-text text-xl font-bold">
                {editMode ? 'Edit Payment' : 'Payment Details'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Feather name="x" size={24} color="#36454F" />
              </TouchableOpacity>
            </View>
            
            <ScrollView className="flex-1">
              {!editMode ? (
                <View>
                  <View className="mb-4">
                    <Text className="text-text/50 text-sm">Vendor</Text>
                    <Text className="text-text text-lg">{selectedPayment.vendorName}</Text>
                  </View>
                  
                  <View className="mb-4">
                    <Text className="text-text/50 text-sm">Reference</Text>
                    <Text className="text-text text-lg">{selectedPayment.reference}</Text>
                  </View>
                  
                  <View className="flex-row mb-4">
                    <View className="flex-1 mr-2">
                      <Text className="text-text/50 text-sm">Amount</Text>
                      <Text className="text-primary-dark text-lg font-bold">
                        ${selectedPayment.amount.toLocaleString()}
                      </Text>
                    </View>
                    
                    <View className="flex-1 ml-2">
                      <Text className="text-text/50 text-sm">Date</Text>
                      <Text className="text-text text-lg">{formatDate(selectedPayment.date)}</Text>
                    </View>
                  </View>
                  
                  <View className="flex-row mb-4">
                    <View className="flex-1 mr-2">
                      <Text className="text-text/50 text-sm">Payment Method</Text>
                      <Text className="text-text text-lg">{selectedPayment.method}</Text>
                    </View>
                    
                    <View className="flex-1 ml-2">
                      <Text className="text-text/50 text-sm">Status</Text>
                      <View className={`mt-1 px-3 py-1 rounded-full self-start ${statusStyle.bg}`}>
                        <Text className={`${statusStyle.text}`}>{selectedPayment.status}</Text>
                      </View>
                    </View>
                  </View>
                </View>
              ) : (
                <View>
                  <View className="mb-4">
                    <Text className="text-text/50 text-sm mb-1">Vendor</Text>
                    <Text className="text-text text-lg">{selectedPayment.vendorName}</Text>
                  </View>
                  
                  <View className="mb-4">
                    <Text className="text-text/50 text-sm mb-1">Reference</Text>
                    <TextInput
                      className="border border-gray-300 rounded-lg p-2 text-text"
                      value={editData.reference}
                      onChangeText={(text) => setEditData({...editData, reference: text})}
                    />
                  </View>
                  
                  <View className="flex-row mb-4">
                    <View className="flex-1 mr-2">
                      <Text className="text-text/50 text-sm mb-1">Amount</Text>
                      <TextInput
                        className="border border-gray-300 rounded-lg p-2 text-text"
                        value={editData.amount}
                        onChangeText={(text) => setEditData({...editData, amount: text})}
                        keyboardType="numeric"
                      />
                    </View>
                    
                    <View className="flex-1 ml-2">
                      <Text className="text-text/50 text-sm mb-1">Date</Text>
                      <Text className="text-text p-2 border border-gray-300 rounded-lg bg-gray-100">
                        {formatDate(selectedPayment.date)}
                      </Text>
                    </View>
                  </View>
                  
                  <View className="flex-row mb-4">
                    <View className="flex-1 mr-2">
                      <Text className="text-text/50 text-sm mb-1">Payment Method</Text>
                      <View className="border border-gray-300 rounded-lg">
                        <Picker
                          selectedValue={editData.method}
                          onValueChange={(value) => setEditData({...editData, method: value})}
                          className="text-text"
                        >
                          <Picker.Item label="Bank Transfer" value="Bank Transfer" />
                          <Picker.Item label="Credit Card" value="Credit Card" />
                          <Picker.Item label="Cash" value="Cash" />
                          <Picker.Item label="Check" value="Check" />
                        </Picker>
                      </View>
                    </View>
                    
                    <View className="flex-1 ml-2">
                      <Text className="text-text/50 text-sm mb-1">Status</Text>
                      <View className="border border-gray-300 rounded-lg">
                        <Picker
                          selectedValue={editData.status}
                          onValueChange={(value) => setEditData({...editData, status: value})}
                          className="text-text"
                        >
                          <Picker.Item label="Completed" value="Completed" />
                          <Picker.Item label="Pending" value="Pending" />
                          <Picker.Item label="Failed" value="Failed" />
                        </Picker>
                      </View>
                    </View>
                  </View>
                </View>
              )}
            </ScrollView>
            
            <View className="flex-row justify-end pt-4 border-t border-gray-200">
              {!editMode ? (
                <TouchableOpacity
                  className="bg-primary py-3 px-6 rounded-lg"
                  onPress={handleEditPayment}
                >
                  <Text className="text-white font-bold">Edit Payment</Text>
                </TouchableOpacity>
              ) : (
                <View className="flex-row">
                  <TouchableOpacity
                    className="bg-gray-200 py-3 px-6 rounded-lg mr-3"
                    onPress={() => setEditMode(false)}
                  >
                    <Text className="text-text font-bold">Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="bg-secondary py-3 px-6 rounded-lg"
                    onPress={handleSaveEdit}
                  >
                    <Text className="text-white font-bold">Save Changes</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  // For demonstration purposes only - in a real app we'd use a proper Picker component
  const Picker = ({ children, selectedValue, onValueChange }) => {
    return (
      <TouchableOpacity 
        className="p-2"
        onPress={() => {
          // In a real implementation, this would show a proper picker
          console.log('Would show picker with options:', children.map(c => c.props.value));
          
          // For demo purposes, we'll cycle through options when clicked
          const values = children.map(c => c.props.value);
          const currentIndex = values.indexOf(selectedValue);
          const nextIndex = (currentIndex + 1) % values.length;
          onValueChange(values[nextIndex]);
        }}
      >
        <Text>{selectedValue}</Text>
      </TouchableOpacity>
    );
  };
  
  Picker.Item = ({ label, value }) => null;

  return (
    <SafeAreaView className="flex-1 bg-background">
      <StatusBar backgroundColor="#2C3E50" barStyle="light-content" />
      
      {/* Header
      <View className="bg-primary py-4 px-4">
        <Text className="text-white text-xl font-bold">Payment Records</Text>
        <Text className="text-white/80 text-sm">Track and manage tax payments</Text>
      </View> */}
      
      {/* Search Bar */}
      <View className="px-4 pt-4 pb-2">
        <View className="flex-row items-center bg-white rounded-lg px-3 py-2">
          <Feather name="search" size={20} color="#8896A6" />
          <TextInput
            className="flex-1 ml-2 text-text"
            placeholder="Search by payments or reference"
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
      
      {/* Payment List */}
      <View className="flex-1 px-4 py-3">
        {loading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#2C3E50" />
            <Text className="text-text mt-2">Loading payment records...</Text>
          </View>
        ) : filteredPayments.length === 0 ? (
          <View className="flex-1 justify-center items-center">
            <Feather name="alert-circle" size={50} color="#8896A6" />
            <Text className="text-text text-lg mt-4">No payments found</Text>
            <Text className="text-text/70 text-center mt-2">
              Try adjusting your search or filters to find what you're looking for
            </Text>
          </View>
        ) : (
          <>
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-text">
                {filteredPayments.length} {filteredPayments.length === 1 ? 'payment' : 'payments'} found
              </Text>
              <Text className="text-primary-dark font-bold">
                Total: ${filteredPayments.reduce((sum, p) => sum + p.amount, 0).toLocaleString()}
              </Text>
            </View>
            <FlatList
              data={filteredPayments}
              keyExtractor={(item) => item.id}
              renderItem={renderPaymentItem}
              showsVerticalScrollIndicator={false}
            />
          </>
        )}
      </View>
      
      {/* Add Payment FAB */}
      <TouchableOpacity 
        className="absolute bottom-6 right-6 bg-secondary rounded-full w-16 h-16 justify-center items-center shadow-lg"
        onPress={() => {
            router.push('/(new_payments)')
        }}
      >
        <Feather name="plus" size={24} color="white" />
      </TouchableOpacity>
      
      {/* Payment Details Modal */}
      {renderPaymentModal()}
    </SafeAreaView>
  );
};

export default PaymentRecordScreen;