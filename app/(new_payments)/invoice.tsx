import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    SafeAreaView,
    StatusBar,
    Alert,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';

import database, { invoicesCollection } from '~/db';
import SelectPayer from '~/components/SelectPayer';
import Header from '~/components/Header';
import DatePicker from '~/components/DatePicker';
import Invoice from '~/db/model/Invoice';
import { INVOICE_STATUS } from '~/services/constants';
import StatusModal from '~/components/modals/Status';
import { relation } from '@nozbe/watermelondb/decorators';
import useAuthStore from '~/store/authStore';
import ReferenceNumber from '~/components/ReferenceNumber';

const NewInvoiceScreen = () => {
    const { payerId, payerName, payerAddress, payerPhone, payerTIN } = useLocalSearchParams();

    const [selectedVendor, setSelectedVendor] = useState(
        payerId
            ? {
                  value: payerId,
                  id: payerId,
                  name: payerName,
                  location: payerAddress,
                  phoneNumber: payerPhone,
                  tpin: payerTIN,
              }
            : null
    );
    const [amount, setAmount] = useState('');
    const [reference, setReference] = useState(null);
    const [date, setDate] = useState(new Date());
    const [description, setDescription] = useState('');

    const [successModalVisible, setSuccessModalVisible] = useState(false);
    const [errorModalVisible, setErrorModalVisible] = useState(false);

    // Handle vendor selection
    const selectVendor = (vendor) => {
        setSelectedVendor(vendor);
    };

    // Handle payment submission
    const createInvoice = async () => {
        if (!selectedVendor) {
            Alert.alert('Error', 'Please select a vendor');
            return;
        }

        if (!amount || parseFloat(amount) <= 0) {
            Alert.alert('Error', 'Please enter a valid amount');
            return;
        }

        database.write(async () => {
            await invoicesCollection.create((invoice: Invoice) => {
                invoice.payerId = selectedVendor.value;
                invoice.createdBy = useAuthStore.getState().userData?.id || '';
                invoice.date = Date.now();
                invoice.amountDue = parseFloat(amount);
                invoice.dueDate = Date.parse(date);
                invoice.status = INVOICE_STATUS.UNPAID;
                invoice.notes = description;
                invoice.ref_no = reference;
                invoice.lastModifiedDate = Date.now();
            })
        }).then(() => {
            setSuccessModalVisible(true);
        }).catch((error) => {
            console.log(error)
            setErrorModalVisible(true);
        })
    };

    // Format date to string
    const formatDate = (date) => {
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <StatusBar backgroundColor="#2C3E50" barStyle="light-content" />
            <Header
                text="New Invoice"
                className="border-b border-gray-200 shadow-sm"
            />

            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                className="flex-1"
            >
                <ScrollView className="flex-1">
                    <View className="p-6 pt-0">
                        {/* Title Section */}
                        <View className="mb-6">
                            <Text className="text-gray-500 mt-1">Generate a new invoice for your payer</Text>
                        </View>

                        {/* Payer Selection Card */}
                        <View className="bg-white rounded-2xl shadow-md p-6 mb-6">
                            <View className="flex-row items-center mb-4">
                                <Feather name="user" size={22} color="#2C3E50" />
                                <Text className="text-gray-800 font-bold ml-2 text-lg">Payer Information</Text>
                            </View>

                            {/* Payer Selection */}
                            <SelectPayer
                                onVendorSelect={selectVendor}
                                value={selectedVendor}
                                className="mb-3"
                            />

                            {/* Selected Vendor Info */}
                            {selectedVendor && (
                                <View className="bg-blue-50 p-4 rounded-xl mt-3 border border-blue-200">
                                    <Text className="text-blue-700 font-bold text-base">{selectedVendor.name}</Text>
                                    <View className="flex-row items-center mt-2">
                                        <Feather name="credit-card" size={14} color="#4B5563" />
                                        <Text className="text-gray-600 ml-2">TPIN: {selectedVendor.tpin}</Text>
                                    </View>
                                    <View className="flex-row items-center mt-1">
                                        <Feather name="map-pin" size={14} color="#4B5563" />
                                        <Text className="text-gray-600 ml-2">{selectedVendor.location}</Text>
                                    </View>
                                    <View className="flex-row items-center mt-1">
                                        <Feather name="phone" size={14} color="#4B5563" />
                                        <Text className="text-gray-600 ml-2">{selectedVendor.phoneNumber}</Text>
                                    </View>
                                </View>
                            )}
                        </View>

                        {/* Invoice Details Card */}
                        <View className="bg-white rounded-2xl shadow-md p-6 mb-6">
                            <View className="flex-row items-center mb-4">
                                <Feather name="file-text" size={22} color="#2C3E50" />
                                <Text className="text-gray-800 font-bold ml-2 text-lg">Invoice Details</Text>
                            </View>

                            {/* Amount */}
                            <View className="mb-5">
                                <Text className="text-gray-700 font-semibold mb-2">Amount</Text>
                                <View className="flex-row items-center border border-gray-200 rounded-xl bg-white px-4">
                                    {/* <Feather name="dollar-sign" size={20} color="#4B5563" /> */}
                                    <Text className='text-[#4B5563]'>GMD</Text>
                                    <TextInput
                                        className="flex-1 py-3 px-3 text-gray-700"
                                        placeholder="0.00"
                                        value={amount}
                                        onChangeText={setAmount}
                                        keyboardType="numeric"
                                        placeholderTextColor="#9CA3AF"
                                    />
                                </View>
                            </View>

                            {/* Reference Number */}
                            <View className="mb-5">
                                <Text className="text-gray-700 font-semibold mb-2">Reference Number</Text>
                                <ReferenceNumber
                                    prefix="INV"
                                    value={reference}
                                    onChange={setReference}
                                    editable={true}
                                    className="bg-gray-100"
                                />
                                <Text className="text-xs text-gray-500 ml-1 mt-1">Auto-generated unique payment reference</Text>
                            </View>

                            {/* Due Date */}
                            <View className="mb-5">
                                <Text className="text-gray-700 font-semibold mb-2">Due Date</Text>
                                <View className="flex-row justify-between items-center">
                                    <View className="flex-row items-center border border-gray-200 rounded-xl bg-white px-4 py-3 flex-1 mr-2">
                                        <Feather name="calendar" size={20} color="#4B5563" />
                                        <Text className="text-gray-700 ml-3">{formatDate(date)}</Text>
                                    </View>
                                    <DatePicker
                                        activator={({ openPicker }) => (
                                            <TouchableOpacity
                                                onPress={openPicker}
                                                className="bg-blue-100 rounded-xl w-12 h-12 flex-row items-center justify-center"
                                            >
                                                <Feather name="calendar" size={24} color="#3B82F6" />
                                            </TouchableOpacity>
                                        )}
                                        onChange={setDate}
                                        selectedDate={date}
                                    />
                                </View>
                            </View>

                            {/* Description */}
                            <View>
                                <Text className="text-gray-700 font-semibold mb-2">Description</Text>
                                <View className="flex-row items-start border border-gray-200 rounded-xl bg-white px-4">
                                    <Feather name="file-text" size={20} color="#4B5563" className="mt-3" />
                                    <TextInput
                                        className="flex-1 py-3 px-3 text-gray-700"
                                        placeholder="Enter invoice description"
                                        value={description}
                                        onChangeText={setDescription}
                                        multiline
                                        numberOfLines={4}
                                        textAlignVertical="top"
                                        placeholderTextColor="#9CA3AF"
                                    />
                                </View>
                                <Text className="text-xs text-gray-500 ml-1 mt-1">Provide details about goods or services invoiced</Text>
                            </View>
                        </View>

                        {/* Invoice Terms Card - Optional, New Section */}
                        {/* <View className="bg-white rounded-2xl shadow-md p-6 mb-6"> */}
                        {/* <View className="flex-row items-center mb-4">
                                <Feather name="clipboard" size={22} color="#2C3E50" />
                                <Text className="text-gray-800 font-bold ml-2 text-lg">Invoice Terms</Text>
                            </View> */}

                        {/* Payment Terms - Optional New Field */}
                        {/* <View className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
                                <View className="flex-row items-center">
                                    <Feather name="info" size={16} color="#D97706" />
                                    <Text className="text-yellow-700 font-semibold ml-2">Payment Terms</Text>
                                </View>
                                <Text className="text-gray-600 mt-1">Due within 30 days of invoice date. Late payments may incur additional fees.</Text>
                            </View> */}
                        {/* </View> */}

                        <TouchableOpacity
                            className="bg-blue-600 py-4 rounded-xl items-center shadow-md"
                            onPress={createInvoice}
                        >
                            <View className="flex-row items-center justify-center space-x-2">
                                <Feather name="check-circle" size={24} color="white" />
                                <Text className="text-white font-bold text-lg ml-2">Create Invoice</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Success Modal */}
            <StatusModal
                visible={successModalVisible}
                type="success"
                title="Invoice Created Successfully!"
                message="The invoice has been added successfully."
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
                title="Invoice Creation Failed"
                message="There was an error while creating the invoice. Please Try again."
                onClose={() => setErrorModalVisible(false)}
                autoCloseTime={0} // Don't auto close error modals
            />
        </SafeAreaView>
    )
};

export default NewInvoiceScreen;