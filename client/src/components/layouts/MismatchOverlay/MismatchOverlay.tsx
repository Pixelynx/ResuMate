import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box } from '@mui/material';
import { MismatchOverlayProps } from '../../../types/mismatchTypes';
import MismatchContent from './MismatchContent';

/**
 * Overlay component that displays compatibility mismatch information
 * @component
 */
const MismatchOverlay: React.FC<MismatchOverlayProps> = ({
  assessment,
  isVisible,
  onClose,
  onRetry,
  title = 'Compatibility Assessment',
  className,
}) => {
  return (
    <Dialog
      open={isVisible}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      className={className}
    >
      <DialogTitle>
        {title}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ py: 2 }}>
          <MismatchContent assessment={assessment} />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MismatchOverlay; 