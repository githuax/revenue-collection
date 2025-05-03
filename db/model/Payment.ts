import { Model } from '@nozbe/watermelondb'
import { field, text, date, readonly, relation, children } from '@nozbe/watermelondb/decorators'
import { Associations } from '@nozbe/watermelondb/Model'

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
  @date('created_date') createdDate
  @field('payer_id') payer_id
  @field('ref_no') ref_no
}
