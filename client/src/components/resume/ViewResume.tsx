import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Button,
  CircularProgress,
  Alert,
  Paper
} from '@mui/material';
import { resumeService } from '../../utils/api';
import { Resume } from './types/resumeTypes';
import ResumePreview from './PreviewResume';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';

const ViewResume: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [resume, setResume] = useState<Resume | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResume = async () => {
      try {
        setLoading(true);
        if (!id) {
          setError('Resume ID is missing');
          return;
        }
        
        const resumeData = await resumeService.getResumeById(id);
        if (resumeData) {
          setResume(resumeData);
        } else {
          setError('Resume not found');
        }
      } catch (err) {
        console.error('Error fetching resume:', err);
        setError('Failed to load resume data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchResume();
  }, [id]);

  const handleEdit = () => {
    navigate(`/resume/builder?id=${id}`);
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
          startIcon={<ArrowBackIcon />} 
          onClick={handleBack}
          sx={{ mt: 2 }}
        >
          Back to Dashboard
        </Button>
      </Container>
    );
  }

  if (!resume) {
    return (
      <Container maxWidth="md">
        <Alert severity="warning" sx={{ mt: 2 }}>Resume not found</Alert>
        <Button 
          variant="outlined" 
          startIcon={<ArrowBackIcon />} 
          onClick={handleBack}
          sx={{ mt: 2 }}
        >
          Back to Dashboard
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2, mb: 2 }}>
        <Button 
          variant="outlined" 
          startIcon={<ArrowBackIcon />} 
          onClick={handleBack}
        >
          Back to Dashboard
        </Button>
        <Button 
          variant="contained" 
          startIcon={<EditIcon />}
          onClick={handleEdit}
        >
          Edit Resume
        </Button>
      </Box>
      
      <ResumePreview formData={resume} />
    </Container>
  );
};

export default ViewResume; 