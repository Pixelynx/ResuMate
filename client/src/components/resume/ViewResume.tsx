import React, { useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Button,
  CircularProgress,
  Alert,
  Tooltip,
  Paper,
  useTheme,
  useMediaQuery,
  Fab,
  Zoom
} from '@mui/material';
import ResumePreview from './PreviewResume';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import PrintIcon from '@mui/icons-material/Print';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { fetchResumeById } from '../../redux/slices/resumeSlice';
import {
  selectCurrentResume,
  selectResumeLoading,
  selectResumeError
} from '../../redux/selectors/resumeSelectors';
import PrintableResume from '../print/PrintableResume';
import PrintController from '../print/PrintController';
import { Resume, ResumeFormData } from './types/resumeTypes';

const ViewResume: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const printableRef = useRef<HTMLDivElement>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const resume = useAppSelector(selectCurrentResume);
  const loading = useAppSelector(selectResumeLoading);
  const error = useAppSelector(selectResumeError);

  // Transform Resume to ResumeFormData
  const transformToFormData = (resume: Resume): ResumeFormData => ({
    ...resume,
    workExperience: resume.workExperience || [],
    education: resume.education || [],
    skills: resume.skills || { skills_: '', languages: '' },
    certifications: resume.certifications || [],
    projects: resume.projects || []
  });

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

  // Trigger vibration for haptic feedback when buttons are clicked
  const triggerHapticFeedback = () => {
    if (navigator.vibrate && isMobile) {
      navigator.vibrate(50); // Short vibration of 50ms
    }
  };
  
  const handleButtonClick = (callback: () => void) => {
    triggerHapticFeedback();
    callback();
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

  const formData = transformToFormData(resume);

  return (
    <Container maxWidth="md" sx={{ paddingBottom: '80px' }}>
      {/* Desktop header buttons */}
      {!isMobile && (
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
            <Tooltip title="Edit functionality is temporarily disabled">
              <span>
                <Button 
                  variant="contained" 
                  startIcon={<EditIcon />}
                  onClick={handleEdit}
                  disabled={true}
                  sx={{ 
                    ml: 2,
                    '&.Mui-disabled': {
                      backgroundColor: (theme) => theme.palette.grey[400],
                      color: (theme) => theme.palette.grey[100]
                    }
                  }}
                >
                  Edit Resume
                </Button>
              </span>
            </Tooltip>
          </Box>
        </Box>
      )}

      {/* Mobile floating buttons */}
      {isMobile && (
        <>
          <Zoom in={true}>
            <Fab
              color="default"
              aria-label="back"
              onClick={() => handleButtonClick(handleBack)}
              sx={{ 
                position: 'fixed',
                top: 66,
                left: 16,
                zIndex: 2
              }}
            >
              <ArrowBackIcon />
            </Fab>
          </Zoom>
          
          <Zoom in={true} style={{ transitionDelay: '75ms' }}>
            <Fab
              color="secondary"
              aria-label="print"
              onClick={() => {
                triggerHapticFeedback();
                if (printableRef.current) {
                  window.print();
                }
              }}
              sx={{ 
                position: 'fixed',
                bottom: 70,
                right: 88,
                zIndex: 2
              }}
            >
              <PrintIcon />
            </Fab>
          </Zoom>
          
          <Zoom in={true} style={{ transitionDelay: '150ms' }}>
            <Tooltip title="Edit functionality is temporarily disabled">
              <Fab
                color="primary"
                aria-label="edit"
                onClick={() => handleButtonClick(handleEdit)}
                disabled={true}
                sx={{ 
                  position: 'fixed',
                  bottom: 70,
                  right: 16,
                  zIndex: 2,
                  '&.Mui-disabled': {
                    backgroundColor: (theme) => theme.palette.grey[400],
                    color: (theme) => theme.palette.grey[100]
                  }
                }}
              >
                <EditIcon />
              </Fab>
            </Tooltip>
          </Zoom>
        </>
      )}
      
      {/* Regular view */}
      <Container 
        maxWidth="lg" 
        sx={{ 
          mt: 5, 
          mb: 2,
          pb: 10,
          display: 'flex',
          justifyContent: 'center',
          width: '100%',
          minHeight: 'auto'
        }}
      >
        <Paper 
          elevation={isMobile ? 0 : 3} 
          sx={{ 
            p: { xs: 2, sm: 3 },
            borderRadius: 2,
            background: isMobile ? 'transparent' : 'linear-gradient(to right, rgba(106, 27, 154, 0.05), rgba(142, 36, 170, 0.05))',
            boxShadow: isMobile ? 'none' : undefined,
            width: '100%',
            maxWidth: '800px',
            height: 'auto',
            overflow: 'visible'
          }}
        >
          <Box sx={{ display: 'block' }}>
            <ResumePreview formData={formData} />
          </Box>
        </Paper>
      </Container>

      {/* Hidden printable view - only shown during printing */}
      <Box sx={{ display: 'none' }}>
        <PrintableResume ref={printableRef} resume={resume} />
      </Box>
    </Container>
  );
};

export default ViewResume; 