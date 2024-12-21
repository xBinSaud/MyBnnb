import { collection, getDocs, query, where } from 'firebase/firestore';
import { db, COLLECTIONS } from '../config/firebase';
import type { Booking, Expense, Apartment } from '../types';
import type { Statistics, BookingStatistics, ExpenseStatistics, ApartmentStatistics, FinancialStatistics } from '../types/statistics';
import { format, differenceInDays, isWithinInterval, startOfMonth, endOfMonth, parse } from 'date-fns';
import { arSA } from 'date-fns/locale';

export async function calculateBookingStatistics(bookings: Booking[]): Promise<BookingStatistics> {
  const totalBookings = bookings.length;
  const totalRevenue = bookings.reduce((sum, booking) => sum + calculateTotalBookingAmount(booking), 0);
  
  // Calculate bookings by source
  const bookingsBySource = bookings.reduce((acc, booking) => {
    const source = booking.bookingSource;
    acc[source] = (acc[source] || 0) + 1;
    return acc;
  }, { airbnb: 0, booking: 0, cash: 0, other: 0 });

  // Calculate bookings by month
  const bookingsByMonth = bookings.reduce((acc, booking) => {
    const month = format(new Date(booking.checkIn!), 'MMMM', { locale: arSA });
    acc[month] = (acc[month] || 0) + 1;
    return acc;
  }, {} as { [key: string]: number });

  // Calculate average stay duration
  const averageStayDuration = bookings.reduce((sum, booking) => {
    if (booking.checkIn && booking.checkOut) {
      return sum + differenceInDays(new Date(booking.checkOut), new Date(booking.checkIn));
    }
    return sum;
  }, 0) / totalBookings;

  return {
    totalBookings,
    totalRevenue,
    averageBookingAmount: totalRevenue / totalBookings,
    bookingsBySource,
    bookingsByMonth,
    occupancyRate: 0, // Will be calculated with apartment data
    averageStayDuration,
  };
}

export async function calculateExpenseStatistics(expenses: Expense[]): Promise<ExpenseStatistics> {
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  // Calculate expenses by month - ensure proper date handling
  const expensesByMonth = expenses.reduce((acc, expense) => {
    // Ensure we have a proper Date object
    const expenseDate = expense.date instanceof Date ? expense.date : new Date(expense.date);
    const month = format(expenseDate, 'MMMM', { locale: arSA });
    acc[month] = (acc[month] || 0) + expense.amount;
    return acc;
  }, {} as { [key: string]: number });

  // Calculate expenses by category
  const expenseCategories = expenses.reduce((acc, expense) => {
    acc[expense.description] = (acc[expense.description] || 0) + expense.amount;
    return acc;
  }, {} as { [key: string]: number });

  return {
    totalExpenses,
    averageExpenseAmount: expenses.length > 0 ? totalExpenses / expenses.length : 0,
    expensesByMonth,
    expenseCategories,
  };
}

export async function calculateApartmentStatistics(apartments: Apartment[], bookings: Booking[]): Promise<ApartmentStatistics> {
  const totalApartments = apartments.length;
  const averagePrice = apartments.reduce((sum, apt) => sum + apt.pricePerNight, 0) / totalApartments;

  // Calculate bookings per apartment
  const bookingsPerApartment = bookings.reduce((acc, booking) => {
    acc[booking.apartmentId] = (acc[booking.apartmentId] || 0) + 1;
    return acc;
  }, {} as { [key: string]: number });

  // Find most booked apartment
  let mostBookedApartment = {
    id: '',
    name: '',
    bookings: 0,
  };

  Object.entries(bookingsPerApartment).forEach(([aptId, bookingCount]) => {
    if (bookingCount > mostBookedApartment.bookings) {
      const apartment = apartments.find(apt => apt.id === aptId);
      if (apartment) {
        mostBookedApartment = {
          id: aptId,
          name: apartment.name,
          bookings: bookingCount,
        };
      }
    }
  });

  // Calculate occupancy by apartment
  const occupancyByApartment = apartments.reduce((acc, apt) => {
    const aptBookings = bookings.filter(booking => booking.apartmentId === apt.id);
    const totalDays = 365; // Assuming one year
    let occupiedDays = 0;

    aptBookings.forEach(booking => {
      if (booking.checkIn && booking.checkOut) {
        occupiedDays += differenceInDays(new Date(booking.checkOut), new Date(booking.checkIn));
      }
    });

    acc[apt.id] = {
      totalDays,
      occupiedDays,
      rate: (occupiedDays / totalDays) * 100,
    };
    return acc;
  }, {} as { [key: string]: { totalDays: number; occupiedDays: number; rate: number } });

  // Calculate revenue by apartment
  const revenueByApartment = bookings.reduce((acc, booking) => {
    acc[booking.apartmentId] = (acc[booking.apartmentId] || 0) + calculateTotalBookingAmount(booking);
    return acc;
  }, {} as { [key: string]: number });

  return {
    totalApartments,
    averagePrice,
    mostBookedApartment,
    occupancyByApartment,
    revenueByApartment,
  };
}

