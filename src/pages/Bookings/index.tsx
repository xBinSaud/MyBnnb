import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  TextField,
  InputAdornment,
  Dialog,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import { format } from "date-fns";
import { arSA } from "date-fns/locale";
import { AddBookingDialog } from "../../components/AddBookingDialog";
import { EditBookingDialog } from "../../components/EditBookingDialog";
import { AddExpenseDialog } from "../../components/AddExpenseDialog";
import { EditExpenseDialog } from "../../components/EditExpenseDialog";
import { Booking, Expense } from "../../config/firebase";
import { useExpenses } from "../../hooks/useExpenses";
import { db } from "../../config/firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  deleteDoc,
  updateDoc,
  Timestamp,
} from "firebase/firestore";
import { BookingsTable } from "../../components/BookingsTable";
import { ExpensesTable } from "../../components/ExpensesTable";
import { MonthSelector } from "../../components/MonthSelector";
import { useBookings } from "../../hooks/useBookings";

export default function Bookings() {
  const {
    year = new Date().getFullYear().toString(),
    month = (new Date().getMonth() + 1).toString(),
  } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBooking, setSelectedBooking] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openAddExpenseDialog, setOpenAddExpenseDialog] = useState(false);
  const [openEditExpenseDialog, setOpenEditExpenseDialog] = useState(false);
  const [openImageDialog, setOpenImageDialog] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

  const {
    bookings,
    loading: bookingsLoading,
    error: bookingsError,
    refetch,
  } = useBookings(year, month);
  const {
    expenses,
    loading: expensesLoading,
    error: expensesError,
  } = useExpenses(year, month);

  const handleBack = () => {
    navigate("/bookings");
  };

  // const startDate = new Date(Number(year), Number(month) - 1, 1);
  // const endDate = new Date(Number(year), Number(month), 0);

  const handleEditBooking = (booking: Booking) => {
    setSelectedBooking(booking.id);
    setOpenEditDialog(true);
  };

  const handleDeleteBooking = async (bookingId: string) => {
    try {
      await deleteDoc(doc(db, "bookings", bookingId));
      refetch();
    } catch (error) {
      console.error("Error deleting booking:", error);
    }
  };

  const handleEditExpense = (expense: Expense) => {
    setSelectedExpense(expense);
    setOpenEditExpenseDialog(true);
  };

  const handleDeleteExpense = async (expenseId: string) => {
    try {
      await deleteDoc(doc(db, "expenses", expenseId));
    } catch (error) {
      console.error("Error deleting expense:", error);
    }
  };

  const handleViewImage = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setOpenImageDialog(true);
  };

  const handleAddBooking = async (bookingData: any) => {
    try {
      const bookingRef = collection(db, "bookings");
      const checkIn = new Date(bookingData.checkIn);
      const checkOut = new Date(bookingData.checkOut);

      // Check if booking spans multiple months
      const checkInMonth = checkIn.getMonth();
      const checkOutMonth = checkOut.getMonth();

      // Calculate total days (excluding checkout day)
      const totalDays = Math.floor((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));

      if (checkInMonth !== checkOutMonth) {
        // Split booking into two parts
        const lastDayOfMonth = new Date(checkIn.getFullYear(), checkInMonth + 1, 0);
        lastDayOfMonth.setHours(23, 59, 59, 999);

        const firstDayOfNextMonth = new Date(checkIn.getFullYear(), checkInMonth + 1, 1);

        // Calculate days for each part (excluding checkout day)
        const firstPartDays = Math.floor((lastDayOfMonth.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)) + 1; // +1 because we include the last day of the month
        const secondPartDays = Math.floor((checkOut.getTime() - firstDayOfNextMonth.getTime()) / (1000 * 60 * 60 * 24)); // Don't add 1 here as we don't count checkout day

        // First part of booking (current month)
        const firstBooking = {
          ...bookingData,
          checkOut: lastDayOfMonth.toISOString(),
          amount: bookingData.amount, // نفس المبلغ كما تم إدخاله
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          year: parseInt(year),
          month: checkInMonth + 1,
          isPartial: true,
          partialType: "first",
          numberOfDays: firstPartDays,
          dailyRate: bookingData.amount
        };

        // Second part of booking (next month)
        const secondBooking = {
          ...bookingData,
          checkIn: firstDayOfNextMonth.toISOString(),
          amount: bookingData.amount, // نفس المبلغ كما تم إدخاله
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          year: parseInt(year),
          month: checkOutMonth + 1,
          isPartial: true,
          partialType: "second",
          numberOfDays: secondPartDays,
          dailyRate: bookingData.amount
        };

        // Add both bookings
        await addDoc(bookingRef, firstBooking);
        await addDoc(bookingRef, secondBooking);
      } else {
        // Single month booking
        const numberOfDays = Math.floor((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));

        const newBooking = {
          ...bookingData,
          amount: bookingData.amount, // نفس المبلغ كما تم إدخاله
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          year: parseInt(year),
          month: checkInMonth + 1,
          numberOfDays: numberOfDays,
          dailyRate: bookingData.amount
        };
        await addDoc(bookingRef, newBooking);
      }

      setOpenAddDialog(false);
      refetch();
    } catch (error) {
      console.error("Error adding booking:", error);
      alert("حدث خطأ أثناء إضافة الحجز");
    }
  };

  const handleUpdateBooking = async (
    bookingId: string,
    bookingData: Partial<Booking>
  ) => {
    try {
      const bookingRef = doc(db, "bookings", bookingId);
      await updateDoc(bookingRef, {
        ...bookingData,
        updatedAt: serverTimestamp(),
      });
      setOpenEditDialog(false);
      refetch();
    } catch (error) {
      console.error("Error updating booking:", error);
      alert("حدث خطأ أثناء تحديث الحجز");
    }
  };

  const handleAddExpense = async (data: {
    description: string;
    amount: number;
    date: Date;
    receiptImage?: string | null;
    year: number;
    month: number;
  }) => {
    try {
      const expenseRef = collection(db, "expenses");

      // Convert the date to a Firestore Timestamp
      const expenseData = {
        description: data.description,
        amount: data.amount,
        date: Timestamp.fromDate(data.date),
        receiptImage: data.receiptImage || null,
        year: data.year,
        month: data.month,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      console.log("Saving to Firestore:", expenseData);
      const docRef = await addDoc(expenseRef, expenseData);
      console.log("Document written with ID:", docRef.id);

      setOpenAddExpenseDialog(false);
    } catch (error) {
      console.error("Error adding expense:", error);
    }
  };

  const handleUpdateExpense = async (
    expenseId: string,
    expenseData: Partial<Expense>
  ) => {
    try {
      const expenseRef = doc(db, "expenses", expenseId);

      // Convert any date strings to Firestore timestamps
      const updateData = {
        ...expenseData,
        date: Timestamp.fromDate(expenseData.date as Date),
        updatedAt: serverTimestamp(),
      };

      await updateDoc(expenseRef, updateData);
      setOpenEditExpenseDialog(false);
    } catch (error) {
      console.error("Error updating expense:", error);
      alert("حدث خطأ أثناء تحديث المصروف");
    }
  };

  const handleMonthChange = (newMonth: number) => {
    navigate(`/bookings/${year}/${newMonth}`);
    refetch();
  };

  const handleYearChange = (newYear: number) => {
    navigate(`/bookings/${newYear}/${month}`);
    refetch();
  };

  return (
    <Box sx={{ width: "100%" }}>
      <MonthSelector
        selectedYear={Number(year)}
        selectedMonth={Number(month)}
        bookings={bookings}
        expenses={expenses}
        onMonthChange={handleMonthChange}
        onYearChange={handleYearChange}
      />

      <Box
        sx={{
          mb: 4,
          display: "flex",
          alignItems: "center",
          gap: 2,
          justifyContent: "space-between",
          width: "100%",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Button onClick={handleBack} variant="outlined" color="primary">
            {t("common.back")}
          </Button>
          <Typography variant="h5" component="h1">
            {format(
              new Date(parseInt(year || "2024"), parseInt(month || "1") - 1),
              "MMMM yyyy",
              { locale: arSA }
            )}
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenAddDialog(true)}
        >
          إضافة حجز
        </Button>
      </Box>

      <Box
        sx={{
          mb: 3,
          display: "flex",
          gap: 2,
          alignItems: "center",
          width: "100%",
        }}
      >
        <TextField
          placeholder="البحث عن حجز..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ width: { xs: "100%", sm: 300 } }}
        />
      </Box>

      <Box sx={{ width: "100%", overflowX: "auto" }}>
        {bookingsLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
            <CircularProgress />
          </Box>
        ) : bookingsError ? (
          <Box sx={{ color: "error.main", textAlign: "center", my: 4 }}>
            حدث خطأ أثناء تحميل البيانات
          </Box>
        ) : (
          <BookingsTable
            bookings={bookings}
            onEdit={handleEditBooking}
            onDelete={handleDeleteBooking}
            onViewImage={handleViewImage}
            selectedMonth={parseInt(month)}
            selectedYear={parseInt(year)}
          />
        )}
      </Box>

      <Box sx={{ width: "100%", mb: 4 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
            width: "100%",
          }}
        >
          <Typography variant="h6">المصروفات</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenAddExpenseDialog(true)}
          >
            إضافة مصروف
          </Button>
        </Box>

        <Box sx={{ width: "100%", overflowX: "auto" }}>
          {expensesLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
              <CircularProgress />
            </Box>
          ) : expensesError ? (
            <Box sx={{ color: "error.main", textAlign: "center", my: 4 }}>
              حدث خطأ أثناء تحميل البيانات
            </Box>
          ) : (
            <ExpensesTable
              expenses={expenses}
              onEdit={handleEditExpense}
              onDelete={handleDeleteExpense}
              onViewImage={handleViewImage}
            />
          )}
        </Box>
      </Box>

      <Dialog
        open={openImageDialog}
        onClose={() => setOpenImageDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogContent>
          {selectedImage && (
            <img
              src={selectedImage}
              alt="Receipt"
              style={{
                width: "100%",
                height: "auto",
                maxHeight: "80vh",
                objectFit: "contain",
              }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenImageDialog(false)}>
            {t("close")}
          </Button>
        </DialogActions>
      </Dialog>

      <AddBookingDialog
        open={openAddDialog}
        onClose={() => setOpenAddDialog(false)}
        onSubmit={handleAddBooking}
        selectedMonth={month}
        selectedYear={year}
      />

      <EditBookingDialog
        open={openEditDialog}
        onClose={() => {
          setOpenEditDialog(false);
          setSelectedBooking(null);
        }}
        booking={bookings.find((b) => b.id === selectedBooking) || null}
        onSubmit={handleUpdateBooking}
      />

      <AddExpenseDialog
        open={openAddExpenseDialog}
        onClose={() => setOpenAddExpenseDialog(false)}
        onSubmit={handleAddExpense}
        selectedMonth={month}
        selectedYear={year}
      />

      <EditExpenseDialog
        open={openEditExpenseDialog}
        onClose={() => {
          setOpenEditExpenseDialog(false);
          setSelectedExpense(null);
        }}
        expense={selectedExpense}
        onSubmit={handleUpdateExpense}
        selectedMonth={""}
        selectedYear={""}
      />
    </Box>
  );
}
