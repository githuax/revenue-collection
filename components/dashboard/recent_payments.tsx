import { View, Text, FlatList, TouchableOpacity } from 'react-native'
import React from 'react'
import { withObservables } from '@nozbe/watermelondb/react'
import { paymentsCollection, payersCollection } from '~/db'
import { Q } from '@nozbe/watermelondb'
import useAuthStore from '~/store/authStore'
import { map, switchAll } from 'rxjs/operators'
import { Model } from '@nozbe/watermelondb'
import { Feather } from '@expo/vector-icons'
import { router } from 'expo-router'

interface Payer extends Model {
    firstName: string;
    lastName: string;
}

type PaymentModel = Model & {
    ref_no: string;
    amount: number;
    status: string;
    payer_id: string;
    _raw: Record<string, any>;
}

const statusColors: Record<string,string> = {
    synced: 'bg-[#22c55e]',
    pending: 'bg-amber-300',
    conflicted: 'bg-red-500',
}

const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
    });
};

interface RenderPaymentProps {
    payment: PaymentModel;
    payer: Payer | undefined;
}

const RenderPayment = ({ payment, payer }: RenderPaymentProps) => {
    const payerName = payer ? `${payer.firstName} ${payer.lastName}` : 'Unknown Payer'
    const createdDate = payment._raw.created_date || payment._raw.createdDate || new Date().toISOString()
    
    return (
        <TouchableOpacity className='bg-white rounded-lg p-4 mb-3 shadow-sm border border-gray-100'
            onPress={() => {
                router.push(`/(payment)/${payment.ref_no}`);
            }}
        >
            <View className='flex-row justify-between items-start mb-2'>
                <View className='flex-1'>
                    <Text className='text-gray-500 text-sm mb-1'>{formatDate(createdDate)}</Text>
                    <Text className='text-lg font-semibold text-gray-800'>{payerName}</Text>
                </View>
                <View className={`px-3 py-1 rounded-full ${statusColors[payment.status]}`}>
                    <Text className='capitalize text-white text-xs tracking-wider'>{payment.status}</Text>
                </View>
            </View>
            
            <View className='flex-row justify-between items-center mt-2 pt-2 border-t border-gray-100'>
                <View className='flex-row items-center'>
                    <Feather name="hash" size={14} color="#6B7280" />
                    <Text className='text-gray-600 ml-1'>{payment.ref_no}</Text>
                </View>
                <Text className='text-primary-dark font-bold'>{payment.amount.toLocaleString()} GMD</Text>
            </View>
        </TouchableOpacity>
    )
}

interface RecentPaymentsComponentProps {
    payments: PaymentModel[];
    payers: Payer[];
}

function RecentPaymentsComponent({
    payments,
    payers
}: RecentPaymentsComponentProps) {
    return (
        <View className='px-4 py-2'>
            <Text className='text-lg font-bold tracking-wider mb-3'>Recent Payments</Text>
            {payments.map((payment) => {
                const payer = payers.find(p => p.id === payment.payer_id)
                return (
                    <RenderPayment 
                        key={payment.id} 
                        payment={payment} 
                        payer={payer}
                    />
                )
            })}
        </View>
    )
}

const enhance = withObservables([], () => ({
    payments: paymentsCollection.query(
        Q.where('created_by', useAuthStore.getState().userData?.id || ''),
        Q.sortBy('created_date', 'desc'),
        Q.take(3)
    ).observeWithColumns(
        paymentsCollection.schema.columnArray.map((column) => column.name)
    ),
    payers: paymentsCollection.query(
        Q.where('created_by', useAuthStore.getState().userData?.id || ''),
        Q.sortBy('created_date', 'desc'),
        Q.take(3)
    ).observe().pipe(
        map(payments => {
            const payerIds = payments.map(payment => payment.payer_id)
            return payersCollection.query(
                Q.where('id', Q.oneOf(payerIds))
            ).observe()
        }),
        switchAll()
    )
}))

const RecentPayments = enhance(RecentPaymentsComponent)
export default RecentPayments;