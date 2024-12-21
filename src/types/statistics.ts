export interface MonthlyStats {
  totalBookings: number;
  totalRevenue: number;
  totalExpenses: number;
  netIncome: number;
  profitMargin: number;
  bookingsBySource: { [key: string]: number };
  totalDailyRates: number;
  occupancyRate: number;
  averageBookingDuration: number;
  averageRevenuePerBooking: number;
  averageDailyRevenue: number;
  totalBookingDays: number;
  revenueGrowth: number;
  expenseGrowth: number;
}

export interface YearlyTotals {
  totalBookings: number;
  totalRevenue: number;
  totalExpenses: number;
  netIncome: number;
  totalDailyRates: number;
  bookingsBySource: { [key: string]: number };
  profitMargin: number;
  occupancyRate: number;
}

export interface BookingStats {
  totalBookings: number;
  occupancyRate: number;
  averageStayDuration: number;
  bookingsBySource: { [key: string]: number };
  totalRevenue?: number;
}

export interface FinancialStats {
  totalRevenue: number;
  totalExpenses: number;
  netIncome: number;
  profitMargin: number;
  expensesByMonth: { [key: string]: number };
}

export interface Statistics {
  monthlyBreakdown: MonthlyStats[];
  yearlyTotals: MonthlyStats;
  year: number;
}
