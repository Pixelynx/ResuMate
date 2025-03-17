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
  Stepper,
  Step,
  StepLabel,
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

interface ResumeOption {
  id: string;
  title: string;
}

const CoverLetterForm: React.FC = () => {
  const { resumeId } = useParams<{ resumeId?: string }>();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [resumes, setResumes] = useState<ResumeOption[]>([]);
  const [generatedContent, setGeneratedContent] = useState<string>('');
  
  const [formState, setFormState] = useState<CoverLetterFormState>({
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
    resumeId: resumeId || '',
    jobTitle: '',
    company: ''
  });

  const [generationOptions, setGenerationOptions] = useState<GenerationOptions>({
    tone: 'professional',
    length: 'medium',
    emphasis: []
  });

  const steps = ['Job Details', 'Generate Cover Letter', 'Review & Save'];

  useEffect(() => {
    const fetchResumes = async () => {
      try {
        setLoading(true);
        const resumes = await resumeService.getAllResumes();
        setResumes(resumes.map((resume: Resume) => ({
          id: resume.id,
          title: resume.personalDetails.firstName && resume.personalDetails.lastName
            ? `${resume.personalDetails.firstName} ${resume.personalDetails.lastName}'s Resume`
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
      resumeId: e.target.value,
    }));
  };

  const handleGenerationOptionsChange = (
    option: keyof GenerationOptions,
    value: string | string[]
  ) => {
    setGenerationOptions(prev => ({
      ...prev,
      [option]: value,
    }));
  };

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const validateCurrentStep = () => {
    switch (activeStep) {
      case 0:
        return formData.resumeId && formData.jobTitle && formData.company;
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
        progress: 0
      });

      const generationRequest: CoverLetterGenerationRequest = {
        resumeId: formData.resumeId || '',
        jobTitle: formData.jobTitle,
        company: formData.company,
        jobDescription: formData.jobDescription
      };

      const response = await coverLetterService.generateCoverLetter(
        generationRequest,
        generationOptions
      );

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to generate cover letter');
      }

      const generatedLetter = response.data;
      setGeneratedContent(generatedLetter.content);
      setFormData(prev => ({
        ...prev,
        content: generatedLetter.content,
        title: `Cover Letter for ${formData.jobTitle} at ${formData.company}`
      }));

      setGenerationStatus({
        isGenerating: false,
        error: null,
        progress: 100
      });

      handleNext();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate cover letter';
      setGenerationStatus({
        isGenerating: false,
        error: errorMessage,
        progress: 0
      });
    }
  };

  const saveCoverLetter = async () => {
    try {
      setFormState(prev => ({ ...prev, isSubmitting: true }));
      
      const response = await coverLetterService.createCoverLetter(formData);
      
      if (response.success) {
        setFormState(prev => ({ ...prev, isSubmitting: false }));
        navigate('/dashboard');
      } else {
        throw new Error(response.message || 'Failed to save cover letter');
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
                    value={formData.resumeId}
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
                  id="jobTitle"
                  name="jobTitle"
                  label="Job Title"
                  value={formData.jobTitle}
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
                  id="jobDescription"
                  name="jobDescription"
                  label="Job Description (Optional)"
                  multiline
                  rows={6}
                  value={formData.jobDescription}
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
    <Box sx={{ maxWidth: 900, mx: 'auto', p: 3 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Create Cover Letter
        </Typography>
        
        <Stepper activeStep={activeStep} sx={{ mb: 4, mt: 3 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
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
  );
};

export default CoverLetterForm; 