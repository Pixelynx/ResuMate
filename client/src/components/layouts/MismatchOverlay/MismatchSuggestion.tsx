import React from 'react';
import { Box, Typography, Alert } from '@mui/material';
import { MismatchSuggestionProps } from '../../../types/mismatchTypes';

/**
 * Component that displays a single compatibility suggestion
 * @component
 */
const MismatchSuggestion: React.FC<MismatchSuggestionProps> = ({
  suggestion,
  className,
}) => {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'blocking':
        return 'error';
      case 'warning':
        return 'warning';
      default:
        return 'info';
    }
  };

  return (
    <Box className={className} sx={{ mb: 2 }}>
      <Alert 
        severity={getSeverityColor(suggestion.severity)}
        sx={{ 
          '& .MuiAlert-message': { 
            width: '100%' 
          } 
        }}
      >
        <Typography variant="subtitle2" gutterBottom>
          {suggestion.type.split('_').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
          ).join(' ')}
        </Typography>
        <Typography variant="body2">
          {suggestion.message}
        </Typography>
      </Alert>
    </Box>
  );
};

export default MismatchSuggestion; 