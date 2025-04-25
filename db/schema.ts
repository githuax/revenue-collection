import { appSchema } from '@nozbe/watermelondb'

import { InvoiceSchema } from "./schema/Invoice";
import { PayerSchema } from "./schema/Payer";
import { PaymentHistorySchema } from "./schema/PaymentHistory";
import { PaymentSchema } from "./schema/Payment";
import { PropertySchema } from "./schema/Property";
import { UserSchema } from "./schema/User";
import { LoginHistorySchema } from "./schema/LoginHistory";

export const myAppSchema = appSchema({
  version: 1,
  tables: [
    PayerSchema,
    UserSchema,
    PaymentSchema,
    PaymentHistorySchema,
    PropertySchema,
    InvoiceSchema,
    LoginHistorySchema
  ],
})
