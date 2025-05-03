import { View, Text, ActivityIndicator, ScrollView, Touchable, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import { router, useLocalSearchParams } from 'expo-router'
import Header from '~/components/Header'
import { getPayerByTIN } from '~/services/dbService'
import Payer from '~/db/model/Payer'
import Chip from '~/components/Chip'
import PropertyCard from '~/components/PropertyCard'

// const MOCK_PROPERTIES = [
//     { id: '1', name: 'Property 1', address: '123 Main St' },
//     { id: '2', name: 'Property 2', address: '456 Elm St' },
//     { id: '3', name: 'Property 3', address: '789 Oak St' },
//     { id: '4', name: 'Property 4', address: '101 Pine St' },
//     { id: '5', name: 'Property 5', address: '202 Maple St' },
// ]

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

const MOCK_INVOICES = [
    { id: '1', amount: 100, date: '2023-01-01', status: 'Paid' },
    { id: '2', amount: 200, date: '2023-02-01', status: 'Pending' },
    { id: '3', amount: 300, date: '2023-03-01', status: 'Overdue' },
]

const MOCK_PAYMENTS = [
    { id: '1', amount: 100, date: '2023-01-01', status: 'Completed' },
    { id: '2', amount: 200, date: '2023-02-01', status: 'Pending' },
    { id: '3', amount: 300, date: '2023-03-01', status: 'Failed' },
    { id: '4', amount: 400, date: '2023-04-01', status: 'Completed' },
    { id: '5', amount: 500, date: '2023-05-01', status: 'Pending' },
]

const SectionHeader = ({ title, addButtonText, action }: { title: string, addButtonText: string, action: Function}) => {
    return (
        <View className='flex-row items-center justify-between mb-4'>
            <Text className='text-text text-xl'>{title}</Text>
            <TouchableOpacity className='bg-primary/10 rounded-full px-4 py-2 flex-row items-center' onPress={() => action()}>
                {/* Add a New Property */}
                <Text className='text-primary font-semibold'>{addButtonText}</Text>
            </TouchableOpacity>
        </View>
    )
}

export default function PayerDetails() {
    const localParams = useLocalSearchParams();

    const [payerDetails, setPayerDetails] = useState<Payer>(undefined);
    const [properties, setProperties] = useState([]);
    const [invoices, setInvoices] = useState([]);
    const [payments, setPayments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        getPayerByTIN(localParams?.id).then((data) => {
            setPayerDetails(data.data);

            const updatedInvoice = data.invoices.map((invoice) => {
                const dueDate = new Date(invoice._raw.due_date).toLocaleDateString();

                return {
                    amountDue: invoice._raw.amount_due,
                    ref_no: invoice._raw.ref_no,
                    status: invoice._raw.status,
                    due_date: dueDate
                }
            })

            const updatedPayments = data.payments.map((payment) => {
                const createdDate = new Date(payment._raw.created_date).toLocaleDateString();

                return {
                    id: payment._raw.id,
                    amount: payment._raw.amount,
                    status: payment._raw.status,
                    created_date: createdDate
                }
            })

            setProperties(data.properties);
            setInvoices(updatedInvoice);
            setPayments(updatedPayments);


            setIsLoading(false);
        })
    }, [])

    if (isLoading) {
        return <ActivityIndicator />
    }

    return (
        <View className='bg-background flex-1'>
            <Header
                text={`${payerDetails?.firstName} ${payerDetails?.lastName}`}
            />
            <ScrollView className='flex-1'>
                <View className='p-4'>
                    <Text className='text-text/70 text-lg'>Tax ID: {payerDetails?.tin}</Text>
                    <Text className='text-text/70 text-lg'>Phone: {payerDetails?.phone}</Text>
                    <Text className='text-text/70 text-lg'>Address: {payerDetails?.address}</Text>
                    <View className='flex-row items-center'>
                        <Text className='text-text/70 text-lg'>Status: </Text>
                        <Chip
                            text={payerDetails?.propertyOwner ? 'Active' : 'Inactive'}
                            style={payerDetails?.propertyOwner ? 'active' : 'inActive'}
                        />
                    </View>
                </View>

                {/* Properties Owned */}
                <View className='p-4'>
                    <SectionHeader
                        title='Properties Owned'
                        addButtonText='+ Add Property'
                        action={() => {
                            router.push('/(property)/add')
                         }}
                    />
                    {MOCK_PROPERTIES.map((property) => (
                        <>
                            <PropertyCard
                                key={property.id}
                                property={{
                                    id: property.id,
                                    title: property.name,
                                    type: property.type,
                                    expiryDate: property.expiryDate,
                                    amount: property.amount
                                }}
                                onPress={() => { }}
                            />
                        </>
                    ))}
                </View>

                {/* Invoices Generated for this Payer */}
                <View className='p-4'>
                    <SectionHeader
                        title='Invoices'
                        addButtonText='+ Add Invoice'
                        action={() => { 
                            router.push('/(new_payments)/invoice')
                         }}
                    />
                    {invoices.map((invoice) => (
                        <View key={invoice.id} className='bg-white rounded-lg p-4 mb-3 shadow-sm border border-gray-100'>
                            <Text className='text-text font-semibold'>Invoice ID: {invoice.ref_no}</Text>
                            <Text className='text-text/70 mt-1'>Amount: ${invoice.amountDue}</Text>
                            <Text className='text-text/70 mt-1'>Date: {invoice.due_date}</Text>
                            <Text className='text-text/70 mt-1'>Status: {invoice.status}</Text>
                        </View>
                    ))}
                </View>


                {/* Payments Generated for this Payer */}
                <View className='p-4'>
                    <SectionHeader
                        title='Payments'
                        addButtonText='+ Add Payment'
                        action={() => { 
                            router.push('/(new_payments)')
                         }}
                    />
                    {payments.map((payment) => (
                        <View key={payment.id} className='bg-white rounded-lg p-4 mb-3 shadow-sm border border-gray-100'>
                            <Text className='text-text font-semibold'>Payment ID: {payment.id}</Text>
                            <Text className='text-text/70 mt-1'>Amount: ${payment.amount}</Text>
                            <Text className='text-text/70 mt-1'>Date: {payment.created_date}</Text>
                            <Text className='text-text/70 mt-1'>Status: {payment.status}</Text>
                        </View>
                    ))}
                </View>
            </ScrollView>
        </View>
    )
}

const styles = {

}