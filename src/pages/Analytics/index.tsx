import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Grid, 
  Paper, 
  Typography,
  FormControl,
  Select,
  MenuItem,
  styled,
  SelectChangeEvent,
  useTheme
} from '@mui/material';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import HomeIcon from '@mui/icons-material/Home';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import PeopleIcon from '@mui/icons-material/People';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import TimelineIcon from '@mui/icons-material/Timeline';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db, COLLECTIONS } from '../../config/firebase';

const StyledSelect = styled(Select)(({ theme }) => ({
  color: 'white',
  backgroundColor: '#1e2632',
  '& .MuiSelect-icon': {
    color: 'white',
  },
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: '#2d3748',
  },
  '&:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: '#4a5568',
  },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: '#4a5568',
  },
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  backgroundColor: '#1e2632',
  color: 'white',
  padding: theme.spacing(3),
  borderRadius: theme.spacing(2),
}));

const StyledStatBox = styled(Box)(({ theme }) => ({
  backgroundColor: '#1e2632',
  borderRadius: theme.spacing(2),
  padding: theme.spacing(3),
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
  '& .MuiSvgIcon-root': {
    fontSize: 40,
    marginBottom: theme.spacing(2),
  },
}));

interface AnalyticsData {
  totalRevenue: number;
  totalBookings: number;
  totalExpenses: number;
  netIncome: number;
  occupancyRate: number;
  averageBookingDuration: number;
  averageRevenuePerBooking: number;
  averageExpensePerDay: number;
  mostPopularDays: { day: string; count: number }[];
  bookingTrends: { name: string; revenue: number; expenses: number; netIncome: number; bookings: number }[];
  bookingTypes: { type: string; count: number; revenue: number }[];
  revenueBySource: { source: string; amount: number }[];
  seasonalTrends: { season: string; bookings: number; revenue: number }[];
  customerStats: {
    totalCustomers: number;
    returningCustomers: number;
    averageRating: number;
  };
}

