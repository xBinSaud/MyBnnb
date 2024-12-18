import { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  useTheme,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { arSA } from 'date-fns/locale';

const months = [
  'يناير', 'فبراير', 'مارس', 'إبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
];

export default function BookingsByMonth() {
  const theme = useTheme();
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  
  const years = Array.from(
    { length: 5 },
    (_, i) => currentYear + i
  );

  const handleMonthClick = (monthIndex: number) => {
    navigate(`/bookings/${selectedYear}/${monthIndex + 1}`);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          الحجوزات والمصروفات الشهرية
        </Typography>
        
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>السنة</InputLabel>
          <Select
            value={selectedYear}
            label="السنة"
            onChange={(e) => setSelectedYear(Number(e.target.value))}
          >
            {years.map((year) => (
              <MenuItem key={year} value={year}>
                {year}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Grid container spacing={3}>
        {months.map((month, index) => {
          const date = new Date(selectedYear, index, 1);
          
          return (
            <Grid item xs={12} sm={6} md={4} lg={3} key={month}>
              <Card 
                sx={{ 
                  cursor: 'pointer',
                  transition: '0.3s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[4],
                  },
                }}
                onClick={() => handleMonthClick(index)}
              >
                <CardContent>
                  <Typography variant="h6" component="h2" gutterBottom>
                    {format(date, 'MMMM yyyy', { locale: arSA })}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}
