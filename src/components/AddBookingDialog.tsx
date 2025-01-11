import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Stack,
  IconButton,
  InputAdornment,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { arSA } from "date-fns/locale";
import { db, COLLECTIONS } from "../config/firebase";
import { collection, getDocs } from "firebase/firestore";
import type { Apartment, Booking } from "../config/firebase";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import PhoneIcon from "@mui/icons-material/Phone";
import { uploadImage } from "../config/cloudinary";

interface Receipt {
  id: string;
  url: string;
  note?: string;
  uploadDate: string;
}

interface AddBookingDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (bookingData: any) => void;
  booking?: Booking;
  selectedMonth: string;
  selectedYear: string;
}

export const AddBookingDialog: React.FC<AddBookingDialogProps> = ({
  open,
  onClose,
  onSubmit,
  booking,
  selectedMonth,
  selectedYear,
}) => {
  const [clientName, setClientName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [checkIn, setCheckIn] = useState<Date>(new Date());
  const [checkOut, setCheckOut] = useState<Date>(new Date());
  const [amount, setAmount] = useState("");
  const [bookingSource, setBookingSource] = useState<"airbnb" | "booking" | "cash" | "other">("cash");
  const [selectedApartment, setSelectedApartment] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(false);
  const [apartments, setApartments] = useState<Apartment[]>([]);
  
  // New states for receipts
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [currentReceipt, setCurrentReceipt] = useState<File | null>(null);
  const [receiptNote, setReceiptNote] = useState("");
  const [editingReceiptId, setEditingReceiptId] = useState<string | null>(null);

  useEffect(() => {
    const fetchApartments = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, COLLECTIONS.APARTMENTS));
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
          ? new Date(booking.checkIn)
          : new Date()
      );
      setCheckOut(
        booking.checkOut instanceof Date
          ? booking.checkOut
          : booking.checkOut
          ? new Date(booking.checkOut)
          : new Date()
      );
      setAmount(booking.amount?.toString() || "");
      setBookingSource(booking.bookingSource || "cash");
      setSelectedApartment(booking.apartmentId || "");
      // Load existing receipts
      if (booking.receipts) {
        setReceipts(booking.receipts);
      } else if (booking.receiptImage) {
        // Convert old single receipt to new format
        setReceipts([{
          id: '1',
          url: booking.receiptImage,
          uploadDate: booking.createdAt || new Date().toISOString()
        }]);
      }
    } else {
      resetForm();
    }
  }, [booking, open]);

  const resetForm = () => {
    setClientName("");
    setPhoneNumber("");
    setCheckIn(new Date());
    setCheckOut(new Date());
    setAmount("");
    setBookingSource("cash");
    setSelectedApartment("");
    setReceipts([]);
    setCurrentReceipt(null);
    setReceiptNote("");
    setEditingReceiptId(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleAddReceipt = async () => {
    if (!currentReceipt) return;

    setUploadProgress(true);
    try {
      const receiptUrl = await uploadImage(currentReceipt);
      const newReceipt = {
        id: Date.now().toString(),
        url: receiptUrl,
        note: receiptNote,
        uploadDate: new Date().toISOString()
      };
      setReceipts(prev => [...prev, newReceipt]);
      setCurrentReceipt(null);
      setReceiptNote("");
    } catch (error) {
      console.error("Error uploading receipt:", error);
      alert("حدث خطأ أثناء رفع الإيصال");
    } finally {
      setUploadProgress(false);
    }
  };

  const handleEditReceiptNote = (receiptId: string, newNote: string) => {
    setReceipts(prev => prev.map(receipt => 
      receipt.id === receiptId ? { ...receipt, note: newNote } : receipt
    ));
    setEditingReceiptId(null);
  };

  const handleDeleteReceipt = (receiptId: string) => {
    setReceipts(prev => prev.filter(receipt => receipt.id !== receiptId));
  };

  const handleSubmit = async () => {
    if (!selectedApartment || !clientName || !phoneNumber || !amount) {
      return;
    }

    setLoading(true);
    try {
      const bookingData = {
        apartmentId: selectedApartment,
        clientName,
        phoneNumber,
        checkIn: checkIn.toISOString(),
        checkOut: checkOut.toISOString(),
        amount: Number(amount),
        bookingSource,
        status: "active",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        receipts: receipts.map(receipt => ({
          id: receipt.id,
          imageUrl: receipt.url,
          uploadedAt: new Date(receipt.uploadDate),
          amount: Number(amount),
          bookingId: "", // This will be set after booking creation
          note: receipt.note || ""
        }))
      };

      await onSubmit(bookingData);
      handleClose();
    } catch (error) {
      console.error("Error adding booking:", error);
      alert("حدث خطأ أثناء إضافة الحجز");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={arSA}>
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>{booking ? "تعديل حجز" : "إضافة حجز"}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            {/* Client Info Section */}
            <Paper elevation={0} sx={{ p: 2, bgcolor: 'rgba(0, 0, 0, 0.05)' }}>
              <Typography variant="subtitle2" sx={{ mb: 2 }}>معلومات العميل</Typography>
              <Stack spacing={2}>
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
              </Stack>
            </Paper>

            {/* Booking Details Section */}
            <Paper elevation={0} sx={{ p: 2, bgcolor: 'rgba(0, 0, 0, 0.05)' }}>
              <Typography variant="subtitle2" sx={{ mb: 2 }}>تفاصيل الحجز</Typography>
              <Stack spacing={2}>
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

                <DatePicker
                  label="تاريخ الدخول"
                  value={checkIn}
                  onChange={(newValue) => setCheckIn(newValue || new Date())}
                  format="dd/MM/yyyy"
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
                  onChange={(newValue) => setCheckOut(newValue || new Date())}
                  format="dd/MM/yyyy"
                  minDate={checkIn}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                    },
                  }}
                />

                <TextField
                  label="المبلغ اليومي"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  type="number"
                  fullWidth
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">ريال</InputAdornment>
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
                    <MenuItem value="booking">Booking.com</MenuItem>
                    <MenuItem value="cash">كاش</MenuItem>
                    <MenuItem value="other">أخرى</MenuItem>
                  </Select>
                </FormControl>
              </Stack>
            </Paper>

            {/* Receipts Section */}
            <Paper elevation={0} sx={{ p: 2, bgcolor: 'rgba(0, 0, 0, 0.05)' }}>
              <Typography variant="subtitle2" sx={{ mb: 2 }}>الإيصالات</Typography>
              
              {/* Upload New Receipt */}
              <Box sx={{ mb: 2 }}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && setCurrentReceipt(e.target.files[0])}
                  style={{ display: 'none' }}
                  id="receipt-upload"
                />
                <Stack direction="row" spacing={2} alignItems="flex-start">
                  <label htmlFor="receipt-upload">
                    <Button
                      component="span"
                      variant="outlined"
                      startIcon={<CloudUploadIcon />}
                      disabled={uploadProgress}
                    >
                      اختيار إيصال
                    </Button>
                  </label>
                  {currentReceipt && (
                    <>
                      <TextField
                        label="ملاحظات الإيصال"
                        value={receiptNote}
                        onChange={(e) => setReceiptNote(e.target.value)}
                        size="small"
                        fullWidth
                      />
                      <Button
                        onClick={handleAddReceipt}
                        variant="contained"
                        disabled={uploadProgress}
                      >
                        {uploadProgress ? <CircularProgress size={24} /> : "إضافة"}
                      </Button>
                    </>
                  )}
                </Stack>
              </Box>

              {/* Receipts List */}
              {receipts.length > 0 && (
                <List>
                  {receipts.map((receipt, index) => (
                    <ListItem
                      key={receipt.id}
                      sx={{
                        bgcolor: 'background.paper',
                        mb: 1,
                        borderRadius: 1,
                      }}
                    >
                      <ListItemText
                        primary={`إيصال ${index + 1}`}
                        secondary={
                          editingReceiptId === receipt.id ? (
                            <TextField
                              value={receipt.note || ""}
                              onChange={(e) => handleEditReceiptNote(receipt.id, e.target.value)}
                              size="small"
                              fullWidth
                              autoFocus
                              onBlur={() => setEditingReceiptId(null)}
                            />
                          ) : (
                            receipt.note || "بدون ملاحظات"
                          )
                        }
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          onClick={() => setEditingReceiptId(receipt.id)}
                          sx={{ mr: 1 }}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          edge="end"
                          onClick={() => handleDeleteReceipt(receipt.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              )}
            </Paper>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
            إلغاء
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? "جاري الحفظ..." : booking ? "تحديث" : "إضافة"}
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
}
