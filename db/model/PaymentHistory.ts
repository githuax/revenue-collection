import { Model } from '@nozbe/watermelondb'
import { field, date, readonly, immutableRelation } from '@nozbe/watermelondb/decorators'
import { Associations } from '@nozbe/watermelondb/Model'

export default class PaymentHistory extends Model {
  static table = 'payment_histories'

  static associations: Associations = {
    payments: { type: 'belongs_to', key: 'payment_id' },
}

  @field('field') fieldName
  @field('old_value') oldValue
  @field('new_value') newValue
  @field('created_by') createdBy
  @readonly @date('created_datetime') createdDate
  @field('last_modified_date') lastModifiedDate

  @immutableRelation('payments', 'payment_id') payment
}
