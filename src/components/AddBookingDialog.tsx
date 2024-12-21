import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Box,
  InputAdornment,
  Typography,
  FormControl,
  InputLabel,
  Select,
  CircularProgress,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { arSA } from "date-fns/locale";
import { collection, getDocs } from "firebase/firestore";
import { db, COLLECTIONS } from "../config/firebase";
import type { Apartment, Booking } from "../config/firebase";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import PhoneIcon from "@mui/icons-material/Phone";
import { uploadImage } from "../config/cloudinary";

interface AddBookingDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (bookingData: {
    clientName: string;
    phoneNumber: string;
    apartmentId: string;
    checkIn: string;
    checkOut: string;
    amount: number;
    receiptImage?: string | null;
    status: string;
    bookingSource: "airbnb" | "booking" | "cash" | "other";
    year: number;
    month: number;
    isPartial?: boolean;
    partialType?: 'first' | 'second';
    numberOfDays?: number;
  }) => void;
  selectedMonth: string;
  selectedYear: string;
  booking?: Booking;
}

export function AddBookingDialog({
  open,
  onClose,
  onSubmit,
  booking,
  selectedMonth,
  selectedYear,
}: AddBookingDialogProps) {
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [selectedApartment, setSelectedApartment] = useState<string>("");
  const [clientName, setClientName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [checkIn, setCheckIn] = useState<Date>(new Date());
  const [checkOut, setCheckOut] = useState<Date>(new Date());
  const [amount, setAmount] = useState("");
  const [bookingSource, setBookingSource] = useState<
    "airbnb" | "booking" | "cash" | "other"
  >("cash");
  const [receipt, setReceipt] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(false);

  useEffect(() => {
    const fetchApartments = async () => {
      try {
        const querySnapshot = await getDocs(
          collection(db, COLLECTIONS.APARTMENTS)
        );
        const apartmentsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Apartment[];
        setApartments(apartmentsData);
      } catch (error) {
        console.error("Error fetching apartments:", error);
      }
    };

    if (open) {
      fetchApartments();
    }
  }, [open]);

  useEffect(() => {
    if (booking) {
      setClientName(booking.clientName || "");
      setPhoneNumber(booking.phoneNumber || "");
      setCheckIn(
        booking.checkIn instanceof Date
          ? booking.checkIn
          : booking.checkIn
          ? new Date(booking.checkIn) // Ensure booking.checkOut is defined
          : new Date() // Fallback to current date if undefined
      );
      setCheckOut(
        booking.checkOut instanceof Date
          ? booking.checkOut
          : booking.checkOut
          ? new Date(booking.checkOut) // Ensure booking.checkOut is defined
          : new Date() // Fallback to current date if undefined
      );
      setAmount(booking.amount?.toString() || "");
      setBookingSource(booking.bookingSource || "cash");
      setSelectedApartment(booking.apartmentId || "");
    } else {
      // Reset form when dialog is opened for a new booking
      setClientName("");
      setPhoneNumber("");
      setCheckIn(new Date());
      setCheckOut(new Date());
      setAmount("");
      setBookingSource("cash");
      setSelectedApartment("");
      setReceipt(null);
    }
  }, [booking, open]);

  useEffect(() => {
    if (open) {
      // Set initial date to the first day of selected month
      const initialDate = new Date(
        parseInt(selectedYear),
        parseInt(selectedMonth) - 1,
        1
      );
      setCheckIn(initialDate);
      setCheckOut(initialDate);
    }
  }, [open, selectedMonth, selectedYear]);

  // const defaultMonth = new Date(
  //   parseInt(selectedYear),
  //   parseInt(selectedMonth) - 1
  // );

  const handleClose = () => {
    // Reset form when dialog is closed
    setClientName("");
    setPhoneNumber("");
    setCheckIn(new Date());
    setCheckOut(new Date());
    setAmount("");
    setBookingSource("cash");
    setSelectedApartment("");
    setReceipt(null);
    onClose();
  };

  const handleSubmit = async () => {
    if (
      !clientName ||
      !phoneNumber ||
      !checkIn ||
      !checkOut ||
      !amount ||
      !selectedApartment
    ) {
      alert("الرجاء تعبئة جميع الحقول المطلوبة");
      return;
    }

    setLoading(true);
    try {
      let receiptUrl = booking?.receiptImage || null;

      // Upload receipt if exists
      if (receipt) {
        setUploadProgress(true);
        receiptUrl = await uploadImage(receipt);
        setUploadProgress(false);
      }

      // تحديد إذا كان الحجز يمتد عبر شهرين
      const bookingMonth = checkIn.getMonth();
      const checkOutMonth = checkOut.getMonth();

      if (bookingMonth !== checkOutMonth) {
        // تحديد نهاية الشهر الأول
        const endOfFirstMonth = new Date(checkIn.getFullYear(), checkIn.getMonth() + 1, 0, 23, 59, 59);
        
        // المبلغ اليومي كما تم إدخاله
        const dailyAmount = parseFloat(amount);
        
        // حساب عدد الأيام في الشهر الأول
        const daysInFirstMonth = Math.ceil((endOfFirstMonth.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        
        // إضافة حجز الشهر الأول
        const firstMonthBooking = {
          clientName,
          phoneNumber,
          apartmentId: selectedApartment,
          checkIn: checkIn.toISOString(),
          checkOut: endOfFirstMonth.toISOString(),
          amount: dailyAmount,
          totalAmount: dailyAmount * daysInFirstMonth,
          bookingSource,
          receiptImage: receiptUrl,
          status: "active" as const,
          year: checkIn.getFullYear(),
          month: checkIn.getMonth() + 1,
          createdAt: booking?.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isPartial: true,
          partialType: 'first',
          numberOfDays: daysInFirstMonth
        };

        // إضافة حجز الشهر الثاني
        const startOfSecondMonth = new Date(checkIn.getFullYear(), checkIn.getMonth() + 1, 1, 0, 0, 0);
        // حساب عدد الأيام في الشهر الثاني بدون يوم الخروج
        const daysInSecondMonth = Math.ceil((checkOut.getTime() - startOfSecondMonth.getTime()) / (1000 * 60 * 60 * 24));

        const secondMonthBooking = {
          clientName,
          phoneNumber,
          apartmentId: selectedApartment,
          checkIn: startOfSecondMonth.toISOString(),
          checkOut: checkOut.toISOString(),
          amount: dailyAmount,
          totalAmount: dailyAmount * daysInSecondMonth,
          bookingSource,
          receiptImage: receiptUrl,
          status: "active" as const,
          year: startOfSecondMonth.getFullYear(),
          month: startOfSecondMonth.getMonth() + 1,
          createdAt: booking?.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isPartial: true,
          partialType: 'second',
          numberOfDays: daysInSecondMonth
        };

        // إضافة كلا الحجزين
        await onSubmit(firstMonthBooking);
        await onSubmit(secondMonthBooking);
      } else {
        // حجز عادي في نفس الشهر
        const bookingData = {
          clientName,
          phoneNumber,
          apartmentId: selectedApartment,
          checkIn: checkIn.toISOString(),
          checkOut: checkOut.toISOString(),
          amount: parseFloat(amount),
          bookingSource,
          receiptImage: receiptUrl,
          status: "active" as const,
          year: parseInt(selectedYear),
          month: parseInt(selectedMonth),
          createdAt: booking?.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isPartial: false
        };

        await onSubmit(bookingData);
      }

      handleClose();
    } catch (error) {
      console.error("Error submitting booking:", error);
      alert("حدث خطأ أثناء إضافة الحجز");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckInChange = (newValue: Date | null) => {
    setCheckIn(newValue || new Date());
  };

  const handleCheckOutChange = (newValue: Date | null) => {
    setCheckOut(newValue || new Date());
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={arSA}>
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{booking ? "تعديل حجز" : "إضافة حجز"}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
            <TextField
              select
              label="الشقة"
              value={selectedApartment}
              onChange={(e) => setSelectedApartment(e.target.value)}
              fullWidth
              required
            >
              {apartments.map((apartment) => (
                <MenuItem key={apartment.id} value={apartment.id}>
                  {apartment.name}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="اسم العميل"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              fullWidth
              required
            />
            <TextField
              label="رقم الجوال"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              fullWidth
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PhoneIcon />
                  </InputAdornment>
                ),
              }}
            />
            <DatePicker
              label="تاريخ الدخول"
              value={checkIn}
              onChange={handleCheckInChange}
              views={["year", "month", "day"]}
              openTo="day"
              slotProps={{
                textField: {
                  fullWidth: true,
                  required: true,
                },
              }}
            />
            <DatePicker
              label="تاريخ الخروج"
              value={checkOut}
              onChange={handleCheckOutChange}
              views={["year", "month", "day"]}
              openTo="day"
              slotProps={{
                textField: {
                  fullWidth: true,
                  required: true,
                },
              }}
            />
            <TextField
              label="المبلغ"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              fullWidth
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">ر.س</InputAdornment>
                ),
              }}
            />
            <FormControl fullWidth>
              <InputLabel>طريقة الحجز</InputLabel>
              <Select
                value={bookingSource}
                onChange={(e) =>
                  setBookingSource(e.target.value as typeof bookingSource)
                }
                label="طريقة الحجز"
              >
                <MenuItem value="airbnb">Airbnb</MenuItem>
                <MenuItem value="booking">Booking</MenuItem>
                <MenuItem value="cash">كاش</MenuItem>
                <MenuItem value="other">أخرى</MenuItem>
              </Select>
            </FormControl>
            <Box>
              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  e.target.files?.[0] && setReceipt(e.target.files[0])
                }
                style={{ display: "none" }}
                id="receipt-upload"
              />
              <label htmlFor="receipt-upload">
                <Button
                  component="span"
                  variant="outlined"
                  startIcon={<CloudUploadIcon />}
                  disabled={uploadProgress}
                >
                  {receipt ? "تغيير الإيصال" : "رفع الإيصال"}
                </Button>
              </label>
              {(receipt || booking?.receiptImage) && (
                <Typography variant="caption" sx={{ ml: 2 }}>
                  {receipt ? receipt.name : "تم رفع الإيصال مسبقاً"}
                </Typography>
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={loading || uploadProgress}>
            إلغاء
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={loading || uploadProgress}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? "جاري الحفظ..." : "حفظ"}
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
}
