import React from 'react';
import {
  SafeAreaView,
  StatusBar,
} from 'react-native';
import DashboardActionTiles from '~/components/DashboardActionTiles';
import DashboardStats from '~/components/DashboardStats';
import Header from '~/components/Header';
import useAuthStore from '~/store/authStore';

const Home = () => {
  const { userData } = useAuthStore();

  return (
    <SafeAreaView className='flex-1 bg-background'>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F7FA" />
      {/* Header */}
      <Header 
        text={`Hello ${userData?.first_name} ${userData?.last_name}`}
        showBackButton={false}
      />

      {/* Task Statistics */}
      <DashboardStats />
      
      {/* Quick Actions */}
      <DashboardActionTiles />
    </SafeAreaView>
  );
};

export default Home;