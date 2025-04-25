import { Model } from '@nozbe/watermelondb'
import { field, date, readonly, relation, children } from '@nozbe/watermelondb/decorators'

export default class Payment extends Model {
  static table = 'payments'

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
