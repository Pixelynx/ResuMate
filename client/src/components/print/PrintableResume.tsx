import React, { forwardRef, useEffect } from 'react';
import { 
  Typography, 
  Box, 
  Paper, 
  Divider, 
  Grid,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Resume } from '../resume/types/resumeTypes';
import { useAppSelector } from '../../redux/hooks';
import { selectIsPrinting } from '../../redux/selectors/printSelectors';
import { processTextForDisplay } from '../../utils/textFormatting';

interface PrintableResumeProps {
  resume: Resume;
}

// Styled components for print-specific styling
const PrintContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  margin: theme.spacing(2),
  boxShadow: 'none',
  border: '1px solid #e0e0e0',
  '@media print': {
    margin: 0,
    padding: theme.spacing(1),
    boxShadow: 'none',
    border: 'none',
    height: 'auto',
    '& .MuiTypography-h4': {
      fontSize: '24px',
    },
    '& .MuiTypography-h5': {
      fontSize: '18px',
    },
    '& .MuiTypography-h6': {
      fontSize: '16px',
    },
    '& .MuiTypography-body1': {
      fontSize: '12px',
    },
    '& .MuiTypography-body2': {
      fontSize: '10px',
    },
  }
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  marginBottom: theme.spacing(1),
  color: theme.palette.primary.main,
  '@media print': {
    marginBottom: theme.spacing(0.5),
    fontSize: '16px',
  }
}));

const SectionContent = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  '@media print': {
    marginBottom: theme.spacing(1.5),
  }
}));

