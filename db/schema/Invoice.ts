import { tableSchema } from "@nozbe/watermelondb";

export const InvoiceSchema = tableSchema({
    name: 'invoices',
    columns: [
      { name: 'payer_id', type: 'string', isIndexed: true },
      { name: 'created_by', type: 'string'},
      { name: 'date', type: 'number' },
      { name: 'amount_due', type: 'number' },
      { name: 'due_date', type: 'number' },
      { name: 'notes', type: 'string' },
      { name: 'status', type: 'string' },
      { name: 'ref_no', type: 'string' }
    ],
  })
  