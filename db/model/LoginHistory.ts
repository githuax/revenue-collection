import { Model } from '@nozbe/watermelondb'
import { field, date, readonly, relation } from '@nozbe/watermelondb/decorators'

export default class LoginHistory extends Model {
  static table = 'login_histories'

  @field('date') date
  @field('ip_address') ipAddress
  @field('status') status
  @field('last_modified_date') lastModifiedDate

  @relation('users', 'user_id') user
}
