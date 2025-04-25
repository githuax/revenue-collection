import { Platform } from 'react-native';
import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';

import Payer from './model/Payer';
import Invoice from './model/Invoice';
import Payment from './model/Payment';
import PaymentHistory from './model/PaymentHistory';
import Property from './model/Property';
import User from './model/User';
import LoginHistory from './model/LoginHistory';

import schema from './schema';
import migrations from './migrations';
import * as Crypto from 'expo-crypto';
import { setGenerator } from '@nozbe/watermelondb/utils/common/randomId';
setGenerator(() => Crypto.randomUUID());

const adapter = new SQLiteAdapter({
  schema,
  // migrations,
  jsi: true,
  onSetUpError: (error) => {
  },
});

const database = new Database({
  adapter,
  modelClasses: [
    Payer,
    Invoice,
    Payment,
    PaymentHistory,
    Property,
    User,
    LoginHistory,
  ],
});

export default database;

export const payersCollection = database.get<Payer>('payers');
export const invoicesCollection = database.get<Invoice>('invoices');
export const paymentsCollection = database.get<Payment>('payments');
export const paymentHistoriesCollection = database.get<PaymentHistory>('payment_histories');
export const propertiesCollection = database.get<Property>('properties');
export const usersCollection = database.get<User>('users');
export const loginHistoriesCollection = database.get<LoginHistory>('login_histories');