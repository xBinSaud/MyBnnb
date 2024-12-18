import { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  IconButton,
  Button,
  Tabs,
  Tab,
  Divider,
} from '@mui/material';
import ApartmentIcon from '@mui/icons-material/Apartment';
import PersonIcon from '@mui/icons-material/Person';
import SettingsIcon from '@mui/icons-material/Settings';
import { AddApartmentDialog } from '../../components/AddApartmentDialog';
import { EditApartmentDialog } from '../../components/EditApartmentDialog';
import { useApartments } from '../../hooks/useApartments';
import { formatPrice } from '../../utils/dateUtils';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function Admin() {
  const [tabValue, setTabValue] = useState(0);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedApartment, setSelectedApartment] = useState<string | null>(null);
  const { apartments, loading, error } = useApartments();

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleEditClick = (apartmentId: string) => {
    setSelectedApartment(apartmentId);
    setOpenEditDialog(true);
  };

  return (
    <Box>
      <Box sx={{ 
        mb: 4, 
        p: 3, 
        borderRadius: 2,
        background: 'linear-gradient(45deg, #1a237e, #0d47a1)',
        color: 'white',
        boxShadow: 3
      }}>
        <Typography variant="h4" gutterBottom fontWeight="bold">
          لوحة تحكم الأدمن
        </Typography>
        <Typography variant="subtitle1">
          إدارة الشقق والإعدادات
        </Typography>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="admin tabs"
          centered
        >
          <Tab 
            icon={<ApartmentIcon />} 
            label="إدارة الشقق" 
            iconPosition="start"
          />
          <Tab 
            icon={<PersonIcon />} 
            label="المستخدمين" 
            iconPosition="start"
          />
          <Tab 
            icon={<SettingsIcon />} 
            label="الإعدادات" 
            iconPosition="start"
          />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            onClick={() => setOpenAddDialog(true)}
            startIcon={<ApartmentIcon />}
          >
            إضافة شقة جديدة
          </Button>
        </Box>

        <Grid container spacing={3}>
          {apartments.map((apartment) => (
            <Grid item xs={12} sm={6} md={4} key={apartment.id}>
              <Paper
                sx={{
                  p: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 3,
                    transition: 'all 0.3s ease-in-out',
                  },
                }}
              >
                <Box
                  sx={{
                    height: 200,
                    mb: 2,
                    borderRadius: 1,
                    overflow: 'hidden',
                    position: 'relative',
                  }}
                >
                  {apartment.images && apartment.images[0] ? (
                    <Box
                      component="img"
                      src={apartment.images[0]}
                      alt={apartment.name}
                      sx={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  ) : (
                    <Box
                      sx={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: 'grey.200',
                      }}
                    >
                      <ApartmentIcon sx={{ fontSize: 60, color: 'grey.400' }} />
                    </Box>
                  )}
                </Box>

                <Typography variant="h6" gutterBottom>
                  {apartment.name}
                </Typography>
                <Typography color="text.secondary" paragraph>
                  {apartment.location}
                </Typography>
                <Typography variant="h6" color="primary" gutterBottom>
                  {formatPrice(apartment.pricePerNight)}
                  <Typography component="span" variant="body2" color="text.secondary">
                    {' '}/ ليلة
                  </Typography>
                </Typography>

                <Box sx={{ mt: 'auto', pt: 2 }}>
                  <Divider sx={{ mb: 2 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      {apartment.amenities.length} مميزات
                    </Typography>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleEditClick(apartment.id)}
                    >
                      تعديل
                    </Button>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Typography variant="h6" color="text.secondary" align="center">
          قريباً - إدارة المستخدمين
        </Typography>
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Typography variant="h6" color="text.secondary" align="center">
          قريباً - إعدادات النظام
        </Typography>
      </TabPanel>

      <AddApartmentDialog
        open={openAddDialog}
        onClose={() => setOpenAddDialog(false)}
      />

      <EditApartmentDialog
        open={openEditDialog}
        onClose={() => {
          setOpenEditDialog(false);
          setSelectedApartment(null);
        }}
        apartment={apartments.find(a => a.id === selectedApartment) || null}
      />
    </Box>
  );
}
