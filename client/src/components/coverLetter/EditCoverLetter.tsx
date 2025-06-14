import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  CircularProgress,
  Alert,
  Container,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { coverLetterService } from '../../utils/api';
import { CoverLetter } from './types/coverLetterTypes';

interface ValidationState {
  firstname: boolean;
  lastname: boolean;
  email: boolean;
  title: boolean;
  content: boolean;
}

const EditCoverLetter: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [coverLetter, setCoverLetter] = useState<CoverLetter | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [validation, setValidation] = useState<ValidationState>({
    firstname: true,
    lastname: true,
    email: true,
    title: true,
    content: true
  });

  // Fetch the cover letter data
  useEffect(() => {
    const fetchCoverLetter = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const response = await coverLetterService.getCoverLetter(id);
        console.log('Fetched cover letter:', response);
        
        // Handle both direct CoverLetter object and CoverLetterResponse format
        if ('success' in response && response.data) {
          // It's a CoverLetterResponse
          setCoverLetter(response.data);
        } else {
          // It's a direct CoverLetter object
          setCoverLetter(response as CoverLetter);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching cover letter:', err);
        setError('Failed to load cover letter data');
        setLoading(false);
      }
    };

    fetchCoverLetter();
  }, [id]);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = (): boolean => {
    const newValidation = {
      firstname: Boolean(coverLetter?.firstname),
      lastname: Boolean(coverLetter?.lastname),
      email: Boolean(coverLetter?.email) && validateEmail(coverLetter?.email || ''),
      title: Boolean(coverLetter?.title),
      content: Boolean(coverLetter?.content)
    };
    
    setValidation(newValidation);
    
    return Object.values(newValidation).every(value => value);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setCoverLetter(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        [name]: value
      };
    });
  };

  const handleSave = async () => {
    if (!coverLetter || !id) return;
    
    if (!validateForm()) {
      setError('Please fill in all required fields correctly');
      return;
    }
    
    try {
      setSubmitting(true);
      setError(null);
      
      await coverLetterService.updateCoverLetter(id, coverLetter);
      
      setSuccess('Cover letter updated successfully');
      setSubmitting(false);
      
      // Navigate back to view page after a short delay
      setTimeout(() => {
        navigate(`/cover-letter/${id}`);
      }, 1500);
    } catch (err) {
      console.error('Error updating cover letter:', err);
      setError('Failed to update cover letter');
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate(`/cover-letter/${id}`);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!coverLetter) {
    return (
      <Container maxWidth="md">
        <Alert severity="error" sx={{ mt: 4 }}>
          Cover letter not found or could not be loaded
        </Alert>
        <Button variant="outlined" onClick={() => navigate('/dashboard')} sx={{ mt: 2 }}>
          Back to Dashboard
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ paddingBottom: '80px' }}>
      <Paper 
        elevation={isMobile ? 0 : 3} 
        sx={{ 
          p: { xs: 2, sm: 4 }, 
          mt: 4, 
          mb: 4,
          borderRadius: '8px',
          boxShadow: isMobile ? 'none' : '0 4px 20px rgba(0, 0, 0, 0.1)',
          background: 'white'
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Edit Cover Letter
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Title
            </Typography>
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              required
              fullWidth
              label="Cover Letter Title"
              name="title"
              value={coverLetter.title || ''}
              onChange={handleInputChange}
              error={!validation.title}
              helperText={!validation.title ? 'Title is required' : ''}
              disabled={submitting}
            />
          </Grid>
          
          
          <Grid item xs={12}>
            {/* <Divider sx={{ my: 2 }} /> */}
            <Typography variant="h6" gutterBottom>
              Cover Letter Content
            </Typography>
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              required
              fullWidth
              label="Content"
              name="content"
              multiline
              rows={12}
              value={coverLetter.content || ''}
              onChange={handleInputChange}
              error={!validation.content}
              helperText={!validation.content ? 'Content is required' : ''}
              disabled={submitting}
            />
          </Grid>
        </Grid>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button
            variant="outlined"
            onClick={handleCancel}
            disabled={submitting}
          >
            Cancel
          </Button>
          
          <Button
            variant="contained"
            color="primary"
            onClick={handleSave}
            disabled={submitting}
            startIcon={submitting ? <CircularProgress size={20} /> : null}
            sx={{
              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
              '&:disabled': {
                background: '#e0e0e0',
                color: '#9e9e9e'
              }
            }}
          >
            {submitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default EditCoverLetter; 