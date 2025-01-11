import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  useTheme,
  Grid,
  Paper,
  Select,
  MenuItem,
  SelectChangeEvent,
  Card,
  CardContent,
  Chip,
  Divider,
} from '@mui/material';
import { useStatistics } from '../../hooks/useStatistics';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
} from 'recharts';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function Analytics() {
  const theme = useTheme();
  const [selectedMonth, setSelectedMonth] = useState(-1);
  const [selectedYear, setSelectedYear] = useState(2024);
  const { statistics, loading, error, refreshStatistics } = useStatistics(selectedYear);

  const months = [
    'كل الأشهر',
    'يناير', 'فبراير', 'مارس', 'إبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
  ];

  const years = Array.from({ length: 7 }, (_, i) => 2024 + i);

  const currentStats = useMemo(() => {
    if (!statistics) return null;

    return selectedMonth === -1
      ? statistics.yearlyTotals
      : statistics.monthlyBreakdown[selectedMonth];
  }, [statistics, selectedMonth]);

  const bookingSourceData = useMemo(() => {
    if (!currentStats?.bookingsBySource) return [];
    return Object.entries(currentStats.bookingsBySource).map(([name, value]) => ({
      name,
      value,
    }));
  }, [currentStats]);

  const monthlyRevenueData = useMemo(() => {
    if (!statistics?.monthlyBreakdown) return [];
    return statistics.monthlyBreakdown.map((month, index) => ({
      name: months[index + 1],
      revenue: month.totalRevenue,
      expenses: month.totalExpenses,
      profit: month.netIncome,
    }));
  }, [statistics]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !statistics) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Typography color="error">
          حدث خطأ أثناء تحميل الإحصائيات. الرجاء المحاولة مرة أخرى.
        </Typography>
      </Box>
    );
  }

  const handleYearChange = (event: SelectChangeEvent<number>) => {
    setSelectedYear(Number(event.target.value));
    refreshStatistics();
  };

  const handleMonthChange = (event: SelectChangeEvent<number>) => {
    setSelectedMonth(event.target.value as number);
  };

  const StatCard = ({ 
    title, 
    value, 
    subtitle, 
    growth 
  }: { 
    title: string; 
    value: string | number; 
    subtitle?: string;
    growth?: number;
  }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography color="textSecondary" gutterBottom>
          {title}
        </Typography>
        <Box display="flex" alignItems="center" gap={1}>
          <Typography variant="h5" component="div">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </Typography>
          {growth !== undefined && (
            <Chip
              icon={growth >= 0 ? <TrendingUpIcon /> : <TrendingDownIcon />}
              label={`${Math.abs(growth).toFixed(1)}%`}
              color={growth >= 0 ? "success" : "error"}
              size="small"
            />
          )}
        </Box>
        {subtitle && (
          <Typography variant="body2" color="textSecondary">
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );

  return (
    <Box p={3}>
      <Box mb={4}>
        <Grid container spacing={2} alignItems="center" justifyContent="space-between">
          <Grid item>
            <Typography variant="h4" gutterBottom>
              لوحة التحليلات
            </Typography>
          </Grid>
          <Grid item>
            <Grid container spacing={2} alignItems="center">
              <Grid item>
                <Select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  size="small"
                  sx={{ minWidth: 100 }}
                >
                  {years.map((year) => (
                    <MenuItem key={year} value={year}>
                      {year}
                    </MenuItem>
                  ))}
                </Select>
              </Grid>
              <Grid item>
                <Select
                  value={selectedMonth}
                  onChange={handleMonthChange}
                  size="small"
                >
                  {months.map((month, index) => (
                    <MenuItem key={index - 1} value={index - 1}>
                      {month}
                    </MenuItem>
                  ))}
                </Select>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Box>

      {currentStats && (
        <Grid container spacing={3}>
          {/* الصف الأول - الإحصائيات المالية الرئيسية */}
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="إجمالي الإيرادات"
              value={`${currentStats.totalRevenue.toLocaleString()} ر.س`}
              growth={currentStats.revenueGrowth}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="إجمالي المصروفات"
              value={`${currentStats.totalExpenses.toLocaleString()} ر.س`}
              growth={currentStats.expenseGrowth}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="صافي الربح"
              value={`${currentStats.netIncome.toLocaleString()} ر.س`}
              subtitle={`هامش الربح: ${currentStats.profitMargin.toFixed(1)}%`}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="متوسط الإيراد اليومي"
              value={`${currentStats.averageDailyRevenue.toLocaleString()} ر.س`}
            />
          </Grid>

          {/* الصف الثاني - إحصائيات الحجوزات */}
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="عدد الحجوزات"
              value={currentStats.totalBookings}
              subtitle={`معدل الإشغال: ${currentStats.occupancyRate.toFixed(1)}%`}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="متوسط السعر اليومي"
              value={`${(currentStats.totalRevenue / currentStats.totalBookingDays).toLocaleString()} ر.س`}
              subtitle="معدل السعر لكل يوم تأجير"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="متوسط إيراد الحجز"
              value={`${currentStats.averageRevenuePerBooking.toLocaleString()} ر.س`}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="إجمالي أيام الحجز"
              value={currentStats.totalBookingDays}
            />
          </Grid>

          {/* الرسم البياني للإيرادات والمصروفات */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2, height: '400px' }}>
              <Typography variant="h6" gutterBottom>
                تحليل الإيرادات والمصروفات
              </Typography>
              <ResponsiveContainer>
                <AreaChart data={monthlyRevenueData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0088FE" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#0088FE" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FF8042" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#FF8042" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00C49F" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#00C49F" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: number) => `${value.toLocaleString()} ر.س`}
                  />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    name="الإيرادات" 
                    stroke="#0088FE" 
                    fillOpacity={1} 
                    fill="url(#colorRevenue)" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="expenses" 
                    name="المصروفات" 
                    stroke="#FF8042" 
                    fillOpacity={1} 
                    fill="url(#colorExpenses)" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="profit" 
                    name="صافي الربح" 
                    stroke="#00C49F" 
                    fillOpacity={1} 
                    fill="url(#colorProfit)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* مخطط مصادر الحجوزات */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2, height: '300px' }}>
              <Typography variant="h6" gutterBottom>
                مصادر الحجوزات
              </Typography>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={bookingSourceData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {bookingSourceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Box>
  );
}
