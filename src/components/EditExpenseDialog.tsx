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
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { uploadImage } from '../config/cloudinary';
import type { Expense } from '../config/firebase';
import { arSA } from 'date-fns/locale';

interface EditExpenseDialogProps {
  open: boolean;
  onClose: () => void;
  expense: Expense | null;
  onSubmit: (expenseId: string, expenseData: Partial<Expense>) => Promise<void>;
  selectedMonth: string;
  selectedYear: string;
}

export const EditExpenseDialog: React.FC<EditExpenseDialogProps> = ({
  open,
  onClose,
  expense,
  onSubmit,
  selectedMonth,
  selectedYear,
}) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState<Date>(new Date());
  const [receipt, setReceipt] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(false);

  useEffect(() => {
    if (expense) {
      setDescription(expense.description || '');
      setAmount(expense.amount?.toString() || '');
      setDate(expense.date instanceof Date ? expense.date : new Date(expense.date));
    }
  }, [expense]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setReceipt(event.target.files[0]);
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

  const handleSubmit = async () => {
    if (!expense || !description || !amount || !date) return;

    setLoading(true);
    try {
      let receiptUrl = expense.receiptUrl;
      
      if (receipt) {
        setUploadProgress(true);
        receiptUrl = await uploadImage(receipt);
        setUploadProgress(false);
      }

      await onSubmit(expense.id, {
        description,
        amount: parseFloat(amount),
        date,
        receiptUrl,
        year: date.getFullYear(),
        month: date.getMonth() + 1,
      });
      onClose();
    } catch (error) {
      console.error('Error updating expense:', error);
      alert('حدث خطأ أثناء تحديث المصروف');
    } finally {
      setLoading(false);
    }
  };

  if (!expense) return null;

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} locale={arSA}>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>تعديل المصروف</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="الوصف"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              fullWidth
              required
            />
            <TextField
              label="المبلغ"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              fullWidth
              required
            />
            <DatePicker
              label="التاريخ"
              value={date}
              onChange={handleDateChange}
              slotProps={{
                textField: {
                  fullWidth: true,
                  required: true
                }
              }}
            />
            <Box>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: 'none' }}
                id="receipt-upload"
              />
              <label htmlFor="receipt-upload">
                <Button
                  component="span"
                  variant="outlined"
                  startIcon={<CloudUploadIcon />}
                  disabled={uploadProgress}
                >
                  تغيير الإيصال
                </Button>
              </label>
              {(receipt || expense.receiptUrl) && (
                <Typography variant="caption" sx={{ ml: 2 }}>
                  {receipt ? receipt.name : 'تم رفع الإيصال مسبقاً'}
                </Typography>
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={loading || uploadProgress}>
            إلغاء
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            disabled={loading || uploadProgress || !description || !amount || !date}
          >
            {loading ? 'جاري الحفظ...' : 'حفظ التغييرات'}
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};
