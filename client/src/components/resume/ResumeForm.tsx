import React, { useState } from 'react';
import { Button, Stepper, Step, StepLabel, TextField, Box, IconButton, Typography, Card, CardContent, CardActions, Grid, AppBar, Toolbar } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import {
  PersonalDetails,
  WorkExperience,
  Education,
  Skills,
  Certification,
  Project,
  ValidationState
} from './types/resumeTypes';
import { useFormValidation } from './validation/useFormValidation';
import { formatPhone } from '../../utils/validation';

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
      validationState,
      fieldRefs,
      handleBlur,
      getActiveErrors,
      handleErrorClick
    } = useFormValidation({
      initialValidationState: {
        firstName: { error: false, message: '', touched: false },
        lastName: { error: false, message: '', touched: false },
        // ... other fields ...
      },
      onValidationChange: (isValid) => {
        // Optional: Handle validation state changes
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
        // Create a type map to help TypeScript understand the relationship
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
        handleBlur(section, field, formattedValue);
      }, 300);
    }
    };
  
    const addEntry = (section: keyof ResumeFormData) => {
      if (isArraySection(section) && formData[section].length > 0) {
        // Create a deep copy of the first entry
        const newEntry = { ...formData[section][0] };
        
        // Use a type assertion to help TypeScript understand what we're doing
        const typedNewEntry = newEntry as Record<string, string>;
        
        // Reset all values to empty strings
        Object.keys(typedNewEntry).forEach(key => {
          typedNewEntry[key] = '';
        });
        
        // Update the form data with the new entry
        setFormData({ ...formData, [section]: [...formData[section], typedNewEntry] });
      }
    };
  
    const removeEntry = (section: keyof ResumeFormData, index: number) => {
      if (isArraySection(section)) {
        // Use a type assertion to tell TypeScript exactly what type of array we're working with
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
                  placeholder="Enter your first name"
                  value={formData.personalDetails.firstName}
                  onChange={(e) => handleChange('personalDetails', 0, 'firstName', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField 
                  label="Last Name"
                  variant="outlined"
                  fullWidth
                  placeholder="Enter your last name"
                  value={formData.personalDetails.lastName}
                  onChange={(e) => handleChange('personalDetails', 0, 'lastName', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField 
                  label="Professional Title"
                  variant="outlined"
                  fullWidth
                  placeholder="Enter your professional title"
                  value={formData.personalDetails.title}
                  onChange={(e) => handleChange('personalDetails', 0, 'title', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField 
                  label="Email Address"
                  variant="outlined"
                  fullWidth
                  type="email" placeholder="Enter your email address"
                  value={formData.personalDetails.email}
                  onChange={(e) => handleChange('personalDetails', 0, 'email', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField 
                  label="Phone Number"
                  variant="outlined"
                  fullWidth
                  placeholder="Enter your phone number"
                  value={formData.personalDetails.phone}
                  onChange={(e) => handleChange('personalDetails', 0, 'phone', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField 
                  label="Location"
                  variant="outlined"
                  fullWidth
                  placeholder="Enter your location"
                  value={formData.personalDetails.location}
                  onChange={(e) => handleChange('personalDetails', 0, 'location', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField 
                  label="LinkedIn Profile URL"
                  variant="outlined"
                  fullWidth
                  type="url" placeholder="Enter your LinkedIn profile URL"
                  value={formData.personalDetails.linkedin}
                  onChange={(e) => handleChange('personalDetails', 0, 'linkedin', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField 
                  label="Website URL"
                  variant="outlined"
                  fullWidth
                  type="url" placeholder="Enter your website URL"
                  value={formData.personalDetails.website}
                  onChange={(e) => handleChange('personalDetails', 0, 'website', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField 
                  label="GitHub URL"
                  variant="outlined"
                  fullWidth
                  type="url" placeholder="Enter your GitHub URL"
                  value={formData.personalDetails.github}
                  onChange={(e) => handleChange('personalDetails', 0, 'github', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField 
                  label="Instagram URL"
                  variant="outlined"
                  fullWidth
                  type="url" placeholder="Enter your Instagram URL"
                  value={formData.personalDetails.instagram}
                  onChange={(e) => handleChange('personalDetails', 0, 'instagram', e.target.value)}
                />
              </Grid>
            </Grid>
          );
        case 1:
          return (
            <Box>
              {formData.workExperience.map((entry, index) => (
                <Box key={index} sx={{ mb: 2 }}>
                  <TextField label="Company Name" variant="outlined" fullWidth value={entry.companyName} onChange={(e) => handleChange('workExperience', index, 'companyName', e.target.value)} />
                  <TextField label="Job Title" variant="outlined" fullWidth value={entry.jobTitle} onChange={(e) => handleChange('workExperience', index, 'jobTitle', e.target.value)} />
                  <TextField label="Location" variant="outlined" fullWidth value={entry.location} onChange={(e) => handleChange('workExperience', index, 'location', e.target.value)} />
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="Employment Start Date"
                      value={entry.startDate}
                      onChange={(date) => handleChange('workExperience', index, 'startDate', date)}
                      slotProps={{ textField: { fullWidth: true } }}
                    />
                    <DatePicker
                      label="Employment End Date"
                      value={entry.endDate}
                      onChange={(date) => handleChange('workExperience', index, 'endDate', date)}
                      slotProps={{ textField: { fullWidth: true } }}
                    />
                  </LocalizationProvider>
                  <TextField label="Job Description" variant="outlined" fullWidth multiline rows={4} value={entry.description} onChange={(e) => handleChange('workExperience', index, 'description', e.target.value)} />
                  <IconButton onClick={() => removeEntry('workExperience', index)}><RemoveCircleOutlineIcon /></IconButton>
                </Box>
              ))}
              <Button onClick={() => addEntry('workExperience')} startIcon={<AddCircleOutlineIcon />}>Add Another</Button>
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