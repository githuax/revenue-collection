import { View, Text } from 'react-native'
import React, { useEffect, useState } from 'react'
import { withObservables } from '@nozbe/watermelondb/react'
import { paymentsCollection } from '~/db'
import { Q } from '@nozbe/watermelondb'

function UEPaymentsWeek({
  userID,
  payments
}) {
  const [totalAmount, setTotalAmount] = useState(0);

  useEffect(() => {
    const total = payments.reduce((acc, payment) => {
      return acc + payment.amount;
    }, 0);
    setTotalAmount(total);
  }, [payments])

  return (
    <View className='rounded-lg bg-white shadow-sm h-fit py-5 px-2 w-[48%] items-center'>
      <Text className='text-center font-semibold'>Payments Weekly</Text>
      <Text className='mt-3'>{totalAmount} GMD</Text>
    </View>
  )
}

const enhance = withObservables(['userID'], ({ userID }) => {
  const now = new Date();
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(now.getDate() - 7);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const timestamp7DaysAgo = sevenDaysAgo.getTime();

  return {
    payments: paymentsCollection.query(
      Q.where('created_by', userID),
      Q.where('created_date', Q.gte(timestamp7DaysAgo)),
    ).observe()
  }
})

const PaymentsWeek = enhance(UEPaymentsWeek)

export default PaymentsWeek;