import { Model } from '@nozbe/watermelondb'
import { field, date, readonly, relation } from '@nozbe/watermelondb/decorators'
import { Associations } from '@nozbe/watermelondb/Model'

export default class Property extends Model {
  static table = 'properties'

  static associations: Associations = {
    payers: { type: 'belongs_to', key: 'owner_id' }
  }

  @field('property_ref_no') propertyRefNo
  @field('address') address
  @field('geolocation') geolocation
  @field('assess_payment') assessPayment
  @field('payment_expiry_date') paymentExpiryDate
  @field('type') type
  @field('notes') notes
  @field('images') images

  @relation('payers', 'owner_id') owner
}
