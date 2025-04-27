import { View, Text, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import { Feather } from '@expo/vector-icons'

export default function Payment({ payment }) {
    const [ modalVisible, setModalVisible ] = useState(false);
    const [ selectedPayment, setSelectedPayment ] = useState(null);
    const [ editMode, setEditMode ] = useState(false);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric', 
          year: 'numeric' 
        });
      };

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
    
    const handleViewPayment = (payment) => {
        setSelectedPayment(payment);
        setModalVisible(true);
        setEditMode(false);
    };

    const statusStyle = getStatusColor(payment.status);

    return (
        <TouchableOpacity
            className="bg-white rounded-lg p-4 mb-3 shadow-sm border border-gray-100"
            onPress={() => handleViewPayment(payment)}
        >
            <View className="flex-row justify-between items-start">
                <View className="flex-1">
                    <Text className="text-text text-lg font-semibold">{payment.vendorName}</Text>
                    <Text className="text-text/70 mt-1">Ref: {payment.reference}</Text>
                    <Text className="text-text/70 mt-1">{formatDate(payment.date)}</Text>
                    <View className="flex-row items-center mt-2">
                        <Text className="text-text/70 mr-2">{payment.method}</Text>
                        <View className={`px-2 py-1 rounded-full ${statusStyle.bg}`}>
                            <Text className={`text-xs ${statusStyle.text}`}>{payment.status}</Text>
                        </View>
                    </View>
                </View>
                <View className="items-end">
                    <Text className="text-primary-dark font-bold">${payment.amount.toLocaleString()}</Text>
                    <TouchableOpacity className="mt-2">
                        <Feather name="chevron-right" size={20} color="#2C3E50" />
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableOpacity>
    )
}