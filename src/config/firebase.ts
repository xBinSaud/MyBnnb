import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyDpIBGp1arPK5pGkXmVp9PKTw_SahF5UM4",
  authDomain: "mybnb-10b27.firebaseapp.com",
  projectId: "mybnb-10b27",
  storageBucket: "mybnb-10b27.appspot.com",
  messagingSenderId: "412168445058",
  appId: "1:412168445058:web:de59004d4f93aca2dae89b",
  measurementId: "G-MZDHEZDXP2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);

// Collections
export const COLLECTIONS = {
  APARTMENTS: 'apartments',
  BOOKINGS: 'bookings',
  BOOKING_DATES: 'bookingDates',
  RECEIPTS: 'receipts',
  APP_SETTINGS: 'appSettings',
  EXPENSES: 'expenses',
} as const;

export interface Expense {
  id: string;
  description: string;
  amount: number;
  date: Date;
  receiptImage?: string;
  year: number;
  month: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Apartment {
  id: string;
  name: string;
  pricePerNight: number;
  location?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AppSettings {
  id: string;
  theme: {
    primaryColor: string;
    secondaryColor: string;
    darkMode: boolean;
  };
  notifications: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    bookingReminders: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface Booking {
  id: string;
  apartmentId: string;
  clientName: string;
  phoneNumber: string;
  checkIn: Date;
  checkOut: Date;
  amount: number;
  receiptImage?: string;
  status: 'active' | 'cancelled';
  bookingSource: 'airbnb' | 'booking' | 'cash' | 'other';
  year: number;
  month: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface BookingDate {
  id: string;
  apartmentId: string;
  bookingId: string;
  date: Date;
  status: 'booked' | 'checkout' | 'checkin';
}

export interface Receipt {
  id: string;
  bookingId: string;
  imageUrl: string;
  uploadedAt: Date;
  amount: number;
}
