import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';

interface ReferenceNumberProps {
  prefix?: string;
  value: string;
  onChange: (value: string) => void;
  editable?: boolean;
  className?: string;
}

const ReferenceNumber: React.FC<ReferenceNumberProps> = ({
  prefix = 'REF',
  value,
  onChange,
  editable = false,
  className = '',
}) => {
  // Generate unique reference number
  const generateReference = () => {
    const year = new Date().getFullYear();
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const newReference = `${prefix}-${year}-${randomNum}`;
    onChange(newReference);
  };

  // Generate reference number on mount
  useEffect(() => {
    if (!value) {
      generateReference();
    }
  }, []);

  return (
    <View className="flex-row items-center justify-between">
      <TextInput
        className={`bg-gray-200 py-3 px-4 rounded-lg border border-gray-300 text-text w-[85%] ${className}`}
        value={value}
        onChangeText={onChange}
        editable={false}
      />
      <TouchableOpacity
        disabled={!editable}
        className="bg-primary/10 p-3 rounded-lg"
        onPress={generateReference}
      >
        <Feather name="refresh-cw" size={20} color="#2C3E50" />
      </TouchableOpacity>
    </View>
  );
};

export default ReferenceNumber;
