export interface Apartment {
  id: string;
  name: string;
  description: string;
  pricePerNight: number;
  amenities: string[];
  images: string[];
  location?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Booking {
  id: string;
  apartmentId: string;
  clientName: string;
  phoneNumber: string;
  checkIn?: Date;
  checkOut?: Date;
  amount: number;
  dailyRate: number;
  receiptImage?: string;
  status: "active" | "cancelled";
  bookingSource: "airbnb" | "booking" | "cash" | "other";
  year: number;
  month: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  date: Date | { toDate: () => Date };
  receiptUrl?: string;
  receiptImage?: string;
  year: number;
  month: number;
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

export interface BookingDate {
  id: string;
  apartmentId: string;
  bookingId: string;
  date: Date | { toDate: () => Date };
  status: "booked" | "checkout" | "checkin";
}

export interface Receipt {
  id: string;
  bookingId: string;
  imageUrl: string;
  uploadedAt: Date;
  amount: number;
}
