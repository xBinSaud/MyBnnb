import React, { useState, useMemo, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  IconButton,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  Paper,
  DialogContentText,
  Chip,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import HomeIcon from "@mui/icons-material/Home";
import CloseIcon from "@mui/icons-material/Close";
import AirbnbIcon from "@mui/icons-material/Home";
import BookingIcon from "@mui/icons-material/Hotel";
import CashIcon from "@mui/icons-material/LocalAtm";
import OtherIcon from "@mui/icons-material/MoreHoriz";
import { Booking } from "../config/firebase";
import { getDate } from "date-fns";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../config/firebase";

type Order = 'asc' | 'desc';

interface BookingsTableProps {
  bookings: Booking[];
  onEdit: (booking: Booking) => void;
  onDelete: (id: string) => void;
  onViewImage: (receipts: any[]) => void;
  selectedMonth: string;
  selectedYear: string;
}

export const BookingsTable: React.FC<BookingsTableProps> = ({
  bookings,
  onEdit,
  onDelete,
  onViewImage: onViewImageProp,
  selectedMonth,
  selectedYear,
}) => {
  const [order, setOrder] = useState<Order>('asc');
  const [selectedReceipts, setSelectedReceipts] = useState<any[]>([]);
  const [viewReceiptsDialogOpen, setViewReceiptsDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [apartments, setApartments] = useState<{[key: string]: any}>({});

  // Fetch apartments
  useEffect(() => {
    const fetchApartments = async () => {
      try {
        const apartmentsSnapshot = await getDocs(collection(db, "apartments"));
        const apartmentsData = apartmentsSnapshot.docs.reduce((acc, doc) => ({
          ...acc,
          [doc.id]: { id: doc.id, ...doc.data() }
        }), {});
        setApartments(apartmentsData);
      } catch (error) {
        console.error("Error fetching apartments:", error);
      }
    };
    fetchApartments();
  }, []);

  const calculateDays = (booking: Booking) => {
    const checkIn = new Date(booking.checkIn);
    const checkOut = new Date(booking.checkOut);
    
    // إذا كان هذا جزء من حجز ممتد بين شهرين
    if (booking.isPartial) {
      if (booking.partialType === "first") {
        // للشهر الأول نحسب اليوم الأخير لأن له تكملة في الشهر التالي
        return Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
      } else {
        // للشهر الثاني لا نحسب يوم الخروج
        return Math.floor((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
      }
    } else {
      // للحجوزات العادية لا نحسب يوم الخروج
      return Math.floor((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    }
  };

  const calculateTotal = (booking: Booking) => {
    const days = calculateDays(booking);
    const dailyRate = booking.amount;
    return days * dailyRate;
  };

  const sortedBookings = useMemo(() => {
    return [...bookings].sort((a, b) => {
      const aDate = new Date(a.checkIn).getTime();
      const bDate = new Date(b.checkIn).getTime();
      return order === 'asc' ? aDate - bDate : bDate - aDate;
    });
  }, [bookings, order]);

  const handleViewImage = (receipts: any[]) => {
    if (!receipts || receipts.length === 0) return;
    setSelectedReceipts(receipts);
    setViewReceiptsDialogOpen(true);
  };

  const handleCloseImagePreview = () => {
    setSelectedImage(null);
  };

  const handleOpenImagePreview = (url: string) => {
    setSelectedImage(url);
  };

  return (
    <Box sx={{ width: '100%', p: 1 }}>
      <Grid container spacing={1.5}>
        {sortedBookings.map((booking) => {
          const checkInDay = getDate(new Date(booking.checkIn));
          const checkOutDay = getDate(new Date(booking.checkOut));

          return (
            <Grid item xs={12} sm={6} lg={4} key={booking.id}>
              <Card 
                sx={{ 
                  bgcolor: '#1e1e1e',
                  color: 'white',
                  borderRadius: 2,
                  position: 'relative',
                  overflow: 'visible',
                  '&:hover': {
                    boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
                  },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: 'linear-gradient(90deg, #3f88c5 0%, #4fa3e3 100%)',
                    borderTopLeftRadius: '8px',
                    borderTopRightRadius: '8px',
                  }
                }}
              >
                <CardContent sx={{ p: 2 }}>
                  {/* Client Info */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                    <AccountCircleIcon sx={{ fontSize: 40, color: '#3f88c5' }} />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" sx={{ color: 'white', lineHeight: 1.2, mb: 0.5 }}>
                        {booking.clientName}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Typography variant="body2" sx={{ color: '#8b949e' }}>
                          {booking.phoneNumber}
                        </Typography>
                      </Box>
                    </Box>
                    <Chip
                      icon={
                        booking.bookingSource === 'airbnb' ? <AirbnbIcon /> :
                        booking.bookingSource === 'booking' ? <BookingIcon /> :
                        booking.bookingSource === 'cash' ? <CashIcon /> :
                        <OtherIcon />
                      }
                      label={
                        booking.bookingSource === 'airbnb' ? 'Airbnb' :
                        booking.bookingSource === 'booking' ? 'Booking' :
                        booking.bookingSource === 'cash' ? 'كاش' :
                        'أخرى'
                      }
                      size="small"
                      sx={{
                        bgcolor: 
                          booking.bookingSource === 'airbnb' ? 'rgba(255, 88, 93, 0.1)' :
                          booking.bookingSource === 'booking' ? 'rgba(0, 113, 194, 0.1)' :
                          booking.bookingSource === 'cash' ? 'rgba(67, 160, 71, 0.1)' :
                          'rgba(158, 158, 158, 0.1)',
                        color: 
                          booking.bookingSource === 'airbnb' ? '#ff585d' :
                          booking.bookingSource === 'booking' ? '#0071c2' :
                          booking.bookingSource === 'cash' ? '#43a047' :
                          '#9e9e9e',
                        '& .MuiChip-icon': {
                          color: 'inherit'
                        }
                      }}
                    />
                  </Box>

                  {/* Dates and Info */}
                  <Stack spacing={1.5} sx={{ mb: 2 }}>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 2,
                      bgcolor: 'rgba(63, 136, 197, 0.1)',
                      borderRadius: 1,
                      p: 1
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CalendarTodayIcon sx={{ color: '#3f88c5', fontSize: 18 }} />
                        <Box>
                          <Typography variant="caption" sx={{ color: '#8b949e', display: 'block' }}>
                            الدخول
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#fff' }}>
                            يوم {checkInDay}
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CalendarTodayIcon sx={{ color: '#f85149', fontSize: 18 }} />
                        <Box>
                          <Typography variant="caption" sx={{ color: '#8b949e', display: 'block' }}>
                            الخروج
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#fff' }}>
                            يوم {checkOutDay}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>

                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 1,
                      bgcolor: 'rgba(139, 148, 158, 0.1)',
                      borderRadius: 1,
                      p: 1
                    }}>
                      <HomeIcon sx={{ color: '#8b949e', fontSize: 18 }} />
                      <Typography variant="body2" sx={{ color: '#fff' }}>
                        {apartments[booking.apartmentId]?.name || 'غير معروف'}
                      </Typography>
                    </Box>
                  </Stack>

                  {/* Payment Info */}
                  <Box sx={{ 
                    bgcolor: 'rgba(63, 136, 197, 0.1)',
                    borderRadius: 1,
                    p: 1
                  }}>
                    <Stack spacing={0.5}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ color: '#8b949e' }}>
                          المبلغ اليومي
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#3f88c5' }}>
                          {booking.amount} ريال
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ color: '#8b949e' }}>
                          المدة
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#fff' }}>
                          {calculateDays(booking)} يوم
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ color: '#8b949e' }}>
                          الإجمالي
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#3f88c5', fontWeight: 'bold' }}>
                          {calculateTotal(booking)} ريال
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>

                  {/* Actions */}
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'flex-end', 
                    gap: 1, 
                    mt: 2,
                    borderTop: '1px solid rgba(139, 148, 158, 0.1)',
                    pt: 1
                  }}>
                    {(booking.receipts?.length > 0 || booking.receiptImage) && (
                      <Typography
                        variant="body2"
                        sx={{ 
                          color: '#3f88c5',
                          cursor: 'pointer',
                          '&:hover': { textDecoration: 'underline' }
                        }}
                        onClick={() => handleViewImage(
                          booking.receipts?.length ? booking.receipts : 
                          booking.receiptImage ? [{ 
                            imageUrl: booking.receiptImage, 
                            id: '1',
                            bookingId: booking.id || '',
                            uploadedAt: booking.updatedAt || new Date(),
                            amount: booking.amount || 0,
                            note: ''
                          }] : []
                        )}
                      >
                        {booking.receipts?.length > 1 ? 'عرض الايصالات' : 'عرض الايصال'}
                      </Typography>
                    )}
                    <IconButton
                      onClick={() => onEdit(booking)}
                      size="small"
                      sx={{ 
                        color: '#3f88c5',
                        '&:hover': { bgcolor: 'rgba(63, 136, 197, 0.1)' }
                      }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      onClick={() => onDelete(booking.id!)}
                      size="small"
                      sx={{ 
                        color: '#f85149',
                        '&:hover': { bgcolor: 'rgba(248, 81, 73, 0.1)' }
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
        {bookings.length === 0 && (
          <Grid item xs={12}>
            <Typography align="center" sx={{ color: '#8b949e' }}>
              لا توجد حجوزات
            </Typography>
          </Grid>
        )}
      </Grid>
      {/* Receipts Dialog */}
      <Dialog 
        open={viewReceiptsDialogOpen} 
        onClose={() => setViewReceiptsDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">الإيصالات</Typography>
            <IconButton onClick={() => setViewReceiptsDialogOpen(false)} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <List>
            {selectedReceipts.map((receipt, index) => (
              <ListItem 
                key={receipt.id}
                sx={{
                  bgcolor: 'rgba(0, 0, 0, 0.05)',
                  mb: 1,
                  borderRadius: 1,
                }}
              >
                <ListItemText
                  primary={`إيصال ${index + 1}`}
                  secondary={
                    <>
                      <Typography variant="body2" color="textSecondary">
                        {receipt.note || "بدون ملاحظات"}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        تاريخ الرفع: {new Date(receipt.uploadedAt).toLocaleDateString('ar-SA')}
                      </Typography>
                    </>
                  }
                />
                <Button
                  onClick={() => handleOpenImagePreview(receipt.imageUrl || receipt.url)}
                  variant="outlined"
                  size="small"
                >
                  عرض
                </Button>
              </ListItem>
            ))}
          </List>
        </DialogContent>
      </Dialog>

      {/* Image Preview Dialog */}
      <Dialog
        open={!!selectedImage}
        onClose={handleCloseImagePreview}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="flex-end">
            <IconButton onClick={handleCloseImagePreview} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            width="100%"
            minHeight="500px"
            position="relative"
          >
            {selectedImage && (
              <img
                src={selectedImage}
                alt="Receipt"
                style={{
                  maxWidth: '100%',
                  maxHeight: '80vh',
                  objectFit: 'contain',
                  cursor: 'pointer'
                }}
                onClick={(e) => {
                  // Open image in new tab when clicked
                  window.open(selectedImage, '_blank');
                }}
              />
            )}
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};
