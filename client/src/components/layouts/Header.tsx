import React from 'react';
import { AppBar, Toolbar, Typography } from '@mui/material';

const Header: React.FC = () => {
  return (
    <AppBar position="static" sx={{ background: 'linear-gradient(to right, #6a1b9a, #8e24aa)' }}>
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              ResuMate
            </Typography>
          </Toolbar>
        </AppBar>
  );
};

export default Header;