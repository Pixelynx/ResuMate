import React from 'react';
import { Box, Typography, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { useTheme, useMediaQuery } from '@mui/material';
import { ValidationError } from './types/validationTypes';

interface InvalidFieldComponentProps {
  errors: ValidationError[];
  onErrorClick: (fieldId: string) => void;
}

const InvalidFieldComponent: React.FC<InvalidFieldComponentProps> = ({ errors, onErrorClick }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box
      sx={{
        position: 'fixed',
        ...(isMobile ? {
          bottom: 0,
          left: 0,
          right: 0,
          maxHeight: '40vh',
          borderRadius: '16px 16px 0 0',
          transform: errors.length ? 'translateY(0)' : 'translateY(100%)',
        } : {
          top: '50%',
          right: '20px',
          transform: `translateY(-50%) ${errors.length ? 'translateX(0)' : 'translateX(120%)'}`,
          width: '300px',
          maxHeight: '80vh',
          borderRadius: '12px',
        }),
        backgroundColor: 'background.paper',
        boxShadow: 3,
        border: '1px solid',
        borderColor: 'error.light',
        transition: 'transform 0.3s ease-in-out',
        zIndex: 1000,
        overflow: 'auto',
      }}
    >
      <Box sx={{ p: 2, backgroundColor: 'error.lighter', borderRadius: 'inherit inherit 0 0' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ErrorOutlineIcon color="error" />
          <Typography variant="h6" color="error">
            Please Fix These Issues
          </Typography>
        </Box>
      </Box>
      <List sx={{ p: 2 }}>
        {errors.map((error, index) => (
          <ListItem
            key={index}
            button
            onClick={() => error.fieldId && onErrorClick(error.fieldId)}
            sx={{
              borderRadius: 1,
              mb: 1,
              '&:hover': {
                backgroundColor: 'error.lighter',
              }
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <ErrorOutlineIcon color="error" fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary={error.fieldName}
              secondary={error.message}
              primaryTypographyProps={{
                variant: 'body2',
                fontWeight: 'medium'
              }}
              secondaryTypographyProps={{
                variant: 'caption',
                color: 'error'
              }}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default InvalidFieldComponent;
