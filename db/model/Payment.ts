import { Model } from '@nozbe/watermelondb'
import { field, text, date, readonly, relation, children } from '@nozbe/watermelondb/decorators'
import { Associations } from '@nozbe/watermelondb/Model'

export default class Payment extends Model {
  static table = 'payments'

  static associations: Associations = {
    payers: { type: 'belongs_to', key: 'payer_id' },
    payment_histories: { type: 'has_many', key: 'payment_id' },
  }

  @field('amount') amount
  @field('payment_type') paymentType
  @field('payment_method') paymentMethod
  @field('location') location
  @field('invoice') invoice
  @field('status') status
  @field('notes') notes
  @field('created_by') createdBy
  @readonly @date('created_date') createdDate

  @relation('payers', 'payer_id') payer
  @children('payment_histories') histories
}
