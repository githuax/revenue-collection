import { Model } from '@nozbe/watermelondb'
import { field, date, readonly, relation } from '@nozbe/watermelondb/decorators'
import { Associations } from '@nozbe/watermelondb/Model'

export default class Invoice extends Model {
  static table = 'invoices'

  @field('date') date
  @field('amount_due') amountDue
  @field('due_date') dueDate
  @field('notes') notes
  @field('status') status
  @field('created_by') createdBy
  @field('payer_id') payerId
  @field('property_id') propertyId
  @field('ref_no') ref_no
}
