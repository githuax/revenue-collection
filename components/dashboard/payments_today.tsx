import { View, Text } from 'react-native'
import React, { useEffect } from 'react'
import { withObservables } from '@nozbe/watermelondb/react'
import { Q } from '@nozbe/watermelondb';
import { invoicesCollection, paymentsCollection } from '~/db';

function UnEnchancedPaymentsToday({
  payments,
  invoices,
  userID
}) {
  const [totalPayments, setTotalPayments] = React.useState(0);
  const [totalInvoices, setTotalInvoices] = React.useState(0);

  useEffect(() => {
    const total = payments.reduce((acc, payment) => {
      return acc + payment.amount;
    }, 0);
    setTotalPayments(total);

    const totalInvoices = invoices.reduce((acc, invoice) => {
      return acc + invoice.amountDue;
    }, 0);
    setTotalInvoices(totalInvoices);
  }, [payments, invoices]);

  return (
    <View className='p-4'>
      <Text className='text-lg font-bold tracking-wider'>Payments Today</Text>
      <View className='rounded-lg bg-white shadow-sm h-fit py-5 px-4 mt-1'>
        <View className='flex-row items-center justify-evenly'>
          <View className='w-[48%]'>
            <Text>Payments Collected</Text>
            <Text>{totalPayments} GMD</Text>
          </View>
          <View className='w-1 h-full bg-gray-600 mr-2' />
          <View className='w-[48%]'>
            <Text> Invoices Issued</Text>
            <Text>{totalInvoices} GMD</Text>
          </View>
        </View>
      </View>
    </View>
  )
}

const enhance = withObservables(['userID'], ({ userID }) => {
  const nowDate = new Date();
  const todayDate = new Date(nowDate.getFullYear(), nowDate.getMonth(), nowDate.getDate());
  todayDate.setHours(0, 0, 0, 0);
  const timestampToday = todayDate.getTime();

  return {
    payments: paymentsCollection.query(
      Q.where('created_by', userID),
      Q.where('created_date', Q.gte(timestampToday)),
    ).observeWithColumns(
      paymentsCollection.schema.columnArray.map((column) => column.name),
    ),
    invoices: invoicesCollection.query(
      Q.where('created_by', userID),
      Q.where('date', Q.gte(timestampToday)),
    ).observeWithColumns(
      invoicesCollection.schema.columnArray.map((column) => column.name),
    )
  }
});

const PaymentsToday = enhance(UnEnchancedPaymentsToday);

export default PaymentsToday;