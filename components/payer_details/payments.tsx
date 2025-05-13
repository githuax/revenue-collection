import { View, Text, TouchableOpacity } from 'react-native'
import { withObservables } from '@nozbe/watermelondb/react';
import React from 'react'
import { paymentsCollection } from '~/db';
import { Q } from '@nozbe/watermelondb';
import { router } from 'expo-router';
import SectionHeader from './section_header';

function Payments({ payerDetails, payments }) {
    return (
        <View className='p-4'>
            <SectionHeader
                title='Payments'
                addButtonText='+ Add Payment'
                action={() => {
                    router.push({
                        pathname: '/(new_payments)',
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
            {payments.map((payment) => (
                <TouchableOpacity key={payment.id} className='bg-white rounded-lg p-4 mb-3 shadow-sm border border-gray-100'
                    onPress={() => {
                        router.push(`/(payment)/${payment.ref_no}`);
                    }}
                >
                    <Text className='text-text font-semibold'>Payment ID: {payment.ref_no}</Text>
                    <Text className='text-text/70 mt-1'>Amount: ${payment.amount}</Text>
                    <Text className='text-text/70 mt-1'>Date: {payment.created_date}</Text>
                    <Text className='text-text/70 mt-1'>Status: {payment.status}</Text>
                </TouchableOpacity>
            ))}
        </View>
    )
}

const enhance = withObservables(['payerDetails'], ({ payerDetails }) => ({
    payments: paymentsCollection.query(
        Q.where('payer_id', payerDetails.id),
    ).observeWithColumns(
        paymentsCollection.schema.columnArray.map((column) => column.name),
    ),
}));

const EnhancedPayments = enhance(Payments);
export default EnhancedPayments;