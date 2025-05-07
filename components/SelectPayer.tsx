import { View, Text, TouchableOpacity, Alert } from 'react-native'
import React, { useState, useEffect } from 'react'

import DropdownComponent from './DropDown'
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useCameraPermissions } from 'expo-camera';
import { getAllPayers } from '~/services/dbService';

export default function SelectPayer({
    value,
    onVendorSelect
}) {
    const [selectedVendor, setSelectedVendor] = useState(value);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);

    const [scanned, setScanned] = useState(false);

    const [permission, requestPermission] = useCameraPermissions();
    const [hasCameraPermission, setHasCameraPermission] = useState(null);

    const [payers, setPayers] = useState([]);

     // Request camera permissions
      useEffect(() => {
        (async () => {
          const { status } = await requestPermission();
          setHasCameraPermission(status === 'granted');
        })();

        getAllPayers().then((payers) => {
            const transformedPayers = payers.map(payer => ({
                id: payer.id,
                label: payer.firstName + ' ' + payer.lastName,
                name: payer.firstName + ' ' + payer.lastName,
                value: payer.id,
                tpin: payer.tin,
                phoneNumber: payer.phone,
                email: payer.email,
            }));

            setPayers(transformedPayers);
            setSearchResults(transformedPayers);
        })
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
                data={payers}
                valueField='id'
                initialValue={selectedVendor}
                placeholder="Select Payer"
                searchPlaceholder="Search by name, TPIN or phone number"
                onChange={selectVendor}
            />
            </View>
            <TouchableOpacity
                className="flex-row items-center justify-center bg-primary/10 w-[12%] py-3 rounded-lg"
                onPress={() => {
                    if (hasCameraPermission) {
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