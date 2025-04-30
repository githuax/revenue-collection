import { View, Text, KeyboardAvoidingView, Modal, ScrollView, TouchableOpacity, Platform, TextInput, FlatList } from 'react-native'
import React, { useState } from 'react'

const dummyOwners = [
    { id: '1', name: 'John Doe' },
    { id: '2', name: 'Acme Corp' },
    { id: '3', name: 'Jane Smith' },
];

export default function RegisterNewPropertyModal({ visible, setIsVisible }) {
    const [ownerSearch, setOwnerSearch] = useState('');
    const [selectedOwner, setSelectedOwner] = useState<{ id: string; name: string } | null>(null);

    const [refNo, setRefNo] = useState('');
    const [address, setAddress] = useState('');
    const [geoLocation, setGeoLocation] = useState('');
    const [assessPayment, setAssessPayment] = useState('');
    const [paymentExpiryDate, setPaymentExpiryDate] = useState('');
    const [payerType, setPayerType] = useState('');
    const [notes, setNotes] = useState('');

    const filteredOwners = dummyOwners.filter((owner) =>
        owner.name.toLowerCase().includes(ownerSearch.toLowerCase())
    );

    const addNewProperty = () => {

    }

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={() => setIsVisible(false)}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className={styles.modalContainer}
            >
                <View className={styles.modalContent}>
                    <View className={styles.modalHeader}>
                        <Text className={styles.modalTitle}>Register New Payer</Text>
                        <TouchableOpacity onPress={() => setIsVisible(false)}>
                            <Text className={styles.modalClose}>✕</Text>
                        </TouchableOpacity>
                    </View>



                    <ScrollView className={styles.modalScrollView}>

                        <View className="mt-5">
                            <Text className={styles.inputLabel}>Owner</Text>
                            <TextInput
                                className={styles.input}
                                placeholder="Search owner..."
                                value={ownerSearch}
                                onChangeText={setOwnerSearch}
                            />
                            {ownerSearch.length > 0 && (
                                <View className="border border-[#DFE4EA] rounded mb-4">
                                {filteredOwners.map((item) => (
                                  <TouchableOpacity
                                    key={item.id}
                                    className="p-2 border-b border-[#DFE4EA]"
                                    onPress={() => {
                                      setSelectedOwner(item);
                                      setOwnerSearch(item.name);
                                    }}
                                  >
                                    <Text className="text-[#36454F]">{item.name}</Text>
                                  </TouchableOpacity>
                                ))}
                              </View>
                            )}
                            {selectedOwner && (
                                <Text className="text-[#3498DB] mb-4">Selected Owner: {selectedOwner.name}</Text>
                            )}
                        </View>


                        <Text className={styles.inputLabel}>Ref No</Text>
                        <TextInput
                            className={styles.input}
                            placeholder="Reference Number"
                            value={refNo}
                            onChangeText={setRefNo}
                        />

                        <Text className={styles.inputLabel}>Address</Text>
                        <TextInput
                            className={styles.input}
                            placeholder="Address"
                            value={address}
                            onChangeText={setAddress}
                        />

                        <Text className={styles.inputLabel}>Geo Location</Text>
                        <TextInput
                            className={styles.input}
                            placeholder="Geo Location"
                            value={geoLocation}
                            onChangeText={setGeoLocation}
                        />

                        <Text className={styles.inputLabel}>Assess Payment</Text>
                        <TextInput
                            className={styles.input}
                            placeholder="Assess Payment"
                            value={assessPayment}
                            onChangeText={setAssessPayment}
                            keyboardType="numeric"
                        />

                        <Text className={styles.inputLabel}>Payment Expiry Date</Text>
                        <TextInput
                            className={styles.input}
                            placeholder="YYYY-MM-DD"
                            value={paymentExpiryDate}
                            onChangeText={setPaymentExpiryDate}
                        />

                        <Text className={styles.inputLabel}>Type</Text>
                        <TextInput
                            className={styles.input}
                            placeholder="Type (e.g., Business/Individual)"
                            value={payerType}
                            onChangeText={setPayerType}
                        />

                        <Text className={styles.inputLabel}>Notes</Text>
                        <TextInput
                            className={`${styles.input} h-[100px]`}
                            placeholder="Notes"
                            multiline
                            numberOfLines={4}
                            value={notes}
                            onChangeText={setNotes}
                        />

                        <Text className={styles.requiredFieldsNote}>* Required fields</Text>

                        <TouchableOpacity
                            className={styles.saveButton}
                            onPress={addNewProperty}
                        >
                            <Text className={styles.saveButtonText}>Register Property</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    )
}

