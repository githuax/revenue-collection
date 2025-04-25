import { tableSchema } from "@nozbe/watermelondb";

export const UserSchema = tableSchema({
    name: 'users',
    columns: [
      { name: 'active', type: 'boolean' },
      { name: 'first_name', type: 'string' },
      { name: 'last_name', type: 'string' },
      { name: 'phone', type: 'string' },
      { name: 'profile', type: 'string' },
      { name: 'default_payment_method', type: 'string' },
      { name: 'created_by', type: 'string' },
      { name: 'created_date', type: 'number' },
      { name: 'last_modified_by', type: 'string' },
      { name: 'last_modified_date', type: 'number' },
    ],
  })
  