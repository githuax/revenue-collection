import { tableSchema } from '@nozbe/watermelondb'

export const PayerSchema = tableSchema({
  name: 'payers',
  columns: [
    { name: 'first_name', type: 'string' },
    { name: 'last_name', type: 'string' },
    { name: 'company_name', type: 'string' },
    { name: 'tin', type: 'string' },
    { name: 'phone', type: 'string' },
    { name: 'email', type: 'string' },
    { name: 'vendor', type: 'boolean' },
    { name: 'property_owner', type: 'boolean' },
    { name: 'business_type', type: 'string' },
    { name: 'last_payment_date', type: 'number' },
    { name: 'notes', type: 'string' },
    { name: 'created_by', type: 'string' },
    { name: 'created_datetime', type: 'number' },
    { name: 'last_modified_by', type: 'string' },
    { name: 'last_modified_date', type: 'number' },
  ],
})
