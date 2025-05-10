import { View, Text, TouchableOpacity } from 'react-native'
import { withObservables } from '@nozbe/watermelondb/react';
import React from 'react'
import { invoicesCollection } from '~/db';
import { Q } from '@nozbe/watermelondb';
import { router } from 'expo-router';
import SectionHeader from './section_header';

function Invoices({ payerDetails, invoices }) {
    return (
        <View className='p-4'>
            <SectionHeader
                title='Invoices'
                addButtonText='+ Add Invoice'
                action={() => {
                    router.push({
                        pathname: '/(new_payments)/invoice',
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
            {invoices.map((invoice) => (
                <TouchableOpacity key={invoice.id} className='bg-white rounded-lg p-4 mb-3 shadow-sm border border-gray-100'
                    onPress={() => {
                        router.push(`/(invoice)/${invoice.ref_no}`);
                    }}
                >
                    <Text className='text-text font-semibold'>Invoice ID: {invoice.ref_no}</Text>
                    <Text className='text-text/70 mt-1'>Amount: ${invoice.amountDue}</Text>
                    <Text className='text-text/70 mt-1'>Date: {invoice.due_date}</Text>
                    <Text className='text-text/70 mt-1'>Status: {invoice.status}</Text>
                </TouchableOpacity>
            ))}
        </View>
    )
}

const enhance = withObservables(['payerDetails'], ({ payerDetails }) => ({
    invoices: invoicesCollection.query(
        Q.where('payer_id', payerDetails.id),
    ),
}));

const EnhancedInvoices = enhance(Invoices);
export default EnhancedInvoices;