import { tableSchema } from "@nozbe/watermelondb";

export const PropertySchema = tableSchema({
    name: 'properties',
    columns: [
      { name: 'owner_id', type: 'string', isIndexed: true },
      { name: 'property_ref_no', type: 'string' },
      { name: 'address', type: 'string' },
      { name: 'geolocation', type: 'string' },
      { name: 'assess_payment', type: 'string' },
      { name: 'payment_expiry_date', type: 'number' },
      { name: 'type', type: 'string' },
      { name: 'notes', type: 'string' },
      { name: 'images', type: 'string' },
    ],
  })
  