import { Grid, Paper, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

export default function Dashboard() {
  const { t } = useTranslation();

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        {t('dashboard.title')}
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
            <Typography color="text.secondary" gutterBottom>
              {t('dashboard.totalRevenue')}
            </Typography>
            <Typography component="p" variant="h4">
              ٠ ر.س
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
            <Typography color="text.secondary" gutterBottom>
              {t('dashboard.averageBooking')}
            </Typography>
            <Typography component="p" variant="h4">
              ٠ ر.س
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
            <Typography color="text.secondary" gutterBottom>
              {t('dashboard.occupancyRate')}
            </Typography>
            <Typography component="p" variant="h4">
              ٠%
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
            <Typography color="text.secondary" gutterBottom>
              {t('dashboard.totalBookings')}
            </Typography>
            <Typography component="p" variant="h4">
              ٠
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
}
