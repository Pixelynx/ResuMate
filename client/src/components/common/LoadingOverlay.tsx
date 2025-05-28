import React from 'react';
import {
  Box,
  CircularProgress,
  Typography,
  Paper,
  LinearProgress
} from '@mui/material';

/**
 * LoadingOverlay Component
 * 
 * A full-screen overlay that displays a loading message and optional progress bar.
 * 
 * The progress value is determined by the API operations that provide progress updates:
 * - Resume parsing: Updates progress as each section is extracted (0-100%)
 * - Cover letter generation: Updates as the AI processes different stages
 * 
 * Note: Progress is based on actual operation completion percentage reported by API calls,
 * not an artificial counter. Some operations may complete at 70-80% if final steps are 
 * handled asynchronously by the server, which is why the progress bar might not reach 100%
 * before the overlay is closed.
 */
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
        <CircularProgress size={48} sx={{ color: '#6a1b9a' }} />
        <Typography variant="h6" align="center">
          {message}
        </Typography>
        {showProgress && (
          <Box sx={{ width: '100%', mt: 1 }}>
            <LinearProgress
              variant="determinate"
              value={progress || 0}
              sx={{ 
                height: 8, 
                borderRadius: 4,
                '& .MuiLinearProgress-bar': {
                  backgroundColor: '#6a1b9a'
                }
              }}
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