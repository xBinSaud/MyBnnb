import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Alert,
  IconButton,
  Typography,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { arSA } from "date-fns/locale";
import { isAfter } from "date-fns";
import { Booking, Receipt } from "../config/firebase";
import { useBookingDates } from "../hooks/useBookingDates";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import { uploadImage } from "../config/cloudinary";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../config/firebase";

interface EditBookingDialogProps {
  open: boolean;
  onClose: () => void;
  booking: Booking | null;
  onSubmit: (bookingId: string, bookingData: Partial<Booking>) => Promise<void>;
}

export const EditBookingDialog: React.FC<EditBookingDialogProps> = ({
  open,
  onClose,
  booking,
  onSubmit,
}) => {
  const [clientName, setClientName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [checkIn, setCheckIn] = useState<Date | null>(null);
  const [checkOut, setCheckOut] = useState<Date | null>(null);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [dateError, setDateError] = useState<string>("");
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [uploading, setUploading] = useState(false);
  const [selectedApartment, setSelectedApartment] = useState("");
  const [apartments, setApartments] = useState<any[]>([]);
  const [bookingSource, setBookingSource] = useState<"airbnb" | "booking" | "cash" | "other">("cash");

  const { isDateBooked, areAllDatesAvailable } = useBookingDates({
    apartmentId: booking?.apartmentId || "",
    startDate: new Date(),
    endDate: new Date(new Date().setMonth(new Date().getMonth() + 6)),
    excludeBookingId: booking?.id,
  });

  useEffect(() => {
    const fetchApartments = async () => {
      try {
        const apartmentsSnapshot = await getDocs(collection(db, "apartments"));
        const apartmentsData = apartmentsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setApartments(apartmentsData);
      } catch (error) {
        console.error("Error fetching apartments:", error);
      }
    };
    fetchApartments();
  }, []);

  useEffect(() => {
    if (booking) {
      setClientName(booking.clientName || "");
      setPhoneNumber(booking.phoneNumber || "");
      setCheckIn(booking.checkIn ? new Date(booking.checkIn) : null);
      setCheckOut(booking.checkOut ? new Date(booking.checkOut) : null);
      setTotalAmount(booking.amount || 0);
      setSelectedApartment(booking.apartmentId || "");
      setBookingSource(booking.bookingSource || "cash");
      
      // Handle both old and new receipt formats
      if (booking.receipts && booking.receipts.length > 0) {
        setReceipts(booking.receipts);
      } else if (booking.receiptImage) {
        // Convert old format to new format
        setReceipts([
          {
            id: "legacy",
            bookingId: booking.id,
            imageUrl: booking.receiptImage,
            uploadedAt: booking.updatedAt || new Date(),
            amount: booking.amount || 0,
            note: "",
          },
        ]);
      } else {
        setReceipts([]);
      }
    }
  }, [booking]);

  useEffect(() => {
    if (checkIn && checkOut) {
      if (!isAfter(checkOut, checkIn)) {
        setDateError("تاريخ المغادرة يجب أن يكون بعد تاريخ الوصول");
      } else if (!areAllDatesAvailable(checkIn, checkOut)) {
        setDateError("بعض التواريخ المختارة محجوزة مسبقاً");
      } else {
        setDateError("");
      }
    } else {
      setDateError("");
    }
  }, [checkIn, checkOut, areAllDatesAvailable]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !booking) return;

    try {
      setUploading(true);
      const imageUrl = await uploadImage(file);
      
      // Add new receipt to the receipts array
      const newReceipt: Receipt = {
        id: `receipt_${Date.now()}`,
        bookingId: booking.id,
        imageUrl: imageUrl,
        uploadedAt: new Date(),
        amount: totalAmount,
        note: "",
      };
      
      setReceipts((prev) => [...prev, newReceipt]);
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("حدث خطأ أثناء رفع الصورة");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteReceipt = (receiptId: string) => {
    setReceipts(prev => prev.filter(receipt => receipt.id !== receiptId));
  };

  const handleSubmit = async () => {
    if (!booking || !checkIn || !checkOut || !clientName || !phoneNumber || !selectedApartment) return;
    if (dateError) return;

    try {
      await onSubmit(booking.id, {
        clientName,
        phoneNumber,
        checkIn,
        checkOut,
        amount: totalAmount,
        receipts: receipts,
        apartmentId: selectedApartment,
        bookingSource,
        updatedAt: new Date(),
      });
      onClose();
    } catch (error) {
      console.error("Error updating booking:", error);
      alert("حدث خطأ أثناء تحديث الحجز");
    }
  };

  const isSubmitDisabled = !checkIn || !checkOut || !clientName || !phoneNumber || !selectedApartment || !!dateError;

  if (!booking) return null;

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} locale={arSA}>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>تعديل الحجز</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
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
            />

            <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
              <FormControl fullWidth required>
                <InputLabel>الشقة</InputLabel>
                <Select
                  value={selectedApartment}
                  onChange={(e) => setSelectedApartment(e.target.value)}
                  label="الشقة"
                >
                  {apartments.map((apartment) => (
                    <MenuItem key={apartment.id} value={apartment.id}>
                      {apartment.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl fullWidth required>
                <InputLabel>طريقة الحجز</InputLabel>
                <Select
                  value={bookingSource}
                  onChange={(e) => setBookingSource(e.target.value as "airbnb" | "booking" | "cash" | "other")}
                  label="طريقة الحجز"
                >
                  <MenuItem value="airbnb">Airbnb</MenuItem>
                  <MenuItem value="booking">Booking</MenuItem>
                  <MenuItem value="cash">كاش</MenuItem>
                  <MenuItem value="other">أخرى</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ display: "flex", gap: 2 }}>
              <DatePicker
                label="تاريخ الوصول"
                value={checkIn}
                onChange={(newValue) => setCheckIn(newValue)}
                disablePast
                shouldDisableDate={isDateBooked}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true,
                  },
                }}
              />
              <DatePicker
                label="تاريخ المغادرة"
                value={checkOut}
                onChange={(newValue) => setCheckOut(newValue)}
                disablePast
                minDate={checkIn || undefined}
                shouldDisableDate={isDateBooked}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true,
                  },
                }}
              />
            </Box>

            {dateError && (
              <Alert severity="error" sx={{ mt: 1 }}>
                {dateError}
              </Alert>
            )}

            <TextField
              label="المبلغ الإجمالي"
              value={totalAmount}
              onChange={(e) => {
                const value = e.target.value;
                const numericValue = value.replace(/[^0-9]/g, "");
                setTotalAmount(Number(numericValue));
              }}
              type="number"
              fullWidth
              required
            />

            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                الإيصالات
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  flexWrap: "wrap",
                }}
              >
                <input
                  accept="image/*"
                  style={{ display: "none" }}
                  id="receipt-upload"
                  type="file"
                  onChange={handleFileUpload}
                  disabled={uploading}
                />
                <label htmlFor="receipt-upload">
                  <Button
                    component="span"
                    variant="outlined"
                    startIcon={<CloudUploadIcon />}
                    disabled={uploading}
                  >
                    {uploading ? "جاري الرفع..." : "رفع إيصال جديد"}
                  </Button>
                </label>
              </Box>
              
              {receipts.length > 0 && (
                <Box sx={{ mt: 2, display: "flex", gap: 2, flexWrap: "wrap" }}>
                  {receipts.map((receipt) => (
                    <Box 
                      key={receipt.id} 
                      sx={{ 
                        position: "relative",
                        '&:hover .delete-icon': {
                          opacity: 1,
                        }
                      }}
                    >
                      <IconButton
                        className="delete-icon"
                        onClick={() => handleDeleteReceipt(receipt.id)}
                        sx={{
                          position: 'absolute',
                          top: -8,
                          right: -8,
                          bgcolor: 'error.main',
                          color: 'white',
                          opacity: 0,
                          transition: 'opacity 0.2s',
                          zIndex: 1,
                          padding: '4px',
                          '&:hover': {
                            bgcolor: 'error.dark',
                          },
                          '& .MuiSvgIcon-root': {
                            fontSize: '1rem',
                          },
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                      <img
                        src={receipt.imageUrl}
                        alt="Receipt"
                        style={{
                          width: "100px",
                          height: "100px",
                          objectFit: "cover",
                          borderRadius: "4px",
                        }}
                      />
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>إلغاء</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={isSubmitDisabled}>
            حفظ التغييرات
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};
