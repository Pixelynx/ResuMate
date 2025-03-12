import React, { useState } from 'react';
import { Button, TextField, Box, IconButton, Typography, Card, CardContent, CardActions, Grid } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import {
  PersonalDetails,
  WorkExperience,
  Education,
  Skills,
  Certification,
  Project,
} from './types/resumeTypes';
import { useFormValidation } from './validation/useFormValidation';
import { formatPhone } from '../../utils/validation';
import { WorkExperienceValidation } from './types/validationTypes';

interface ResumeFormData {
  personalDetails: PersonalDetails;
  workExperience: WorkExperience[];
  education: Education[];
  skills: Skills;
  certifications: Certification[];
  projects: Project[];
}

const steps = ['Personal Details', 'Work Experience', 'Education', 'Skills', 'Certifications', 'Projects'];

const ResumeForm: React.FC = () => {
    const [activeStep, setActiveStep] = useState(0);
    const [formData, setFormData] = useState<ResumeFormData> ({
      personalDetails: {
        firstName: '',
        lastName: '',
        title: '',
        email: '',
        phone: '',
        location: '',
        linkedin: '',
        website: '',
        github: '',
        instagram: '',
      },
      workExperience: [{ companyName: '', jobTitle: '', location: '', startDate: null, endDate: null, description: '' }],
      education: [{ institutionName: '', degree: '', fieldOfStudy: '', location: '', graduationDate: null }],
      skills: { skills_: '', languages: '' },
      certifications: [{ name: '', organization: '', dateObtained: null, expirationDate: null, credentialUrl: '' }],
      projects: [{ title: '', role: '', duration: '', description: '', technologies: '', projectUrl: '' }],
    });

    const {
      setValidationState,
      validationState,
      fieldRefs,
      handleBlur,
    } = useFormValidation({
      initialValidationState: {
        firstName: { error: false, message: '', touched: false },
        lastName: { error: false, message: '', touched: false },
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
            jobTitle: { error: false, message: '', touched: false },
            location: { error: false, message: '', touched: false },
            startDate: { error: false, message: '', touched: false },
            endDate: { error: false, message: '', touched: false },
            description: { error: false, message: '', touched: false },
          }
        ]
      },
      onValidationChange: (isValid) => {
        console.log('Form validation state changed:', isValid);
      }
    });
  
    const handleNext = () => setActiveStep((prev) => prev + 1);
    const handleBack = () => setActiveStep((prev) => prev - 1);

    const isArraySection = (
      section: keyof ResumeFormData
    ): section is "workExperience" | "education" | "certifications" | "projects" => {
      return ['workExperience', 'education', 'certifications', 'projects'].includes(section);
    }
  
    const handleChange = (section: keyof ResumeFormData, index: number, field: string, value: any) => {
      const formattedValue = field === 'phone' ? formatPhone(value) : value;

      if (isArraySection(section)) {
        type SectionTypeMap = {
          workExperience: WorkExperience;
          education: Education;
          certifications: Certification;
          projects: Project;
        };

        // Helps TypeScript understand which type we're dealing with based on the section
        const updatedSection = [...formData[section]] as SectionTypeMap[typeof section][];
        // Now we use a type assertion to tell TypeScript the field is valid for this type
        (updatedSection[index] as any)[field] = value;
        setFormData({ ...formData, [section]: updatedSection });
      } else {
        setFormData({ ...formData, [section]: { ...formData[section], [field]: formattedValue } });
      }

      if (section === 'personalDetails') {
        setTimeout(() => {
          handleBlur(section, 0, field, formattedValue);
        }, 300);
      }
    };
  
    const addEntry = (section: keyof ResumeFormData) => {
      if (section === 'workExperience') {
        setValidationState(prev => {
          const updatedWorkExperience = [...(prev.workExperience as WorkExperienceValidation[] || [])];
          updatedWorkExperience.push({
            companyName: { error: false, message: '', touched: false },
            jobTitle: { error: false, message: '', touched: false },
            location: { error: false, message: '', touched: false },
            startDate: { error: false, message: '', touched: false },
            endDate: { error: false, message: '', touched: false },
            description: { error: false, message: '', touched: false },
          });
          return {
            ...prev,
            workExperience: updatedWorkExperience
          };
        });
      }
    
      if (isArraySection(section) && formData[section].length > 0) {
        const newEntry = { ...formData[section][0] };
        const typedNewEntry = newEntry as Record<string, any>;
        Object.keys(typedNewEntry).forEach(key => {
          typedNewEntry[key] = key.includes('Date') ? null : '';
        });
        setFormData({ ...formData, [section]: [...formData[section], typedNewEntry] });
      }
    };
  
    const removeEntry = (section: keyof ResumeFormData, index: number) => {
      if (isArraySection(section)) {
        const sectionArray = formData[section] as any[];
        const updatedSection = sectionArray.filter((_: any, i: number) => i !== index);
        setFormData({ ...formData, [section]: updatedSection });
      }
    };
  
    const renderStepContent = (step: number) => {
      switch (step) {
        case 0:
          return (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField 
                  label="First Name"
                  variant="outlined"
                  fullWidth
                  required
                  inputRef={el => fieldRefs.current['firstName'] = el}
                  placeholder="Enter your first name"
                  value={formData.personalDetails.firstName}
                  onChange={(e) => handleChange('personalDetails', 0, 'firstName', e.target.value)}
                  onBlur={(e) => handleBlur('personalDetails', 0, 'firstName', e.target.value)}
                  error={validationState.firstName.error && validationState.firstName.touched}
                  helperText={validationState.firstName.touched ? validationState.firstName.message : ''}
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
                  inputRef={el => fieldRefs.current['lastName'] = el}
                  placeholder="Enter your last name"
                  value={formData.personalDetails.lastName}
                  onChange={(e) => handleChange('personalDetails', 0, 'lastName', e.target.value)}
                  onBlur={(e) => handleBlur('personalDetails', 0, 'lastName', e.target.value)}
                  error={validationState.lastName.error && validationState.lastName.touched}
                  helperText={validationState.lastName.touched ? validationState.lastName.message : ''}
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
                  <TextField
                    label="Job Title"
                    variant="outlined"
                    fullWidth
                    inputRef={el => fieldRefs.current[`workExperience_${index}_jobTitle`] = el}
                    value={entry.jobTitle}
                    onChange={(e) => handleChange('workExperience', index, 'jobTitle', e.target.value)}
                    onBlur={(e) => handleBlur('workExperience', index, 'jobTitle', e.target.value)}
                    error={validationState.workExperience?.[index]?.jobTitle.error && 
                           validationState.workExperience?.[index]?.jobTitle.touched}
                    helperText={validationState.workExperience?.[index]?.jobTitle.touched ? 
                              validationState.workExperience?.[index]?.jobTitle.message : ''}
                    InputProps={{
                      'aria-label': `Job Title for entry ${index + 1}`,
                    }}
                  />
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
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="Employment Start Date"
                      value={entry.startDate}
                      onChange={(date) => handleChange('workExperience', index, 'startDate', date)}
                      slotProps={{ 
                        textField: { 
                          fullWidth: true,
                          required: true,
                          inputRef: el => fieldRefs.current[`workExperience_${index}_startDate`] = el,
                          error: validationState.workExperience?.[index]?.startDate.error && 
                                 validationState.workExperience?.[index]?.startDate.touched,
                          helperText: validationState.workExperience?.[index]?.startDate.touched ? 
                                    validationState.workExperience?.[index]?.startDate.message : ''
                        } 
                      }}
                    />
                  </LocalizationProvider>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="Employment End Date"
                      value={entry.endDate}
                      onChange={(date) => handleChange('workExperience', index, 'endDate', date)}
                      slotProps={{ 
                        textField: { 
                          fullWidth: true,
                          inputRef: el => fieldRefs.current[`workExperience_${index}_endDate`] = el,
                          error: validationState.workExperience?.[index]?.endDate.error && 
                                 validationState.workExperience?.[index]?.endDate.touched,
                          helperText: validationState.workExperience?.[index]?.endDate.touched ? 
                                    validationState.workExperience?.[index]?.endDate.message : ''
                        } 
                      }}
                    />
                  </LocalizationProvider>
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
                    <Grid item xs={12}>
                      <TextField 
                        label="Project URL" 
                        variant="outlined" 
                        fullWidth 
                        type="url"
                        value={entry.projectUrl}
                        onChange={(e) => handleChange('projects', index, 'projectUrl', e.target.value)}
                      />
                    </Grid>
                  </Grid>
                  <IconButton onClick={() => removeEntry('projects', index)}><RemoveCircleOutlineIcon /></IconButton>
                </Box>
              ))}
              <Button onClick={() => addEntry('projects')} startIcon={<AddCircleOutlineIcon />}>Add Another Project</Button>
            </Box>
          );
        default:
          return 'Unknown step';
      }
    };
  
    return (
      <Box sx={{ 
          minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: -5 }}>
          <Card sx={{ maxWidth: 800,
              width: '100%', p: 3,
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
              <Button color="primary" onClick={handleBack} disabled={activeStep === 0}>
              Back
            </Button>
            <Box sx={{ flex: '1 1 auto' }} />
            <Button color="primary" onClick={handleNext}>
              {activeStep === steps.length - 1 ? 'Finish' : 'Next Section'}
            </Button>
            </CardActions>
        </Card>
        </Box>
      </Box>
    );
  };
  
  export default ResumeForm; 