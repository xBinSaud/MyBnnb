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
  Button,
  Chip,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import DescriptionIcon from "@mui/icons-material/Description";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import HomeIcon from "@mui/icons-material/Home";
import CloseIcon from "@mui/icons-material/Close";
import { Expense } from "../config/firebase";
import { getDate, format } from "date-fns";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../config/firebase";

type Order = 'asc' | 'desc';

interface ExpensesTableProps {
  expenses: Expense[];
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
  onViewImage: (imageUrl: string) => void;
  selectedMonth: string;
  selectedYear: string;
}

export const ExpensesTable: React.FC<ExpensesTableProps> = ({
  expenses,
  onEdit,
  onDelete,
  onViewImage,
  selectedMonth,
  selectedYear,
}) => {
  const [order, setOrder] = useState<Order>('asc');
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

  const sortedExpenses = useMemo(() => {
    return [...expenses].sort((a, b) => {
      const aDate = new Date(a.date).getTime();
      const bDate = new Date(b.date).getTime();
      return order === 'asc' ? aDate - bDate : bDate - aDate;
    });
  }, [expenses, order]);

  const handleCloseImagePreview = () => {
    setSelectedImage(null);
  };

  const handleOpenImagePreview = (url: string) => {
    setSelectedImage(url);
  };

  return (
    <Box sx={{ width: '100%', p: 1 }}>
      <Grid container spacing={1.5}>
        {sortedExpenses.map((expense) => (
          <Grid item xs={12} sm={6} lg={4} key={expense.id}>
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
                  background: 'linear-gradient(90deg, #f85149 0%, #ff6b64 100%)',
                  borderTopLeftRadius: '8px',
                  borderTopRightRadius: '8px',
                }
              }}
            >
              <CardContent sx={{ p: 2 }}>
                {/* Expense Info */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                  <AttachMoneyIcon sx={{ fontSize: 40, color: '#f85149' }} />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" sx={{ color: 'white', lineHeight: 1.2, mb: 0.5 }}>
                      {expense.amount} ريال
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Typography variant="body2" sx={{ color: '#8b949e' }}>
                        {expense.description}
                      </Typography>
                    </Box>
                  </Box>
                  <Chip
                    icon={<DescriptionIcon />}
                    label={expense.category}
                    size="small"
                    sx={{
                      bgcolor: 'rgba(248, 81, 73, 0.1)',
                      color: '#f85149',
                      '& .MuiChip-icon': {
                        color: 'inherit'
                      }
                    }}
                  />
                </Box>

                {/* Date and Apartment Info */}
                <Stack spacing={1.5} sx={{ mb: 2 }}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1,
                    bgcolor: 'rgba(248, 81, 73, 0.1)',
                    borderRadius: 1,
                    p: 1
                  }}>
                    <CalendarTodayIcon sx={{ color: '#f85149', fontSize: 18 }} />
                    <Typography variant="body2" sx={{ color: '#fff' }}>
                      {format(new Date(expense.date), 'dd/MM/yyyy')}
                    </Typography>
                  </Box>

                  {expense.apartmentId && (
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
                        {apartments[expense.apartmentId]?.name || 'غير معروف'}
                      </Typography>
                    </Box>
                  )}
                </Stack>

                {/* Actions */}
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'flex-end', 
                  gap: 1, 
                  mt: 2,
                  borderTop: '1px solid rgba(139, 148, 158, 0.1)',
                  pt: 1
                }}>
                  {expense.receiptImage && (
                    <Typography
                      variant="body2"
                      sx={{ 
                        color: '#f85149',
                        cursor: 'pointer',
                        '&:hover': { textDecoration: 'underline' }
                      }}
                      onClick={() => handleOpenImagePreview(expense.receiptImage!)}
                    >
                      عرض الايصال
                    </Typography>
                  )}
                  <IconButton
                    onClick={() => onEdit(expense)}
                    size="small"
                    sx={{ 
                      color: '#f85149',
                      '&:hover': { bgcolor: 'rgba(248, 81, 73, 0.1)' }
                    }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    onClick={() => onDelete(expense.id!)}
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
        ))}
        {expenses.length === 0 && (
          <Grid item xs={12}>
            <Typography align="center" sx={{ color: '#8b949e' }}>
              لا توجد مصروفات
            </Typography>
          </Grid>
        )}
      </Grid>

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
