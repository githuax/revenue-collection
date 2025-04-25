import { Model } from '@nozbe/watermelondb'
import { field, date, readonly, children } from '@nozbe/watermelondb/decorators'

export default class User extends Model {
  static table = 'users'

  @field('active') active
  @field('first_name') firstName
  @field('last_name') lastName
  @field('phone') phone
  @field('profile') profile
  @field('default_payment_method') defaultPaymentMethod
  @field('created_by') createdBy
  @field('last_modified_by') lastModifiedBy
  @readonly @date('created_date') createdDate
  @readonly @date('last_modified_date') lastModifiedDate

  @children('login_histories') loginHistories
  @children('invoices') invoices
}
