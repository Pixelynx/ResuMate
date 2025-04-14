import React, { useEffect } from 'react';
import {
  Button,
  TextField,
  Box,
  IconButton,
  Typography,
  Card,
  CardContent,
  CardActions,
  Grid,
  Snackbar,
  Alert,
  CircularProgress,
  Divider
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import { useFormValidation } from './validation/useFormValidation';
import { formatPhone } from '../../utils/validation';
import { WorkExperienceValidation } from './types/validationTypes';
import ResumePreview from './PreviewResume';
import { useSearchParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { 
  fetchResumeById, 
  createResume, 
  updateResume,
  nextStep,
  prevStep,
  updatePersonalDetails,
  updateWorkExperience,
  addWorkExperience,
  removeWorkExperience,
  updateEducation,
  addEducation,
  removeEducation,
  updateSkills,
  updateCertification,
  addCertification,
  removeCertification,
  updateProject,
  addProject,
  removeProject,
  initNewDraftResume,
  clearError
} from '../../redux/slices/resumeSlice';
import { 
  selectActiveStep, 
  selectDraftResume, 
  selectResumeLoading, 
  selectResumeSubmitting, 
  selectResumeError,
  selectSavedResumeId
} from '../../redux/selectors/resumeSelectors';
import { ResumeFormData } from './types/resumeTypes';
import ResumeParser from './ResumeParser';
import ResumeFormStepper from './ResumeFormStepper';
import dayjs from 'dayjs';

const steps = ['Personal Details', 'Work Experience', 'Education', 'Skills', 'Certifications', 'Projects', 'Preview'];

const ResumeForm: React.FC = () => {
    const dispatch = useAppDispatch();
    const [searchParams] = useSearchParams();
    const resumeid = searchParams.get('id');
    
    // Redux state
    const activeStep = useAppSelector(selectActiveStep);
    const formData = useAppSelector(selectDraftResume);
    const loading = useAppSelector(selectResumeLoading);
    const submitting = useAppSelector(selectResumeSubmitting);
    const submitError = useAppSelector(selectResumeError);
    const savedResumeId = useAppSelector(selectSavedResumeId);
    
    // Local state for success message
    const [submitSuccess, setSubmitSuccess] = React.useState(false);

    const {
      setValidationState,
      validationState,
      fieldRefs,
      handleBlur,
      validateWorkExperienceDates,
    } = useFormValidation({
      initialValidationState: {
        firstname: { error: false, message: '', touched: false },
        lastname: { error: false, message: '', touched: false },
        title: { error: false, message: '', touched: false },
        email: { error: false, message: '', touched: false },
        phone: { error: false, message: '', touched: false },
        location: { error: false, message: '', touched: false },
        linkedin: { error: false, message: '', touched: false },
        website: { error: false, message: '', touched: false },
        github: { error: false, message: '', touched: false },
        instagram: { error: false, message: '', touched: false },
        companyName: { error: false, message: '', touched: false },
        workExperience: [
          {
            companyName: { error: false, message: '', touched: false },
            jobtitle: { error: false, message: '', touched: false },
            location: { error: false, message: '', touched: false },
            description: { error: false, message: '', touched: false },
            startDateValid: true,
            endDateValid: true,
            dateErrorMessage: '',
          }
        ]
      },
      onValidationChange: (isValid) => {
        console.log('Form validation state changed:', isValid);
      }
    });

    // Initialize resume form
    useEffect(() => {
      if (!formData) {
        dispatch(initNewDraftResume());
      }
    }, [dispatch, formData]);

    // Fetch resume data if ID is provided
    useEffect(() => {
      if (resumeid) {
        dispatch(fetchResumeById(resumeid));
      }
    }, [dispatch, resumeid]);

    const submitResume = async () => {
      if (!formData) return;
      console.log("Starting resume submission");
      
      // Create a serialized copy of form data to ensure all dates are in ISO format
      const serializedFormData = {
        ...formData,
        workExperience: formData.workExperience.map(exp => ({
          ...exp,
          startDate: exp.startDate ? 
            (typeof exp.startDate === 'string' ? exp.startDate : dayjs(exp.startDate).toISOString()) : null,
          endDate: exp.endDate ? 
            (typeof exp.endDate === 'string' ? exp.endDate : dayjs(exp.endDate).toISOString()) : null
        })),
        education: formData.education.map(edu => ({
          ...edu,
          graduationDate: edu.graduationDate ? 
            (typeof edu.graduationDate === 'string' ? edu.graduationDate : dayjs(edu.graduationDate).toISOString()) : null
        })),
        certifications: formData.certifications.map(cert => ({
          ...cert,
          dateObtained: cert.dateObtained ? 
            (typeof cert.dateObtained === 'string' ? cert.dateObtained : dayjs(cert.dateObtained).toISOString()) : null,
          expirationDate: cert.expirationDate ? 
            (typeof cert.expirationDate === 'string' ? cert.expirationDate : dayjs(cert.expirationDate).toISOString()) : null
        }))
      };
      
      if (serializedFormData.workExperience && serializedFormData.workExperience.length > 0) {
        console.log("Serialized work experience date formats:");
        serializedFormData.workExperience.forEach((exp, i) => {
          const startDate = exp.startDate;
          const endDate = exp.endDate;
          
          console.log(`Entry ${i+1}:`);
          console.log(` - startDate:`, startDate, typeof startDate);
          console.log(` - endDate:`, endDate, typeof endDate);
        });
      }
      
      try {
        if (savedResumeId) {
          console.log("Updating existing resume with ID:", savedResumeId);
          await dispatch(updateResume({ id: savedResumeId, formData: serializedFormData })).unwrap();
          console.log("Resume updated successfully");
        } else {
          console.log("Creating new resume");
          const result = await dispatch(createResume(serializedFormData)).unwrap();
          if (result) {
            console.log("Resume created successfully with ID:", result.id);
            setSubmitSuccess(true);
          }
        }
      } catch (error) {
        console.error('Error submitting resume:', error);
      }
    };
  
    const handleNext = () => dispatch(nextStep());
    const handleBack = () => dispatch(prevStep());
    const handleFinish = () => submitResume();

    const handleChange = (section: keyof ResumeFormData, index: number, field: string, value: any) => {
      // Format phone numbers
      const formattedValue = field === 'phone' ? formatPhone(value) : value;

      // Special handling for date fields to ensure they're serializable
      const isDateField = ['startDate', 'endDate', 'graduationDate', 'dateObtained', 'expirationDate'].includes(field);
      
      // Serialize date objects to ISO strings before storing in Redux
      let processedValue = formattedValue;
      if (isDateField && formattedValue) {
        console.log(`Processing date field ${field}:`, formattedValue);
        try {
          // Check if it's a dayjs object (has format method)
          if (formattedValue.format) {
            processedValue = formattedValue.toISOString();
            console.log(`Converted dayjs to ISO string: ${processedValue}`);
          } 
          // For regular Date objects
          else if (formattedValue instanceof Date) {
            processedValue = formattedValue.toISOString();
            console.log(`Converted Date to ISO string: ${processedValue}`);
          }
          // Otherwise try to create a dayjs object and convert
          else {
            const dayjsObj = dayjs(formattedValue);
            if (dayjsObj.isValid()) {
              processedValue = dayjsObj.toISOString();
              console.log(`Converted to ISO string: ${processedValue}`);
            } else {
              console.log(`Invalid date, not converting: ${formattedValue}`);
            }
          }
        } catch (error) {
          console.error(`Error serializing date ${field}:`, error);
          // Fall back to original value if conversion fails
          processedValue = formattedValue;
        }
      }

      if (section === 'personalDetails') {
        dispatch(updatePersonalDetails({ field, value: processedValue }));
        setTimeout(() => {
          handleBlur(section, 0, field, processedValue);
        }, 300);
      } else if (section === 'workExperience') {
        dispatch(updateWorkExperience({ index, field, value: processedValue }));
      } else if (section === 'education') {
        dispatch(updateEducation({ index, field, value: processedValue }));
      } else if (section === 'skills') {
        dispatch(updateSkills({ field, value: processedValue }));
      } else if (section === 'certifications') {
        dispatch(updateCertification({ index, field, value: processedValue }));
      } else if (section === 'projects') {
        dispatch(updateProject({ index, field, value: processedValue }));
      }
    };
  
    const addEntry = (section: keyof ResumeFormData) => {
      if (section === 'workExperience') {
        setValidationState(prev => {
          const updatedWorkExperience = [...(prev.workExperience as WorkExperienceValidation[] || [])];
          updatedWorkExperience.push({
            companyName: { error: false, message: '', touched: false },
            jobtitle: { error: false, message: '', touched: false },
            location: { error: false, message: '', touched: false },
            description: { error: false, message: '', touched: false },
            startDateValid: true,
            endDateValid: true,
            dateErrorMessage: '',
          });
          return {
            ...prev,
            workExperience: updatedWorkExperience
          };
        });
        dispatch(addWorkExperience());
      } else if (section === 'education') {
        dispatch(addEducation());
      } else if (section === 'certifications') {
        dispatch(addCertification());
      } else if (section === 'projects') {
        dispatch(addProject());
      }
    };
  
    const removeEntry = (section: keyof ResumeFormData, index: number) => {
      if (section === 'workExperience') {
        dispatch(removeWorkExperience(index));
      } else if (section === 'education') {
        dispatch(removeEducation(index));
      } else if (section === 'certifications') {
        dispatch(removeCertification(index));
      } else if (section === 'projects') {
        dispatch(removeProject(index));
      }
    };
  
    const renderStepContent = (step: number) => {
      if (!formData) return null;
      
      switch (step) {
        case 0:
          return (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <ResumeParser />
                <Divider sx={{ my: 2 }} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField 
                  label="First Name"
                  variant="outlined"
                  fullWidth
                  required
                  inputRef={el => fieldRefs.current['firstname'] = el}
                  placeholder="Enter your first name"
                  value={formData.personalDetails.firstname}
                  onChange={(e) => handleChange('personalDetails', 0, 'firstname', e.target.value)}
                  onBlur={(e) => handleBlur('personalDetails', 0, 'firstname', e.target.value)}
                  error={validationState.firstname.error && validationState.firstname.touched}
                  helperText={validationState.firstname.touched ? validationState.firstname.message : ''}
                  InputProps={{
                    'aria-label': 'First Name',
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField 
                  label="Last Name"
                  variant="outlined"
                  fullWidth
                  required
                  inputRef={el => fieldRefs.current['lastname'] = el}
                  placeholder="Enter your last name"
                  value={formData.personalDetails.lastname}
                  onChange={(e) => handleChange('personalDetails', 0, 'lastname', e.target.value)}
                  onBlur={(e) => handleBlur('personalDetails', 0, 'lastname', e.target.value)}
                  error={validationState.lastname.error && validationState.lastname.touched}
                  helperText={validationState.lastname.touched ? validationState.lastname.message : ''}
                  InputProps={{
                    'aria-label': 'Last Name',
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField 
                  label="Professional Title"
                  variant="outlined"
                  fullWidth
                  inputRef={el => fieldRefs.current['title'] = el}
                  placeholder="Enter your professional title"
                  value={formData.personalDetails.title}
                  onChange={(e) => handleChange('personalDetails', 0, 'title', e.target.value)}
                  onBlur={(e) => handleBlur('personalDetails', 0, 'title', e.target.value)}
                  error={validationState.title.error && validationState.title.touched}
                  helperText={validationState.title.touched ? validationState.title.message : ''}
                  InputProps={{
                    'aria-label': 'Professional Title',
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField 
                  label="Email Address"
                  variant="outlined"
                  fullWidth
                  required
                  type="email"
                  inputRef={el => fieldRefs.current['email'] = el}
                  placeholder="Enter your email address"
                  value={formData.personalDetails.email}
                  onChange={(e) => handleChange('personalDetails', 0, 'email', e.target.value)}
                  onBlur={(e) => handleBlur('personalDetails', 0, 'email', e.target.value)}
                  error={validationState.email.error && validationState.email.touched}
                  helperText={validationState.email.touched ? validationState.email.message : ''}
                  InputProps={{
                    'aria-label': 'Email Address',
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField 
                  label="Phone Number"
                  variant="outlined"
                  fullWidth
                  required
                  inputRef={el => fieldRefs.current['phone'] = el}
                  placeholder="Enter your phone number"
                  value={formData.personalDetails.phone}
                  onChange={(e) => handleChange('personalDetails', 0, 'phone', e.target.value)}
                  onBlur={(e) => handleBlur('personalDetails', 0, 'phone', e.target.value)}
                  error={validationState.phone.error && validationState.phone.touched}
                  helperText={validationState.phone.touched ? validationState.phone.message : ''}
                  InputProps={{
                    'aria-label': 'Phone Number',
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField 
                  label="Location"
                  variant="outlined"
                  fullWidth
                  required
                  inputRef={el => fieldRefs.current['location'] = el}
                  placeholder="Enter your location"
                  value={formData.personalDetails.location}
                  onChange={(e) => handleChange('personalDetails', 0, 'location', e.target.value)}
                  onBlur={(e) => handleBlur('personalDetails', 0, 'location', e.target.value)}
                  error={validationState.location.error && validationState.location.touched}
                  helperText={validationState.location.touched ? validationState.location.message : ''}
                  InputProps={{
                    'aria-label': 'Location',
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField 
                  label="LinkedIn Profile URL"
                  variant="outlined"
                  fullWidth
                  type="url"
                  inputRef={el => fieldRefs.current['linkedin'] = el}
                  placeholder="Enter your LinkedIn profile URL"
                  value={formData.personalDetails.linkedin}
                  onChange={(e) => handleChange('personalDetails', 0, 'linkedin', e.target.value)}
                  onBlur={(e) => handleBlur('personalDetails', 0, 'linkedin', e.target.value)}
                  error={validationState.linkedin.error && validationState.linkedin.touched}
                  helperText={validationState.linkedin.touched ? validationState.linkedin.message : ''}
                  InputProps={{
                    'aria-label': 'LinkedIn Profile URL',
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField 
                  label="Website URL"
                  variant="outlined"
                  fullWidth
                  type="url"
                  inputRef={el => fieldRefs.current['website'] = el}
                  placeholder="Enter your website URL"
                  value={formData.personalDetails.website}
                  onChange={(e) => handleChange('personalDetails', 0, 'website', e.target.value)}
                  onBlur={(e) => handleBlur('personalDetails', 0, 'website', e.target.value)}
                  error={validationState.website.error && validationState.website.touched}
                  helperText={validationState.website.touched ? validationState.website.message : ''}
                  InputProps={{
                    'aria-label': 'Website URL',
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField 
                  label="GitHub URL"
                  variant="outlined"
                  fullWidth
                  type="url"
                  inputRef={el => fieldRefs.current['github'] = el}
                  placeholder="Enter your GitHub URL"
                  value={formData.personalDetails.github}
                  onChange={(e) => handleChange('personalDetails', 0, 'github', e.target.value)}
                  onBlur={(e) => handleBlur('personalDetails', 0, 'github', e.target.value)}
                  error={validationState.github.error && validationState.github.touched}
                  helperText={validationState.github.touched ? validationState.github.message : ''}
                  InputProps={{
                    'aria-label': 'GitHub URL',
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField 
                  label="Instagram URL"
                  variant="outlined"
                  fullWidth
                  type="url"
                  inputRef={el => fieldRefs.current['instagram'] = el}
                  placeholder="Enter your Instagram URL"
                  value={formData.personalDetails.instagram}
                  onChange={(e) => handleChange('personalDetails', 0, 'instagram', e.target.value)}
                  onBlur={(e) => handleBlur('personalDetails', 0, 'instagram', e.target.value)}
                  error={validationState.instagram.error && validationState.instagram.touched}
                  helperText={validationState.instagram.touched ? validationState.instagram.message : ''}
                  InputProps={{
                    'aria-label': 'Instagram URL',
                  }}
                />
              </Grid>
            </Grid>
          );
        case 1:
          return (
            <Box>
              {formData.workExperience.map((entry, index) => (
                <Box key={index} sx={{ mb: 2 }}>
                  <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                  <TextField
                    label="Company Name"
                    variant="outlined"
                    fullWidth
                    inputRef={el => fieldRefs.current[`workExperience_${index}_companyName`] = el}
                    value={entry.companyName}
                    onChange={(e) => handleChange('workExperience', index, 'companyName', e.target.value)}
                    onBlur={(e) => handleBlur('workExperience', index, 'companyName', e.target.value)}
                    error={validationState.workExperience?.[index]?.companyName.error && 
                           validationState.workExperience?.[index]?.companyName.touched}
                    helperText={validationState.workExperience?.[index]?.companyName.touched ? 
                              validationState.workExperience?.[index]?.companyName.message : ''}
                    InputProps={{
                      'aria-label': `Company Name for entry ${index + 1}`,
                    }}
                  />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                  <TextField
                    label="Job Title"
                    variant="outlined"
                    fullWidth
                    inputRef={el => fieldRefs.current[`workExperience_${index}_jobtitle`] = el}
                    value={entry.jobtitle}
                    onChange={(e) => handleChange('workExperience', index, 'jobtitle', e.target.value)}
                    onBlur={(e) => handleBlur('workExperience', index, 'jobtitle', e.target.value)}
                    error={validationState.workExperience?.[index]?.jobtitle.error && 
                           validationState.workExperience?.[index]?.jobtitle.touched}
                    helperText={validationState.workExperience?.[index]?.jobtitle.touched ? 
                              validationState.workExperience?.[index]?.jobtitle.message : ''}
                    InputProps={{
                      'aria-label': `Job Title for entry ${index + 1}`,
                    }}
                  />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                  <TextField
                    label="Location"
                    variant="outlined"
                    fullWidth
                    inputRef={el => fieldRefs.current[`workExperience_${index}_location`] = el}
                    value={entry.location}
                    onChange={(e) => handleChange('workExperience', index, 'location', e.target.value)}
                    onBlur={(e) => handleBlur('workExperience', index, 'location', e.target.value)}
                    error={validationState.workExperience?.[index]?.location.error && 
                           validationState.workExperience?.[index]?.location.touched}
                    helperText={validationState.workExperience?.[index]?.location.touched ? 
                              validationState.workExperience?.[index]?.location.message : ''}
                    InputProps={{
                      'aria-label': `Location for entry ${index + 1}`,
                    }}
                  />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="Employment Start Date"
                      value={entry.startDate}
                      onChange={(date) => {
                        handleChange('workExperience', index, 'startDate', date);
                        validateWorkExperienceDates(index, date, entry.endDate);
                      }}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          required: true,
                          inputRef: el => fieldRefs.current[`workExperience_${index}_startDate`] = el,
                          error: !validationState.workExperience?.[index]?.startDateValid,
                          helperText: !validationState.workExperience?.[index]?.startDateValid ?
                            validationState.workExperience?.[index]?.dateErrorMessage : ''
                        }
                      }}
                    />
                  </LocalizationProvider>
                  </Grid>
                  <Grid item xs={12} sm={6}></Grid> {/* To position start and end date input on top one another */}
                  <Grid item xs={12} sm={6}>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="Employment End Date"
                      value={entry.endDate}
                      onChange={(date) => {
                        handleChange('workExperience', index, 'endDate', date);
                        validateWorkExperienceDates(index, entry.startDate, date);
                      }}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          inputRef: el => fieldRefs.current[`workExperience_${index}_endDate`] = el,
                          error: !validationState.workExperience?.[index]?.endDateValid,
                          helperText: !validationState.workExperience?.[index]?.endDateValid ?
                            validationState.workExperience?.[index]?.dateErrorMessage : ''
                        }
                      }}
                    />
                  </LocalizationProvider>
                  </Grid>
                  <Grid item xs={12}>
                  <TextField
                    label="Job Description"
                    variant="outlined"
                    fullWidth
                    multiline
                    rows={4}
                    inputRef={el => fieldRefs.current[`workExperience_${index}_description`] = el}
                    value={entry.description}
                    onChange={(e) => handleChange('workExperience', index, 'description', e.target.value)}
                    onBlur={(e) => handleBlur('workExperience', index, 'description', e.target.value)}
                    error={validationState.workExperience?.[index]?.description.error && 
                           validationState.workExperience?.[index]?.description.touched}
                    helperText={validationState.workExperience?.[index]?.description.touched ? 
                              validationState.workExperience?.[index]?.description.message : ''}
                    InputProps={{
                      'aria-label': `Job Description for entry ${index + 1}`,
                    }}
                  />
                  </Grid>
                  </Grid>
                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                    <IconButton 
                      onClick={() => removeEntry('workExperience', index)}
                      disabled={formData.workExperience.length === 1}
                      aria-label={`Remove work experience entry ${index + 1}`}
                    >
                      <RemoveCircleOutlineIcon />
                    </IconButton>
                  </Box>
                </Box>
              ))}
              <Button 
                onClick={() => addEntry('workExperience')} 
                startIcon={<AddCircleOutlineIcon />}
              >
                Add Another Work Experience
              </Button>
            </Box>
          );
        case 2:
          return (
            <Box>
              {formData.education.map((entry, index) => (
                <Box key={index} sx={{ mb: 2 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField 
                        label="Institution Name" 
                        variant="outlined" 
                        fullWidth 
                        value={entry.institutionName}
                        onChange={(e) => handleChange('education', index, 'institutionName', e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField 
                        label="Degree" 
                        variant="outlined" 
                        fullWidth 
                        value={entry.degree}
                        onChange={(e) => handleChange('education', index, 'degree', e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField 
                        label="Field of Study" 
                        variant="outlined" 
                        fullWidth 
                        value={entry.fieldOfStudy}
                        onChange={(e) => handleChange('education', index, 'fieldOfStudy', e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField 
                        label="Location" 
                        variant="outlined" 
                        fullWidth 
                        value={entry.location}
                        onChange={(e) => handleChange('education', index, 'location', e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                          label="Graduation Date"
                          value={entry.graduationDate}
                          onChange={(date) => handleChange('education', index, 'graduationDate', date)}
                          slotProps={{ textField: { fullWidth: true } }}
                        />
                      </LocalizationProvider>
                    </Grid>
                  </Grid>
                  <IconButton onClick={() => removeEntry('education', index)}><RemoveCircleOutlineIcon /></IconButton>
                </Box>
              ))}
              <Button onClick={() => addEntry('education')} startIcon={<AddCircleOutlineIcon />}>Add Another Education</Button>
            </Box>
          );
        case 3:
          return (
            <Box>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    label="Skills"
                    variant="outlined"
                    fullWidth
                    multiline
                    rows={4}
                    placeholder="Enter your skills (e.g., Programming Languages, Frameworks, Tools)"
                    value={formData.skills.skills_}
                    onChange={(e) => handleChange('skills', 0, 'skills_', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Languages"
                    variant="outlined"
                    fullWidth
                    multiline
                    rows={2}
                    placeholder="Enter languages you speak"
                    value={formData.skills.languages}
                    onChange={(e) => handleChange('skills', 0, 'languages', e.target.value)}
                  />
                </Grid>
              </Grid>
            </Box>
          );
        case 4:
          return (
            <Box>
              {formData.certifications.map((entry, index) => (
                <Box key={index} sx={{ mb: 2 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField 
                        label="Certification Name" 
                        variant="outlined" 
                        fullWidth 
                        value={entry.name}
                        onChange={(e) => handleChange('certifications', index, 'name', e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField 
                        label="Issuing Organization" 
                        variant="outlined" 
                        fullWidth 
                        value={entry.organization}
                        onChange={(e) => handleChange('certifications', index, 'organization', e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                          label="Date Obtained"
                          value={entry.dateObtained}
                          onChange={(date) => handleChange('certifications', index, 'dateObtained', date)}
                          slotProps={{ textField: { fullWidth: true } }}
                        />
                      </LocalizationProvider>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                          label="Expiration Date"
                          value={entry.expirationDate}
                          onChange={(date) => handleChange('certifications', index, 'expirationDate', date)}
                          slotProps={{ textField: { fullWidth: true } }}
                        />
                      </LocalizationProvider>
                    </Grid>
                    <Grid item xs={12}>
                      <TextField 
                        label="Credential URL" 
                        variant="outlined" 
                        fullWidth 
                        type="url"
                        value={entry.credentialUrl}
                        onChange={(e) => handleChange('certifications', index, 'credentialUrl', e.target.value)}
                      />
                    </Grid>
                  </Grid>
                  <IconButton onClick={() => removeEntry('certifications', index)}><RemoveCircleOutlineIcon /></IconButton>
                </Box>
              ))}
              <Button onClick={() => addEntry('certifications')} startIcon={<AddCircleOutlineIcon />}>Add Another Certification</Button>
            </Box>
          );
        case 5:
          return (
            <Box>
              {formData.projects.map((entry, index) => (
                <Box key={index} sx={{ mb: 2 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField 
                        label="Project Title" 
                        variant="outlined" 
                        fullWidth 
                        value={entry.title}
                        onChange={(e) => handleChange('projects', index, 'title', e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField 
                        label="Project URL" 
                        variant="outlined" 
                        fullWidth 
                        type="url"
                        value={entry.projectUrl}
                        onChange={(e) => handleChange('projects', index, 'projectUrl', e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField 
                        label="Role" 
                        variant="outlined" 
                        fullWidth 
                        value={entry.role}
                        onChange={(e) => handleChange('projects', index, 'role', e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField 
                        label="Duration" 
                        variant="outlined" 
                        fullWidth 
                        value={entry.duration}
                        onChange={(e) => handleChange('projects', index, 'duration', e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField 
                        label="Technologies Used" 
                        variant="outlined" 
                        fullWidth 
                        value={entry.technologies}
                        onChange={(e) => handleChange('projects', index, 'technologies', e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField 
                        label="Project Description" 
                        variant="outlined" 
                        fullWidth 
                        multiline 
                        rows={4}
                        value={entry.description}
                        onChange={(e) => handleChange('projects', index, 'description', e.target.value)}
                      />
                    </Grid>
                  </Grid>
                  <IconButton onClick={() => removeEntry('projects', index)}><RemoveCircleOutlineIcon /></IconButton>
                </Box>
              ))}
              <Button onClick={() => addEntry('projects')} startIcon={<AddCircleOutlineIcon />}>Add Another Project</Button>
            </Box>
          );
          case steps.length - 1:
            return <ResumePreview formData={formData} />;
          default:
            return 'Unknown step';
        }
    };
  
    return (
      <Box sx={{ 
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          paddingBottom: '80px'
        }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <CircularProgress />
            <Typography variant="h6" sx={{ ml: 2 }}>Loading resume data...</Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
            <ResumeFormStepper activeStep={activeStep} steps={steps} />
            
            <Card sx={{ 
                maxWidth: 800,
                width: '100%', 
                p: 3,
                borderRadius: 2,
                boxShadow: 3
              }}>
              <CardContent>
                <Typography variant="h5" component="div" gutterBottom>
                  {steps[activeStep]}
                </Typography>
                {renderStepContent(activeStep)}
              </CardContent>
              <CardActions sx={{ justifyContent: 'space-between' }}>
                <Button variant="outlined" color="primary" onClick={handleBack} disabled={activeStep === 0}>
                  Back
                </Button>
                <Box sx={{ flex: '1 1 auto' }} />
                {activeStep === steps.length - 1 ? (
                  <Button
                    color="primary"
                    onClick={handleFinish}
                    disabled={submitting}
                    startIcon={submitting ? <CircularProgress size={20} /> : null}
                  >
                    {submitting ? 'Submitting...' : savedResumeId ? 'Update Resume' : 'Save Resume'}
                  </Button>
                ) : (
                  <Button variant="contained" color="primary" onClick={handleNext}>
                    {activeStep === steps.length - 2 ? 'Preview Resume' : 'Next Section'}
                  </Button>
                )}
              </CardActions>
            </Card>
          </Box>
        )}
        
        {/* Success/Error Notifications */}
        <Snackbar 
          open={submitSuccess} 
          autoHideDuration={6000} 
          onClose={() => {
            setSubmitSuccess(false);
            // Navigate to the preview step after successful submission
            if (activeStep !== steps.length - 1) {
              handleNext();
            }
          }}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={() => setSubmitSuccess(false)} severity="success">
            Resume {savedResumeId ? 'updated' : 'saved'} successfully!
          </Alert>
        </Snackbar>
        
        <Snackbar 
          open={!!submitError} 
          autoHideDuration={6000} 
          onClose={() => dispatch(clearError())}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={() => dispatch(clearError())} severity="error">
            {submitError}
          </Alert>
        </Snackbar>
      </Box>
    );
  };
  
  export default ResumeForm;