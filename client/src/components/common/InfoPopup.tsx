import React, { useEffect, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Button,
  Box,
  Typography,
  styled
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

// Styled components
const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    maxWidth: '70vw',
    maxHeight: '70vh',
    width: 'auto',
    margin: theme.spacing(2),
    background: 'linear-gradient(to right, rgba(106, 27, 154, 0.7), rgba(142, 36, 170, 0.7))',
    border: '2px solid rgba(106, 27, 154, 0.8)',
    borderRadius: theme.spacing(2),
    [theme.breakpoints.down('sm')]: {
      maxWidth: '80vw',
      margin: theme.spacing(1),
    },
  },
}));

const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: theme.spacing(2),
  color: 'rgba(255, 255, 255, 0.85)',
}));

const StyledDialogContent = styled(DialogContent)(({ theme }) => ({
  padding: theme.spacing(2),
  color: 'rgba(255, 255, 255, 0.85)',
}));

const StyledDialogActions = styled(DialogActions)(({ theme }) => ({
  padding: theme.spacing(2),
}));

export interface InfoPopupProps {
  open: boolean;
  onClose: () => void;
  title: string;
  content: React.ReactNode;
  storageKey?: string;
  showDontShowAgain?: boolean;
}

const InfoPopup: React.FC<InfoPopupProps> = ({
  open,
  onClose,
  title,
  content,
  storageKey,
  showDontShowAgain = true,
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);

  // Handle escape key
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && open) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [open, onClose]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dialogRef.current && !dialogRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open, onClose]);

  const handleDontShowAgain = () => {
    if (storageKey) {
      localStorage.setItem(storageKey, 'true');
    }
    onClose();
  };

  return (
    <StyledDialog
      open={open}
      onClose={onClose}
      ref={dialogRef}
      aria-labelledby="info-popup-title"
      maxWidth={false}
    >
      <StyledDialogTitle id="info-popup-title">
        <Typography variant="h6" component="div">
          {title}
        </Typography>
        <IconButton
          aria-label="close"
          onClick={onClose}
          size="small"
          sx={{
              textTransform: 'none',
              color: 'rgba(255, 255, 255, 0.85)',
              '&:hover': {
                color: 'rgba(255, 255, 255, 0.95)',
                background: 'rgba(106, 27, 154, 0.08)'
              }
            }}
        >
          <CloseIcon />
        </IconButton>
      </StyledDialogTitle>
      <StyledDialogContent>
        <Box sx={{ overflowY: 'auto' }}>
          {content}
        </Box>
      </StyledDialogContent>
      {showDontShowAgain && storageKey && (
        <StyledDialogActions>
          <Button
            onClick={handleDontShowAgain}
            variant="text"
            sx={{
              textTransform: 'none',
              color: 'rgba(255, 255, 255, 0.85)',
              '&:hover': {
                color: 'rgba(255, 255, 255, 0.95)',
                background: 'rgba(106, 27, 154, 0.08)'
              }
            }}
          >
            Don't show this again
          </Button>
        </StyledDialogActions>
      )}
    </StyledDialog>
  );
};

export default InfoPopup; 