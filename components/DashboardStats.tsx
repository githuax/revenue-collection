import React, {useEffect, useState} from 'react';
import { View, Text } from 'react-native';
import { Ionicons,MaterialCommunityIcons,Feather } from '@expo/vector-icons';
import { getDashboardStats } from '~/services/dbService';

// Format currency values to include commas and dollar sign
const formatCurrency = (amount) => {
  return `$${amount.toLocaleString()}`;
};

const DashboardStats = () => {
    const [financialData, setFinancialData] = useState({
        totalAmountDue: 0,
        totalAmountLeft: 0,
        totalAmountPaid: 0,
        totalInvoices: 0,
        totalPayments: 0
    });

    const percentagePaid = (financialData.totalAmountPaid / financialData.totalAmountDue * 100).toFixed(1);

    useEffect(() => {
        getDashboardStats().then(data => {
            setFinancialData(data);
        })
    }, [])

  return (
    <View className="p-4 bg-gray-100">
      {/* Main Summary Tile */}
      <View className="bg-white rounded-xl shadow p-5 mb-4">
        <View className="flex-row justify-between items-center mb-6">
          <View>
            <Text className="text-xs font-medium text-gray-500">Total Amount Due</Text>
            <Text className="text-2xl font-bold text-gray-800">{formatCurrency(financialData.totalAmountDue)}</Text>
          </View>
          <View className="bg-blue-100 p-3 rounded-full">
            <MaterialCommunityIcons name="currency-usd" size={24} color="#3b82f6" />
          </View>
        </View>
        
        {/* Progress bar */}
        <View className="mb-2">
          <View className="w-full bg-gray-200 rounded-full h-2">
            <View 
              className="bg-blue-500 rounded-full h-2" 
              style={{ width: `${percentagePaid}%` }} 
            />
          </View>
        </View>
        
        <View className="flex-row justify-between">
          <Text className="text-xs text-gray-500">{`${percentagePaid}% Paid`}</Text>
          <Text className="text-xs text-gray-500">{formatCurrency(financialData.totalAmountPaid)} of {formatCurrency(financialData.totalAmountDue)}</Text>
        </View>
      </View>
      
      {/* Stats Grid */}
      <View className="flex-row flex-wrap justify-between">
        {/* Amount Left Tile */}
        <View className="bg-white rounded-xl shadow p-4 mb-4 w-[48%]">
          <View className="flex-row justify-between items-center">
            <View>
              <Text className="text-xs font-medium text-gray-500">Amount Left</Text>
              <Text className="text-xl font-bold text-gray-800">{formatCurrency(financialData.totalAmountLeft)}</Text>
            </View>
            <View className="bg-red-100 p-2 rounded-full">
              <Feather name="arrow-up-right" size={16} color="#ef4444" />
            </View>
          </View>
        </View>
        
        {/* Amount Paid Tile */}
        <View className="bg-white rounded-xl shadow p-4 mb-4 w-[48%]">
          <View className="flex-row justify-between items-center">
            <View>
              <Text className="text-xs font-medium text-gray-500">Amount Paid</Text>
              <Text className="text-xl font-bold text-gray-800">{formatCurrency(financialData.totalAmountPaid)}</Text>
            </View>
            <View className="bg-green-100 p-2 rounded-full">
              <Feather name="arrow-down-right" size={16} color="#22c55e" />
            </View>
          </View>
        </View>
        
        {/* Invoices Tile */}
        <View className="bg-white rounded-xl shadow p-4 mb-4 w-[48%]">
          <View className="flex-row justify-between items-center">
            <View>
              <Text className="text-xs font-medium text-gray-500">Total Invoices</Text>
              <Text className="text-xl font-bold text-gray-800">{financialData.totalInvoices}</Text>
            </View>
            <View className="bg-purple-100 p-2 rounded-full">
              <MaterialCommunityIcons name="file-document-outline" size={16} color="#a855f7" />
            </View>
          </View>
        </View>
        
        {/* Payments Tile */}
        <View className="bg-white rounded-xl shadow p-4 mb-4 w-[48%]">
          <View className="flex-row justify-between items-center">
            <View>
              <Text className="text-xs font-medium text-gray-500">Total Payments</Text>
              <Text className="text-xl font-bold text-gray-800">{financialData.totalPayments}</Text>
            </View>
            <View className="bg-yellow-100 p-2 rounded-full">
              <MaterialCommunityIcons name="credit-card-outline" size={16} color="#eab308" />
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

export default DashboardStats;