import { tableSchema } from "@nozbe/watermelondb";

export const LoginHistorySchema = tableSchema({
    name: 'login_histories',
    columns: [
      { name: 'user_id', type: 'string', isIndexed: true },
      { name: 'date', type: 'number' },
      { name: 'ip_address', type: 'string' },
      { name: 'status', type: 'string' },
      { name: 'last_modified_date', type: 'number' },
    ],
  })
  