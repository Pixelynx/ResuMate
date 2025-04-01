import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  CircularProgress, 
  Button, 
  Collapse,
  Alert,
  useTheme
} from '@mui/material';
import WorkIcon from '@mui/icons-material/Work';
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
  maxWidth: '500px',
  margin: '0 auto',
  overflow: 'hidden',
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: '0 12px 20px rgba(0, 0, 0, 0.15)',
    transform: 'translateY(-3px)',
  }
}));

interface ScoreBoxProps {
  score: number | null;
}

const ScoreBox = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'score'
})<ScoreBoxProps>(({ theme, score }) => {
  let bgColor = 'linear-gradient(45deg, #e0e0e0 30%, #f5f5f5 90%)';
  let textColor = theme.palette.text.primary;
  
  if (score !== null) {
    if (score >= 8.0) {
      bgColor = 'linear-gradient(45deg, #4caf50 30%, #8bc34a 90%)'; // green
      textColor = '#ffffff';
    } else if (score >= 6.0) {
      bgColor = 'linear-gradient(45deg, #2196f3 30%, #03a9f4 90%)'; // blue
      textColor = '#ffffff';
    } else if (score >= 4.0) {
      bgColor = 'linear-gradient(45deg, #ff9800 30%, #ffc107 90%)'; // orange
      textColor = '#ffffff';
    } else {
      bgColor = 'linear-gradient(45deg, #f44336 30%, #ff5722 90%)'; // red
      textColor = '#ffffff';
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
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (score !== null) {
      setOpen(true);
    }
  }, [score]);

  const handleCalculate = () => {
    dispatch(fetchJobFitScore(coverLetterId));
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
      {!open && (
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleCalculate}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : <WorkIcon />}
          sx={{
            background: 'linear-gradient(45deg, #6a1b9a 30%, #8e24aa 90%)',
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
      )}

      <Collapse in={open} timeout={800}>
        <AnimatedPaper>
          <Typography 
            variant="h5" 
            gutterBottom 
            sx={{ 
              fontWeight: 'bold',
              textAlign: 'center',
              color: '#6a1b9a'
            }}
          >
            Job Fit Analysis
          </Typography>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
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
                  <Typography variant="body1" sx={{ fontStyle: 'italic', lineHeight: 1.6 }}>
                    {explanation}
                  </Typography>
                </Box>
              )}
              
              <Button 
                variant="outlined" 
                color="primary" 
                onClick={() => setOpen(false)} 
                sx={{ mt: 2 }}
              >
                Hide
              </Button>
            </>
          )}
        </AnimatedPaper>
      </Collapse>
    </Box>
  );
};

export default JobScore;
