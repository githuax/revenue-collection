import { View, Text, TouchableOpacity } from 'react-native'
import { withObservables } from '@nozbe/watermelondb/react';
import React from 'react'
import { propertiesCollection } from '~/db';
import { Q } from '@nozbe/watermelondb';
import { router } from 'expo-router';
import PropertyCard from '../PropertyCard';
import SectionHeader from './section_header';


const MOCK_PROPERTIES = [
    {
        id: '1',
        name: 'Follow up on Smith & Co. late filing',
        type: 'Commercial',
        expiryDate: '2025-06-23',
        amount: 12500,
        priority: 'high',
    },
    {
        id: '2',
        name: 'Review Johnson Property tax assessment',
        type: 'Residential',
        expiryDate: '2025-04-24',
        amount: 8750,
        priority: 'medium',
    },
    {
        id: '3',
        name: 'Review Johnson Property tax assessment',
        type: 'Residential',
        expiryDate: '2025-05-02',
        amount: 8750,
        priority: 'medium',
    },
]

function Properties({ payerDetails, properties }) {
    return (
        <View className='p-4'>
            <SectionHeader
                title='Properties Owned'
                addButtonText='+ Add Property'
                action={() => {
                    router.push({
                        pathname: '/(property)/add',
                        params: {
                            payerId: payerDetails?.id,
                            payerName: `${payerDetails?.firstName} ${payerDetails?.lastName}`,
                            payerAddress: payerDetails?.address,
                            payerPhone: payerDetails?.phone,
                            payerTIN: payerDetails?.tin,
                        },
                    });
                }}
            />
            {properties.map((property) => (
                <>
                    <PropertyCard
                        key={property.property_ref_no}
                        property={{
                            id: property.propertyRefNo,
                            title: property.propertyRefNo,
                            type: property.type,
                            expiryDate: property.paymentExpiryDate,
                            amount: property.amount
                        }}
                        onPress={() => { 
                            router.push(`/(property)/${property.id}`);
                        }}
                    />
                </>
            ))}
        </View>
    )
}

const enhance = withObservables(['payerDetails'], ({ payerDetails }) => ({
    properties: propertiesCollection.query(
        Q.where('owner_id', payerDetails.id),
    ).observeWithColumns(
        propertiesCollection.schema.columnArray.map((column) => column.name)
    )
}));

const EnhancedProperties = enhance(Properties);
export default EnhancedProperties;