export async function calculateFinancialStatistics(bookings: Booking[], expenses: Expense[]): Promise<FinancialStatistics> {
  const totalRevenue = bookings.reduce((sum, booking) => sum + calculateTotalBookingAmount(booking), 0);
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const netIncome = totalRevenue - totalExpenses;
  const profitMargin = (netIncome / totalRevenue) * 100;

  // Calculate monthly statistics
  const revenueByMonth = bookings.reduce((acc, booking) => {
    const month = format(new Date(booking.checkIn!), 'MMMM', { locale: arSA });
    acc[month] = (acc[month] || 0) + calculateTotalBookingAmount(booking);
    return acc;
  }, {} as { [key: string]: number });

  const expensesByMonth = expenses.reduce((acc, expense) => {
    const month = format(new Date(expense.date), 'MMMM', { locale: arSA });
    acc[month] = (acc[month] || 0) + expense.amount;
    return acc;
  }, {} as { [key: string]: number });

  // Calculate profit by month
  const profitByMonth = Object.keys(revenueByMonth).reduce((acc, month) => {
    acc[month] = (revenueByMonth[month] || 0) - (expensesByMonth[month] || 0);
    return acc;
  }, {} as { [key: string]: number });

  return {
    totalRevenue,
    totalExpenses,
    netIncome,
    profitMargin,
    revenueByMonth,
    expensesByMonth,
    profitByMonth,
  };
}

function calculateTotalBookingAmount(booking: Booking): number {
  const checkIn = new Date(booking.checkIn);
  const checkOut = new Date(booking.checkOut);
  const days = differenceInDays(checkOut, checkIn) + 1;
  return days * booking.amount;
}

export async function calculateMonthlyStatistics(bookings: Booking[], expenses: Expense[], month: number, year: number) {
  // month is 1-based in our system, convert to 0-based for JavaScript Date
  const jsMonth = month - 1;
  
  // Filter bookings and expenses for the specified month
  const monthBookings = bookings.filter(booking => {
    const bookingDate = new Date(booking.checkIn);
    return bookingDate.getMonth() === jsMonth && bookingDate.getFullYear() === year;
  });

  const monthExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    return expenseDate.getMonth() === jsMonth && expenseDate.getFullYear() === year;
  });

  // Calculate totals
  const totalBookings = monthBookings.length;
  const totalRevenue = monthBookings.reduce((sum, booking) => {
    return sum + calculateTotalBookingAmount(booking);
  }, 0);
  
  const totalExpenses = monthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const netIncome = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? (netIncome / totalRevenue) * 100 : 0;
  // Calculate average daily rate
  const averageBookingAmount = totalBookings > 0 
    ? monthBookings.reduce((sum, booking) => sum + booking.amount, 0) / totalBookings 
    : 0;

  // Calculate bookings by source
  const bookingsBySource = monthBookings.reduce((acc, booking) => {
    const source = booking.bookingSource;
    acc[source] = (acc[source] || 0) + 1;
    return acc;
  }, {} as { [key: string]: number });

  return {
    totalRevenue,
    totalExpenses,
    netIncome,
    profitMargin,
    totalBookings,
    bookingsBySource,
    averageBookingAmount, // This is now the average daily rate
  };
}

