import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Stack,
  Alert,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { isAfter } from "date-fns";
import type { Booking } from "../config/firebase";
import { useBookingDates } from "../hooks/useBookingDates";

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

  const { isDateBooked, areAllDatesAvailable } = useBookingDates({
    apartmentId: booking?.apartmentId || "",
    startDate: new Date(),
    endDate: new Date(new Date().setMonth(new Date().getMonth() + 6)),
    excludeBookingId: booking?.id,
  });

  useEffect(() => {
    if (booking) {
      setClientName(booking.clientName || "");
      setPhoneNumber(booking.phoneNumber || "");
      setCheckIn(
        booking.checkIn instanceof Date
          ? booking.checkIn
          : new Date(booking.checkIn || new Date())
      );
      setCheckOut(
        booking.checkOut instanceof Date
          ? booking.checkOut
          : new Date(booking.checkOut || new Date())
      );
      setTotalAmount(booking.amount || 0);
    }
  }, [booking]);

  // Validate dates whenever they change
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

  const handleSubmit = async () => {
    if (!booking || !checkIn || !checkOut || !clientName || !phoneNumber)
      return;
    if (dateError) return;

    try {
      await onSubmit(booking.id, {
        clientName,
        phoneNumber,
        checkIn: checkIn,
        checkOut: checkOut,
        amount: totalAmount,
        updatedAt: new Date(),
      });
      onClose();
    } catch (error) {
      console.error("Error updating booking:", error);
      alert("حدث خطأ أثناء تحديث الحجز");
    }
  };

  const isSubmitDisabled =
    !checkIn || !checkOut || !clientName || !phoneNumber || !!dateError;

  if (!booking) return null;

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
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

            <Stack
              spacing={2}
              direction={{ xs: "column", sm: "row" }}
              sx={{ width: "100%" }}
            >
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
            </Stack>

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
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>إلغاء</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={isSubmitDisabled}
          >
            حفظ التغييرات
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};
