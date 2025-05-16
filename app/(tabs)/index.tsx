import React from 'react';
import {
  SafeAreaView,
  StatusBar,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import PaymentsMonth from '~/components/dashboard/payments_month';
import PaymentsToday from '~/components/dashboard/payments_today';
import PaymentsWeek from '~/components/dashboard/payments_week';
import RecentPayments from '~/components/dashboard/recent_payments';
import DashboardActionTiles from '~/components/DashboardActionTiles';
import DashboardStats from '~/components/DashboardStats';
import Header from '~/components/Header';
import syncDb from '~/db/sync';
import useAuthStore from '~/store/authStore';

const Home = () => {
  const { userData } = useAuthStore();

  if (!userData) {
    return (
      <SafeAreaView className='flex-1 bg-background'>
        <StatusBar barStyle="dark-content" backgroundColor="#F5F7FA" />
        <View className='flex-1 justify-center items-center'>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className='flex-1 bg-background'>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F7FA" />
      <ScrollView>
        {/* Header */}
        <Header
          text={`Hello ${userData?.first_name}`}
          showBackButton={false}
        />

        {/* Sync Database */}
        {/* <TouchableOpacity
          className='absolute top-0 right-0 p-4'
          onPress={async () => {
            try {
              await syncDb();
            } catch (error) {
              console.error('Error syncing database:', error);
            }
          }}
        >
          <Text className='text-sm text-gray-500'>Sync DB</Text>
        </TouchableOpacity> */}

        {/* Task Statistics */}
        {/* <DashboardStats /> */}

        {/* Quick Actions */}
        <DashboardActionTiles />

        {/* Recent Payments */}
        <RecentPayments />

        <PaymentsToday
          userID={userData?.id}
        />

        <View className='flex-row justify-between items-center px-4 py-2'>
          <PaymentsWeek
            userID={userData?.id || ''}
          />
          <PaymentsMonth
            userID={userData?.id || ''}
          />
        </View>

      </ScrollView>

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
      {false && (<>{/* Quick Actions */}
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