import React from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import type { Booking, Expense } from "../config/firebase";
import { differenceInDays } from "date-fns";

interface MonthSelectorProps {
  selectedYear: number;
  selectedMonth: number;
  bookings: Booking[];
  expenses: Expense[];
  onMonthChange: (month: number) => void;
  onYearChange: (year: number) => void;
}

export const MonthSelector: React.FC<MonthSelectorProps> = ({
  selectedYear,
  selectedMonth,
  bookings,
  expenses,
  onMonthChange,
  onYearChange,
}) => {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);
  const months = [
    { value: 1, label: "يناير" },
    { value: 2, label: "فبراير" },
    { value: 3, label: "مارس" },
    { value: 4, label: "أبريل" },
    { value: 5, label: "مايو" },
    { value: 6, label: "يونيو" },
    { value: 7, label: "يوليو" },
    { value: 8, label: "أغسطس" },
    { value: 9, label: "سبتمبر" },
    { value: 10, label: "أكتوبر" },
    { value: 11, label: "نوفمبر" },
    { value: 12, label: "ديسمبر" },
  ];

  // Calculate statistics
  const totalBookings = bookings.length;
  const totalBookingAmount = bookings.reduce((sum, booking) => {
    const days = differenceInDays(
      new Date(booking.checkOut || new Date()),
      new Date(booking.checkIn || new Date())
    );
    return sum + booking.amount * days;
  }, 0);
  const totalExpenses = expenses.reduce(
    (sum, expense) => sum + expense.amount,
    0
  );
  const netIncome = totalBookingAmount - totalExpenses;

  const handleYearChange = (event: any) => {
    const newYear = Number(event.target.value);
    onYearChange(newYear);
    navigate(`/bookings/${newYear}/${selectedMonth}`);
  };

  const handleMonthChange = (event: any) => {
    const newMonth = Number(event.target.value);
    onMonthChange(newMonth);
    navigate(`/bookings/${selectedYear}/${newMonth}`);
  };

  return (
    <Box sx={{ mb: 4, width: "100%" }}>
      <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel id="year-select-label">السنة</InputLabel>
          <Select
            labelId="year-select-label"
            value={selectedYear}
            label="السنة"
            onChange={handleYearChange}
          >
            {years.map((year) => (
              <MenuItem key={year} value={year}>
                {year}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel id="month-select-label">الشهر</InputLabel>
          <Select
            labelId="month-select-label"
            value={selectedMonth}
            label="الشهر"
            onChange={handleMonthChange}
          >
            {months.map((month) => (
              <MenuItem key={month.value} value={month.value}>
                {month.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                عدد الحجوزات
              </Typography>
              <Typography variant="h5" component="div">
                {totalBookings}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                إجمالي الإيرادات
              </Typography>
              <Typography variant="h5" component="div">
                {totalBookingAmount} ريال
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                إجمالي المصروفات
              </Typography>
              <Typography variant="h5" component="div" color="error">
                {totalExpenses} ريال
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                صافي الدخل
              </Typography>
              <Typography
                variant="h5"
                component="div"
                color={netIncome >= 0 ? "success" : "error"}
              >
                {netIncome} ريال
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};
