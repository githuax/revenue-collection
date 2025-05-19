import { View, Text, ScrollView, TouchableOpacity } from 'react-native'
import { withObservables } from '@nozbe/watermelondb/react';
import React from 'react'
import { invoicesCollection } from '~/db';
import { Q } from '@nozbe/watermelondb';
import { useLocalSearchParams, router } from 'expo-router';
import Header from '~/components/Header';
import { Ionicons } from '@expo/vector-icons';

interface Invoice {
    id: string;
    ref_no: string;
    amountDue: number;
    dueDate: string;
    status: string;
    description?: string;
}

function InvoiceList({ invoices }: { invoices: Invoice[] }) {
    return (
        <View className="flex-1 bg-gray-50">
            <Header text="Invoices" />
            <ScrollView className="flex-1">
                <View className="p-4">
                    {invoices.map((invoice) => (
                        <TouchableOpacity 
                            key={invoice.id}
                            className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100"
                            onPress={() => {
                                router.push(`/(invoice)/${invoice.ref_no}`);
                            }}
                        >
                            <View className="flex-row justify-between items-center mb-3">
                                <Text className="text-text/70">Invoice ID</Text>
                                <Text className="text-text font-semibold">{invoice.ref_no}</Text>
                            </View>

                            <View className="flex-row justify-between items-center mb-3">
                                <Text className="text-text/70">Amount Due</Text>
                                <Text className="text-text font-semibold">{invoice.amountDue} GMD</Text>
                            </View>

                            <View className="flex-row justify-between items-center mb-3">
                                <Text className="text-text/70">Due Date</Text>
                                <Text className="text-text font-semibold">{new Date(invoice.dueDate).toLocaleDateString()}</Text>
                            </View>

                            <View className="flex-row justify-between items-center">
                                <Text className="text-text/70">Status</Text>
                                <View className="flex-row items-center">
                                    <View className={`w-2 h-2 rounded-full mr-2 ${
                                        invoice.status === 'paid' ? 'bg-green-500' : 
                                        invoice.status === 'pending' ? 'bg-yellow-500' : 
                                        'bg-red-500'
                                    }`} />
                                    <Text className="text-text font-semibold capitalize">{invoice.status}</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))}

                    {invoices.length === 0 && (
                        <View className="bg-white rounded-xl p-8 mb-3 shadow-sm border border-gray-100 items-center">
                            <Ionicons name="document-text-outline" size={48} color="#9CA3AF" />
                            <Text className="text-text text-center mt-4">No invoices found</Text>
                        </View>
                    )}
                </View>
            </ScrollView>
        </View>
    )
}

const enhance = withObservables(['payerId'], ({ payerId }: { payerId: string }) => ({
    invoices: invoicesCollection
        .query(Q.where('payer_id', payerId), Q.sortBy('due_date', 'desc'))
        .observe(),
}));

const EnhancedInvoiceList = enhance(InvoiceList);

// ----------------------
// Wrapper to Extract Params
// ----------------------
export default function InvoiceListWrapper() {
    const { id } = useLocalSearchParams();

    return <EnhancedInvoiceList payerId={id as string} />;
}