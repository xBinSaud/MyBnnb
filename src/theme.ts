import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  direction: 'rtl',
  palette: {
    mode: 'dark',
    primary: {
      main: '#4F6F8F',
      light: '#6B8CAC',
      dark: '#364D63',
      contrastText: '#E2E8F0',
    },
    secondary: {
      main: '#78909C',
      light: '#90A4AE',
      dark: '#546E7A',
      contrastText: '#E2E8F0',
    },
    background: {
      default: '#151A23',
      paper: '#1E2633',
    },
    text: {
      primary: '#E2E8F0',
      secondary: '#A0AEC0',
    },
    error: {
      main: '#E53E3E',
      light: '#FC8181',
      dark: '#C53030',
    },
    warning: {
      main: '#D69E2E',
      light: '#F6E05E',
      dark: '#B7791F',
    },
    success: {
      main: '#38A169',
      light: '#68D391',
      dark: '#2F855A',
    },
    info: {
      main: '#4299E1',
      light: '#63B3ED',
      dark: '#3182CE',
    },
    divider: 'rgba(226, 232, 240, 0.08)',
    action: {
      active: '#4F6F8F',
      hover: 'rgba(79, 111, 143, 0.08)',
      selected: 'rgba(79, 111, 143, 0.16)',
      disabled: 'rgba(226, 232, 240, 0.3)',
      disabledBackground: 'rgba(226, 232, 240, 0.04)',
    },
  },
  typography: {
    fontFamily: 'Cairo, sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
      lineHeight: 1.2,
      letterSpacing: '-0.01em',
      color: '#E2E8F0',
    },
    h2: {
      fontWeight: 700,
      fontSize: '2rem',
      lineHeight: 1.3,
      letterSpacing: '-0.01em',
      color: '#E2E8F0',
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.75rem',
      lineHeight: 1.3,
      letterSpacing: '-0.01em',
      color: '#E2E8F0',
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
      lineHeight: 1.4,
      letterSpacing: '-0.01em',
      color: '#E2E8F0',
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.25rem',
      lineHeight: 1.4,
      letterSpacing: '-0.01em',
      color: '#E2E8F0',
    },
    h6: {
      fontWeight: 600,
      fontSize: '1rem',
      lineHeight: 1.5,
      letterSpacing: '-0.01em',
      color: '#E2E8F0',
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
      color: '#A0AEC0',
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.6,
      color: '#A0AEC0',
    },
    button: {
      fontWeight: 600,
      fontSize: '0.875rem',
      textTransform: 'none',
      letterSpacing: '0.02em',
    },
    caption: {
      fontSize: '0.75rem',
      lineHeight: 1.5,
      color: '#718096',
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: '#1E2633',
          borderRadius: 16,
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateY(-4px)',
          },
        },
        elevation1: {
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        },
        elevation2: {
          boxShadow: '0 8px 16px rgba(0, 0, 0, 0.15)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: 'none',
          fontWeight: 600,
          padding: '8px 24px',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-2px)',
          },
        },
        contained: {
          background: 'linear-gradient(45deg, #4F6F8F, #6B8CAC)',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
          '&:hover': {
            background: 'linear-gradient(45deg, #364D63, #4F6F8F)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
          },
        },
        outlined: {
          borderColor: '#4F6F8F',
          '&:hover': {
            borderColor: '#6B8CAC',
            backgroundColor: 'rgba(79, 111, 143, 0.08)',
          },
        },
        text: {
          '&:hover': {
            backgroundColor: 'rgba(79, 111, 143, 0.08)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            backgroundColor: 'rgba(21, 26, 35, 0.6)',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              backgroundColor: 'rgba(21, 26, 35, 0.8)',
            },
            '&.Mui-focused': {
              backgroundColor: 'rgba(21, 26, 35, 0.8)',
              boxShadow: '0 0 0 3px rgba(79, 111, 143, 0.25)',
            },
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          background: 'linear-gradient(180deg, rgba(30, 38, 51, 0.95), rgba(30, 38, 51, 0.98))',
          backdropFilter: 'blur(8px)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(226, 232, 240, 0.08)',
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
            border: '1px solid rgba(226, 232, 240, 0.12)',
          },
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          transition: 'all 0.2s ease-in-out',
          '&.Mui-selected': {
            backgroundColor: 'rgba(79, 111, 143, 0.16)',
            backdropFilter: 'blur(4px)',
            '&:hover': {
              backgroundColor: 'rgba(79, 111, 143, 0.24)',
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-1px)',
          },
        },
        filled: {
          backgroundColor: 'rgba(79, 111, 143, 0.16)',
          '&:hover': {
            backgroundColor: 'rgba(79, 111, 143, 0.24)',
          },
        },
        outlined: {
          borderColor: 'rgba(79, 111, 143, 0.4)',
          '&:hover': {
            borderColor: 'rgba(79, 111, 143, 0.6)',
          },
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: 'rgba(30, 38, 51, 0.95)',
          backdropFilter: 'blur(8px)',
          borderRadius: 8,
          padding: '8px 12px',
          fontSize: '0.75rem',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        },
      },
    },
  },
});
