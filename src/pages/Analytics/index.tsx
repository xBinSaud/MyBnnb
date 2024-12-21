import { useState } from "react";
import {
  Box,
  Typography,
  Grid,
  useTheme,
  IconButton,
  Tooltip,
  Select,
  MenuItem,
  FormControl,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
  CircularProgress,
} from "@mui/material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import HomeIcon from "@mui/icons-material/Home";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import TableChartIcon from "@mui/icons-material/TableChart";
import DashboardIcon from "@mui/icons-material/Dashboard";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useStatistics } from "../../hooks/useStatistics";
import { StatCard } from "../../components/StatCard";
import type { SelectChangeEvent } from "@mui/material/Select";
import type { MonthlyStats } from "../../types/statistics";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

export default function Analytics() {
  const theme = useTheme();
  const [selectedMonth, setSelectedMonth] = useState(-1); // -1 يمثل "كل الأشهر"
  const [selectedYear, setSelectedYear] = useState(2024);
  const [viewMode, setViewMode] = useState<'summary' | 'detailed'>('summary');
  const { statistics, loading, error, refreshStatistics } = useStatistics(selectedYear);

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error || !statistics) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <Typography color="error">
          حدث خطأ أثناء تحميل الإحصائيات. الرجاء المحاولة مرة أخرى.
        </Typography>
      </Box>
    );
  }

  const months = [
    'كل الأشهر',
    'يناير', 'فبراير', 'مارس', 'إبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
  ];

  const startYear = 2024;
  const currentYear = new Date().getFullYear();
  const years = Array.from(
    { length: Math.max(currentYear - startYear + 5, 1) }, 
    (_, i) => startYear + i
  );

  const calculateTotalStats = () => {
    if (!statistics?.monthlyBreakdown) return {
      totalRevenue: 0,
      totalExpenses: 0,
      netIncome: 0,
      profitMargin: 0,
      totalBookings: 0,
      bookingsBySource: {},
      averageBookingAmount: 0,
      totalDailyRates: 0,
    };

    const totalStats = statistics.monthlyBreakdown.reduce((acc, month) => {
      acc.totalRevenue += month.totalRevenue;
      acc.totalExpenses += month.totalExpenses;
      acc.netIncome += month.netIncome;
      acc.totalBookings += month.totalBookings;
      acc.totalDailyRates += month.averageBookingAmount * month.totalBookings;

      // دمج مصادر الحجوزات
      Object.entries(month.bookingsBySource).forEach(([source, count]) => {
        acc.bookingsBySource[source] = (acc.bookingsBySource[source] || 0) + count;
      });

      return acc;
    }, {
      totalRevenue: 0,
      totalExpenses: 0,
      netIncome: 0,
      totalBookings: 0,
      totalDailyRates: 0,
      bookingsBySource: {} as { [key: string]: number },
    });

    // حساب المتوسطات
    totalStats.profitMargin = totalStats.totalRevenue > 0 
      ? (totalStats.netIncome / totalStats.totalRevenue) * 100 
      : 0;
    
    totalStats.averageBookingAmount = totalStats.totalBookings > 0 
      ? totalStats.totalDailyRates / totalStats.totalBookings 
      : 0;

    return totalStats;
  };

  const currentMonthStats = selectedMonth === -1 
    ? calculateTotalStats()
    : statistics?.monthlyBreakdown[selectedMonth] || {
        totalRevenue: 0,
        totalExpenses: 0,
        netIncome: 0,
        profitMargin: 0,
        totalBookings: 0,
        bookingsBySource: {},
        averageBookingAmount: 0,
      };

  const handleYearChange = (event: SelectChangeEvent<number>) => {
    const newYear = event.target.value as number;
    setSelectedYear(newYear);
    refreshStatistics();
  };

  const handleMonthChange = (event: SelectChangeEvent<number>) => {
    setSelectedMonth(event.target.value as number);
  };

  const handleViewModeChange = (
    event: React.MouseEvent<HTMLElement>,
    newMode: 'summary' | 'detailed' | null,
  ) => {
    if (newMode !== null) {
      setViewMode(newMode);
    }
  };

  const DetailedStatsTable = () => (
    <TableContainer component={Paper} sx={{ mt: 4 }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>الشهر</TableCell>
            <TableCell align="right">إجمالي الإيرادات</TableCell>
            <TableCell align="right">إجمالي المصروفات</TableCell>
            <TableCell align="right">صافي الربح</TableCell>
            <TableCell align="right">هامش الربح</TableCell>
            <TableCell align="right">عدد الحجوزات</TableCell>
            <TableCell align="right">متوسط قيمة الحجز</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {statistics?.monthlyBreakdown.map((monthStats: MonthlyStats, index: number) => (
            <TableRow key={index}>
              <TableCell>{months[index + 1]}</TableCell>
              <TableCell align="right">{monthStats.totalRevenue.toLocaleString()} ر.س</TableCell>
              <TableCell align="right">{monthStats.totalExpenses.toLocaleString()} ر.س</TableCell>
              <TableCell align="right">{monthStats.netIncome.toLocaleString()} ر.س</TableCell>
              <TableCell align="right">{monthStats.profitMargin.toFixed(1)}%</TableCell>
              <TableCell align="right">{monthStats.totalBookings}</TableCell>
              <TableCell align="right">{monthStats.averageBookingAmount.toLocaleString()} ر.س</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <Box p={3} sx={{ backgroundColor: theme.palette.background.default }}>
      {/* Header Controls */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" fontWeight="bold" color="text.primary">
          لوحة التحكم والإحصائيات
        </Typography>
        <Box display="flex" gap={2} alignItems="center">
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={handleViewModeChange}
            size="small"
          >
            <ToggleButton value="summary">
              <Tooltip title="عرض ملخص">
                <DashboardIcon />
              </Tooltip>
            </ToggleButton>
            <ToggleButton value="detailed">
              <Tooltip title="عرض تفصيلي">
                <TableChartIcon />
              </Tooltip>
            </ToggleButton>
          </ToggleButtonGroup>
          <FormControl size="small" sx={{ minWidth: 100 }}>
            <Select
              value={selectedYear}
              onChange={handleYearChange}
              MenuProps={{
                PaperProps: {
                  style: {
                    maxHeight: 300,
                  },
                },
              }}
            >
              {years.map((year) => (
                <MenuItem key={year} value={year}>{year}</MenuItem>
              ))}
            </Select>
          </FormControl>
          {viewMode === 'summary' && (
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <Select
                value={selectedMonth}
                onChange={handleMonthChange}
                MenuProps={{
                  PaperProps: {
                    style: {
                      maxHeight: 300,
                    },
                  },
                }}
              >
                {months.map((month, index) => (
                  <MenuItem key={index - 1} value={index - 1}>{month}</MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
          <Tooltip title="تحديث البيانات">
            <IconButton onClick={refreshStatistics} color="primary">
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {viewMode === 'summary' ? (
        <>
          {/* Summary View */}
          <Grid container spacing={3} mb={4}>
            <Grid item xs={12} sm={6} md={4}>
              <StatCard
                title="إجمالي الإيرادات"
                value={`${currentMonthStats.totalRevenue.toLocaleString()} ر.س`}
                icon={AttachMoneyIcon}
                color="success"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <StatCard
                title="إجمالي المصروفات"
                value={`${currentMonthStats.totalExpenses.toLocaleString()} ر.س`}
                icon={AccountBalanceIcon}
                color="error"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <StatCard
                title="صافي الربح"
                value={`${currentMonthStats.netIncome.toLocaleString()} ر.س`}
                icon={TrendingUpIcon}
                color="info"
              />
            </Grid>
          </Grid>

          <Grid container spacing={3} mb={4}>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="هامش الربح"
                value={`${currentMonthStats.profitMargin.toFixed(1)}%`}
                icon={ShowChartIcon}
                color="warning"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="عدد الحجوزات"
                value={currentMonthStats.totalBookings}
                icon={EventAvailableIcon}
                color="primary"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="متوسط قيمة الحجز"
                value={`${currentMonthStats.averageBookingAmount.toLocaleString()} ر.س`}
                icon={AttachMoneyIcon}
                color="secondary"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="معدل الإشغال"
                value={`${statistics.bookings.occupancyRate.toFixed(1)}%`}
                icon={HomeIcon}
                color="success"
              />
            </Grid>
          </Grid>

          {/* Charts */}
          <Grid container spacing={3}>
            <Grid item xs={12} lg={8}>
              <Paper sx={{ p: 3, borderRadius: 2, boxShadow: "0 4px 20px 0 rgba(0,0,0,0.12)" }}>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  تفاصيل الشهر
                </Typography>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={statistics.monthlyBreakdown}>
                    <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                    <XAxis
                      dataKey="month"
                      tickFormatter={(value) => months[value + 1]}
                      stroke={theme.palette.text.secondary}
                    />
                    <YAxis stroke={theme.palette.text.secondary} />
                    <RechartsTooltip
                      formatter={(value: number) => `${value.toLocaleString()} ر.س`}
                      labelFormatter={(label: number) => months[label + 1]}
                    />
                    <Line
                      type="monotone"
                      dataKey="totalRevenue"
                      name="الإيرادات"
                      stroke={theme.palette.success.main}
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="totalExpenses"
                      name="المصروفات"
                      stroke={theme.palette.error.main}
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="netIncome"
                      name="صافي الربح"
                      stroke={theme.palette.info.main}
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>

            <Grid item xs={12} lg={4}>
              <Paper sx={{ p: 3, borderRadius: 2, boxShadow: "0 4px 20px 0 rgba(0,0,0,0.12)" }}>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  مصادر الحجوزات
                </Typography>
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                    <Pie
                      data={Object.entries(currentMonthStats.bookingsBySource).map(([source, count]) => ({
                        name: source,
                        value: count,
                      }))}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {Object.entries(currentMonthStats.bookingsBySource).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
          </Grid>
        </>
      ) : (
        <DetailedStatsTable />
      )}

      {/* Last Updated */}
      <Box mt={3} display="flex" justifyContent="flex-end">
        <Typography variant="caption" color="text.secondary">
          آخر تحديث: {new Date(statistics?.lastUpdated).toLocaleString()}
        </Typography>
      </Box>
    </Box>
  );
}
