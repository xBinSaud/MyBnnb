import { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db, COLLECTIONS, type BookingDate } from "../config/firebase";
import { startOfDay, endOfDay, eachDayOfInterval } from "date-fns";

interface UseBookingDatesProps {
  apartmentId?: string;
  startDate?: Date;
  endDate?: Date;
  excludeBookingId?: string; // Add this line
}

export const useBookingDates = ({
  apartmentId,
  startDate,
  endDate,
}: UseBookingDatesProps) => {
  const [bookedDates, setBookedDates] = useState<Date[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookedDates = async () => {
      if (!apartmentId || !startDate || !endDate) return;

      setLoading(true);
      setError(null);

      try {
        const q = query(
          collection(db, COLLECTIONS.BOOKING_DATES),
          where("apartmentId", "==", apartmentId),
          where("date", ">=", startOfDay(startDate)),
          where("date", "<=", endOfDay(endDate))
        );

        const querySnapshot = await getDocs(q);
        const dates = querySnapshot.docs.map((doc) => {
          const bookingDate = doc.data() as BookingDate;
          return bookingDate.date instanceof Date
            ? bookingDate.date
            : bookingDate.date.toDate();
        });
        setBookedDates(dates);
      } catch (err) {
        console.error("Error fetching booked dates:", err);
        setError("حدث خطأ أثناء جلب التواريخ المحجوزة");
      } finally {
        setLoading(false);
      }
    };

    fetchBookedDates();
  }, [apartmentId, startDate, endDate]);

  const isDateBooked = (date: Date) => {
    return bookedDates.some(
      (bookedDate) =>
        startOfDay(bookedDate).getTime() === startOfDay(date).getTime()
    );
  };

  const areAllDatesAvailable = (start: Date, end: Date) => {
    const dates = eachDayOfInterval({ start, end });
    return !dates.some(isDateBooked);
  };

  return {
    bookedDates,
    loading,
    error,
    isDateBooked,
    areAllDatesAvailable,
  };
};