export default function Analytics() {
  const theme = useTheme();
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<string>('كل الأشهر');
  const [data, setData] = useState<AnalyticsData>({
    totalRevenue: 0,
    totalBookings: 0,
    totalExpenses: 0,
    netIncome: 0,
    occupancyRate: 0,
    averageBookingDuration: 0,
    averageRevenuePerBooking: 0,
    averageExpensePerDay: 0,
    mostPopularDays: [],
    bookingTrends: [],
    bookingTypes: [],
    revenueBySource: [],
    seasonalTrends: [],
    customerStats: {
      totalCustomers: 0,
      returningCustomers: 0,
      averageRating: 0
    }
  });

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i);
  const months = [
    { value: 'كل الأشهر', label: 'كل الأشهر' },
    { value: '1', label: 'يناير' },
    { value: '2', label: 'فبراير' },
    { value: '3', label: 'مارس' },
    { value: '4', label: 'أبريل' },
    { value: '5', label: 'مايو' },
    { value: '6', label: 'يونيو' },
    { value: '7', label: 'يوليو' },
    { value: '8', label: 'أغسطس' },
    { value: '9', label: 'سبتمبر' },
    { value: '10', label: 'أكتوبر' },
    { value: '11', label: 'نوفمبر' },
    { value: '12', label: 'ديسمبر' }
  ];

  const handleYearChange = (event: SelectChangeEvent<number>) => {
    setYear(event.target.value as number);
  };

  const handleMonthChange = (event: SelectChangeEvent<string>) => {
    setSelectedMonth(event.target.value as string);
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const bookingsRef = collection(db, COLLECTIONS.BOOKINGS);
        const expensesRef = collection(db, COLLECTIONS.EXPENSES);
        
        let bookingsQuery = bookingsRef;
        let expensesQuery = expensesRef;

        if (selectedMonth !== 'كل الأشهر') {
          const startOfMonth = new Date(year, parseInt(selectedMonth) - 1, 1);
          const endOfMonth = new Date(year, parseInt(selectedMonth), 0);
          
          bookingsQuery = query(
            bookingsRef,
            where('checkIn', '>=', startOfMonth),
            where('checkIn', '<=', endOfMonth)
          );
          
          expensesQuery = query(
            expensesRef,
            where('date', '>=', startOfMonth),
            where('date', '<=', endOfMonth)
          );
        }

        const [bookingsSnapshot, expensesSnapshot] = await Promise.all([
          getDocs(bookingsQuery),
          getDocs(expensesQuery)
        ]);

        const bookings = bookingsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const expenses = expensesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Calculate basic metrics
        const totalRevenue = bookings.reduce((sum: number, booking: any) => sum + (booking.amount || 0), 0);
        const totalExpenses = expenses.reduce((sum: number, expense: any) => sum + (expense.amount || 0), 0);
        const netIncome = totalRevenue - totalExpenses;

        // Calculate booking types
        const bookingTypeMap = new Map<string, { count: number; revenue: number }>();
        
        bookings.forEach((booking: any) => {
          const bookingType = booking.bookingType || 'حجز عادي';
          const currentStats = bookingTypeMap.get(bookingType) || { count: 0, revenue: 0 };
          bookingTypeMap.set(bookingType, {
            count: currentStats.count + 1,
            revenue: currentStats.revenue + (booking.amount || 0)
          });
        });

        const bookingTypes = Array.from(bookingTypeMap.entries()).map(([type, stats]) => ({
          type,
          count: stats.count,
          revenue: stats.revenue
        }));

        // Ensure we have default booking types even if there's no data
        if (bookingTypes.length === 0) {
          bookingTypes.push(
            { type: 'حجز عادي', count: 0, revenue: 0 },
            { type: 'حجز مميز', count: 0, revenue: 0 },
            { type: 'حجز طويل المدى', count: 0, revenue: 0 }
          );
        }

        // Create monthly financial summary data
        const monthlyData = [];
        if (selectedMonth === 'كل الأشهر') {
          // Group data by month for the entire year
          const monthlyBookings = new Map();
          const monthlyExpenses = new Map();

          bookings.forEach((booking: any) => {
            const date = new Date(booking.checkIn);
            const monthKey = date.getMonth();
            const currentAmount = monthlyBookings.get(monthKey) || 0;
            monthlyBookings.set(monthKey, currentAmount + (booking.amount || 0));
          });

          expenses.forEach((expense: any) => {
            const date = new Date(expense.date);
            const monthKey = date.getMonth();
            const currentAmount = monthlyExpenses.get(monthKey) || 0;
            monthlyExpenses.set(monthKey, currentAmount + (expense.amount || 0));
          });

          // Create data for all months
          for (let month = 0; month < 12; month++) {
            const monthRevenue = monthlyBookings.get(month) || 0;
            const monthExpenses = monthlyExpenses.get(month) || 0;
            monthlyData.push({
              name: months[month + 1].label,
              revenue: monthRevenue,
              expenses: monthExpenses,
              netIncome: monthRevenue - monthExpenses
            });
          }
        } else {
          // Only show data for selected month
          monthlyData.push({
            name: months[parseInt(selectedMonth)].label,
            revenue: totalRevenue,
            expenses: totalExpenses,
            netIncome: netIncome
          });
        }

        setData(prevData => ({
          ...prevData,
          totalRevenue,
          totalExpenses,
          totalBookings: bookings.length,
          netIncome,
          bookingTypes,
          bookingTrends: monthlyData
        }));

      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [selectedMonth, year]);

  if (!data) {
    return null;
  }

  return (
    <Box sx={{ p: 3, backgroundColor: '#141b2d', minHeight: '100vh' }}>
      <Typography variant="h4" sx={{ color: 'white', mb: 3 }}>
        التحليلات والإحصائيات
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <StyledSelect
            value={year}
            onChange={handleYearChange}
            displayEmpty
          >
            {years.map(y => (
              <MenuItem key={y} value={y}>{y}</MenuItem>
            ))}
          </StyledSelect>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <StyledSelect
            value={selectedMonth}
            onChange={handleMonthChange}
            displayEmpty
          >
            {months.map(m => (
              <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>
            ))}
          </StyledSelect>
        </FormControl>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <StyledPaper>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <TrendingUpIcon sx={{ mr: 1 }} />
              <Typography variant="h6">إجمالي الإيرادات</Typography>
            </Box>
            <Typography variant="h4">{formatCurrency(data.totalRevenue)}</Typography>
          </StyledPaper>
        </Grid>
        <Grid item xs={12} md={3}>
          <StyledPaper>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <HomeIcon sx={{ mr: 1 }} />
              <Typography variant="h6">إجمالي الحجوزات</Typography>
            </Box>
            <Typography variant="h4">{data.totalBookings}</Typography>
          </StyledPaper>
        </Grid>
        <Grid item xs={12} md={3}>
          <StyledPaper>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <AccountBalanceIcon sx={{ mr: 1 }} />
              <Typography variant="h6">إجمالي المصروفات</Typography>
            </Box>
            <Typography variant="h4">{formatCurrency(data.totalExpenses)}</Typography>
          </StyledPaper>
        </Grid>
        <Grid item xs={12} md={3}>
          <StyledPaper>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <AttachMoneyIcon sx={{ mr: 1 }} />
              <Typography variant="h6">صافي الربح</Typography>
            </Box>
            <Typography variant="h4">{formatCurrency(data.netIncome)}</Typography>
          </StyledPaper>
        </Grid>
        <Grid item xs={12} md={3}>
          <StyledPaper>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <TimelineIcon sx={{ mr: 1 }} />
              <Typography variant="h6">نسبة الإشغال</Typography>
            </Box>
            <Typography variant="h4">{data.occupancyRate.toFixed(1)}%</Typography>
          </StyledPaper>
        </Grid>
        <Grid item xs={12} md={3}>
          <StyledPaper>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <CalendarTodayIcon sx={{ mr: 1 }} />
              <Typography variant="h6">متوسط مدة الإقامة</Typography>
            </Box>
            <Typography variant="h4">{data.averageBookingDuration.toFixed(1)} يوم</Typography>
          </StyledPaper>
        </Grid>
        <Grid item xs={12} md={3}>
          <StyledPaper>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <ShowChartIcon sx={{ mr: 1 }} />
              <Typography variant="h6">متوسط الإيراد للحجز</Typography>
            </Box>
            <Typography variant="h4">{formatCurrency(data.averageRevenuePerBooking)}</Typography>
          </StyledPaper>
        </Grid>
        <Grid item xs={12} md={3}>
          <StyledPaper>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <PeopleIcon sx={{ mr: 1 }} />
              <Typography variant="h6">العملاء المميزين</Typography>
            </Box>
            <Typography variant="h4">{data.customerStats.returningCustomers}</Typography>
          </StyledPaper>
        </Grid>
        <Grid item xs={12} md={8}>
          <StyledPaper>
            <Typography variant="h6" gutterBottom>
              الإيرادات والمصروفات
            </Typography>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={data.bookingTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
                <XAxis dataKey="name" stroke="#fff" />
                <YAxis stroke="#fff" />
                <Tooltip />
                <Legend />
                <Bar name="الإيرادات" dataKey="revenue" fill="#4caf50" />
                <Bar name="المصروفات" dataKey="expenses" fill="#f44336" />
              </BarChart>
            </ResponsiveContainer>
          </StyledPaper>
        </Grid>
        <Grid item xs={12} md={4}>
          <StyledPaper>
            <Typography variant="h6" gutterBottom>
              توزيع أنواع الحجوزات
            </Typography>
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                {data.bookingTypes && data.bookingTypes.length > 0 && (
                  <Pie
                    data={data.bookingTypes}
                    dataKey="count"
                    nameKey="type"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    label={({
                      cx,
                      cy,
                      midAngle,
                      innerRadius,
                      outerRadius,
                      value,
                      index
                    }) => {
                      const RADIAN = Math.PI / 180;
                      const radius = 25 + innerRadius + (outerRadius - innerRadius);
                      const x = cx + radius * Math.cos(-midAngle * RADIAN);
                      const y = cy + radius * Math.sin(-midAngle * RADIAN);

                      return (
                        <text
                          x={x}
                          y={y}
                          fill="#fff"
                          textAnchor={x > cx ? 'start' : 'end'}
                          dominantBaseline="central"
                        >
                          {data.bookingTypes[index].type} ({value})
                        </text>
                      );
                    }}
                  >
                    {data.bookingTypes.map((entry, index) => (
                      <Cell 
                        key={index} 
                        fill={[
                          '#4caf50',  // أخضر للحجز العادي
                          '#2196f3',  // أزرق للحجز المميز
                          '#ff9800',  // برتقالي للحجز طويل المدى
                          '#f44336'   // أحمر لأي نوع إضافي
                        ][index % 4]} 
                      />
                    ))}
                  </Pie>
                )}
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e2632', border: 'none' }}
                  formatter={(value: any, name: string, props: any) => {
                    if (!props || !data.bookingTypes[props.payload.index]) return [];
                    const bookingType = data.bookingTypes[props.payload.index];
                    return [
                      `عدد الحجوزات: ${value}`,
                      `الإيرادات: ${formatCurrency(bookingType.revenue)}`,
                      `النوع: ${name}`
                    ];
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            {data.bookingTypes && data.bookingTypes.length > 0 && (
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 2 }}>
                {data.bookingTypes.map((type, index) => (
                  <Box 
                    key={index} 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 1 
                    }}
                  >
                    <Box 
                      sx={{ 
                        width: 12, 
                        height: 12, 
                        borderRadius: '50%',
                        backgroundColor: [
                          '#4caf50',
                          '#2196f3',
                          '#ff9800',
                          '#f44336'
                        ][index % 4]
                      }} 
                    />
                    <Typography variant="body2">
                      {type.type} ({((type.count / (data.totalBookings || 1)) * 100).toFixed(1)}%)
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}
          </StyledPaper>
        </Grid>
        <Grid item xs={12}>
          <StyledPaper>
            <Typography variant="h6" gutterBottom>
              الملخص المالي الشهري
            </Typography>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={data.bookingTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
                <XAxis dataKey="name" stroke="#fff" />
                <YAxis stroke="#fff" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e2632', border: 'none' }}
                  labelStyle={{ color: '#fff' }}
                  formatter={(value: any) => formatCurrency(value)}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  name="إجمالي الدخل" 
                  stroke="#4caf50" 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="expenses" 
                  name="إجمالي المصروفات" 
                  stroke="#f44336" 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="netIncome" 
                  name="صافي الربح" 
                  stroke="#2196f3" 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </StyledPaper>
        </Grid>
      </Grid>
    </Box>
  );
}
