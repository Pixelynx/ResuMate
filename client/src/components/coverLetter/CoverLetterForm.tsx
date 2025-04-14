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
  Divider,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Container,
} from '@mui/material';
import { coverLetterService, resumeService } from '../../utils/api';
import {
  CoverLetterFormData,
  CoverLetterGenerationRequest,
  CoverLetterFormState,
  GenerationOptions,
  CoverLetterGenerationStatus
} from './types/coverLetterTypes';
import { Resume } from '../resume/types/resumeTypes';
import LoadingOverlay from '../common/LoadingOverlay';
import CoverLetterFormStepper from './CoverLetterFormStepper';

interface ResumeOption {
  id: string;
  title: string;
}

const CoverLetterForm: React.FC = () => {
  const { resumeid } = useParams<{ resumeid?: string }>();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, ] = useState<string | null>(null);
  const [resumes, setResumes] = useState<ResumeOption[]>([]);
  const [generatedContent, ] = useState<string>('');
  
  const [, setFormState] = useState<CoverLetterFormState>({
    isSubmitting: false,
    isEditing: false,
    validationErrors: {}
  });

  const [generationStatus, setGenerationStatus] = useState<CoverLetterGenerationStatus>({
    isGenerating: false,
    error: null,
    progress: 0
  });

  const [formData, setFormData] = useState<CoverLetterFormData>({
    title: '',
    content: '',
    resumeid: resumeid || '',
    jobtitle: '',
    company: '',
    firstname: '',
    lastname: '',
    email: '',
    phoneNumber: '',
    jobdescription: ''
  });

  const [generationoptions, ] = useState<GenerationOptions>({
    tone: 'professional',
    length: 'medium',
    focusPoints: []
  });

  const steps = ['Job Details', 'Generate Cover Letter', 'Review & Save'];

  useEffect(() => {
    const fetchResumes = async () => {
      try {
        setLoading(true);
        const resumes = await resumeService.getAllResumes();
        setResumes(resumes.map((resume: Resume) => ({
          id: resume.id,
          title: resume.personalDetails.firstname && resume.personalDetails.lastname
            ? `${resume.personalDetails.firstname} ${resume.personalDetails.lastname}'s Resume`
            : 'Untitled Resume'
        })));
        setLoading(false);
      } catch (err) {
        setError('Failed to load resumes. Please try again.');
        setLoading(false);
      }
    };

    fetchResumes();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleResumeChange = (e: SelectChangeEvent) => {
    setFormData(prev => ({
      ...prev,
      resumeid: e.target.value,
    }));
  };

  // const handleGenerationOptionsChange = (
  //   option: keyof GenerationOptions,
  //   value: string | string[]
  // ) => {
  //   setGenerationOptions(prev => ({
  //     ...prev,
  //     [option]: value,
  //   }));
  // };

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const validateCurrentStep = () => {
    switch (activeStep) {
      case 0:
        return formData.resumeid && formData.jobtitle && formData.company;
      case 1:
        return generatedContent.length > 0;
      case 2:
        return formData.title.length > 0 && formData.content.length > 0;
      default:
        return false;
    }
  };

  const generateCoverLetter = async () => {
    try {
      setGenerationStatus({
        isGenerating: true,
        error: null,
        progress: 0,
        message: 'Preparing to generate cover letter...'
      });

      const generationRequest: CoverLetterGenerationRequest = {
        resumeid: formData.resumeid || '',
        jobtitle: formData.jobtitle,
        company: formData.company,
        jobdescription: formData.jobdescription,
        firstname: formData.firstname,
        lastname: formData.lastname,
        email: formData.email,
        phoneNumber: formData.phoneNumber
      };

      // Start progress simulation
      const progressInterval = setInterval(() => {
        setGenerationStatus(prev => ({
          ...prev,
          progress: Math.min(prev.progress + 10, 90),
          message: prev.progress < 30 
            ? 'Analyzing resume and job details...'
            : prev.progress < 80
            ? 'Generating personalized content...'
            : 'Finalizing your cover letter...'
        }));
      }, 1000);

      const response = await coverLetterService.generateCoverLetter(
        generationRequest,
        generationoptions
      );

      clearInterval(progressInterval);

      if (!response) {
        throw new Error('Failed to generate cover letter');
      }

      setGenerationStatus({
        isGenerating: false,
        error: null,
        progress: 100,
        message: 'Cover letter generated successfully!'
      });

      // Navigate to the view page for the new cover letter
      if ('data' in response && response.data && response.data.id) {
        // Wrapped response format
        navigate(`/cover-letter/${response.data.id}`);
      } else if ('id' in response) {
        // Direct response format
        navigate(`/cover-letter/${response.id}`);
      } else {
        throw new Error('Failed to retrieve cover letter ID');
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate cover letter';
      setGenerationStatus({
        isGenerating: false,
        error: errorMessage,
        progress: 0,
        message: 'Generation failed'
      });
    }
  };

  const saveCoverLetter = async () => {
    try {
      setFormState(prev => ({ ...prev, isSubmitting: true }));
      
      const response = await coverLetterService.createCoverLetter(formData);
      
      if ('success' in response && response.success) {
        // Wrapped response format
        setFormState(prev => ({ ...prev, isSubmitting: false }));
        navigate('/dashboard');
      } else if ('id' in response) {
        // Direct response format
        setFormState(prev => ({ ...prev, isSubmitting: false }));
        navigate('/dashboard');
      } else {
        const errorMessage = 'success' in response && response.message 
          ? response.message 
          : 'Failed to save cover letter';
        throw new Error(errorMessage);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save cover letter';
      setFormState(prev => ({
        ...prev,
        isSubmitting: false,
        validationErrors: {
          ...prev.validationErrors,
          submit: errorMessage
        }
      }));
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box sx={{ mt: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel id="resume-select-label">Select Resume</InputLabel>
                  <Select
                    labelId="resume-select-label"
                    id="resume-select"
                    value={formData.resumeid}
                    label="Select Resume"
                    onChange={handleResumeChange}
                    disabled={loading}
                  >
                    {resumes.map((resume) => (
                      <MenuItem key={resume.id} value={resume.id}>
                        {resume.title}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  required
                  fullWidth
                  id="jobtitle"
                  name="jobtitle"
                  label="Job Title"
                  value={formData.jobtitle}
                  onChange={handleInputChange}
                  disabled={loading}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  required
                  fullWidth
                  id="company"
                  name="company"
                  label="Company Name"
                  value={formData.company}
                  onChange={handleInputChange}
                  disabled={loading}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="jobdescription"
                  name="jobdescription"
                  label="Job Description (Optional)"
                  multiline
                  rows={6}
                  value={formData.jobdescription}
                  onChange={handleInputChange}
                  disabled={loading}
                  placeholder="Paste the job description here to create a more tailored cover letter"
                />
              </Grid>
            </Grid>
          </Box>
        );
      case 1:
        return (
          <Box sx={{ mt: 3 }}>
            <Typography variant="body1" gutterBottom>
              Click the button below to generate an AI-powered cover letter based on your resume and the job details.
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, mb: 3 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={generateCoverLetter}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : null}
              >
                {loading ? 'Generating...' : 'Generate Cover Letter'}
              </Button>
            </Box>
            {generatedContent && (
              <Paper elevation={2} sx={{ p: 3, mt: 3, backgroundColor: '#f9f9f9' }}>
                <Typography variant="h6" gutterBottom>
                  Generated Cover Letter Preview:
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                  {generatedContent}
                </Typography>
              </Paper>
            )}
          </Box>
        );
      case 2:
        return (
          <Box sx={{ mt: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="title"
                  name="title"
                  label="Cover Letter Title"
                  value={formData.title}
                  onChange={handleInputChange}
                  disabled={loading}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="content"
                  name="content"
                  label="Cover Letter Content"
                  multiline
                  rows={12}
                  value={formData.content}
                  onChange={handleInputChange}
                  disabled={loading}
                />
              </Grid>
            </Grid>
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <Container maxWidth="md">
      {generationStatus.isGenerating && (
        <LoadingOverlay
          message={generationStatus.message}
          progress={generationStatus.progress}
          showProgress={true}
        />
      )}
      
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, mb: 4 }}>
        <CoverLetterFormStepper activeStep={activeStep} steps={steps} />
        
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            Create Cover Letter
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
          
          {renderStepContent()}
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              variant="outlined"
              onClick={activeStep === 0 ? () => navigate('/dashboard') : handleBack}
              disabled={loading}
            >
              {activeStep === 0 ? 'Cancel' : 'Back'}
            </Button>
            
            <Button
              variant="contained"
              color="primary"
              onClick={activeStep === steps.length - 1 ? saveCoverLetter : handleNext}
              disabled={loading || !validateCurrentStep()}
              startIcon={loading && activeStep === steps.length - 1 ? <CircularProgress size={20} /> : null}
            >
              {activeStep === steps.length - 1 ? 'Save Cover Letter' : 'Next'}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default CoverLetterForm; 