import React, { useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box, 
  IconButton, 
  Menu, 
  MenuItem,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import DescriptionIcon from '@mui/icons-material/Description';
import NoteAddIcon from '@mui/icons-material/NoteAdd';

const Header: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  return (
    <AppBar position="static" sx={{ background: 'linear-gradient(to right, #6a1b9a, #8e24aa)' }}>
      <Toolbar>
        <Typography 
          variant="h6" 
          component={RouterLink} 
          to="/" 
          sx={{ 
            flexGrow: 1, 
            textDecoration: 'none', 
            color: 'white',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          ResuMate
        </Typography>

        {isMobile ? (
          <>
            <IconButton
              color="inherit"
              aria-label="menu"
              onClick={handleMenuOpen}
              edge="end"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
            >
              <MenuItem 
                component={RouterLink} 
                to="/dashboard" 
                onClick={handleMenuClose}
                selected={isActive('/dashboard')}
              >
                <DashboardIcon sx={{ mr: 1 }} fontSize="small" />
                Dashboard
              </MenuItem>
              <MenuItem 
                component={RouterLink} 
                to="/resume/builder" 
                onClick={handleMenuClose}
                selected={isActive('/resume')}
              >
                <DescriptionIcon sx={{ mr: 1 }} fontSize="small" />
                Resume Builder
              </MenuItem>
              <MenuItem 
                component={RouterLink} 
                to="/cover-letter/new" 
                onClick={handleMenuClose}
                selected={isActive('/cover-letter')}
              >
                <NoteAddIcon sx={{ mr: 1 }} fontSize="small" />
                Cover Letter
              </MenuItem>
            </Menu>
          </>
        ) : (
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button 
              color="inherit" 
              component={RouterLink} 
              to="/dashboard"
              startIcon={<DashboardIcon />}
              sx={{ 
                fontWeight: isActive('/dashboard') ? 'bold' : 'normal',
                borderBottom: isActive('/dashboard') ? '2px solid white' : 'none',
              }}
            >
              Dashboard
            </Button>
            <Button 
              color="inherit" 
              component={RouterLink} 
              to="/resume/builder"
              startIcon={<DescriptionIcon />}
              sx={{ 
                fontWeight: isActive('/resume') ? 'bold' : 'normal',
                borderBottom: isActive('/resume') ? '2px solid white' : 'none',
              }}
            >
              Resume Builder
            </Button>
            <Button 
              color="inherit" 
              component={RouterLink} 
              to="/cover-letter/new"
              startIcon={<NoteAddIcon />}
              sx={{ 
                fontWeight: isActive('/cover-letter') ? 'bold' : 'normal',
                borderBottom: isActive('/cover-letter') ? '2px solid white' : 'none',
              }}
            >
              Cover Letter
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header;