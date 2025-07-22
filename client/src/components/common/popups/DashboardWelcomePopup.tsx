import React from 'react';
import { Typography, Box } from '@mui/material';

const DashboardWelcomePopup: React.FC = () => {
  return (
    <Box sx={{ p: 1 }}>
      <Typography variant="body1" paragraph>
        Welcome to ResuMate! We're excited to have you here. Just a friendly heads-up: we're currently in the experimental stage, which means a few things:
      </Typography>
      
      <Typography variant="body1" paragraph>
        First, we're working on a proper user profile system to keep your documents safe and organized. For now, though, we're keeping things simple. Any resumes or cover letters you create will be automatically deleted after 2 hours. Think of it as a test drive!
      </Typography>
      
      <Typography variant="body1" paragraph>
        Don't worry though! You can still create, edit, and download your documents during this time. We just recommend saving them to your computer if you want to keep them longer than 2 hours.
      </Typography>
      
      <Typography variant="body1">
        Thanks for being part of our early testing phase. We're working hard to make ResuMate even better!
      </Typography>
    </Box>
  );
};

export default DashboardWelcomePopup; 