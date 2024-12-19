import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { arSA } from "date-fns/locale";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Bookings from "./pages/Bookings";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import Apartments from "./pages/Apartments";
import BookingsByMonth from "./pages/BookingsByMonth";
import { theme } from "./theme";
import arTranslations from "./i18n/ar.json";

i18n.use(initReactI18next).init({
  resources: {
    ar: {
      translation: arTranslations,
    },
  },
  lng: "ar",
  fallbackLng: "ar",
  interpolation: {
    escapeValue: false,
  },
});

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/dashboard/:year/:month" element={<Dashboard />} />
      <Route path="/bookings/:year/:month" element={<Bookings />} />
      <Route path="/bookings" element={<BookingsByMonth />} />
      <Route path="/analytics" element={<Analytics />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/apartments" element={<Apartments />} />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <ThemeProvider theme={theme}>
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={arSA}>
          <Layout>
            <AppRoutes />
          </Layout>
        </LocalizationProvider>
      </ThemeProvider>
    </Router>
  );
}
