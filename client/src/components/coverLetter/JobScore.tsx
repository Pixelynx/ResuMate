import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Button,
  Alert,
  useTheme,
  Modal,
  IconButton,
  Backdrop,
  Dialog,
  DialogContent,
  DialogTitle,
} from '@mui/material';
import WorkIcon from '@mui/icons-material/Work';
import CloseIcon from '@mui/icons-material/Close';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { fetchJobFitScore } from '../../redux/slices/jobFitSlice';
import {
  selectJobFitScore,
  selectJobFitExplanation,
  selectJobFitLoading,
  selectJobFitError
} from '../../redux/selectors/jobFitSelectors';
import { keyframes } from '@emotion/react';
import { styled } from '@mui/material/styles';
interface JobScoreProps {
  coverLetterId: string;
}
// Define animations
const bounceAnimation = keyframes`
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-15px);
  }
  60% {
    transform: translateY(-7px);
  }
`;
// Styled components
const AnimatedPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: '12px',
  boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
  animation: `${bounceAnimation} 1s ease`,
  width: '100%',
  overflow: 'hidden',
  transition: 'all 0.3s ease',
  position: 'relative',
  '&:hover': {
    boxShadow: '0 12px 20px rgba(0, 0, 0, 0.15)',
  }
}));
interface ScoreBoxProps {
  score: number | null;
}
const ScoreBox = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'score'
})<ScoreBoxProps>(({ theme, score }) => {
  let bgColor = 'linear-gradient(45deg, #E0E0E0 30%, #F5F5F5 90%)';
  let textColor = theme.palette.text.primary;
  if (score !== null) {
    if (score >= 8.0) {
      bgColor = 'linear-gradient(45deg, #4CAF50 30%, #8BC34A 90%)'; // green
      textColor = '#FFFFFF';
    } else if (score >= 6.0) {
      bgColor = 'linear-gradient(45deg, #2196F3 30%, #03A9F4 90%)'; // blue
      textColor = '#FFFFFF';
    } else if (score >= 4.0) {
      bgColor = 'linear-gradient(45deg, #FF9800 30%, #FFC107 90%)'; // orange
      textColor = '#FFFFFF';
    } else {
      bgColor = 'linear-gradient(45deg, #F44336 30%, #FF5722 90%)'; // red
      textColor = '#FFFFFF';
    }
  }
  return {
    padding: theme.spacing(2),
    borderRadius: '8px',
    background: bgColor,
    color: textColor,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing(2),
  };
});
const JobScore: React.FC<JobScoreProps> = ({ coverLetterId }) => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const score = useAppSelector(selectJobFitScore);
  const explanation = useAppSelector(selectJobFitExplanation);
  const loading = useAppSelector(selectJobFitLoading);
  const error = useAppSelector(selectJobFitError);
  const [modalOpen, setModalOpen] = useState(false);
  const [hasResults, setHasResults] = useState(false);
  useEffect(() => {
    // If we have results (score or error), mark that we have results
    if (score !== null || error) {
      setHasResults(true);
      // If we're calculating, automatically open the modal
      if (loading) {
        setModalOpen(true);
      }
    }
  }, [score, error, loading]);
  const handleCalculate = () => {
    dispatch(fetchJobFitScore(coverLetterId));
    setModalOpen(true); // Open modal when calculating
  };
  const handleCloseModal = () => {
    setModalOpen(false);
  };
  const handleOpenModal = () => {
    // Only allow opening if we have results to show
    if (hasResults) {
      setModalOpen(true);
    }
  };
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        minHeight: '30vh',
        justifyContent: 'center',
        mt: 2,
        mb: 2
      }}
    >
      <Button
        variant="contained"
        color="primary"
        onClick={handleCalculate}
        disabled={loading}
        startIcon={loading ? <CircularProgress size={20} /> : <WorkIcon />}
        sx={{
          background: 'linear-gradient(45deg, #6A1B9A 30%, #8E24AA 90%)',
          borderRadius: '8px',
          boxShadow: '0 3px 5px 2px rgba(106, 27, 154, .3)',
          color: 'white',
          height: 48,
          padding: '0 30px',
          '&:hover': {
            boxShadow: '0 5px 8px 2px rgba(142, 36, 170, .4)',
            transform: 'translateY(-2px)',
          }
        }}
      >
        {loading ? 'Calculating...' : 'Calculate Job Fit Score'}
      </Button>
      {/* Show a button to view results if available and modal is closed */}
      {hasResults && !modalOpen && (
        <Button
          variant="outlined"
          color="primary"
          disabled={true} // TODO: Fix persisting previous results
          onClick={handleOpenModal}
          sx={{ mt: 2 }}
        >
          View Job Fit Results
        </Button>
      )}
      {/* Use Dialog instead of Modal for better accessibility */}
      <Dialog
        open={modalOpen}
        onClose={handleCloseModal}
        maxWidth="md"
        PaperProps={{
          sx: {
            borderRadius: '12px',
            maxWidth: '600px',
            maxHeight: '80vh',
          }
        }}
      >
        <DialogTitle
          sx={{
            textAlign: 'center',
            fontWeight: 'bold',
            color: '#6A1B9A',
            pt: 3,
            pr: 6 // Add space for the close button
          }}
        >
          Job Fit Analysis
          <IconButton
            onClick={handleCloseModal}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: theme.palette.grey[500]
            }}
            aria-label="close"
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          ) : score === null ? (
            <Alert severity="warning" sx={{ mb: 2 }}>
              Our job fit scoring service is currently unavailable. Please try again later.
            </Alert>
          ) : (
            <>
              <ScoreBox score={score}>
                <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                  {score !== null ? score.toFixed(1) : '-'}/10.0
                </Typography>
                <Typography variant="subtitle1">
                  Job Fit Score
                </Typography>
              </ScoreBox>
              {explanation && (
                <Box sx={{ mt: 2 }}>
                  <Typography
                    variant="body1"
                    sx={{
                      lineHeight: 1.6,
                      whiteSpace: 'pre-line'
                    }}
                  >
                    {explanation}
                  </Typography>
                </Box>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};
export default JobScore;