import { tableSchema } from "@nozbe/watermelondb";

export const PaymentHistorySchema = tableSchema({
    name: 'payment_histories',
    columns: [
      { name: 'payment_id', type: 'string', isIndexed: true },
      { name: 'field', type: 'string' },
      { name: 'old_value', type: 'string' },
      { name: 'new_value', type: 'string' },
      { name: 'created_by', type: 'string' },
      { name: 'created_datetime', type: 'number' },
      { name: 'last_modified_date', type: 'number' },
    ],
  })
  