const STATES = [
    {
        name: 'Pending',
        color: '#FFA500', // Orange
    },
    {
        name: 'Refunded',
        color: '#0000FF', // Blue
    },
    {
        name: 'Completed',
        color: '#008000', // Green
    },
    {
        name: 'Cancelled',
        color: '#800080', // Purple
    },
    {
        name: 'Conflicted',
        color: '#FF0000', // Red
    }
] as const;

const PROPERTY_TYPES = [
    'House',
    'Apartment',
    'Commercial',
    'Other'
] as const;

const PAYMENT_TYPES = [
    'Rates',
    'License',
    'Tax',
    'Other'
]

const PAYMENT_METHODS = [
    'Credit Card',
    'Debit Card',
    'Bank Transfer',
    'Cash',
    'Other'
] as const;

const BUSINESS_TYPES = [
    'Agricultural Produce',
    'Electronics', 
    'Entertainment', 
    "Food & Beverage", 
    'Manufacturing', 
    'Media', 
    'Retail', 
    'Technology', 
    'Transportation', 
    'Other'
]

const INVOICE_STATUS = {
    PAID: 'paid',
    UNPAID: 'unpaid',
    PARTIALLY_PAID: 'partially_paid'
}

export {
    STATES,
    PAYMENT_METHODS,
    BUSINESS_TYPES,
    INVOICE_STATUS,
    PROPERTY_TYPES
}