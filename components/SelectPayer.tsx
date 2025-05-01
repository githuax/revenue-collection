import { View, Text, TouchableOpacity, Alert } from 'react-native'
import React, { useState, useEffect } from 'react'

import DropdownComponent from './DropDown'
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useCameraPermissions } from 'expo-camera';

// Mock data for vendors
const MOCK_VENDORS = [
    { id: '1', name: 'TechSolutions Inc.', tpin: 'TP12345', phoneNumber: '555-123-4567', address: '123 Tech Blvd, Silicon Valley' },
    { id: '2', name: 'Green Grocery Ltd', tpin: 'TP23456', phoneNumber: '555-234-5678', address: '456 Green St, Farmville' },
    { id: '3', name: 'Fitness First', tpin: 'TP34567', phoneNumber: '555-345-6789', address: '789 Fitness Ave, Gymtown' },
    { id: '4', name: 'Books & Beyond', tpin: 'TP45678', phoneNumber: '555-456-7890', address: '101 Reader Lane, Bookville' },
    { id: '5', name: 'Office Supplies Co.', tpin: 'TP56789', phoneNumber: '555-567-8901', address: '234 Office Park, Stationery City' },
];

const TRANSFORMED_MOCK_VENDORS = MOCK_VENDORS.map(vendor => ({
    id: vendor.id,
    label: vendor.name,
    name: vendor.name,
    value: vendor.id,
    tpin: vendor.tpin,
    phoneNumber: vendor.phoneNumber,
    address: vendor.address,
}));

export default function SelectPayer({
    onVendorSelect
}) {
    const [selectedVendor, setSelectedVendor] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState(TRANSFORMED_MOCK_VENDORS);

    const [scanned, setScanned] = useState(false);

    const [permission, requestPermission] = useCameraPermissions();
    const [hasCameraPermission, setHasCameraPermission] = useState(null);

     // Request camera permissions
      useEffect(() => {
        (async () => {
          const { status } = await requestPermission();
          setHasCameraPermission(status === 'granted');
        })();
      }, []);


    // Handle search input change
    const handleSearch = (query) => {
        setSearchQuery(query);
        if (query) {
            const filteredResults = TRANSFORMED_MOCK_VENDORS.filter(vendor =>
                vendor.name.toLowerCase().includes(query.toLowerCase()) ||
                vendor.tpin.toLowerCase().includes(query.toLowerCase()) ||
                vendor.phoneNumber.includes(query)
            );
            setSearchResults(filteredResults);
        } else {
            setSearchResults(TRANSFORMED_MOCK_VENDORS);
        }
    };

    // Handle vendor selection
    const selectVendor = (vendor) => {
        setSelectedVendor(vendor);
        setSearchQuery(vendor.name);
        setSearchResults([]);
        if (onVendorSelect) {
            onVendorSelect(vendor);
        }
    };

    return (
        <View className="flex-row items-center justify-between">
            <View className='w-[85%]'>
            <DropdownComponent
                data={TRANSFORMED_MOCK_VENDORS}
                placeholder="Select Payer"
                searchPlaceholder="Search by name, TPIN or phone number"
                onChange={selectVendor}
            />
            </View>
            <TouchableOpacity
                className="p-3"
                onPress={() => {
                    if (hasCameraPermission) {
                        // setShowCamera(true);
                        router.push('/(new_payments)/camera')
                        setScanned(false);
                    } else {
                        Alert.alert('Permission Required', 'Camera permission is required to scan QR codes');
                    }
                }}
            >
                <MaterialCommunityIcons name="qrcode-scan" size={20} color="#2C3E50" />
            </TouchableOpacity>
        </View>
    )
}