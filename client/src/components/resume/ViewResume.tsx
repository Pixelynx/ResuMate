import React, { useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import ResumePreview from './PreviewResume';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { fetchResumeById } from '../../redux/slices/resumeSlice';
import {
  selectCurrentResume,
  selectResumeLoading,
  selectResumeError
} from '../../redux/selectors/resumeSelectors';
import PrintableResume from '../print/PrintableResume';
import PrintController from '../print/PrintController';

const ViewResume: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const printableRef = useRef<HTMLDivElement>(null);
  
  const resume = useAppSelector(selectCurrentResume);
  const loading = useAppSelector(selectResumeLoading);
  const error = useAppSelector(selectResumeError);

  useEffect(() => {
    if (id) {
      dispatch(fetchResumeById(id));
    }
  }, [dispatch, id]);

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
        <Box>
          <PrintController 
            documentId={resume.id} 
            documentType="resume" 
            contentRef={printableRef} 
          />
          <Button 
            variant="contained" 
            startIcon={<EditIcon />}
            onClick={handleEdit}
            sx={{ ml: 2 }}
          >
            Edit Resume
          </Button>
        </Box>
      </Box>
      
      {/* Regular view */}
      <Box sx={{ display: 'block' }}>
        <ResumePreview formData={resume} />
      </Box>

      {/* Hidden printable view - only shown during printing */}
      <Box sx={{ display: 'none' }}>
        <PrintableResume ref={printableRef} resume={resume} />
      </Box>
    </Container>
  );
};

export default ViewResume; 