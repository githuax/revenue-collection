import React from 'react';
import {
  SafeAreaView,
  StatusBar,
  View,
  Text,
  TouchableOpacity
} from 'react-native';
import DashboardActionTiles from '~/components/DashboardActionTiles';
import DashboardStats from '~/components/DashboardStats';
import Header from '~/components/Header';
import syncDb from '~/db/sync';
import useAuthStore from '~/store/authStore';

const Home = () => {
  const { userData } = useAuthStore();

  return (
    <SafeAreaView className='flex-1 bg-background'>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F7FA" />
      {/* Header */}
      <Header 
        text={`Hello ${userData?.first_name}`}
        showBackButton={false}
      />

      <TouchableOpacity className='bg-primary/10 rounded-full px-4 py-2 flex-row items-center mx-4 my-2' onPress={() => {
        syncDb();
      }}>
        <Text className='text-primary font-semibold'>Sync</Text>
      </TouchableOpacity>

      {/* Task Statistics */}
      <DashboardStats />
      
      {/* Quick Actions */}
      <DashboardActionTiles />

      {/* <View>
        <View className='flex-row justify-between items-center px-4 py-2'>
          <Text className='text-lg font-semibold'>Quick Actions</Text>
          <TouchableOpacity>
            <Text className='text-blue-500'>See All</Text>
          </TouchableOpacity>
        </View>

        <View className='px-4'>
        </View>
      </View> */}
     {false && ( <>{/* Quick Actions */}
      <View className="mb-6">
          <Text className="text-sm uppercase font-medium text-gray-500 mb-2">Quick Actions</Text>
          
          {/* Create Payment Button */}
          <TouchableOpacity className="bg-gray-200 rounded-lg p-3 mb-3">
            <Text className="text-lg font-medium text-gray-800">CREATE PAYMENT</Text>
          </TouchableOpacity>
          
          {/* Add Payer and Add Property */}
          <View className="flex-row justify-between mb-4">
            <TouchableOpacity className="bg-gray-200 rounded-lg p-3 w-[48%]">
              <Text className="text-base font-medium text-gray-800">ADD PAYER</Text>
            </TouchableOpacity>
            <TouchableOpacity className="bg-gray-200 rounded-lg p-3 w-[48%]">
              <Text className="text-base font-medium text-gray-800">ADD PROPERTY</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Payments */}
        <View className="mb-6">
          <View className="mb-4">
            <Text className="text-base font-medium text-gray-700 mb-1">MOST RECENT PAYMENT 1</Text>
            <Text className="text-base font-medium text-gray-700 mb-1">MOST RECENT PAYMENT 2</Text>
            <Text className="text-base font-medium text-gray-700 mb-1">MOST RECENT PAYMENT 3</Text>
          </View>
        </View>

        {/* Payment Today */}
        <View className="mb-6">
          <Text className="text-base font-medium text-gray-700 mb-2">MY PAYMENT TODAY</Text>
          <View className="bg-gray-200 rounded-lg p-4 mb-3">
            {/* This would contain payment details */}
          </View>
        </View>

        {/* Payment Period Summaries */}
        <View className="flex-row justify-between mb-8">
          <TouchableOpacity className="bg-gray-200 rounded-lg p-3 w-[48%]">
            <Text className="text-sm font-medium text-gray-700">PAYMENTS LAST 7 DAYS</Text>
          </TouchableOpacity>
          <TouchableOpacity className="bg-gray-200 rounded-lg p-3 w-[48%]">
            <Text className="text-sm font-medium text-gray-700">PAYMENTS LAST 30 DAYS</Text>
          </TouchableOpacity>
        </View>
      </>)}
    </SafeAreaView>
  );
};

export default Home;