// Define the component with forwardRef for react-to-print compatibility
const PrintableResume = forwardRef<HTMLDivElement, PrintableResumeProps>((props, ref) => {
  const { resume } = props;
  const isPrinting = useAppSelector(selectIsPrinting);

  // Use specific print styles when printing
  useEffect(() => {
    if (isPrinting) {
      document.title = `${resume.personalDetails.firstname} ${resume.personalDetails.lastname} - Resume`;
    }
  }, [isPrinting, resume.personalDetails]);

  if (!resume) return null;

  return (
    <div ref={ref}>
      <PrintContainer>
        {/* Header/Personal Details */}
        <Box sx={{ mb: 3, textAlign: 'center' }}>
          <Typography variant="h4" component="h1" gutterBottom>
            {resume.personalDetails.firstname} {resume.personalDetails.lastname}
          </Typography>
          {resume.personalDetails.title && (
            <Typography variant="h6" color="textSecondary">
              {resume.personalDetails.title}
            </Typography>
          )}
          <Box sx={{ mt: 1 }}>
            <Typography variant="body1">
              {/* FIX PIPE GAPS*/}
              {resume.personalDetails.email} | {resume.personalDetails.phone} | {resume.personalDetails.location}
            </Typography>
            <Box sx={{ mt: 0.5, display: 'flex', justifyContent: 'center', gap: 2 }}>
              {resume.personalDetails.linkedin && (
                <Typography variant="body2">
                    {`${resume.personalDetails.linkedin} `} | 
                </Typography>
              )}
              {resume.personalDetails.github && (
                <Typography variant="body2">
                    {`${resume.personalDetails.github} `} | 
                </Typography>
              )}
              {resume.personalDetails.website && (
                <Typography variant="body2">
                    {`${resume.personalDetails.website} `}
                </Typography>
              )}
            </Box>
          </Box>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Skills */}
        {resume.skills && (resume.skills.skills_ || resume.skills.languages) && (
          <SectionContent>
            <SectionTitle variant="h4">Skills</SectionTitle>
            <Grid container spacing={2}>
              {resume.skills.skills_ && (
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" sx={{ whiteSpace: 'pre-line'}}>Professional</Typography>
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                    {resume.skills.skills_}
                  </Typography>
                </Grid>
              )}
              {resume.skills.languages && (
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" component="h4">Languages</Typography>
                  <Typography variant="body1">
                    {resume.skills.languages}
                  </Typography>
                </Grid>
              )}
            </Grid>
          </SectionContent>
        )}

        {/* Work Experience */}
        {resume.workExperience && resume.workExperience.length > 0 && (
          <SectionContent>
            <SectionTitle variant="h4">Work Experience</SectionTitle>
            {resume.workExperience.map((experience, index) => (
              <Box key={index} sx={{ mb: 2 }}>
                <Grid container justifyContent="space-between" alignItems="flex-start">
                  <Grid item xs={9}>
                    <Typography variant="h6" component="h3" sx={{ fontWeight: 'bold' }}>
                      {experience.jobtitle} at {experience.companyName}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {experience.location}
                    </Typography>
                  </Grid>
                  <Grid item xs={3} sx={{ textAlign: 'right' }}>
                    <Typography variant="body2">
                      {experience.startDate ? new Date(experience.startDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short'
                      }) : ''} - {experience.endDate ? new Date(experience.endDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short'
                      }) : 'Present'}
                    </Typography>
                  </Grid>
                </Grid>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    whiteSpace: 'pre-wrap',
                    fontFamily: 'monospace',
                    mt: 1,
                    fontSize: '10pt',
                    lineHeight: 1.4
                  }}
                >
                  {processTextForDisplay(experience.description)}
                </Typography>
              </Box>
            ))}
          </SectionContent>
        )}

        {/* Projects */}
        {resume.projects && resume.projects.length > 0 && (
          <SectionContent>
            <SectionTitle variant="h4">Projects</SectionTitle>
            {resume.projects.map((project, index) => (
              <Box key={index} sx={{ mb: 2 }}>
                <Grid container justifyContent="space-between">
                  <Grid item xs={9}>
                    <Typography variant="h6" component="h3" sx={{ fontWeight: 'bold' }}>
                      {project.title} |
                      {project.projectUrl && (
                         ` ${project.projectUrl}`
                      )}
                    </Typography>
                    {project.role && (
                      <Typography variant="body2" color="textSecondary">
                        Role: {project.role}
                      </Typography>
                    )}
                  </Grid>
                  <Grid item xs={3} sx={{ textAlign: 'right' }}>
                    <Typography variant="body2">
                      {project.duration}
                    </Typography>
                  </Grid>
                </Grid>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    whiteSpace: 'pre-wrap',
                    fontFamily: 'monospace',
                    mt: 1,
                    fontSize: '10pt',
                    lineHeight: 1.4
                  }}
                >
                  {processTextForDisplay(project.description)}
                </Typography>
                {project.technologies && (
                  <Typography variant="body2" color="textSecondary">
                    <strong>Technologies:</strong> {project.technologies}
                  </Typography>
                )}
              </Box>
            ))}
          </SectionContent>
        )}

        {/* Education */}
        {resume.education && resume.education.length > 0 && (
          <SectionContent>
            <SectionTitle variant="h4">Education</SectionTitle>
            {resume.education.map((edu, index) => (
              <Box key={index} sx={{ mb: 2 }}>
                <Grid container justifyContent="space-between">
                  <Grid item xs={9}>
                    <Typography variant="h6" component="h3" sx={{ fontWeight: 'bold' }}>
                      {edu.institutionName}
                    </Typography>
                    <Typography variant="body1">
                      {edu.degree} in {edu.fieldOfStudy}
                    </Typography>
                    {edu.location && (
                      <Typography variant="body2" color="textSecondary">
                        {edu.location}
                      </Typography>
                    )}
                  </Grid>
                  <Grid item xs={3} sx={{ textAlign: 'right' }}>
                    <Typography variant="body2">
                      {edu.graduationDate ? new Date(edu.graduationDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short'
                      }) : ''}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            ))}
          </SectionContent>
        )}

        {/* Certifications */}
        {resume.certifications && resume.certifications.length > 0 && (
          <SectionContent>
            <SectionTitle variant="h4">Certifications</SectionTitle>
            <List sx={{ py: 0 }}>
              {resume.certifications.map((cert, index) => (
                <ListItem key={index} sx={{ px: 0, py: 0.5 }}>
                  <ListItemText
                    primary={
                      <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                        {cert.name} - {cert.organization}
                        {cert.credentialUrl && (
                          <Typography>
                            {` ${cert.credentialUrl}`}
                          </Typography>
                        )}
                      </Typography>
                    }
                    secondary={
                      <Typography variant="body2" color="textSecondary">
                        {cert.dateObtained ? new Date(cert.dateObtained).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short'
                        }) : ''} 
                        {cert.expirationDate ? ` - ${new Date(cert.expirationDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short'
                        })}` : ''}
                      </Typography>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </SectionContent>
        )}
      </PrintContainer>
    </div>
  );
});

PrintableResume.displayName = 'PrintableResume';

export default PrintableResume; 