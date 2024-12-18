import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  FormControl,
  InputLabel,
  Divider,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db, COLLECTIONS } from '../../config/firebase';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { arSA } from 'date-fns/locale';

interface MonthStats {
  totalBookings: number;
  totalRevenue: number;
  occupancyRate: number;
  averageStayDuration: number;
  bookingsBySource: { [key: string]: number };
  bookingsByApartment: { [key: string]: number };
  cancelledBookings: number;
}

export default function Calendar() {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [monthStats, setMonthStats] = useState<MonthStats | null>(null);
  const [apartments, setApartments] = useState<{ [key: string]: string }>({});

  const months = Array.from({ length: 12 }, (_, i) => ({
    number: i,
    name: format(new Date(2024, i, 1), 'MMMM', { locale: arSA }),
  }));

  // Load apartments for reference
  useEffect(() => {
    const loadApartments = async () => {
      const apartmentsSnapshot = await getDocs(collection(db, COLLECTIONS.APARTMENTS));
      const apartmentsData: { [key: string]: string } = {};
      apartmentsSnapshot.forEach((doc) => {
        apartmentsData[doc.id] = doc.data().name;
      });
      setApartments(apartmentsData);
    };
    loadApartments();
  }, []);

  const calculateMonthStats = async (month: number) => {
    try {
      const bookingsQuery = query(
        collection(db, COLLECTIONS.BOOKINGS),
        where('year', '==', selectedYear),
        where('month', '==', month)
      );

      const expensesQuery = query(
        collection(db, COLLECTIONS.EXPENSES),
        where('year', '==', selectedYear),
        where('month', '==', month)
      );

      const [bookingsSnapshot, expensesSnapshot] = await Promise.all([
        getDocs(bookingsQuery),
        getDocs(expensesQuery)
      ]);

      const bookings = bookingsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const expenses = expensesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Calculate total revenue including number of days
      const totalRevenue = bookings.reduce((sum, booking) => {
        const days = Math.ceil(
          (new Date(booking.checkOut).getTime() - new Date(booking.checkIn).getTime()) / 
          (1000 * 60 * 60 * 24)
        ) + 1;
        return sum + (booking.amount * days);
      }, 0);

      // Calculate total expenses
      const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

      const stats: MonthStats = {
        totalBookings: bookings.length,
        totalRevenue,
        occupancyRate: 0,
        averageStayDuration: 0,
        bookingsBySource: {},
        bookingsByApartment: {},
        cancelledBookings: bookings.filter(booking => booking.status === 'cancelled').length,
      };

      // Calculate bookings by source
      bookings.forEach(booking => {
        stats.bookingsBySource[booking.bookingSource] = 
          (stats.bookingsBySource[booking.bookingSource] || 0) + 1;
      });

      // Calculate bookings by apartment
      bookings.forEach(booking => {
        stats.bookingsByApartment[booking.apartmentId] = 
          (stats.bookingsByApartment[booking.apartmentId] || 0) + 1;
      });

      // Calculate average stay duration
      const totalDays = bookings.reduce((sum, booking) => {
        const days = Math.ceil(
          (new Date(booking.checkOut).getTime() - new Date(booking.checkIn).getTime()) / 
          (1000 * 60 * 60 * 24)
        ) + 1;
        return sum + days;
      }, 0);
      stats.averageStayDuration = totalDays / (bookings.length || 1);

      // Calculate occupancy rate
      const daysInMonth = new Date(selectedYear, month, 0).getDate();
      const totalPossibleDays = daysInMonth * Object.keys(apartments).length;
      stats.occupancyRate = (totalDays / totalPossibleDays) * 100;

      setMonthStats(stats);
    } catch (error) {
      console.error('Error calculating month stats:', error);
    }
  };

  const handleMonthClick = async (month: number) => {
    setSelectedMonth(month);
    await calculateMonthStats(month);
  };

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" component="h1">
          التقويم
        </Typography>
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>السنة</InputLabel>
          <Select
            value={selectedYear}
            label="السنة"
            onChange={(e) => setSelectedYear(Number(e.target.value))}
          >
            {Array.from({ length: 5 }, (_, i) => currentYear - 2 + i).map((year) => (
              <MenuItem key={year} value={year}>
                {year}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Grid container spacing={3}>
        {months.map(({ number, name }) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={number}>
            <Card>
              <CardActionArea onClick={() => handleMonthClick(number)}>
                <CardContent>
                  <Typography variant="h5" component="h2" gutterBottom>
                    {name}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog
        open={selectedMonth !== null}
        onClose={() => setSelectedMonth(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">
              {selectedMonth !== null && `إحصائيات شهر ${months[selectedMonth].name} ${selectedYear}`}
            </Typography>
            <IconButton onClick={() => setSelectedMonth(null)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {monthStats && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      معلومات عامة
                    </Typography>
                    <Typography>عدد الحجوزات: {monthStats.totalBookings}</Typography>
                    <Typography>
                      إجمالي الإيرادات: {monthStats.totalRevenue.toLocaleString()} ر.س
                    </Typography>
                    <Typography>
                      نسبة الإشغال: {monthStats.occupancyRate.toFixed(1)}%
                    </Typography>
                    <Typography>
                      متوسط مدة الإقامة: {monthStats.averageStayDuration.toFixed(1)} يوم
                    </Typography>
                    <Typography>
                      الحجوزات الملغاة: {monthStats.cancelledBookings}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      الحجوزات حسب المصدر
                    </Typography>
                    {Object.entries(monthStats.bookingsBySource).map(([source, count]) => (
                      <Typography key={source}>
                        {source}: {count} حجز
                      </Typography>
                    ))}
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      الحجوزات حسب الشقة
                    </Typography>
                    <Grid container spacing={2}>
                      {Object.entries(monthStats.bookingsByApartment).map(([apartmentId, count]) => (
                        <Grid item xs={12} sm={6} md={4} key={apartmentId}>
                          <Typography>
                            {apartments[apartmentId]}: {count} حجز
                          </Typography>
                        </Grid>
                      ))}
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}
