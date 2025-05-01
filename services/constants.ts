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

export {
    STATES,
    PAYMENT_METHODS
}