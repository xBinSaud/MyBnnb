import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  CircularProgress,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { uploadImage } from '../config/cloudinary';
import type { Expense } from '../config/firebase';
import { arSA } from 'date-fns/locale';

interface ExpenseFormData {
  description: string;
  amount: number;
  date: Date;
  receiptImage?: string | null;
  year: number;
  month: number;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ExpenseFormData) => Promise<void>;
  selectedMonth: string;
  selectedYear: string;
  expense?: Expense;
}

export const AddExpenseDialog: React.FC<Props> = ({
  open,
  onClose,
  onSubmit,
  selectedMonth,
  selectedYear,
  expense
}) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState<Date | null>(new Date());
  const [receipt, setReceipt] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (expense) {
      setDescription(expense.description || '');
      setAmount(expense.amount?.toString() || '');
      setDate(expense.date instanceof Date ? expense.date : new Date(expense.date));
    } else {
      setDescription('');
      setAmount('');
      setDate(new Date());
      setReceipt(null);
      setPreviewUrl(null);
    }
  }, [expense, open]);

  useEffect(() => {
    if (open) {
      // Set initial date to the first day of selected month
      const initialDate = new Date(parseInt(selectedYear), parseInt(selectedMonth) - 1, 1);
      setDate(initialDate);
    }
  }, [open, selectedMonth, selectedYear]);

  const handleClose = () => {
    setDescription('');
    setAmount('');
    setDate(new Date());
    setReceipt(null);
    setPreviewUrl(null);
    onClose();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setReceipt(file);
      // Create a preview URL for the selected image
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!description || !amount || !date) return;
    
    setLoading(true);
    try {
      let receiptImage = null;
      if (receipt) {
        setUploadProgress(true);
        try {
          receiptImage = await uploadImage(receipt);
          console.log('Receipt image URL:', receiptImage);
        } catch (uploadError) {
          console.error('Error uploading image:', uploadError);
          // Continue without image if upload fails
        }
        setUploadProgress(false);
      }

      const expenseData = {
        description,
        amount: parseFloat(amount),
        date: new Date(date),
        receiptImage,
        year: parseInt(selectedYear),
        month: parseInt(selectedMonth)
      };

      console.log('Submitting expense data:', expenseData);
      await onSubmit(expenseData);
      handleClose();
    } catch (error) {
      console.error('Error submitting expense:', error);
    } finally {
      setLoading(false);
    }
  };

  const isDateInSelectedMonth = (date: Date | null) => {
    if (!date) return false;
    return date.getMonth() + 1 === parseInt(selectedMonth) && date.getFullYear() === parseInt(selectedYear);
  };

  const handleDateChange = (newValue: Date | null) => {
    if (newValue && !isDateInSelectedMonth(newValue)) {
      alert('يجب أن يكون التاريخ في نفس الشهر المحدد');
      return;
    }
    setDate(newValue);
  };

  const defaultMonth = new Date(parseInt(selectedYear), parseInt(selectedMonth) - 1);

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{expense ? 'تعديل مصروف' : 'إضافة مصروف'}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            id="expense-description"
            name="description"
            label="الوصف"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
          />
          <TextField
            id="expense-amount"
            name="amount"
            label="المبلغ"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            fullWidth
          />
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={arSA}>
            <DatePicker
              label="التاريخ"
              value={date}
              onChange={handleDateChange}
              slotProps={{
                textField: {
                  id: 'expense-date',
                  name: 'date',
                  fullWidth: true
                }
              }}
              defaultCalendarMonth={defaultMonth}
              views={['year', 'month', 'day']}
              openTo="day"
            />
          </LocalizationProvider>
          <input
            accept="image/*"
            id="expense-receipt"
            name="receipt"
            type="file"
            hidden
            onChange={handleFileChange}
          />
          <label htmlFor="expense-receipt">
            <Button
              component="span"
              variant="outlined"
              startIcon={<CloudUploadIcon />}
              fullWidth
              disabled={uploadProgress}
            >
              {receipt ? 'تغيير الإيصال' : 'رفع الإيصال'}
            </Button>
          </label>
          {(receipt || expense?.receiptImage) && (
            <Box sx={{ mb: 2, textAlign: 'center' }}>
              {previewUrl && (
                <img 
                  src={previewUrl} 
                  alt="Receipt preview" 
                  style={{ 
                    maxWidth: '100%', 
                    maxHeight: '200px', 
                    objectFit: 'contain' 
                  }} 
                />
              )}
              <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>
                {receipt ? receipt.name : 'تم رفع الإيصال مسبقاً'}
              </Typography>
            </Box>
          )}
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
          {loading ? 'جاري الإضافة...' : 'حفظ'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
