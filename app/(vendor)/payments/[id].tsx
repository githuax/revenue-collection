import { View, Text, ScrollView, TouchableOpacity } from 'react-native'
import { withObservables } from '@nozbe/watermelondb/react';
import React from 'react'
import { paymentsCollection } from '~/db';
import { Q } from '@nozbe/watermelondb';
import { useLocalSearchParams, router } from 'expo-router';
import Header from '~/components/Header';
import { Ionicons } from '@expo/vector-icons';

interface Payment {
    id: string;
    ref_no: string;
    amount: number;
    createdDate: string;
    status: string;
    description?: string;
}

function PaymentList({ payments }: { payments: Payment[] }) {
    return (
        <View className="flex-1 bg-gray-50">
            <Header text="Payments" />
            <ScrollView className="flex-1">
                <View className="p-4">
                    {payments.map((payment) => (
                        <TouchableOpacity 
                            key={payment.id}
                            className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100"
                            onPress={() => {
                                router.push(`/(payment)/${payment.ref_no}`);
                            }}
                        >
                            <View className="flex-row justify-between items-center mb-3">
                                <Text className="text-text/70">Payment ID</Text>
                                <Text className="text-text font-semibold">{payment.ref_no}</Text>
                            </View>

                            <View className="flex-row justify-between items-center mb-3">
                                <Text className="text-text/70">Amount</Text>
                                <Text className="text-text font-semibold">{payment.amount} GMD</Text>
                            </View>

                            <View className="flex-row justify-between items-center mb-3">
                                <Text className="text-text/70">Date</Text>
                                <Text className="text-text font-semibold">{new Date(payment.createdDate).toLocaleDateString()}</Text>
                            </View>

                            <View className="flex-row justify-between items-center">
                                <Text className="text-text/70">Status</Text>
                                <View className="flex-row items-center">
                                    <View className={`w-2 h-2 rounded-full mr-2 ${
                                        payment.status === 'completed' ? 'bg-green-500' : 
                                        payment.status === 'pending' ? 'bg-yellow-500' : 
                                        'bg-red-500'
                                    }`} />
                                    <Text className="text-text font-semibold capitalize">{payment.status}</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))}

                    {payments.length === 0 && (
                        <View className="bg-white rounded-xl p-8 mb-3 shadow-sm border border-gray-100 items-center">
                            <Ionicons name="cash-outline" size={48} color="#9CA3AF" />
                            <Text className="text-text text-center mt-4">No payments found</Text>
                        </View>
                    )}
                </View>
            </ScrollView>
        </View>
    )
}

const enhance = withObservables(['payerId'], ({ payerId }: { payerId: string }) => ({
    payments: paymentsCollection
        .query(Q.where('payer_id', payerId), Q.sortBy('created_date', 'desc'))
        .observe(),
}));

const EnhancedPaymentList = enhance(PaymentList);

// ----------------------
// Wrapper to Extract Params
// ----------------------
export default function PaymentListWrapper() {
    const { id } = useLocalSearchParams();

    return <EnhancedPaymentList payerId={id as string} />;
}