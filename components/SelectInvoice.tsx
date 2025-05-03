import { View, Text, TouchableOpacity, Alert } from 'react-native'
import React, { useState, useEffect } from 'react'

import DropdownComponent from './DropDown'
import { getAllInvoices, getAllPayers, getPayerInvoices } from '~/services/dbService';

export default function SelectInvoice({
    onInvoiceSelect,
    payerId
}) {
    const [selectedVendor, setSelectedVendor] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);

    const [payers, setPayers] = useState([]);

    useEffect(() => {
        if(payerId) {
            getPayerInvoices(payerId).then(data => {
                const transformedInvoices = data.map(invoice => ({
                    ...invoice,
                    id: invoice.id,
                    label: `${invoice._raw.amount_due}`,
                    value: invoice.id,
                    dueDate: invoice.dueDate
                }))

                setPayers(transformedInvoices)
                setSearchResults(transformedInvoices)
            })
        } else {
            getAllInvoices().then(data => {
                const transformedInvoices = data.map(invoice => ({
                    ...invoice,
                    id: invoice.id,
                    label: `${invoice._raw.amount_due}`,
                    value: invoice.id,
                    dueDate: invoice.dueDate
                }))

                setPayers(transformedInvoices)
                setSearchResults(transformedInvoices)
            })
        }
    }, [payerId]);


    // Handle search input change
    const handleSearch = (query) => {
        setSearchQuery(query);
        if (query) {
            const filteredResults = TRANSFORMED_MOCK_VENDORS.filter(vendor =>
                vendor.name.toLowerCase().includes(query.toLowerCase()) ||
                vendor.tpin.toLowerCase().includes(query.toLowerCase()) ||
                vendor.phoneNumber.includes(query)
            );
            setSearchResults(filteredResults);
        } else {
            setSearchResults(TRANSFORMED_MOCK_VENDORS);
        }
    };

    // Handle vendor selection
    const selectVendor = (vendor) => {
        setSelectedVendor(vendor);
        setSearchQuery(vendor.name);
        setSearchResults([]);
        if (onInvoiceSelect) {
            onInvoiceSelect(vendor);
        }
    };

    return (
        <DropdownComponent
            data={payers}
            placeholder="Select Invoice"
            searchPlaceholder="Search by name, TPIN or phone number"
            onChange={selectVendor}
        />
    )
}