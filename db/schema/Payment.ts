import { tableSchema } from "@nozbe/watermelondb";

export const PaymentSchema = tableSchema({
    name: 'payments',
    columns: [
      { name: 'payer_id', type: 'string', isIndexed: true },
      { name: 'amount', type: 'number' },
      { name: 'payment_type', type: 'string' },
      { name: 'payment_method', type: 'string' },
      { name: 'location', type: 'string' },
      { name: 'invoice', type: 'string' },
      { name: 'status', type: 'string' },
      { name: 'notes', type: 'string' },
      { name: 'created_by', type: 'string' },
      { name: 'created_date', type: 'number' },
      { name: 'ref_no', type: 'string' }
    ],
  })
  