const styles = {
    container: 'flex-1 bg-[#F5F7FA]',
    header: 'flex-row justify-center items-center px-5 py-4 border-b border-[#E1E8ED]',
    headerTitle: 'text-[22px] font-bold text-[#2C3E50]',
    scrollView: 'flex-1',
    sectionHeader: 'px-5 py-3 bg-[#F5F7FA]',
    sectionTitle: 'text-[18px] font-semibold text-[#2C3E50]',
    cardContainer: 'bg-white rounded-lg p-4 mx-5 mb-5 shadow-sm',
    profileHeader: 'flex-row mb-4',
    profileAvatar: 'w-16 h-16 rounded-full bg-[#2C3E50] justify-center items-center',
    profileInitials: 'text-white text-[24px] font-bold',
    profileInfo: 'ml-4 flex-1 justify-center',
    profileName: 'text-[18px] font-semibold text-[#36454F] mb-0.5',
    profileId: 'text-[12px] text-[#6B7C93] mb-1.5',
    profileDepartment: 'text-[14px] text-[#36454F] mb-0.5',
    profilePosition: 'text-[14px] text-[#6B7C93]',
    editButton: 'p-2 bg-[#3498DB] rounded-md self-start',
    editButtonText: 'text-white font-medium',
    profileDetails: 'mt-2',
    detailRow: 'flex-row py-2 border-b border-[#F0F0F0]',
    detailLabel: 'w-[100px] text-[14px] text-[#6B7C93]',
    detailValue: 'flex-1 text-[14px] text-[#36454F]',
    preferenceRow: 'flex-row justify-between items-center py-3 border-b border-[#F0F0F0]',
    preferenceLabel: 'text-[16px] text-[#36454F]',
    addPayerButton: 'bg-[#4CAF50] rounded-lg p-3 items-center mb-4',
    addPayerButtonText: 'text-white font-semibold text-[16px]',
    recentPayersTitle: 'text-[16px] font-semibold text-[#36454F] mb-3',
    payerItem: 'border border-[#E1E8ED] rounded-lg p-3 mb-3',
    payerHeader: 'flex-row justify-between items-center mb-2',
    payerName: 'text-[16px] font-semibold text-[#36454F]',
    payerType: 'px-2 py-0.5 rounded text-[12px] font-medium',
    businessType: 'bg-[#E1F5FE] text-[#0288D1]',
    individualType: 'bg-[#F0F4C3] text-[#AFB42B]',
    payerDetails: 'flex-row justify-between mb-3',
    payerId: 'text-[14px] text-[#6B7C93]',
    payerDate: 'text-[14px] text-[#6B7C93]',
    viewPayerButton: 'border border-[#3498DB] rounded py-1.5 items-center',
    viewPayerText: 'text-[#3498DB] text-[14px] font-medium',
    settingOption: 'flex-row justify-between items-center py-4 border-b border-[#F0F0F0]',
    settingOptionText: 'text-[16px] text-[#36454F]',
    settingOptionArrow: 'text-[20px] text-[#6B7C93]',
    logoutButton: 'bg-[#E74C3C] rounded-lg p-4 items-center mx-5 mb-5',
    logoutButtonText: 'text-white font-semibold text-[16px]',
    versionInfo: 'items-center py-5',
    versionText: 'text-[#6B7C93] text-[14px]',
    modalContainer: 'flex-1 justify-end bg-[rgba(0,0,0,0.5)]',
    modalContent: 'bg-white rounded-t-2xl h-[80%] pb-9',
    modalHeader: 'flex-row justify-between items-center p-4 border-b border-[#E1E8ED]',
    modalTitle: 'text-[18px] font-semibold text-[#2C3E50]',
    modalClose: 'text-[20px] text-[#6B7C93] p-1',
    modalScrollView: 'p-4',
    inputGroup: 'mb-4',
    inputLabel: 'text-[14px] font-medium text-[#36454F] mb-2',
    input: 'bg-[#F5F7FA] border border-[#DFE4EA] rounded-lg p-3 text-[16px] text-[#36454F]',
    textArea: 'h-[100px] text-top',
    saveButton: 'bg-[#3498DB] rounded-lg p-4 items-center my-4',
    saveButtonText: 'text-white font-semibold text-[16px]',
    payerTypeSelector: 'flex-row mb-4',
    payerTypeOption: 'flex-1 py-3 items-center bg-[#F5F7FA] border border-[#DFE4EA]',
    payerTypeSelected: 'bg-[#3498DB] border-[#3498DB]',
    payerTypeText: 'text-[16px] font-medium text-[#6B7C93]',
    payerTypeTextSelected: 'text-white',
    requiredFieldsNote: 'text-[12px] text-[#6B7C93] mt-2',
};