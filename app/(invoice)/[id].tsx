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
    Share
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';

import database, { invoicesCollection, payersCollection } from '~/db';
import SelectPayer from '~/components/SelectPayer';
import Header from '~/components/Header';
import DatePicker from '~/components/DatePicker';
import Invoice from '~/db/model/Invoice';
import { INVOICE_STATUS } from '~/services/constants';
import StatusModal from '~/components/modals/Status';
import useAuthStore from '~/store/authStore';
import ReferenceNumber from '~/components/ReferenceNumber';
import { Q } from '@nozbe/watermelondb';

const InvoiceDetailScreen = () => {
    const { id } = useLocalSearchParams();
    const [isLoading, setIsLoading] = useState(true);
    const [invoice, setInvoice] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    
    // Form state
    const [selectedVendor, setSelectedVendor] = useState(null);
    const [amount, setAmount] = useState('');
    const [reference, setReference] = useState(null);
    const [date, setDate] = useState(new Date());
    const [description, setDescription] = useState('');
    const [status, setStatus] = useState('');

    // Modals
    const [successModalVisible, setSuccessModalVisible] = useState(false);
    const [errorModalVisible, setErrorModalVisible] = useState(false);

    useEffect(() => {
        fetchInvoiceData();
    }, [id]);

    const fetchInvoiceData = async () => {
        try {
            setIsLoading(true);
            
            // Fetch the invoice by ID
            const invoiceRecord = await invoicesCollection.query(
                Q.where('ref_no', id)
            ).fetch().then(records => records[0]);
            setInvoice(invoiceRecord);
            
            // Get the payer information (you'll need to implement or modify this part based on your data structure)
            const payer = await payersCollection.query(
                Q.where('id', invoiceRecord.payerId)
            ).fetch().then(records => records[0]);
            if (payer.length === 0) {
                Alert.alert("Error", "Payer not found");
                setIsLoading(false);
                return;
            }
            const payerData = payer;
            
            // Populate form data
            setSelectedVendor({
                value: payerData.id,
                id: payerData.id,
                name: payerData.firstName + ' ' + payerData.lastName,
                address: payerData.businessType,
                phoneNumber: payerData.phone,
                tpin: payerData.tin,
            });
            
            setAmount(invoiceRecord.amountDue.toString());
            setReference(invoiceRecord.ref_no);
            setDate(new Date(invoiceRecord.dueDate));
            setDescription(invoiceRecord.notes);
            setStatus(invoiceRecord.status);
            
            setIsLoading(false);
        } catch (error) {
            console.error("Error fetching invoice:", error);
            Alert.alert("Error", "Could not load invoice details");
            setIsLoading(false);
        }
    };

    const handleEditToggle = () => {
        if (isEditing) {
            // If currently editing, ask for confirmation before discarding changes
            Alert.alert(
                "Discard Changes?",
                "You have unsaved changes. Are you sure you want to discard them?",
                [
                    { text: "Continue Editing", style: "cancel" },
                    { text: "Discard", onPress: () => {
                        setIsEditing(false);
                        fetchInvoiceData(); // Reset form data to original values
                    }}
                ]
            );
        } else {
            // Start editing
            setIsEditing(true);
        }
    };

    const updateInvoice = async () => {
        if (!selectedVendor) {
            Alert.alert('Error', 'Please select a vendor');
            return;
        }

        if (!amount || parseFloat(amount) <= 0) {
            Alert.alert('Error', 'Please enter a valid amount');
            return;
        }

        try {
            await database.write(async () => {
                await invoice.update(updatedInvoice => {
                    updatedInvoice.payerId = selectedVendor.value;
                    updatedInvoice.amountDue = parseFloat(amount);
                    updatedInvoice.dueDate = Date.parse(date);
                    updatedInvoice.notes = description;
                });
            });
            
            setSuccessModalVisible(true);
            setIsEditing(false);
            fetchInvoiceData(); // Refresh data
        } catch (error) {
            console.error("Error updating invoice:", error);
            setErrorModalVisible(true);
        }
    };

    // Handle vendor selection
    const selectVendor = (vendor) => {
        setSelectedVendor(vendor);
    };

    // Share invoice details
    const shareInvoice = async () => {
        try {
            const message = `
Invoice #${reference}
Payer: ${selectedVendor?.name}
Amount: $${amount}
Due Date: ${formatDate(date)}
Status: ${status}
${description ? `Description: ${description}` : ''}
            `;
            
            await Share.share({
                message,
                title: `Invoice #${reference}`,
            });
        } catch (error) {
            Alert.alert('Error', 'Failed to share invoice');
        }
    };

    // Format date to string
    const formatDate = (date) => {
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Get status color
    const getStatusColor = (status) => {
        switch (status) {
            case INVOICE_STATUS.PAID:
                return 'bg-green-100 text-green-700 border-green-200';
            case INVOICE_STATUS.OVERDUE:
                return 'bg-red-100 text-red-700 border-red-200';
            case INVOICE_STATUS.PENDING:
                return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case INVOICE_STATUS.UNPAID:
            default:
                return 'bg-blue-100 text-blue-700 border-blue-200';
        }
    };

    if (isLoading) {
        return (
            <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center">
                <ActivityIndicator size="large" color="#3B82F6" />
                <Text className="mt-4 text-gray-600">Loading invoice details...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <StatusBar backgroundColor="#2C3E50" barStyle="light-content" />
            <Header
                text={isEditing ? "Edit Invoice" : "Invoice Details"}
                className="border-b border-gray-200 shadow-sm"
                leftButton={{
                    icon: "arrow-left",
                    onPress: () => router.back()
                }}
                rightButton={{
                    icon: isEditing ? "x" : "edit-2",
                    onPress: handleEditToggle
                }}
            />

            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                className="flex-1"
            >
                <ScrollView className="flex-1">
                    <View className="p-6 pt-0">
                        {/* Invoice ID and Status Header */}
                        <View className="flex-row justify-between items-center mb-6">
                            <View>
                                <Text className="text-gray-600">Invoice #{reference}</Text>
                                <Text className="text-gray-500 mt-1">Created on {formatDate(new Date(invoice?.date))}</Text>
                            </View>
                            <View className={`px-3 py-1 rounded-full border ${getStatusColor(status)}`}>
                                <Text className={`font-medium ${getStatusColor(status).split(' ')[1]}`}>
                                    {status}
                                </Text>
                            </View>
                        </View>

                        {/* Payer Information Card */}
                        <View className="bg-white rounded-2xl shadow-md p-6 mb-6">
                            <View className="flex-row items-center mb-4 justify-between">
                                <View className="flex-row items-center">
                                    <Feather name="user" size={22} color="#2C3E50" />
                                    <Text className="text-gray-800 font-bold ml-2 text-lg">Payer Information</Text>
                                </View>
                            </View>

                            {/* Payer Selection - Only visible in edit mode */}
                            {isEditing ? (
                                <SelectPayer
                                    onVendorSelect={selectVendor}
                                    value={selectedVendor}
                                    className="mb-3"
                                />
                            ) : null}

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
                                {isEditing ? (
                                    <View className="flex-row items-center border border-gray-200 rounded-xl bg-white px-4">
                                        <Feather name="dollar-sign" size={20} color="#4B5563" />
                                        <TextInput
                                            className="flex-1 py-3 px-3 text-gray-700"
                                            placeholder="0.00"
                                            value={amount}
                                            onChangeText={setAmount}
                                            keyboardType="numeric"
                                            placeholderTextColor="#9CA3AF"
                                        />
                                    </View>
                                ) : (
                                    <View className="flex-row items-center border border-gray-200 rounded-xl bg-gray-50 px-4 py-3">
                                        <Feather name="dollar-sign" size={20} color="#4B5563" />
                                        <Text className="flex-1 ml-3 text-gray-700 font-medium">{parseFloat(amount).toFixed(2)}</Text>
                                    </View>
                                )}
                            </View>

                            {/* Reference Number */}
                            <View className="mb-5">
                                <Text className="text-gray-700 font-semibold mb-2">Reference Number</Text>
                                <ReferenceNumber
                                    prefix="INV"
                                    value={reference}
                                    onChange={setReference}
                                    editable={false}
                                    className="bg-gray-100"
                                />
                                <Text className="text-xs text-gray-500 ml-1 mt-1">Unique payment reference</Text>
                            </View>

                            {/* Due Date */}
                            <View className="mb-5">
                                <Text className="text-gray-700 font-semibold mb-2">Due Date</Text>
                                <View className="flex-row justify-between items-center">
                                    <View className="flex-row items-center border border-gray-200 rounded-xl bg-white px-4 py-3 flex-1 mr-2">
                                        <Feather name="calendar" size={20} color="#4B5563" />
                                        <Text className="text-gray-700 ml-3">{formatDate(date)}</Text>
                                    </View>
                                    {isEditing && (
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
                                    )}
                                </View>
                            </View>

                            {/* Description */}
                            <View>
                                <Text className="text-gray-700 font-semibold mb-2">Description</Text>
                                {isEditing ? (
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
                                ) : (
                                    <View className="border border-gray-200 rounded-xl bg-gray-50 p-4">
                                        <Text className="text-gray-700">{description || "No description provided"}</Text>
                                    </View>
                                )}
                            </View>
                        </View>

                        {/* Action Buttons */}
                        {isEditing ? (
                            <TouchableOpacity
                                className="bg-blue-600 py-4 rounded-xl items-center shadow-md mb-4"
                                onPress={updateInvoice}
                            >
                                <View className="flex-row items-center justify-center space-x-2">
                                    <Feather name="save" size={24} color="white" />
                                    <Text className="text-white font-bold text-lg ml-2">Save Changes</Text>
                                </View>
                            </TouchableOpacity>
                        ) : (
                            <View className="flex-row space-x-3">
                                <TouchableOpacity
                                    className="flex-1 bg-blue-600 py-4 rounded-xl items-center shadow-md mb-4"
                                    onPress={() => setIsEditing(true)}
                                >
                                    <View className="flex-row items-center justify-center">
                                        <Feather name="edit-2" size={20} color="white" />
                                        <Text className="text-white font-bold text-base ml-2">Edit</Text>
                                    </View>
                                </TouchableOpacity>
                                
                                <TouchableOpacity
                                    className="flex-1 bg-gray-200 py-4 rounded-xl items-center shadow-md mb-4"
                                    onPress={shareInvoice}
                                >
                                    <View className="flex-row items-center justify-center">
                                        <Feather name="share" size={20} color="#4B5563" />
                                        <Text className="text-gray-700 font-bold text-base ml-2">Share</Text>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Success Modal */}
            <StatusModal
                visible={successModalVisible}
                type="success"
                title="Invoice Updated Successfully!"
                message="The invoice has been updated successfully."
                onClose={() => setSuccessModalVisible(false)}
                autoCloseTime={3000} // Auto close after 3 seconds
            />

            {/* Error Modal */}
            <StatusModal
                visible={errorModalVisible}
                type="error"
                title="Update Failed"
                message="There was an error while updating the invoice. Please try again."
                onClose={() => setErrorModalVisible(false)}
                autoCloseTime={0} // Don't auto close error modals
            />
        </SafeAreaView>
    );
};

export default InvoiceDetailScreen;