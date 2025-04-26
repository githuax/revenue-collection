import { Model } from '@nozbe/watermelondb'
import { field, date, readonly, relation } from '@nozbe/watermelondb/decorators'
import { Associations } from '@nozbe/watermelondb/Model'

export default class Invoice extends Model {
  static table = 'invoices'

  static associations : Associations = {
    payers: { type: 'belongs_to', key: 'payer_id' },
    users: { type: 'belongs_to', key: 'user_id' }
  }

  @field('date') date
  @field('payment_id') paymentId
  @field('amount_due') amountDue
  @field('due_date') dueDate
  @field('notes') notes
  @field('status') status

  @relation('payers', 'payer_id') payer
  @relation('users', 'user_id') user
}
