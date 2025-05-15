import { View, Text } from 'react-native'
import React, { useEffect, useState } from 'react'
import { withObservables } from '@nozbe/watermelondb/react'
import { paymentsCollection } from '~/db'
import { Q } from '@nozbe/watermelondb'

function UEPaymentsMonth({
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
      <Text className='text-center font-semibold'>Payments Month</Text>
      <Text className='mt-3'>{totalAmount} GMD</Text>
    </View>
  )
}

const enhance = withObservables(['userID'], ({ userID }) => {
  const now = new Date();
  const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
  oneMonthAgo.setHours(0, 0, 0, 0);

  const timestamp1MonthAgo = oneMonthAgo.getTime(); 

  return {
    payments: paymentsCollection.query(
      Q.where('created_by', userID),
      Q.where('created_date',Q.gte(timestamp1MonthAgo)),
    ).observe()
  }
})

const PaymentsMonth = enhance(UEPaymentsMonth)

export default PaymentsMonth;