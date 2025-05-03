import { View, Text, TextInput as RNTextInput } from 'react-native'
import React from 'react'

type TextInputProps = {
    label: string;
    placeholder: string;
    value: string;
    onChangeText: (text: string) => void;
    onSubmitEditing?: () => void;
    secureTextEntry?: boolean;
    autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
    autoCorrect?: boolean;
    icon?: React.ReactNode;
    keyboardType?: 
        | 'default'
        | 'email-address'
        | 'numeric'
        | 'phone-pad'
        | 'ascii-capable'
        | 'numbers-and-punctuation'
        | 'url'
        | 'name-phone-pad'
        | 'decimal-pad'
        | 'twitter'
        | 'web-search'
        | undefined;
    returnKeyType?: 
        | 'done'
        | 'go'
        | 'next'
        | 'search'
        | 'send';
}

export default function TextInput({
    label,
    placeholder,
    value,
    onChangeText,
    onSubmitEditing,
    icon,
    secureTextEntry = false,
    autoCapitalize = 'none',
    autoCorrect = false,
    keyboardType = 'default',
    returnKeyType = 'done',
}: TextInputProps) {
  return (
    <>
        {label && <Text className='text-gray-700 font-semibold mb-2'>{label}</Text>}
        <View className='flex-row items-center border border-gray-200 rounded-xl bg-white px-4 h-12'>
            {icon && <View className='mr-2'>{icon}</View>}
            <RNTextInput 
                placeholder={placeholder}
                value={value}
                onChangeText={onChangeText}
                onSubmitEditing={onSubmitEditing}
                secureTextEntry={secureTextEntry}
                autoCapitalize={autoCapitalize}
                autoCorrect={autoCorrect}
                keyboardType={keyboardType}
                returnKeyType={returnKeyType}
            />
        </View>
    </>
  )
}