export async function calculateAllStatistics(selectedYear: number = new Date().getFullYear()): Promise<Statistics> {
  const [bookingsSnapshot, expensesSnapshot, apartmentsSnapshot] = await Promise.all([
    getDocs(collection(db, COLLECTIONS.BOOKINGS)),
    getDocs(collection(db, COLLECTIONS.EXPENSES)),
    getDocs(collection(db, COLLECTIONS.APARTMENTS)),
  ]);

  // Transform the data and ensure proper date handling
  const bookings = bookingsSnapshot.docs.map(doc => {
    const data = doc.data();
    const checkIn = data.checkIn?.toDate ? data.checkIn.toDate() : new Date(data.checkIn);
    const checkOut = data.checkOut?.toDate ? data.checkOut.toDate() : new Date(data.checkOut);
    
    return {
      id: doc.id,
      ...data,
      checkIn,
      checkOut,
      // Store the daily rate
      amount: data.amount,
    };
  }) as Booking[];

  const expenses = expensesSnapshot.docs.map(doc => {
    const data = doc.data();
    const date = data.date?.toDate ? data.date.toDate() : new Date(data.date);
    return { id: doc.id, ...data, date };
  }) as Expense[];

  const apartments = apartmentsSnapshot.docs.map(doc => ({ 
    id: doc.id, 
    ...doc.data() 
  })) as Apartment[];

  // Filter data for selected year
  const yearBookings = bookings.filter(booking => new Date(booking.checkIn).getFullYear() === selectedYear);
  const yearExpenses = expenses.filter(expense => {
    const expenseYear = expense.year || new Date(expense.date).getFullYear();
    return expenseYear === selectedYear;
  });

  // Calculate monthly breakdown for selected year (using 1-based months)
  const monthlyBreakdown = Array.from({ length: 12 }, (_, i) => i + 1).map(month => {
    const monthBookings = yearBookings.filter(booking => {
      const bookingDate = new Date(booking.checkIn);
      return bookingDate.getMonth() === month - 1;
    });

    const monthExpenses = yearExpenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getMonth() === month - 1;
    });

    const totalBookings = monthBookings.length;
    // Calculate total revenue using the total amount for each booking
    const totalRevenue = monthBookings.reduce((sum, booking) => sum + calculateTotalBookingAmount(booking), 0);
    const totalExpenses = monthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const netIncome = totalRevenue - totalExpenses;
    const profitMargin = totalRevenue > 0 ? (netIncome / totalRevenue) * 100 : 0;
    // Calculate average daily rate instead of average total booking amount
    const averageBookingAmount = totalBookings > 0 
      ? monthBookings.reduce((sum, booking) => sum + booking.amount, 0) / totalBookings 
      : 0;

    const bookingsBySource = monthBookings.reduce((acc, booking) => {
      const source = booking.bookingSource;
      acc[source] = (acc[source] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    return {
      month: month - 1,
      totalRevenue,
      totalExpenses,
      netIncome,
      profitMargin,
      totalBookings,
      bookingsBySource,
      averageBookingAmount, // This is now the average daily rate
    };
  });

  // Calculate yearly totals
  const yearlyTotalRevenue = monthlyBreakdown.reduce((sum, month) => sum + month.totalRevenue, 0);
  const yearlyTotalExpenses = monthlyBreakdown.reduce((sum, month) => sum + month.totalExpenses, 0);
  const yearlyNetIncome = yearlyTotalRevenue - yearlyTotalExpenses;
  const yearlyProfitMargin = yearlyTotalRevenue > 0 ? (yearlyNetIncome / yearlyTotalRevenue) * 100 : 0;
  const yearlyTotalBookings = monthlyBreakdown.reduce((sum, month) => sum + month.totalBookings, 0);
  // Calculate yearly average daily rate
  const yearlyAverageBookingAmount = yearlyTotalBookings > 0 
    ? yearBookings.reduce((sum, booking) => sum + booking.amount, 0) / yearlyTotalBookings 
    : 0;

  return {
    monthlyBreakdown,
    bookings: {
      totalBookings: yearlyTotalBookings,
      occupancyRate: calculateOccupancyRate(yearBookings, apartments),
      averageStayDuration: calculateAverageStayDuration(yearBookings),
    },
    financial: {
      totalRevenue: yearlyTotalRevenue,
      totalExpenses: yearlyTotalExpenses,
      netIncome: yearlyNetIncome,
      profitMargin: yearlyProfitMargin,
      averageBookingAmount: yearlyAverageBookingAmount, // This is now the average daily rate
    },
    lastUpdated: new Date(),
  };
}

function calculateOccupancyRate(bookings: Booking[], apartments: Apartment[]): number {
  if (!bookings.length || !apartments.length) return 0;

  const totalDays = 365; // Total days in a year
  const totalRooms = apartments.length;
  const totalAvailableDays = totalDays * totalRooms;

  // Calculate total booked days
  const bookedDays = bookings.reduce((total, booking) => {
    const checkIn = new Date(booking.checkIn);
    const checkOut = new Date(booking.checkOut);
    const days = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    return total + days;
  }, 0);

  return (bookedDays / totalAvailableDays) * 100;
}

function calculateAverageStayDuration(bookings: Booking[]): number {
  if (!bookings.length) return 0;

  const totalDays = bookings.reduce((total, booking) => {
    const checkIn = new Date(booking.checkIn);
    const checkOut = new Date(booking.checkOut);
    const days = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    return total + days;
  }, 0);

  return totalDays / bookings.length;
}
