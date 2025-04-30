import { View, Text, Switch as RNSwitch } from 'react-native';
import React from 'react';

interface SwitchProps {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}

export default function Switch({ label, value, onValueChange }: SwitchProps) {
  return (
    <View className='flex-row items-center justify-between p-4'>
      <Text className='text-base'>{label}</Text>
      <RNSwitch value={value} onValueChange={onValueChange} />
    </View>
  );
}