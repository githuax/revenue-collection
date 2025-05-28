import { View, Text, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Ionicons, MaterialIcons, Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Network from 'expo-network';
import syncDb from '~/db/sync';

type HeaderProps = {
  text: string;
  showBackButton?: boolean;
  rightComponent?: React.ReactNode;
  leftComponent?: React.ReactNode;
};

export default function Header({ text, showBackButton = true, rightComponent, leftComponent }: HeaderProps) {
  const [connectionType, setConnectionType] = useState<string | null>(null);

  useEffect(() => {
    const getNetworkStatus = async () => {
      const status = await Network.getNetworkStateAsync();
      setConnectionType(status.type);
      if(status.isConnected) {
        syncDb();
      }
    };

    getNetworkStatus();
    const interval = setInterval(getNetworkStatus, 5000);

    return () => clearInterval(interval);
  }, []);

  const renderWifiIcon = () => {
    
    if (connectionType === Network.NetworkStateType.WIFI) {
      return <Ionicons name="wifi" size={20} color="green" />;
    } else if (connectionType === Network.NetworkStateType.CELLULAR) {
      return <MaterialIcons name="signal-cellular-alt" size={20} color="orange" />;
    } else if (connectionType === Network.NetworkStateType.NONE) {
      return <Feather name="wifi-off" size={20} color="red" />;
    } else {
      return <Ionicons name="help-circle" size={20} color="gray" />;
    }
  };

  return (
    <View className='flex-row items-center justify-between p-4 bg-background'>
      <View className='flex-row items-center'>
        {(router.canGoBack() && showBackButton) && (
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color="black" className='mr-3' />
          </TouchableOpacity>
        )}
        <Text className='text-2xl font-bold tracking-wider'>{text}</Text>
      </View>
      <View className='flex-row items-center'>
        {rightComponent}
        {renderWifiIcon()}
      </View>
    </View>
  );
}
