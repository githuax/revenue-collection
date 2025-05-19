import { View, Text, ScrollView, TouchableOpacity } from 'react-native'
import { withObservables } from '@nozbe/watermelondb/react';
import React from 'react'
import { propertiesCollection } from '~/db';
import { Q } from '@nozbe/watermelondb';
import { useLocalSearchParams, router } from 'expo-router';
import Header from '~/components/Header';
import { Ionicons } from '@expo/vector-icons';

interface Property {
    id: string;
    propertyRefNo: string;
    type: string;
    paymentExpiryDate: string;
    description?: string;
    location?: string;
    ownerId: string;
}

function PropertyList({ properties }: { properties: Property[] }) {
    return (
        <View className="flex-1 bg-gray-50">
            <Header text="Properties" />
            <ScrollView className="flex-1">
                <View className="p-4">
                    {properties.map((property) => (
                        <TouchableOpacity 
                            key={property.id}
                            className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100"
                            onPress={() => {
                                router.push(`/(property)/${property.propertyRefNo}`);
                            }}
                        >
                            <View className="flex-row justify-between items-center mb-3">
                                <Text className="text-text/70">Property Reference</Text>
                                <Text className="text-text font-semibold">{property.propertyRefNo}</Text>
                            </View>

                            <View className="flex-row justify-between items-center mb-3">
                                <Text className="text-text/70">Type</Text>
                                <Text className="text-text font-semibold capitalize">{property.type}</Text>
                            </View>

                            <View className="flex-row justify-between items-center mb-3">
                                <Text className="text-text/70">Payment Expiry Date</Text>
                                <Text className="text-text font-semibold">{new Date(property.paymentExpiryDate).toLocaleDateString()}</Text>
                            </View>

                            <View className="flex-row justify-between items-center">
                                <Text className="text-text/70">Location</Text>
                                <Text className="text-text font-semibold">{property.location || 'No location provided'}</Text>
                            </View>
                        </TouchableOpacity>
                    ))}

                    {properties.length === 0 && (
                        <View className="bg-white rounded-xl p-8 mb-3 shadow-sm border border-gray-100 items-center">
                            <Ionicons name="business-outline" size={48} color="#9CA3AF" />
                            <Text className="text-text text-center mt-4">No properties found</Text>
                        </View>
                    )}
                </View>
            </ScrollView>
        </View>
    )
}

const enhance = withObservables(['payerId'], ({ payerId }: { payerId: string }) => ({
    properties: propertiesCollection
        .query(Q.where('owner_id', payerId), Q.sortBy('payment_expiry_date', 'desc'))
        .observe(),
}));

const EnhancedPropertyList = enhance(PropertyList);

// ----------------------
// Wrapper to Extract Params
// ----------------------
export default function PropertyListWrapper() {
    const { id } = useLocalSearchParams();

    return <EnhancedPropertyList payerId={id as string} />;
}