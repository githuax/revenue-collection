import { View, Text, FlatList } from 'react-native'
import React from 'react'
import { withObservables } from '@nozbe/watermelondb/react'
import { paymentsCollection } from '~/db'
import { Q } from '@nozbe/watermelondb'
import useAuthStore from '~/store/authStore'

const RenderPayment = ({ payment }) => {
    return (
        <View className='bg-white rounded-lg p-4 mb-3 shadow-sm border border-gray-100'>
            <View className='mb-2 px-3 py-1 rounded-full bg-primary/10 w-fit'>
                <Text className='capitalize w-fit'>{payment.status}</Text>
            </View>
            <View className='flex-row justify-between items-center mb-3'>
                <Text className='text-lg font-semibold'>{payment.ref_no}</Text>
                <Text>{payment.amount} GMD</Text>
            </View>
            <Text>{`${Date(payment.createdDate)}`}</Text>
        </View>
    )
}

function RecentPaymentsComponent({
    payments
}) {
    return (
        <View className='px-4 py-2'>
            <Text className='text-lg font-bold tracking-wider'>Recent Payments</Text>
            {payments.map((payment) => (
                <RenderPayment key={payment.id} payment={payment} />
            ))}
        </View>
    )
}

const enhance = withObservables([], () => ({
    payments: paymentsCollection.query(
        Q.where('created_by', useAuthStore.getState().userData?.id || ''),
        Q.sortBy('created_date', 'desc'),
        Q.take(3)
    ).observe(),
}))

const RecentPayments = enhance(RecentPaymentsComponent)
export default RecentPayments;