import { useState, useEffect, useCallback } from "react";
import {
  collection,
  query,
  orderBy,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  Timestamp,
  where,
  getDocs,
} from "firebase/firestore";
import { db, COLLECTIONS, Booking } from "../config/firebase";

export function useBookings(year?: string, month?: string) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      const bookingsRef = collection(db, COLLECTIONS.BOOKINGS);

      // استعلام بسيط بدون الحاجة إلى index مركب
      const q = query(bookingsRef);
      const snapshot = await getDocs(q);
      
      // تحديد بداية ونهاية الشهر المحدد
      const startOfMonth = new Date(parseInt(year || "2024"), parseInt(month || '1') - 1, 1);
      const endOfMonth = new Date(parseInt(year || "2024"), parseInt(month || '1'), 0, 23, 59, 59);

      // تصفية الحجوزات في الذاكرة
      const bookingsData = snapshot.docs
        .map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            checkIn: data.checkIn instanceof Timestamp ? data.checkIn.toDate() : new Date(data.checkIn),
            checkOut: data.checkOut instanceof Timestamp ? data.checkOut.toDate() : new Date(data.checkOut),
            createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt),
            updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(data.updatedAt),
          } as Booking;
        })
        .filter((booking) => {
          const checkIn = new Date(booking.checkIn);
          const checkOut = new Date(booking.checkOut);
          
          // الحجز يتداخل مع الشهر المحدد إذا:
          // 1. تاريخ الدخول يقع في الشهر المحدد، أو
          // 2. تاريخ الخروج يقع في الشهر المحدد، أو
          // 3. الحجز يمتد عبر الشهر المحدد بالكامل
          return (
            (checkIn.getFullYear() === parseInt(year || "2024") && checkIn.getMonth() === parseInt(month || '1') - 1) ||
            (checkOut.getFullYear() === parseInt(year || "2024") && checkOut.getMonth() === parseInt(month || '1') - 1)
          );
        });

      setBookings(bookingsData);
      setError(null);
    } catch (err) {
      console.error("Error fetching bookings:", err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [year, month]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const addBooking = async (
    bookingData: Omit<Booking, "id" | "createdAt" | "updatedAt">
  ) => {
    try {
      const now = Timestamp.now();
      await addDoc(collection(db, COLLECTIONS.BOOKINGS), {
        ...bookingData,
        createdAt: now,
        updatedAt: now,
        checkIn: bookingData.checkIn,
        checkOut: bookingData.checkOut,
      });
    } catch (err) {
      console.error("Error adding booking:", err);
      throw new Error("حدث خطأ أثناء إضافة الحجز");
    }
  };

  const updateBooking = async (
    bookingId: string,
    bookingData: Partial<Omit<Booking, "id" | "createdAt" | "updatedAt">>
  ) => {
    try {
      const bookingRef = doc(db, COLLECTIONS.BOOKINGS, bookingId);
      const updateData = {
        ...bookingData,
        updatedAt: Timestamp.now(),
      };

      if (bookingData.checkIn) {
        updateData.checkIn = bookingData.checkIn;
      }
      if (bookingData.checkOut) {
        updateData.checkOut = bookingData.checkOut;
      }

      await updateDoc(bookingRef, updateData);
    } catch (err) {
      console.error("Error updating booking:", err);
      throw new Error("حدث خطأ أثناء تحديث الحجز");
    }
  };

  const deleteBooking = async (bookingId: string) => {
    try {
      const bookingRef = doc(db, COLLECTIONS.BOOKINGS, bookingId);
      await deleteDoc(bookingRef);
    } catch (err) {
      console.error("Error deleting booking:", err);
      throw new Error("حدث خطأ أثناء حذف الحجز");
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
}
