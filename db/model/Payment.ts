import { Model } from '@nozbe/watermelondb'
import { field, date } from '@nozbe/watermelondb/decorators'

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
  @field('last_modified_date') lastModifiedDate
}
