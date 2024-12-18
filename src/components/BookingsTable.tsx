import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Box,
  Typography,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { format, differenceInDays } from 'date-fns';
import { arSA } from 'date-fns/locale';
import type { Booking } from '../config/firebase';

interface BookingsTableProps {
  bookings: Booking[];
  onEdit: (booking: Booking) => void;
  onDelete: (bookingId: string) => void;
  onViewImage: (imageUrl: string) => void;
}

export const BookingsTable: React.FC<BookingsTableProps> = ({
  bookings,
  onEdit,
  onDelete,
  onViewImage,
}) => {
  const calculateTotalAmount = (booking: Booking) => {
    const days = differenceInDays(new Date(booking.checkOut), new Date(booking.checkIn)) + 1;
    return days * booking.amount;
  };

  return (
    <TableContainer component={Paper} sx={{ width: '100%' }}>
      <Table sx={{ minWidth: 800 }}>
        <TableHead>
          <TableRow>
            <TableCell>اسم العميل</TableCell>
            <TableCell>تاريخ الدخول</TableCell>
            <TableCell>تاريخ الخروج</TableCell>
            <TableCell>المبلغ اليومي</TableCell>
            <TableCell>عدد الأيام</TableCell>
            <TableCell>المبلغ الإجمالي</TableCell>
            <TableCell>طريقة الحجز</TableCell>
            <TableCell>صورة الإيصال</TableCell>
            <TableCell>إجراءات</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {bookings.map((booking) => {
            const days = differenceInDays(new Date(booking.checkOut), new Date(booking.checkIn)) + 1;
            const totalAmount = calculateTotalAmount(booking);
            
            return (
              <TableRow key={booking.id}>
                <TableCell>{booking.clientName}</TableCell>
                <TableCell>
                  {format(new Date(booking.checkIn), 'dd/MM/yyyy', { locale: arSA })}
                </TableCell>
                <TableCell>
                  {format(new Date(booking.checkOut), 'dd/MM/yyyy', { locale: arSA })}
                </TableCell>
                <TableCell>{booking.amount} ريال</TableCell>
                <TableCell>{days} يوم</TableCell>
                <TableCell>
                  <Typography fontWeight="bold" color="primary">
                    {totalAmount} ريال
                  </Typography>
                </TableCell>
                <TableCell>{booking.bookingSource}</TableCell>
                <TableCell>
                  {booking.receiptImage && (
                    <IconButton onClick={() => onViewImage(booking.receiptImage!)}>
                      <VisibilityIcon />
                    </IconButton>
                  )}
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => onEdit(booking)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => onDelete(booking.id)}>
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
