import React, { useEffect } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  Box,
  Typography,
  Alert,
  CircularProgress
} from '@mui/material';
import { MismatchOverlayProps } from '../../../types/mismatchTypes';
import { useMismatchContent } from '../../../hooks/useMismatchContent';
import { useMismatchLoading } from '../../../hooks/useMismatchLoading';
import MismatchContent from './MismatchContent';
import styles from './MismatchOverlay.module.css';

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
  // Content management
  const {
    content,
    isLoading: isContentLoading,
    isGenerating,
    error: contentError,
    regenerateContent,
    retryGeneration
  } = useMismatchContent(assessment);

  // Loading state management
  const {
    isLoading: isOverlayLoading,
    progress,
    loadingMessage,
    startLoading,
    resetState
  } = useMismatchLoading();

  // Start loading when overlay becomes visible
  useEffect(() => {
    if (isVisible && !content) {
      startLoading();
    }
  }, [isVisible, content, startLoading]);

  // Reset states when overlay closes
  useEffect(() => {
    if (!isVisible) {
      resetState();
    }
  }, [isVisible, resetState]);

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      retryGeneration();
    }
  };

  const handleRegenerate = () => {
    startLoading();
    regenerateContent();
  };

  return (
    <Dialog
      open={isVisible}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      className={`${styles.dialog} ${className || ''}`}
    >
      <DialogTitle className={styles.title}>
        {title}
        {isGenerating && (
          <Typography variant="caption" color="textSecondary" sx={{ ml: 2 }}>
            Generating...
          </Typography>
        )}
      </DialogTitle>

      <DialogContent>
        <Box className={styles.content}>
          {(isOverlayLoading || isContentLoading) ? (
            <Box className={styles.loadingContainer}>
              <CircularProgress size={48} className={styles.progress} />
              <Typography variant="h6" className={styles.loadingMessage}>
                {loadingMessage}
              </Typography>
              {progress !== undefined && (
                <Typography variant="body2" color="textSecondary">
                  {Math.round(progress)}%
                </Typography>
              )}
            </Box>
          ) : contentError ? (
            <Alert 
              severity="error" 
              action={
                <Button color="inherit" size="small" onClick={handleRetry}>
                  Retry
                </Button>
              }
            >
              {contentError}
            </Alert>
          ) : content ? (
            <>
              <MismatchContent 
                assessment={assessment} 
                explanation={content.explanation}
                alternativeRoles={content.alternativeRoles}
              />
              <Box className={styles.regenerateContainer}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleRegenerate}
                  disabled={isGenerating}
                >
                  Regenerate Suggestions
                </Button>
              </Box>
            </>
          ) : null}
        </Box>
      </DialogContent>

      <DialogActions className={styles.actions}>
        <Button 
          onClick={handleClose} 
          color="primary"
          disabled={isGenerating}
        >
          Close
        </Button>
        {onRetry && (
          <Button
            onClick={handleRetry}
            color="primary"
            variant="contained"
            disabled={isGenerating}
          >
            Try Different Role
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default MismatchOverlay; 