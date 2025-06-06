import React from 'react';
import { Box, Typography, Link } from '@mui/material';

const Footer: React.FC = () => {
  return (
    <Box
      component="footer"
      sx={{
        position: 'fixed',
        bottom: '4px',
        left: '50%',
        width: 'calc(100% - 32px)',
        maxWidth: '1200px',
        padding: '16px 24px',
        borderRadius: '12px',
        backgroundColor: 'rgba(106, 27, 154, 0.95)',
        backdropFilter: 'blur(8px)',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        transform: 'translateX(-50%)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        color: 'white',
        zIndex: 10,
      }}
    >
      <Typography variant="body2" sx={{ opacity: 0.9 }}>
        {new Date().getFullYear()} Resumate
      </Typography>
      <Box sx={{ display: 'flex', gap: 3 }}>
        <Link
          href="#"
          color="inherit"
          underline="hover"
          sx={{
            opacity: 0.9,
            transition: 'opacity 0.2s',
            '&:hover': {
              opacity: 1
            }
          }}
        >
          Terms
        </Link>
        <Link
          href="#"
          color="inherit"
          underline="hover"
          sx={{
            opacity: 0.9,
            transition: 'opacity 0.2s',
            '&:hover': {
              opacity: 1
            }
          }}
        >
          Privacy
        </Link>
      </Box>
    </Box>
  );
};

export default Footer;