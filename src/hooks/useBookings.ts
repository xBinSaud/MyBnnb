import { useState, useEffect, useCallback } from 'react';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  doc, 
  Timestamp, 
  where, 
  getDocs 
} from 'firebase/firestore';
import { db, COLLECTIONS, Booking } from '../config/firebase';
import { startOfMonth, endOfMonth } from 'date-fns';

export function useBookings(year?: string, month?: string) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      const bookingsRef = collection(db, COLLECTIONS.BOOKINGS);
      let q = query(bookingsRef, orderBy('createdAt', 'desc'));
      
      if (year && month) {
        q = query(
          bookingsRef,
          where('year', '==', parseInt(year)),
          where('month', '==', parseInt(month)),
          orderBy('createdAt', 'desc')
        );
      }

      const snapshot = await getDocs(q);
      const bookingsData = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          checkIn: data.checkIn?.toDate ? data.checkIn.toDate() : new Date(data.checkIn),
          checkOut: data.checkOut?.toDate ? data.checkOut.toDate() : new Date(data.checkOut),
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt),
        } as Booking;
      });
      
      setBookings(bookingsData);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [year, month]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const addBooking = async (bookingData: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const now = Timestamp.now();
      await addDoc(collection(db, COLLECTIONS.BOOKINGS), {
        ...bookingData,
        createdAt: now,
        updatedAt: now,
        checkIn: Timestamp.fromDate(bookingData.checkIn),
        checkOut: Timestamp.fromDate(bookingData.checkOut),
      });
    } catch (err) {
      console.error('Error adding booking:', err);
      throw new Error('حدث خطأ أثناء إضافة الحجز');
    }
  };

  const updateBooking = async (
    bookingId: string,
    bookingData: Partial<Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>>
  ) => {
    try {
      const bookingRef = doc(db, COLLECTIONS.BOOKINGS, bookingId);
      const updateData = {
        ...bookingData,
        updatedAt: Timestamp.now(),
      };

      if (bookingData.checkIn) {
        updateData.checkIn = Timestamp.fromDate(bookingData.checkIn);
      }
      if (bookingData.checkOut) {
        updateData.checkOut = Timestamp.fromDate(bookingData.checkOut);
      }

      await updateDoc(bookingRef, updateData);
    } catch (err) {
      console.error('Error updating booking:', err);
      throw new Error('حدث خطأ أثناء تحديث الحجز');
    }
  };

  const deleteBooking = async (bookingId: string) => {
    try {
      const bookingRef = doc(db, COLLECTIONS.BOOKINGS, bookingId);
      await deleteDoc(bookingRef);
    } catch (err) {
      console.error('Error deleting booking:', err);
      throw new Error('حدث خطأ أثناء حذف الحجز');
    }
  };

  return {
    bookings,
    loading,
    error,
    refetch: fetchBookings,
    addBooking,
    updateBooking,
    deleteBooking,
  };
};
