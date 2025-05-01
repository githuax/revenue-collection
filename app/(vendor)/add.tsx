import { View, Text, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'

import Header from '~/components/Header'
import TextInput from '~/components/TextInput'
import Switch from '~/components/Switch'
import Select from '~/components/Select'
import StatusModal from '~/components/modals/Status'

import database, { payersCollection } from '~/db'
import Payer from '~/db/model/Payer'
import { router } from 'expo-router'

export default function Add() {
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [tin, setTin] = useState<string>('');
  const [isPropertyOwner, setIsPropertyOwner] = useState<boolean>(false);
  const [isVendor, setIsVendor] = useState<boolean>(false);
  const [selectedBusinessTypes, setSelectedBusinessTypes] = useState<string[]>([]);

  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [errorModalVisible, setErrorModalVisible] = useState(false);

  const businessTypeOptions = [
    { label: 'Retail', value: 'retail' },
    { label: 'Wholesale', value: 'wholesale' },
    { label: 'Service', value: 'service' },
    { label: 'Manufacturing', value: 'manufacturing' },
  ];

  const handleBusinessTypeChange = (selectedValues: string[]) => {
    setSelectedBusinessTypes(selectedValues);
    console.log('Selected Business Types:', selectedValues);
  };

  const addPayer = () => {
    database.write(async () => {
      await payersCollection.create((payer: Payer) => {
        payer.firstName = firstName;
        payer.lastName = lastName;
        payer.email = email;
        payer.phone = phone;
        payer.tin = tin;
        payer.propertyOwner = isPropertyOwner;
        payer.vendor = isVendor;
        payer.businessType = selectedBusinessTypes;
      })
    }).then(() => {
      setSuccessModalVisible(true);
    }).catch(() => {
      setErrorModalVisible(true);
    })
  }

  return (
    <View className="flex-1 bg-white">
      <Header text='Add Payer' />

      <View className='flex-1 p-4'>
        <TextInput
          label='First Name'
          placeholder='First Name'
          value={firstName}
          onChangeText={(text) => { setFirstName(text) }}
          onSubmitEditing={() => { }}
          autoCapitalize='words'
          autoCorrect={false}
          keyboardType='default'
        />

        <TextInput
          label='Last Name'
          placeholder='Last Name'
          value={lastName}
          onChangeText={(text => { setLastName(text) })}
          onSubmitEditing={() => { }}
          autoCapitalize='words'
          autoCorrect={false}
          keyboardType='default'
        />

        <TextInput
          label='Email'
          placeholder='Email'
          value={email}
          onChangeText={(text => { setEmail(text) })}
          onSubmitEditing={() => { }}
          autoCapitalize='none'
          autoCorrect={false}
          keyboardType='email-address'
        />

        <TextInput
          label='Phone'
          placeholder='Phone'
          value={phone}
          onChangeText={(text => { setPhone(text) })}
          onSubmitEditing={() => { }}
          autoCapitalize='none'
          autoCorrect={false}
          keyboardType='phone-pad'
        />

        <TextInput
          label='TIN'
          placeholder='TIN'
          value={tin}
          onChangeText={(text => { setTin(text) })}
          onSubmitEditing={() => { }}
          autoCapitalize='words'
          autoCorrect={false}
          keyboardType='default'
        />

        <Select
          options={businessTypeOptions}
          onChange={handleBusinessTypeChange}
        />

        <Text style={{ marginTop: 8 }}>
          Selected Business Types: {selectedBusinessTypes.join(', ')}
        </Text>

        <Switch
          label='Property Owner'
          value={isPropertyOwner}
          onValueChange={(value => { setIsPropertyOwner(value) })}
        />

        <Switch
          label='Is Vendor'
          value={isVendor}
          onValueChange={(value => { setIsVendor(value) })}
        />

        {/* Save button */}
        <TouchableOpacity className='bg-blue-500 rounded-lg p-4 mt-4' onPress={addPayer}>
          <Text className='text-white text-center'>Save</Text>
        </TouchableOpacity>

        {/* Success Modal */}
        <StatusModal
          visible={successModalVisible}
          type="success"
          title="Payer Added Successfully!"
          message="The payer has been added successfully."
          onClose={() => {
            setSuccessModalVisible(false);
            router.back();
          }}
          autoCloseTime={5000} // Auto close after 5 seconds
        />

        {/* Error Modal */}
        <StatusModal
          visible={errorModalVisible}
          type="error"
          title="Payment Failed"
          message="We couldn't process your payment. Please check your payment details and try again."
          onClose={() => setErrorModalVisible(false)}
          autoCloseTime={0} // Don't auto close error modals
        />
      </View>
    </View>
  )
}