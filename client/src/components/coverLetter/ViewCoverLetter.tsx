import React, { useState, useEffect } from 'react';
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
import { CoverLetter } from './types/coverLetterTypes';

const ViewCoverLetter: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [coverLetter, setCoverLetter] = useState<CoverLetter | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCoverLetter = async () => {
      try {
        setLoading(true);
        const response = await coverLetterService.getCoverLetter(id!);
        
        // Handle both direct response and wrapped response formats
        if (response && typeof response === 'object') {
          if ('success' in response && response.success && response.data) {
            // Wrapped response format with success/data properties
            setCoverLetter(response.data);
          } else if ('id' in response && 'title' in response && 'content' in response) {
            // Direct response format that has required CoverLetter properties
            const coverLetterData: CoverLetter = {
              id: response.id,
              title: response.title,
              content: response.content,
              resumeId: response.resumeId,
              jobTitle: response.jobTitle,
              company: response.company,
              generationOptions: 'generationOptions' in response ? response.generationOptions : undefined,
              createdAt: 'createdAt' in response ? response.createdAt : undefined,
              updatedAt: 'updatedAt' in response ? response.updatedAt : undefined
            };
            setCoverLetter(coverLetterData);
          } else {
            setError('Invalid cover letter data format');
          }
        } else {
          setError('Failed to load cover letter');
        }
      } catch (err) {
        setError('Failed to load cover letter. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCoverLetter();
    }
  }, [id]);

  const handleEdit = () => {
    navigate(`/cover-letter/edit/${id}`);
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this cover letter?')) {
      return;
    }

    try {
      setLoading(true);
      await coverLetterService.deleteCoverLetter(id!);
      navigate('/dashboard');
    } catch (err) {
      setError('Failed to delete cover letter. Please try again.');
      setLoading(false);
    }
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
      </Container>
    );
  }

  if (!coverLetter) {
    return (
      <Container maxWidth="md">
        <Alert severity="warning" sx={{ mt: 2 }}>Cover letter not found</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 4, mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h4" gutterBottom>
              {coverLetter.title}
            </Typography>
            <Typography variant="subtitle1" color="textSecondary" gutterBottom>
              For: {coverLetter.jobTitle} at {coverLetter.company}
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
    </Container>
  );
};

export default ViewCoverLetter; 