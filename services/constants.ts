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
    'Mobile Money',
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

const DB_SYNC_STATUS = {
    PENDING: 'pending',
    SYNCED: 'synced',
    CONFLICTED: 'conflicted',
}

export {
    STATES,
    PAYMENT_METHODS,
    BUSINESS_TYPES,
    INVOICE_STATUS,
    PROPERTY_TYPES,
    DB_SYNC_STATUS
}