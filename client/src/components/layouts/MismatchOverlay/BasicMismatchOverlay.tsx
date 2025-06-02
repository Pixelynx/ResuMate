import React, { useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Typography,
  Box,
  Chip,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import styles from './BasicMismatchOverlay.module.css';
import { CompatibilityAssessment } from '../../../types/mismatchTypes';

interface BasicMismatchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onRetry?: () => void;
  companyName?: string;
  assessment?: CompatibilityAssessment | null;
}

const BasicMismatchOverlay: React.FC<BasicMismatchOverlayProps> = ({
  isOpen,
  onClose,
  onRetry,
  companyName = 'this position',
  assessment
}) => {
  // Handle ESC key
  const handleEscapeKey = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
      return () => {
        document.removeEventListener('keydown', handleEscapeKey);
      };
    }
  }, [isOpen, handleEscapeKey]);

  const renderMismatchDetails = () => {
    if (!assessment) return null;

    return (
      <>
        <Box className={styles.scoreSection}>
          <Typography variant="h6" gutterBottom>
            Compatibility Score: {Math.round(assessment.compatibilityScore)}%
          </Typography>
          {assessment.metadata.skillsMatch.length > 0 && (
            <Box className={styles.skillsSection}>
              <Typography variant="subtitle2" gutterBottom>
                Matching Skills:
              </Typography>
              <Box className={styles.skillsContainer}>
                {assessment.metadata.skillsMatch.map((skill, index) => (
                  <Chip
                    key={index}
                    label={skill}
                    color="primary"
                    variant="outlined"
                    size="small"
                    className={styles.skillChip}
                  />
                ))}
              </Box>
            </Box>
          )}
        </Box>

        {assessment.suggestions.length > 0 && (
          <List className={styles.suggestionList}>
            {assessment.suggestions.map((suggestion, index) => (
              <ListItem key={index} className={styles.suggestionItem}>
                <ListItemText
                  primary={suggestion.message}
                  secondary={`Category: ${suggestion.type}`}
                />
              </ListItem>
            ))}
          </List>
        )}
      </>
    );
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      aria-labelledby="mismatch-dialog-title"
      className={styles.dialog}
    >
      <DialogTitle id="mismatch-dialog-title" className={styles.dialogTitle}>
        <Box className={styles.titleContent}>
          <ErrorOutlineIcon color="error" className={styles.errorIcon} />
          <Typography variant="h6">Cannot Generate Cover Letter</Typography>
        </Box>
        <IconButton
          aria-label="close"
          onClick={onClose}
          className={styles.closeButton}
          size="large"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <Box className={styles.content}>
          <Typography variant="body1" paragraph>
            We're unable to generate a cover letter as your resume doesn't appear to be a strong match for {companyName}.
          </Typography>

          {renderMismatchDetails()}

          <Typography variant="body1" gutterBottom>
            Please try:
          </Typography>
          <ul className={styles.suggestionList}>
            <li>Applying to a different role that better matches your background</li>
            <li>Updating your resume to better highlight relevant skills and experience</li>
          </ul>

          <Typography variant="body1" className={styles.closeMessage}>
            You can close this message and try again with a different approach.
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions className={styles.actions}>
        <Button
          onClick={onClose}
          variant="outlined"
          className={styles.button}
        >
          Close
        </Button>
        {onRetry && (
          <Button
            onClick={() => {
              onClose();
              onRetry();
            }}
            variant="contained"
            color="primary"
            className={styles.button}
          >
            Try Again
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default BasicMismatchOverlay; 