import { View, Text, ActivityIndicator, ScrollView, TouchableOpacity } from 'react-native'
import React, { useCallback, useEffect, useLayoutEffect, useState } from 'react'
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router'
import Header from '~/components/Header'
import { getPayerByTIN } from '~/services/dbService'
import Payer from '~/db/model/Payer'
import Chip from '~/components/Chip'
import EnhancedPayments from '~/components/payer_details/payments'
import EnhancedInvoices from '~/components/payer_details/invoice'
import EnhancedProperties from '~/components/payer_details/properties'
import { FontAwesome5 } from '@expo/vector-icons'
import { useIsFocused } from '@react-navigation/native'

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

// Helper component for info rows
const InfoRow = ({ label, value, children }) => (
    <View className='flex-row justify-between items-center py-3 border-b border-gray-100'>
        <Text className='text-gray-600 text-base font-medium'>{label}</Text>
        {children || <Text className='text-gray-900 text-base font-semibold flex-1 text-right'>{value}</Text>}
    </View>
)

// Helper component for section headers
const SectionHeader = ({ title, subtitle }) => (
    <View className='mb-4'>
        <Text className='text-xl font-bold text-gray-900 mb-1'>{title}</Text>
        {subtitle && <Text className='text-sm text-gray-500'>{subtitle}</Text>}
    </View>
)

// Profile header component
const ProfileHeader = ({ payer }) => {
    const displayName = payer?.companyName || `${payer?.firstName} ${payer?.lastName}`;
    const isCompany = !!payer?.companyName;

    return (
        <View className='bg-white mx-4 mt-4 rounded-xl shadow-sm border border-gray-100 p-6'>
            {/* Main Name/Company */}
            <View className='items-center mb-4'>
                <View className='w-20 h-20 bg-blue-100 rounded-full items-center justify-center mb-3'>
                    <Text className='text-2xl font-bold text-blue-600'>
                        {displayName?.charAt(0)?.toUpperCase()}
                    </Text>
                </View>
                <Text className='text-2xl font-bold text-gray-900 text-center'>{displayName}</Text>
                {isCompany && payer?.firstName && (
                    <Text className='text-base text-gray-600 mt-1'>
                        Contact: {payer.firstName} {payer.lastName}
                    </Text>
                )}
            </View>

            {/* Status and Type Chips */}
            <View className='flex-row justify-center items-center mb-4'>
                <Chip
                    text={payer?.propertyOwner ? 'Property Owner' : 'Non-Owner'}
                    style={payer?.propertyOwner ? 'active' : 'inActive'}
                />
                {payer?.vendor && (
                    <View className='ml-2'>
                        <Chip text="Vendor" style="active" />
                    </View>
                )}
                {payer?.businessType && (
                    <View className='ml-2'>
                        <Chip text={payer.businessType} style="neutral" />
                    </View>
                )}
            </View>
        </View>
    )
}

// Contact information component
const ContactInfo = ({ payer }) => (
    <View className='bg-white mx-4 mt-4 rounded-xl shadow-sm border border-gray-100 p-6'>
        <SectionHeader title="Contact Information" />

        {payer?.tin && (
            <InfoRow label="Tax ID (TIN)" value={payer.tin} />
        )}

        {payer?.phone && (
            <InfoRow label="Phone" value={payer.phone} />
        )}

        {payer?.email && (
            <InfoRow label="Email" value={payer.email} />
        )}

        {payer?.location && (
            <InfoRow label="Location" value={payer.location} />
        )}
    </View>
)

// Account summary component
const AccountSummary = ({ payer }) => {
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString();
    };

    return (
        <View className='bg-white mx-4 mt-4 rounded-xl shadow-sm border border-gray-100 p-6'>
            <SectionHeader title="Account Summary" />

            {payer?.created_at && (
                <InfoRow label="Account Created" value={formatDate(payer.created_at)} />
            )}

            {payer?.updated_at && (
                <InfoRow label="Last Updated" value={formatDate(payer.updated_at)} />
            )}
        </View>
    )
}

// Notes component
const NotesSection = ({ payer }) => {
    if (!payer?.notes) return null;

    return (
        <View className='bg-white mx-4 mt-4 rounded-xl shadow-sm border border-gray-100 p-6'>
            <SectionHeader title="Notes" />
            <Text className='text-gray-700 text-base leading-6'>{payer.notes}</Text>
        </View>
    )
}

export default function PayerDetails() {
    const localParams = useLocalSearchParams();

    const [payerDetails, setPayerDetails] = useState<Payer>(undefined);
    const [isLoading, setIsLoading] = useState(true);
    const isFocused = useIsFocused();

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

            setIsLoading(false);
        })
    }, [isFocused])

    if (isLoading) {
        return (
            <View className='flex-1 bg-gray-50 justify-center items-center'>
                <ActivityIndicator size="large" color="#3B82F6" />
                <Text className='text-gray-600 mt-4 text-base'>Loading payer details...</Text>
            </View>
        )
    }

    const headerTitle = payerDetails?.companyName ||
        `${payerDetails?.firstName} ${payerDetails?.lastName}`;

    return (
        <View className='bg-gray-50 flex-1'>
            <Header text={headerTitle}
                rightComponent={
                    <TouchableOpacity onPress={() => {
                        router.push({
                            pathname: '/(vendor)/edit', 
                            params: {
                                id: payerDetails.id,
                                firstName: payerDetails.firstName,
                                lastName: payerDetails.lastName,
                                companyName: payerDetails.companyName,
                                tin: payerDetails.tin,
                                phone: payerDetails.phone,
                                email: payerDetails.email,
                                vendor: payerDetails.vendor,
                                propertyOwner: payerDetails.propertyOwner,
                                businessType: payerDetails.businessType,
                                notes: payerDetails.notes,
                                location: payerDetails.location
                            }
                        })
                    }}>
                        <FontAwesome5 name="user-edit" size={16} color="#3B82F6" />
                    </TouchableOpacity>
                }
            />

            <ScrollView
                className='flex-1'
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 20 }}
            >
                {/* Profile Header */}
                <ProfileHeader payer={payerDetails} />

                {/* Contact Information */}
                <ContactInfo payer={payerDetails} />

                {/* Account Summary */}
                <AccountSummary payer={payerDetails} />

                {/* Notes Section */}
                <NotesSection payer={payerDetails} />

                {/* Payments Section */}
                <View className='mt-4'>
                    <EnhancedPayments payerDetails={payerDetails} />
                </View>

                {/* Properties Section */}
                <View className='mt-4'>
                    <EnhancedProperties payerDetails={payerDetails} />
                </View>

                {/* Invoices Section */}
                <View className='mt-4'>
                    <EnhancedInvoices payerDetails={payerDetails} />
                </View>
            </ScrollView>
        </View>
    )
}