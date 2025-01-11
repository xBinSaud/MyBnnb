import { collection, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { db, COLLECTIONS, Booking, Expense, Apartment } from '../config/firebase';
import { Statistics, BookingStats, FinancialStats, MonthlyStats } from '../types/statistics';
import { format, differenceInDays, isWithinInterval, startOfMonth, endOfMonth, parseISO, startOfYear, endOfYear } from 'date-fns';
import { arSA } from 'date-fns/locale';

const toDate = (timestamp: any): Date => {
  if (timestamp instanceof Date) return timestamp;
  if (timestamp?.toDate) return timestamp.toDate();
  if (typeof timestamp === 'string') return parseISO(timestamp);
  return new Date(timestamp);
};

const toFirestoreTimestamp = (date: Date): Timestamp => {
  return Timestamp.fromDate(date);
};

const calculateTotalAmount = (booking: Booking): number => {
  if (!booking.amount || !booking.checkIn || !booking.checkOut) return 0;

  const checkIn = toDate(booking.checkIn);
  const checkOut = toDate(booking.checkOut);
  
  // إذا كان الحجز في نفس الشهر، نحسب جميع الأيام بما فيها يوم الخروج
  if (!booking.isPartial) {
    const days = differenceInDays(checkOut, checkIn) + 1;
    return days * booking.amount;
  }
  
  // إذا كان الحجز مقسم بين شهرين
  if (booking.isPartial) {
    if (booking.partialType === 'first') {
      // للشهر الأول نحسب جميع الأيام بما فيها يوم الخروج لأنه آخر يوم في الشهر
      const days = differenceInDays(checkOut, checkIn) + 1;
      return days * booking.amount;
    } else {
      // للشهر الثاني لا نحسب يوم الخروج
      const days = differenceInDays(checkOut, checkIn);
      return days * booking.amount;
    }
  }

  return 0;
};

export async function calculateBookingStatistics(bookings: Booking[]): Promise<BookingStats> {
  try {
    const totalBookings = bookings.length;
    const totalRevenue = bookings.reduce((sum, booking) => {
      return sum + calculateTotalAmount(booking);
    }, 0);
    
    const bookingsBySource = bookings.reduce((acc, booking) => {
      const source = booking.bookingSource || 'غير محدد';
      acc[source] = (acc[source] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    const averageStayDuration = bookings.length > 0 
      ? bookings.reduce((sum, booking) => {
          if (booking.checkIn && booking.checkOut) {
            return sum + differenceInDays(toDate(booking.checkOut), toDate(booking.checkIn));
          }
          return sum;
        }, 0) / totalBookings
      : 0;

    return {
      totalBookings,
      occupancyRate: calculateOccupancyRate(bookings),
      averageStayDuration,
      bookingsBySource,
      totalRevenue,
    };
  } catch (error) {
    console.error('Error calculating booking statistics:', error);
    throw error;
  }
}

export async function calculateExpenseStatistics(expenses: Expense[]): Promise<FinancialStats> {
  try {
    const totalExpenses = expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);

    const expensesByMonth = expenses.reduce((acc, expense) => {
      const expenseDate = toDate(expense.date);
      const month = format(expenseDate, 'MMMM', { locale: arSA });
      acc[month] = (acc[month] || 0) + (expense.amount || 0);
      return acc;
    }, {} as { [key: string]: number });

    return {
      totalExpenses,
      totalRevenue: 0,
      netIncome: -totalExpenses,
      profitMargin: 0,
      expensesByMonth,
    };
  } catch (error) {
    console.error('Error calculating expense statistics:', error);
    throw error;
  }
}

export function calculateTotalBookingAmount(booking: Booking): number {
  return booking.amount || 0;
}

export async function calculateMonthlyStatistics(
  bookings: Booking[],
  expenses: Expense[],
  month: number,
  year: number,
  previousMonth?: MonthlyStats
): Promise<MonthlyStats> {
  try {
    const startDate = startOfMonth(new Date(year, month));
    const endDate = endOfMonth(startDate);

    const monthlyBookings = bookings.filter(booking => {
      const checkIn = toDate(booking.checkIn);
      return isWithinInterval(checkIn, { start: startDate, end: endDate });
    });

    const monthlyExpenses = expenses.filter(expense => {
      const expenseDate = toDate(expense.date);
      return isWithinInterval(expenseDate, { start: startDate, end: endDate });
    });

    const totalRevenue = monthlyBookings.reduce((sum, booking) => 
      sum + calculateTotalAmount(booking), 0);
    const totalExpenses = monthlyExpenses.reduce((sum, expense) => 
      sum + (expense.amount || 0), 0);

    const netIncome = totalRevenue - totalExpenses;
    const profitMargin = totalRevenue > 0 ? (netIncome / totalRevenue) * 100 : 0;

    const bookingsBySource = monthlyBookings.reduce((acc, booking) => {
      const source = booking.bookingSource || 'غير محدد';
      acc[source] = (acc[source] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    const totalDailyRates = monthlyBookings.reduce((sum, booking) => {
      return sum + (booking.amount || 0);
    }, 0);

    // حساب إجمالي أيام الحجوزات
    const totalBookingDays = monthlyBookings.reduce((sum, booking) => {
      if (!booking.checkIn || !booking.checkOut) return sum;
      const duration = differenceInDays(toDate(booking.checkOut), toDate(booking.checkIn));
      return sum + duration;
    }, 0);

    // حساب متوسط مدة الحجز
    const averageBookingDuration = monthlyBookings.length > 0 
      ? totalBookingDays / monthlyBookings.length 
      : 0;

    // حساب متوسط الإيراد لكل حجز
    const averageRevenuePerBooking = monthlyBookings.length > 0 
      ? totalRevenue / monthlyBookings.length 
      : 0;

    // حساب متوسط الإيراد اليومي
    const daysInMonth = differenceInDays(endDate, startDate) + 1;
    const averageDailyRevenue = totalRevenue / daysInMonth;

    // حساب نسبة النمو في الإيرادات والمصروفات
    const revenueGrowth = previousMonth && previousMonth.totalRevenue > 0
      ? ((totalRevenue - previousMonth.totalRevenue) / previousMonth.totalRevenue) * 100
      : 0;

    const expenseGrowth = previousMonth && previousMonth.totalExpenses > 0
      ? ((totalExpenses - previousMonth.totalExpenses) / previousMonth.totalExpenses) * 100
      : 0;

    const occupancyRate = calculateOccupancyRate(monthlyBookings);

    return {
      totalBookings: monthlyBookings.length,
      totalRevenue,
      totalExpenses,
      netIncome,
      profitMargin,
      bookingsBySource,
      totalDailyRates,
      occupancyRate,
      averageBookingDuration,
      averageRevenuePerBooking,
      averageDailyRevenue,
      totalBookingDays,
      revenueGrowth,
      expenseGrowth,
    };
  } catch (error) {
    console.error('Error calculating monthly statistics:', error);
    throw error;
  }
}

export async function calculateAllStatistics(selectedYear: number = new Date().getFullYear()): Promise<Statistics> {
  try {
    console.log('Calculating statistics for year:', selectedYear);
    
    const bookingsRef = collection(db, COLLECTIONS.BOOKINGS);
    const expensesRef = collection(db, COLLECTIONS.EXPENSES);
    const apartmentsRef = collection(db, COLLECTIONS.APARTMENTS);

    const [bookingsSnapshot, expensesSnapshot, apartmentsSnapshot] = await Promise.all([
      getDocs(query(
        bookingsRef,
        where('year', '==', selectedYear)
      )),
      getDocs(query(
        expensesRef,
        where('year', '==', selectedYear)
      )),
      getDocs(apartmentsRef)
    ]);

    console.log('Data fetched:', {
      bookings: bookingsSnapshot.size,
      expenses: expensesSnapshot.size,
      apartments: apartmentsSnapshot.size
    });

    const bookings = bookingsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        checkIn: data.checkIn?.toDate ? data.checkIn.toDate() : toDate(data.checkIn),
        checkOut: data.checkOut?.toDate ? data.checkOut.toDate() : toDate(data.checkOut),
        amount: Number(data.amount) || 0,
      } as Booking;
    });

    const expenses = expensesSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        date: data.date?.toDate ? data.date.toDate() : toDate(data.date),
        amount: Number(data.amount) || 0,
      } as Expense;
    });

    const apartments = apartmentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Apartment));

    // Calculate monthly breakdown with previous month data for growth calculations
    const monthlyBreakdown: MonthlyStats[] = [];
    for (let i = 0; i < 12; i++) {
      const previousMonth = i > 0 ? monthlyBreakdown[i - 1] : undefined;
      const monthStats = await calculateMonthlyStatistics(bookings, expenses, i, selectedYear, previousMonth);
      monthlyBreakdown.push(monthStats);
    }

    // Calculate yearly totals
    const yearlyTotals = monthlyBreakdown.reduce((acc, month) => ({
      totalBookings: acc.totalBookings + month.totalBookings,
      totalRevenue: acc.totalRevenue + month.totalRevenue,
      totalExpenses: acc.totalExpenses + month.totalExpenses,
      netIncome: acc.netIncome + month.netIncome,
      totalDailyRates: acc.totalDailyRates + month.totalDailyRates,
      bookingsBySource: Object.entries(month.bookingsBySource).reduce((sources, [source, count]) => {
        sources[source] = (sources[source] || 0) + count;
        return sources;
      }, acc.bookingsBySource),
      profitMargin: 0,
      occupancyRate: 0,
      averageBookingDuration: 0,
      averageRevenuePerBooking: 0,
      averageDailyRevenue: 0,
      totalBookingDays: acc.totalBookingDays + month.totalBookingDays,
      revenueGrowth: month.revenueGrowth,
      expenseGrowth: month.expenseGrowth,
    }), {
      totalBookings: 0,
      totalRevenue: 0,
      totalExpenses: 0,
      netIncome: 0,
      totalDailyRates: 0,
      bookingsBySource: {} as { [key: string]: number },
      profitMargin: 0,
      occupancyRate: 0,
      averageBookingDuration: 0,
      averageRevenuePerBooking: 0,
      averageDailyRevenue: 0,
      totalBookingDays: 0,
      revenueGrowth: 0,
      expenseGrowth: 0,
    });

    // Calculate final yearly metrics
    yearlyTotals.profitMargin = yearlyTotals.totalRevenue > 0 
      ? (yearlyTotals.netIncome / yearlyTotals.totalRevenue) * 100 
      : 0;
    yearlyTotals.occupancyRate = calculateOccupancyRate(bookings, apartments);
    yearlyTotals.averageBookingDuration = yearlyTotals.totalBookings > 0 
      ? yearlyTotals.totalBookingDays / yearlyTotals.totalBookings 
      : 0;
    yearlyTotals.averageRevenuePerBooking = yearlyTotals.totalBookings > 0
      ? yearlyTotals.totalRevenue / yearlyTotals.totalBookings
      : 0;
    yearlyTotals.averageDailyRevenue = yearlyTotals.totalRevenue / 365;

    console.log('Statistics calculated:', {
      yearlyTotals,
      monthlyBreakdownLength: monthlyBreakdown.length
    });

    return {
      monthlyBreakdown,
      yearlyTotals,
      year: selectedYear,
    };
  } catch (error) {
    console.error('Error calculating all statistics:', error);
    throw error;
  }
}

export function calculateOccupancyRate(bookings: Booking[], apartments: Apartment[] = []): number {
  if (bookings.length === 0 || apartments.length === 0) return 0;

  const totalDays = 365; // Assuming a full year
  const totalRooms = apartments.length;
  const totalAvailableDays = totalDays * totalRooms;

  const occupiedDays = bookings.reduce((sum, booking) => {
    if (!booking.checkIn || !booking.checkOut) return sum;
    const duration = differenceInDays(toDate(booking.checkOut), toDate(booking.checkIn));
    return sum + (duration > 0 ? duration : 0);
  }, 0);

  return (occupiedDays / totalAvailableDays) * 100;
}

export function calculateAverageStayDuration(bookings: Booking[]): number {
  if (bookings.length === 0) return 0;

  const totalDuration = bookings.reduce((sum, booking) => {
    if (!booking.checkIn || !booking.checkOut) return sum;
    const duration = differenceInDays(toDate(booking.checkOut), toDate(booking.checkIn));
    return sum + (duration > 0 ? duration : 0);
  }, 0);

  return totalDuration / bookings.length;
}
