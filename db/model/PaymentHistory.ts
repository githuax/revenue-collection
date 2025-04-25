import { Model } from '@nozbe/watermelondb'
import { field, date, readonly, relation } from '@nozbe/watermelondb/decorators'

export default class PaymentHistory extends Model {
  static table = 'payment_histories'

  @field('field') fieldName
  @field('old_value') oldValue
  @field('new_value') newValue
  @field('created_by') createdBy
  @readonly @date('created_datetime') createdDate

  @relation('payments', 'payment_id') payment
}
