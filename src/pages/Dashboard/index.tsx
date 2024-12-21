import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  CircularProgress,
  LinearProgress,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Stack,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import HotelIcon from "@mui/icons-material/Hotel";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db, COLLECTIONS, Expense, Booking } from "../../config/firebase";
import { AddExpenseDialog } from "../../components/AddExpenseDialog";
import { AddBookingDialog } from "../../components/AddBookingDialog";
import { format, differenceInDays } from "date-fns";
import { BookingsTable } from "../../components/BookingsTable";
import { MonthSelector } from "../../components/MonthSelector";

export default function Dashboard() {
  const {
    year = new Date().getFullYear().toString(),
    month = (new Date().getMonth() + 1).toString(),
  } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading] = useState(true);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isAddBookingOpen, setIsAddBookingOpen] = useState(false);
  const [selectedExpenseImage, setSelectedExpenseImage] = useState<
    string | null
  >(null);

  const handleMonthSelect = (selectedYear: string, selectedMonth: string) => {
    navigate(`/dashboard/${selectedYear}/${selectedMonth}`);
  };

  const fetchExpenses = async () => {
    try {
      const expensesRef = collection(db, COLLECTIONS.EXPENSES);
      const expensesSnapshot = await getDocs(expensesRef);
      const expensesData = expensesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date.toDate(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as Expense[];
      setExpenses(expensesData);
    } catch (error) {
      console.error("Error fetching expenses:", error);
      alert("حدث خطأ أثناء تحميل المصروفات");
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [year, month]);

  const fetchBookings = async () => {
    try {
      setBookingsLoading(true);
      const bookingsRef = collection(db, COLLECTIONS.BOOKINGS);
      const q = query(
        bookingsRef,
        where("year", "==", parseInt(year)),
        where("month", "==", parseInt(month))
      );
      const querySnapshot = await getDocs(q);
      const bookingsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        checkIn: doc.data().checkIn?.toDate() || new Date(doc.data().checkIn),
        checkOut:
          doc.data().checkOut?.toDate() || new Date(doc.data().checkOut),
        createdAt:
          doc.data().createdAt?.toDate() || new Date(doc.data().createdAt),
        updatedAt:
          doc.data().updatedAt?.toDate() || new Date(doc.data().updatedAt),
      })) as Booking[];
      setBookings(bookingsData);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setBookingsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [year, month]);

  const handleAddExpense = async (expenseData: {
    description: string;
    amount: number;
    date: Date;
    receiptImage?: string | null;
    year: number;
    month: number;
  }): Promise<void> => {
    try {
      const expenseDate = expenseData.date instanceof Date
        ? expenseData.date
        : new Date(expenseData.date);

      const expenseToAdd = {
        ...expenseData,
        createdAt: new Date(),
        updatedAt: new Date(),
        date: expenseDate,
        month: expenseDate.getMonth() + 1,
        year: expenseDate.getFullYear(),
      };

      if (!expenseToAdd.receiptImage) {
        delete expenseToAdd.receiptImage;
      }

      const expenseRef = collection(db, COLLECTIONS.EXPENSES);
      await addDoc(expenseRef, expenseToAdd);
      await fetchExpenses();
      setIsAddExpenseOpen(false);
    } catch (error) {
      console.error("Error adding expense:", error);
      alert("حدث خطأ أثناء إضافة المصروف");
      throw error;
    }
  };

  const handleAddBooking = async (bookingData: Omit<Booking, "id"> | any) => {
    try {
      const bookingRef = collection(db, COLLECTIONS.BOOKINGS);
      await addDoc(bookingRef, {
        ...bookingData,
        year: parseInt(year),
        month: parseInt(month),
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      fetchBookings();
      setIsAddBookingOpen(false);
    } catch (error) {
      console.error("Error adding booking:", error);
    }
  };

  const handleViewReceipt = (receiptImage: string) => {
    setSelectedExpenseImage(receiptImage);
  };

  const handleCloseReceipt = () => {
    setSelectedExpenseImage(null);
  };

  const handleDeleteExpense = async (id: string) => {
    try {
      await deleteDoc(doc(db, COLLECTIONS.EXPENSES, id));
      await fetchExpenses();
    } catch (error) {
      console.error("Error deleting expense:", error);
    }
  };

  const handleEditExpense = async (_: Expense) => {
    try {
      await fetchExpenses();
    } catch (error) {
      console.error("Error editing expense:", error);
    }
  };

  const totalRevenue = bookings.reduce(
    (sum, booking) => sum + (booking.amount || 0),
    0
  );
  const totalBookings = bookings.length;
  const averageBookingValue =
    totalBookings > 0 ? totalRevenue / totalBookings : 0;

  const calculateTotalBookingDays = (bookings: Booking[]) => {
    return bookings.reduce((sum, booking) => {
      if (!booking.checkIn || !booking.checkOut) return sum;
      const days = differenceInDays(
        new Date(booking.checkOut),
        new Date(booking.checkIn)
      );
      return sum + days;
    }, 0);
  };

  const totalBookingDays = calculateTotalBookingDays(bookings);
  const averageBookingDuration = totalBookings > 0 ? totalBookingDays / totalBookings : 0;
  const daysInMonth = new Date(parseInt(year), parseInt(month), 0).getDate();
  const occupancyRate = (totalBookingDays / daysInMonth) * 100;

  const StatCard = ({
    title,
    value,
    icon,
    color,
  }: {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
  }) => (
    <Paper
      sx={{
        p: 3,
        display: "flex",
        flexDirection: "column",
        height: 160,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: -10,
          right: -10,
          backgroundColor: `${color}15`,
          borderRadius: "50%",
          width: 80,
          height: 80,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          "& > svg": {
            fontSize: 40,
            color: color,
            opacity: 0.7,
          },
        }}
      >
        {icon}
      </Box>
      <Typography color="text.secondary" gutterBottom>
        {title}
      </Typography>
      <Typography component="p" variant="h4" sx={{ mt: 2, mb: 1 }}>
        {value}
      </Typography>
      <Box sx={{ width: "100%", mt: "auto" }}>
        <LinearProgress
          variant="determinate"
          value={70}
          sx={{
            height: 6,
            borderRadius: 3,
            backgroundColor: `${color}15`,
            "& .MuiLinearProgress-bar": {
              backgroundColor: color,
            },
          }}
        />
      </Box>
    </Paper>
  );

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontWeight: "bold",
          }}
        >
          {t("dashboard.title")}
        </Typography>
        <MonthSelector
          selectedMonth={Number(month)}
          selectedYear={Number(year)}
          onMonthChange={(month) => handleMonthSelect(year, String(month))}
          onYearChange={(year) => handleMonthSelect(String(year), month)}
          bookings={[]}
          expenses={[]}
        />
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title={t("dashboard.totalBookingDays")}
            value={totalBookingDays}
            icon={<CalendarTodayIcon />}
            color="#f50057"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title={t("dashboard.averageBookingDuration")}
            value={`${averageBookingDuration.toFixed(1)} ${t("common.days")}`}
            icon={<HotelIcon />}
            color="#4caf50"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title={t("dashboard.occupancyRate")}
            value={`${occupancyRate.toFixed(1)}%`}
            icon={<CalendarTodayIcon />}
            color="#00bcd4"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title={t("dashboard.totalRevenue")}
            value={`${totalRevenue.toLocaleString("ar-SA")} ر.س`}
            icon={<AttachMoneyIcon />}
            color="#2196f3"
          />
        </Grid>
      </Grid>

      <Box sx={{ mt: 4 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="h6">{t("dashboard.expenses")}</Typography>
          <Button
            variant="contained"
            onClick={() => setIsAddExpenseOpen(true)}
            sx={{
              backgroundColor: "#4caf50",
              "&:hover": {
                backgroundColor: "#388e3c",
              },
            }}
          >
            {t("dashboard.addExpense")}
          </Button>
        </Box>

        <AddExpenseDialog
          open={isAddExpenseOpen}
          onClose={() => setIsAddExpenseOpen(false)}
          onSubmit={handleAddExpense}
          selectedMonth={month}
          selectedYear={year}
        />

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>إجراءات</TableCell>
                  <TableCell>الإيصال</TableCell>
                  <TableCell>المبلغ</TableCell>
                  <TableCell>التاريخ</TableCell>
                  <TableCell>الوصف</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {expenses
                  .filter(
                    (expense) =>
                      expense.year === parseInt(year) &&
                      expense.month === parseInt(month)
                  )
                  .map((expense) => (
                    <TableRow key={expense.id}>
                      <TableCell>
                        <Stack direction="row" spacing={1}>
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteExpense(expense.id)}
                            sx={{ color: "error.main" }}
                          >
                            <DeleteIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleEditExpense(expense)}
                          >
                            <EditIcon />
                          </IconButton>
                          {expense.receiptImage && (
                            <IconButton
                              size="small"
                              onClick={() =>
                                handleViewReceipt(expense.receiptImage!)
                              }
                            >
                              <VisibilityIcon />
                            </IconButton>
                          )}
                        </Stack>
                      </TableCell>
                      <TableCell>
                        {expense.receiptImage ? "نعم" : "لا"}
                      </TableCell>
                      <TableCell>{expense.amount} ريال</TableCell>
                      <TableCell>
                        {expense.date instanceof Date
                          ? format(expense.date, "dd/MM/yyyy")
                          : format(expense.date.toDate(), "dd/MM/yyyy")}
                      </TableCell>
                      <TableCell>{expense.description}</TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>

      <Dialog
        open={!!selectedExpenseImage}
        onClose={handleCloseReceipt}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>معاينة الإيصال</DialogTitle>
        <DialogContent>
          {selectedExpenseImage && (
            <Box sx={{ textAlign: "center", mt: 2 }}>
              <img
                src={selectedExpenseImage}
                alt="Receipt"
                style={{
                  maxWidth: "100%",
                  maxHeight: "70vh",
                  objectFit: "contain",
                }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseReceipt}>إغلاق</Button>
        </DialogActions>
      </Dialog>

      <Box sx={{ mt: 4 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="h6">{t("dashboard.bookings")}</Typography>
          <Button
            variant="contained"
            onClick={() => setIsAddBookingOpen(true)}
            sx={{
              backgroundColor: "#2196f3",
              "&:hover": {
                backgroundColor: "#1976d2",
              },
            }}
          >
            {t("dashboard.addBooking")}
          </Button>
        </Box>

        <AddBookingDialog
          open={isAddBookingOpen}
          onClose={() => setIsAddBookingOpen(false)}
          onSubmit={handleAddBooking}
          selectedMonth={String(parseInt(month))}
          selectedYear={String(parseInt(year))}
        />

        {bookingsLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <BookingsTable
            bookings={bookings}
            onDelete={() => fetchBookings()}
            onEdit={() => fetchBookings()}
            onViewImage={function (_: string): void {
              throw new Error("Function not implemented.");
            }}
          />
        )}
      </Box>
    </Box>
  );
}
