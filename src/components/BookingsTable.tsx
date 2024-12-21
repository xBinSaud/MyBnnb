import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Typography,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { format, differenceInDays } from "date-fns";
import { arSA } from "date-fns/locale";
import type { Booking } from "../config/firebase";

interface BookingsTableProps {
  bookings: Booking[];
  onEdit: (booking: Booking) => void;
  onDelete: (bookingId: string) => void;
  onViewImage: (imageUrl: string) => void;
  selectedMonth: number;
  selectedYear: number;
}

export const BookingsTable: React.FC<BookingsTableProps> = ({
  bookings,
  onEdit,
  onDelete,
  onViewImage,
  selectedMonth,
  selectedYear,
}) => {
  const calculateDays = (booking: Booking) => {
    const checkIn = new Date(booking.checkIn);
    const checkOut = new Date(booking.checkOut);
    // لا نضيف 1 لأننا لا نريد حساب يوم الخروج
    return differenceInDays(checkOut, checkIn);
  };

  const calculateTotalAmount = (booking: Booking) => {
    const days = calculateDays(booking);
    return days * booking.amount;
  };

  return (
    <TableContainer component={Paper} sx={{ width: "100%" }}>
      <Table sx={{ minWidth: 800 }}>
        <TableHead>
          <TableRow>
            <TableCell>
              <Typography>اسم العميل</Typography>
            </TableCell>
            <TableCell>
              <Typography>تاريخ الدخول</Typography>
            </TableCell>
            <TableCell>
              <Typography>تاريخ الخروج</Typography>
            </TableCell>
            <TableCell>
              <Typography>المبلغ اليومي</Typography>
            </TableCell>
            <TableCell>
              <Typography>عدد الأيام</Typography>
            </TableCell>
            <TableCell>
              <Typography>المبلغ الإجمالي</Typography>
            </TableCell>
            <TableCell>
              <Typography>طريقة الحجز</Typography>
            </TableCell>
            <TableCell>
              <Typography>صورة الإيصال</Typography>
            </TableCell>
            <TableCell>
              <Typography>إجراءات</Typography>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {bookings.map((booking) => {
            const days = calculateDays(booking);
            const totalAmount = calculateTotalAmount(booking);

            return (
              <TableRow key={booking.id}>
                <TableCell>
                  <Typography>{booking.clientName}</Typography>
                </TableCell>
                <TableCell>
                  <Typography>
                    {format(new Date(booking.checkIn), "dd/MM/yyyy", {
                      locale: arSA,
                    })}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography>
                    {format(new Date(booking.checkOut), "dd/MM/yyyy", {
                      locale: arSA,
                    })}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography>{booking.amount} ريال</Typography>
                </TableCell>
                <TableCell>
                  <Typography>{days} يوم</Typography>
                </TableCell>
                <TableCell>
                  <Typography fontWeight="bold" color="primary">
                    {totalAmount} ريال
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography>{booking.bookingSource}</Typography>
                </TableCell>
                <TableCell>
                  {booking.receiptImage && (
                    <IconButton
                      onClick={() => onViewImage(booking.receiptImage!)}
                      size="small"
                    >
                      <VisibilityIcon />
                    </IconButton>
                  )}
                </TableCell>
                <TableCell>
                  <IconButton
                    onClick={() => onEdit(booking)}
                    size="small"
                    sx={{ mr: 1 }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => onDelete(booking.id!)}
                    size="small"
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            );
          })}
          {bookings.length === 0 && (
            <TableRow>
              <TableCell colSpan={9} align="center">
                لا توجد حجوزات
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
