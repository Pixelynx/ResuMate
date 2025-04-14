import React, { useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Button,
  CircularProgress,
  Alert,
  Container,
  Grid,
  Divider
} from '@mui/material';
import { coverLetterService } from '../../utils/api';
import PrintableCoverLetter from '../print/PrintableCoverLetter';
import PrintController from '../print/PrintController';
import JobScore from './JobScore';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { fetchCoverLetterById } from '../../redux/slices/coverLetterSlice';
import { 
  selectCurrentCoverLetter, 
  selectCoverLetterLoading, 
  selectCoverLetterError 
} from '../../redux/selectors/coverLetterSelectors';

const ViewCoverLetter: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const printableRef = useRef<HTMLDivElement>(null);
  
  // Redux state
  const coverLetter = useAppSelector(selectCurrentCoverLetter);
  const loading = useAppSelector(selectCoverLetterLoading);
  const error = useAppSelector(selectCoverLetterError);

  useEffect(() => {
    if (id) {
      dispatch(fetchCoverLetterById(id));
    }
  }, [dispatch, id]);

  const handleEdit = () => {
    navigate(`/cover-letter/edit/${id}`);
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this cover letter?')) {
      return;
    }

    try {
      await coverLetterService.deleteCoverLetter(id!);
      navigate('/dashboard');
    } catch (err) {
      console.error('Failed to delete cover letter:', err);
    }
  };

  const handleBack = () => {
    navigate('/dashboard');
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md">
        <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
        <Button 
          variant="outlined"
          onClick={handleBack}
          sx={{ mt: 2 }}
        >
          Back to Dashboard
        </Button>
      </Container>
    );
  }

  if (!coverLetter) {
    return (
      <Container maxWidth="md">
        <Alert severity="warning" sx={{ mt: 2 }}>Cover letter not found</Alert>
        <Button 
          variant="outlined"
          onClick={handleBack}
          sx={{ mt: 2 }}
        >
          Back to Dashboard
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ paddingBottom: '80px' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2, mb: 2 }}>
        <Button 
          variant="outlined" 
          onClick={handleBack}
        >
          Back to Dashboard
        </Button>
        <PrintController 
          documentId={coverLetter.id} 
          documentType="coverLetter" 
          contentRef={printableRef} 
        />
      </Box>
      
      {/* Job Fit Score Component */}
      <JobScore coverLetterId={coverLetter.id} />
      
      {/* Regular view */}
      <Paper elevation={3} sx={{ p: 4, mt: 4, mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h4" gutterBottom>
              {coverLetter.title}
            </Typography>
            <Typography variant="subtitle1" color="textSecondary" gutterBottom>
              For: {coverLetter.jobtitle} at {coverLetter.company}
            </Typography>
            <Divider sx={{ my: 2 }} />
          </Grid>
          
          <Grid item xs={12}>
            <Typography variant="body1" style={{ whiteSpace: 'pre-line' }}>
              {coverLetter.content}
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Box display="flex" gap={2} mt={3}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleEdit}
                disabled={loading}
              >
                Edit
              </Button>
              <Button
                variant="outlined"
                color="error"
                onClick={handleDelete}
                disabled={loading}
              >
                Delete
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Hidden printable view - only shown during printing */}
      <Box sx={{ display: 'none' }}>
        <PrintableCoverLetter ref={printableRef} coverLetter={coverLetter} />
      </Box>
    </Container>
  );
};

export default ViewCoverLetter; 