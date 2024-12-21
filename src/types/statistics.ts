export interface MonthlyStats {
  month: number;
  totalRevenue: number;
  totalExpenses: number;
  netIncome: number;
  profitMargin: number;
  totalBookings: number;
  bookingsBySource: { [key: string]: number };
  averageBookingAmount: number;
}

export interface BookingStats {
  totalBookings: number;
  occupancyRate: number;
  averageStayDuration: number;
  bookingsBySource: { [key: string]: number };
}

export interface FinancialStats {
  totalRevenue: number;
  totalExpenses: number;
  netIncome: number;
  profitMargin: number;
}

export interface Statistics {
  lastUpdated: string;
  bookings: BookingStats;
  financials: FinancialStats;
  monthlyBreakdown: MonthlyStats[];
}
