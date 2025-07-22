import React from 'react';
import { Typography, Box } from '@mui/material';

const CoverLetterNoticePopup: React.FC = () => {
  return (
    <Box sx={{ p: 1 }}>
      <Typography variant="body1" paragraph>
        Welcome to our Cover Letter Generator! We want to let you know that this feature is currently optimized for technical positions like software development, engineering, and data science roles.
      </Typography>
      
      <Typography variant="body1" paragraph>
        While we're working on expanding our capabilities to better serve other industries, we encourage you to try it out anyway. You might be pleasantly humoured by the results! AI can often generate interesting results.
      </Typography>
      
      <Typography variant="body1">
        Feel free to experiment and let the AI work its magic. You can always edit the generated content to better match your needs!
      </Typography>
    </Box>
  );
};

export default CoverLetterNoticePopup; 