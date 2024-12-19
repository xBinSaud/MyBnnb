import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Switch,
  FormControlLabel,
  Tabs,
  Tab,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  getDoc,
  setDoc,
} from "firebase/firestore";
import { db, COLLECTIONS } from "../../config/firebase";
import type { Apartment, AppSettings } from "../../config/firebase";

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
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function Settings() {
  const [tabValue, setTabValue] = useState(0);
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [apartmentName, setApartmentName] = useState("");

  // Load apartments
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, COLLECTIONS.APARTMENTS),
      (snapshot) => {
        const apartmentsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Apartment[];
        setApartments(apartmentsData);
      }
    );

    return () => unsubscribe();
  }, []);

  // Load settings
  useEffect(() => {
    const loadSettings = async () => {
      const settingsRef = doc(db, COLLECTIONS.APP_SETTINGS, "default");
      const settingsDoc = await getDoc(settingsRef);

      if (settingsDoc.exists()) {
        setSettings(settingsDoc.data() as AppSettings);
      } else {
        // Create default settings if they don't exist
        const defaultSettings: Omit<AppSettings, "id"> = {
          theme: {
            primaryColor: "#4F6F8F",
            secondaryColor: "#78909C",
            darkMode: true,
          },
          notifications: {
            emailNotifications: true,
            pushNotifications: true,
            bookingReminders: true,
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        await setDoc(settingsRef, defaultSettings);
        setSettings({ id: "default", ...defaultSettings });
      }
    };

    loadSettings();
  }, []);

  const handleSaveSettings = async () => {
    if (!settings) return;

    try {
      const settingsRef = doc(db, COLLECTIONS.APP_SETTINGS, "default");
      await updateDoc(settingsRef, {
        ...settings,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      alert("حدث خطأ أثناء حفظ الإعدادات");
    }
  };

  const handleAddApartment = async () => {
    if (!apartmentName.trim()) return;

    try {
      await addDoc(collection(db, COLLECTIONS.APARTMENTS), {
        name: apartmentName,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      setApartmentName("");
      setOpenDialog(false);
    } catch (error) {
      console.error("Error adding apartment:", error);
      alert("حدث خطأ أثناء إضافة الشقة");
    }
  };

  const handleDeleteApartment = async (apartmentId: string) => {
    if (window.confirm("هل أنت متأكد من حذف هذه الشقة؟")) {
      try {
        await deleteDoc(doc(db, COLLECTIONS.APARTMENTS, apartmentId));
      } catch (error) {
        console.error("Error deleting apartment:", error);
        alert("حدث خطأ أثناء حذف الشقة");
      }
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        الإعدادات
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={(_, newValue) => setTabValue(newValue)}
        >
          <Tab label="الشقق" />
          <Tab label="الإشعارات" />
          <Tab label="المظهر" />
        </Tabs>
      </Box>

      {/* Apartments Tab */}
      <TabPanel value={tabValue} index={0}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
          <Typography variant="h6">إدارة الشقق</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenDialog(true)}
          >
            إضافة شقة
          </Button>
        </Box>

        <Grid container spacing={3}>
          {apartments.map((apartment) => (
            <Grid item xs={12} sm={6} md={4} key={apartment.id}>
              <Card>
                <CardContent>
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Typography variant="h6">{apartment.name}</Typography>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteApartment(apartment.id)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      {/* Notifications Tab */}
      <TabPanel value={tabValue} index={1}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings?.notifications.emailNotifications || false}
                  onChange={(e) =>
                    setSettings(
                      settings
                        ? {
                            ...settings,
                            notifications: {
                              ...settings.notifications,
                              emailNotifications: e.target.checked,
                            },
                          }
                        : null
                    )
                  }
                />
              }
              label="إشعارات البريد الإلكتروني"
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings?.notifications.pushNotifications || false}
                  onChange={(e) =>
                    setSettings(
                      settings
                        ? {
                            ...settings,
                            notifications: {
                              ...settings.notifications,
                              pushNotifications: e.target.checked,
                            },
                          }
                        : null
                    )
                  }
                />
              }
              label="الإشعارات المنبثقة"
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings?.notifications.bookingReminders || false}
                  onChange={(e) =>
                    setSettings(
                      settings
                        ? {
                            ...settings,
                            notifications: {
                              ...settings.notifications,
                              bookingReminders: e.target.checked,
                            },
                          }
                        : null
                    )
                  }
                />
              }
              label="تذكيرات الحجوزات"
            />
          </Grid>
        </Grid>
      </TabPanel>

      {/* Theme Tab */}
      <TabPanel value={tabValue} index={2}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings?.theme.darkMode || false}
                  onChange={(e) =>
                    setSettings(
                      settings
                        ? {
                            ...settings,
                            theme: {
                              ...settings.theme,
                              darkMode: e.target.checked,
                            },
                          }
                        : null
                    )
                  }
                />
              }
              label="الوضع الداكن"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="اللون الرئيسي"
              type="color"
              value={settings?.theme.primaryColor || "#4F6F8F"}
              onChange={(e) =>
                setSettings(
                  settings
                    ? {
                        ...settings,
                        theme: {
                          ...settings.theme,
                          primaryColor: e.target.value,
                        },
                      }
                    : null
                )
              }
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="اللون الثانوي"
              type="color"
              value={settings?.theme.secondaryColor || "#78909C"}
              onChange={(e) =>
                setSettings(
                  settings
                    ? {
                        ...settings,
                        theme: {
                          ...settings.theme,
                          secondaryColor: e.target.value,
                        },
                      }
                    : null
                )
              }
            />
          </Grid>
        </Grid>
      </TabPanel>

      {/* Save Button */}
      {tabValue > 0 && (
        <Box mt={3} display="flex" justifyContent="flex-end">
          <Button
            variant="contained"
            color="primary"
            onClick={handleSaveSettings}
          >
            حفظ التغييرات
          </Button>
        </Box>
      )}

      {/* Add Apartment Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>إضافة شقة جديدة</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="اسم الشقة"
            fullWidth
            value={apartmentName}
            onChange={(e) => setApartmentName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>إلغاء</Button>
          <Button
            onClick={handleAddApartment}
            variant="contained"
            color="primary"
          >
            إضافة
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
