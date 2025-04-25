import { Model } from '@nozbe/watermelondb'
import { field, date, readonly, relation } from '@nozbe/watermelondb/decorators'

export default class Property extends Model {
  static table = 'properties'

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
