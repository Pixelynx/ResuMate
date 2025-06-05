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
import styles from '../../styles/Header.module.css';

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
    <AppBar position="static" className={styles.header}>
      <Toolbar>
        <Typography 
          variant="h6" 
          component={RouterLink} 
          to="/" 
          className={styles.logo}
        >
          ResuMate
        </Typography>

        {isMobile ? (
          <>
            <IconButton
              aria-label="menu"
              onClick={handleMenuOpen}
              edge="end"
              className={styles.menuIcon}
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
                className={styles.menuItem}
              >
                <DashboardIcon className={styles.menuItemIcon} fontSize="small" />
                Dashboard
              </MenuItem>
              <MenuItem 
                component={RouterLink} 
                to="/resume/builder" 
                onClick={handleMenuClose}
                selected={isActive('/resume')}
                className={styles.menuItem}
              >
                <DescriptionIcon className={styles.menuItemIcon} fontSize="small" />
                Resume Builder
              </MenuItem>
              <MenuItem 
                component={RouterLink} 
                to="/cover-letter/new" 
                onClick={handleMenuClose}
                selected={isActive('/cover-letter')}
                className={styles.menuItem}
              >
                <NoteAddIcon className={styles.menuItemIcon} fontSize="small" />
                Cover Letter
              </MenuItem>
            </Menu>
          </>
        ) : (
          <Box className={styles.navContainer}>
            <Button 
              component={RouterLink} 
              to="/dashboard"
              startIcon={<DashboardIcon />}
              className={isActive('/dashboard') ? styles.navButtonActive : styles.navButton}
            >
              Dashboard
            </Button>
            <Button 
              component={RouterLink} 
              to="/resume/builder"
              startIcon={<DescriptionIcon />}
              className={isActive('/resume') ? styles.navButtonActive : styles.navButton}
            >
              Resume Builder
            </Button>
            <Button 
              component={RouterLink} 
              to="/cover-letter/new"
              startIcon={<NoteAddIcon />}
              className={isActive('/cover-letter') ? styles.navButtonActive : styles.navButton}
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