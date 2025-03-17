import React from 'react';
import {
  Box,
  CircularProgress,
  Typography,
  Paper,
  LinearProgress
} from '@mui/material';

interface LoadingOverlayProps {
  message?: string;
  progress?: number;
  showProgress?: boolean;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  message = 'Loading...',
  progress,
  showProgress = false
}) => {
  return (
    <Box
      position="fixed"
      top={0}
      left={0}
      right={0}
      bottom={0}
      display="flex"
      alignItems="center"
      justifyContent="center"
      zIndex={9999}
      bgcolor="rgba(0, 0, 0, 0.5)"
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
          maxWidth: '80%',
          width: '400px'
        }}
      >
        <CircularProgress size={48} />
        <Typography variant="h6" align="center">
          {message}
        </Typography>
        {showProgress && (
          <Box sx={{ width: '100%', mt: 1 }}>
            <LinearProgress
              variant="determinate"
              value={progress || 0}
              sx={{ height: 8, borderRadius: 4 }}
            />
            <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
              {Math.round(progress || 0)}%
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default LoadingOverlay; 