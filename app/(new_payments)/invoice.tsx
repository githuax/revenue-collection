import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    SafeAreaView,
    StatusBar,
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    Modal,
    Button
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';

import database, { invoicesCollection } from '~/db';
import SelectPayer from '~/components/SelectPayer';
import Header from '~/components/Header';
import DatePicker from '~/components/DatePicker';
import Invoice from '~/db/model/Invoice';
import { INVOICE_STATUS } from '~/services/constants';
import StatusModal from '~/components/modals/Status';

const NewInvoiceScreen = () => {
    const [selectedVendor, setSelectedVendor] = useState(null);
    const [amount, setAmount] = useState('');
    const [reference, setReference] = useState(`PMT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
    const [date, setDate] = useState(new Date());
    const [description, setDescription] = useState('');

    const [successModalVisible, setSuccessModalVisible] = useState(false);
    const [errorModalVisible, setErrorModalVisible] = useState(false);

    // Generate unique reference number
    const generateReference = () => {
        const prefix = 'PMT';
        const year = new Date().getFullYear();
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        setReference(`${prefix}-${year}-${randomNum}`);
    };

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
            invoicesCollection.create((invoice: Invoice) => {
                invoice.payer = selectVendor;
                invoice.date = Date.now();
                invoice.amountDue = amount;
                invoice.dueDate = date;
                invoice.status = INVOICE_STATUS.UNPAID;
            })
        }).then(() => {
            setSuccessModalVisible(true);
        }).catch((error) => {
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
        <SafeAreaView className="flex-1 bg-background">
            <StatusBar backgroundColor="#2C3E50" barStyle="light-content" />
            <Header
                text="New Invoice"
            />

            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                className="flex-1"
            >
                <ScrollView className="flex-1 px-4 py-4">
                    {/* Vendor Search Section */}
                    <View className="mb-6">
                        <Text className="text-text font-bold mb-2">Payer</Text>
                        <SelectPayer
                            onVendorSelect={selectVendor}
                        />

                        {/* Selected Vendor Info */}
                        {selectedVendor && (
                            <View className="bg-primary/5 p-3 rounded-lg mt-3 border border-primary/20">
                                <Text className="text-primary font-bold">{selectedVendor.name}</Text>
                                <Text className="text-text/70 mt-1">TPIN: {selectedVendor.tpin}</Text>
                                <Text className="text-text/70">{selectedVendor.address}</Text>
                                <Text className="text-text/70">{selectedVendor.phoneNumber}</Text>
                            </View>
                        )}
                    </View>

                    {/* Payment Details Section */}
                    <View className="mb-6">
                        <Text className="text-text font-bold mb-2">Invoice Details</Text>

                        {/* Amount */}
                        <View className="mb-4">
                            <Text className="text-text/70 mb-1">Amount ($)</Text>
                            <TextInput
                                className="bg-white py-3 px-4 rounded-lg border border-gray-300 text-text"
                                placeholder="0.00"
                                value={amount}
                                onChangeText={setAmount}
                                keyboardType="numeric"
                            />
                        </View>

                        {/* Reference Number */}
                        <View className="mb-4">
                            <Text className="text-text/70 mb-1">Reference Number</Text>
                            <View className="flex-row items-center justify-between">
                                <TextInput
                                    className="bg-gray-200 py-3 px-4 rounded-lg border border-gray-300 text-text w-[85%]"
                                    value={reference}
                                    onChangeText={setReference}
                                    editable={false}
                                />
                                <TouchableOpacity
                                    className="bg-primary/10 p-3 rounded-lg"
                                    onPress={generateReference}
                                >
                                    <Feather name="refresh-cw" size={20} color="#2C3E50" />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Date */}
                        <View className="mb-4">
                            <Text className="text-text/70 mb-1">Due Date</Text>
                            <View
                                className='flex-row justify-between items-center'
                            >
                                <View
                                    className="bg-gray-200 py-3 px-4 rounded-lg border border-gray-300 w-[85%]"
                                >
                                    <Text className="text-text">{formatDate(date)}</Text>
                                </View>
                                <DatePicker
                                    activator={({ openPicker }) => (
                                        <TouchableOpacity onPress={openPicker} className='bg-primary/10 rounded-md w-[12%] py-3 flex-row items-center justify-center'>
                                            <Feather name="calendar" size={20} color="#2C3E50" />
                                        </TouchableOpacity>
                                    )}
                                    onChange={setDate}
                                    selectedDate={date}
                                />
                            </View>
                        </View>

                        {/* Description */}
                        <View className="mb-4">
                            <Text className="text-text/70 mb-1">Description (Optional)</Text>
                            <TextInput
                                className="bg-white py-3 px-4 rounded-lg border border-gray-300 text-text"
                                placeholder="Enter payment description"
                                value={description}
                                onChangeText={setDescription}
                                multiline
                                numberOfLines={3}
                                textAlignVertical="top"
                            />
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Submit Button */}
            <View className="p-4 bg-white border-t border-gray-200">
                <TouchableOpacity
                    className="bg-secondary py-4 rounded-lg items-center"
                    onPress={createInvoice}
                >
                    <Text className="text-white font-bold text-lg">Create Invoice</Text>
                </TouchableOpacity>
            </View>

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
    );
};

export default NewInvoiceScreen;