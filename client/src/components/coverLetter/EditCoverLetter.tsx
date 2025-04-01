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
  Divider
} from '@mui/material';
import { coverLetterService } from '../../utils/api';
import { CoverLetter } from './types/coverLetterTypes';

interface ValidationState {
  firstName: boolean;
  lastName: boolean;
  email: boolean;
  title: boolean;
  content: boolean;
}

const EditCoverLetter: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [coverLetter, setCoverLetter] = useState<CoverLetter | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [validation, setValidation] = useState<ValidationState>({
    firstName: true,
    lastName: true,
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
      firstName: Boolean(coverLetter?.firstName),
      lastName: Boolean(coverLetter?.lastName),
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
    <Container maxWidth="md">
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4, 
          mt: 4, 
          mb: 4,
          borderRadius: '8px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Edit Cover Letter
        </Typography>
        
        <Divider sx={{ mb: 4 }} />
        
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
              Cover Letter Information
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
              label="First Name"
              name="firstName"
              value={coverLetter.firstName || ''}
              onChange={handleInputChange}
              error={!validation.firstName}
              helperText={!validation.firstName ? 'First name is required' : ''}
              disabled={submitting}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
              label="Last Name"
              name="lastName"
              value={coverLetter.lastName || ''}
              onChange={handleInputChange}
              error={!validation.lastName}
              helperText={!validation.lastName ? 'Last name is required' : ''}
              disabled={submitting}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={coverLetter.email || ''}
              onChange={handleInputChange}
              error={!validation.email}
              helperText={!validation.email ? 'Valid email is required' : ''}
              disabled={submitting}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Phone Number"
              name="phoneNumber"
              value={coverLetter.phoneNumber || ''}
              onChange={handleInputChange}
              disabled={submitting}
            />
          </Grid>
          
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>
              Job Details
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
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Job Title"
              name="jobTitle"
              value={coverLetter.jobTitle || ''}
              onChange={handleInputChange}
              disabled={submitting}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Company"
              name="company"
              value={coverLetter.company || ''}
              onChange={handleInputChange}
              disabled={submitting}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Job Description"
              name="jobDescription"
              multiline
              rows={4}
              value={coverLetter.jobDescription || ''}
              onChange={handleInputChange}
              disabled={submitting}
            />
          </Grid>
          
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
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