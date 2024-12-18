import { Box, Drawer, List, ListItem, ListItemIcon, ListItemText, Typography, Avatar, IconButton } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import DashboardIcon from '@mui/icons-material/Dashboard';
import BookIcon from '@mui/icons-material/Book';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import SettingsIcon from '@mui/icons-material/Settings';
import MenuIcon from '@mui/icons-material/Menu';
import { useState, ReactNode } from 'react';

const drawerWidth = 280;

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const menuItems = [
    { 
      text: t('dashboard.title'), 
      icon: <DashboardIcon />, 
      path: '/', 
      isActive: (path: string) => path === '/' || path.startsWith('/dashboard')
    },
    { 
      text: t('bookings.title'), 
      icon: <BookIcon />, 
      path: '/bookings',
      isActive: (path: string) => path.startsWith('/bookings')
    },
    { 
      text: t('analytics.title'), 
      icon: <AnalyticsIcon />, 
      path: '/analytics',
      isActive: (path: string) => path.startsWith('/analytics')
    },
    { 
      text: t('settings.title'), 
      icon: <SettingsIcon />, 
      path: '/settings',
      isActive: (path: string) => path.startsWith('/settings')
    },
  ];

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <Box sx={{ overflow: 'auto' }}>
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Avatar sx={{ bgcolor: 'primary.main' }}>MB</Avatar>
        <Typography variant="h6">MyBNB</Typography>
      </Box>
      <List>
        {menuItems.map((item) => (
          <ListItem
            button
            key={item.path}
            onClick={() => navigate(item.path)}
            selected={item.isActive(location.pathname)}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', direction: 'rtl' }}>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          bgcolor: 'background.default',
          marginRight: { sm: `${drawerWidth}px` },
          marginLeft: 0,
          transition: 'margin 0.2s ease-out'
        }}
      >
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="end"
          onClick={handleDrawerToggle}
          sx={{ ml: 2, display: { sm: 'none' } }}
        >
          <MenuIcon />
        </IconButton>
        {children}
      </Box>
      <Box
        component="nav"
        sx={{
          width: { sm: drawerWidth },
          flexShrink: { sm: 0 },
          position: 'fixed',
          right: 0,
          top: 0,
          height: '100%',
        }}
      >
        <Drawer
          variant="temporary"
          anchor="right"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              right: 0,
              left: 'auto',
              border: 'none'
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          anchor="right"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              right: 0,
              left: 'auto',
              borderLeft: '1px solid rgba(0, 0, 0, 0.12)',
              borderRight: 'none',
              position: 'fixed'
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
    </Box>
  );
}
