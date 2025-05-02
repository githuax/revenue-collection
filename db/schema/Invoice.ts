import { tableSchema } from "@nozbe/watermelondb";

export const InvoiceSchema = tableSchema({
    name: 'invoices',
    columns: [
      { name: 'payer_id', type: 'string', isIndexed: true },
      { name: 'user_id', type: 'string', isIndexed: true },
      { name: 'date', type: 'number' },
      { name: 'amount_due', type: 'number' },
      { name: 'due_date', type: 'number' },
      { name: 'notes', type: 'string' },
      { name: 'status', type: 'string' },
    ],
  })
  