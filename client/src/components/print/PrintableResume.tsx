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
  Link
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Resume } from '../resume/types/resumeTypes';
import { useAppSelector, useAppDispatch } from '../../redux/hooks';
import { selectIsPrinting, selectShouldShowIcons } from '../../redux/selectors/printSelectors';

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
  const shouldShowIcons = useAppSelector(selectShouldShowIcons);
  
  // Use specific print styles when printing
  useEffect(() => {
    if (isPrinting) {
      document.title = `${resume.personalDetails.firstName} ${resume.personalDetails.lastName} - Resume`;
    }
  }, [isPrinting, resume.personalDetails]);

  if (!resume) return null;

  return (
    <div ref={ref}>
      <PrintContainer>
        {/* Header/Personal Details */}
        <Box sx={{ mb: 3, textAlign: 'center' }}>
          <Typography variant="h4" component="h1" gutterBottom>
            {resume.personalDetails.firstName} {resume.personalDetails.lastName}
          </Typography>
          {resume.personalDetails.title && (
            <Typography variant="h6" color="textSecondary">
              {resume.personalDetails.title}
            </Typography>
          )}
          <Box sx={{ mt: 1 }}>
            <Typography variant="body1">
              {resume.personalDetails.email} | {resume.personalDetails.phone} | {resume.personalDetails.location}
            </Typography>
            <Box sx={{ mt: 0.5, display: 'flex', justifyContent: 'center', gap: 2 }}>
              {resume.personalDetails.linkedin && (
                <Typography variant="body2">
                  {shouldShowIcons ? (
                    <Link href={resume.personalDetails.linkedin} target="_blank" rel="noopener">
                      LinkedIn
                    </Link>
                  ) : (
                    `LinkedIn: ${resume.personalDetails.linkedin}`
                  )}
                </Typography>
              )}
              {resume.personalDetails.github && (
                <Typography variant="body2">
                  {shouldShowIcons ? (
                    <Link href={resume.personalDetails.github} target="_blank" rel="noopener">
                      GitHub
                    </Link>
                  ) : (
                    `GitHub: ${resume.personalDetails.github}`
                  )}
                </Typography>
              )}
              {resume.personalDetails.website && (
                <Typography variant="body2">
                  {shouldShowIcons ? (
                    <Link href={resume.personalDetails.website} target="_blank" rel="noopener">
                      Portfolio
                    </Link>
                  ) : (
                    `Website: ${resume.personalDetails.website}`
                  )}
                </Typography>
              )}
            </Box>
          </Box>
        </Box>

        <Divider />

        {/* Work Experience */}
        {resume.workExperience && resume.workExperience.length > 0 && (
          <SectionContent>
            <SectionTitle variant="h5">Work Experience</SectionTitle>
            {resume.workExperience.map((experience, index) => (
              <Box key={index} sx={{ mb: 2 }}>
                <Grid container justifyContent="space-between" alignItems="flex-start">
                  <Grid item xs={9}>
                    <Typography variant="h6" component="h3" sx={{ fontWeight: 'bold' }}>
                      {experience.jobTitle} at {experience.companyName}
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
                <Typography variant="body1" sx={{ mt: 1, whiteSpace: 'pre-line' }}>
                  {experience.description}
                </Typography>
              </Box>
            ))}
          </SectionContent>
        )}

        {/* Education */}
        {resume.education && resume.education.length > 0 && (
          <SectionContent>
            <SectionTitle variant="h5">Education</SectionTitle>
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

        {/* Skills */}
        {resume.skills && (resume.skills.skills_ || resume.skills.languages) && (
          <SectionContent>
            <SectionTitle variant="h5">Skills</SectionTitle>
            <Grid container spacing={2}>
              {resume.skills.skills_ && (
                <Grid item xs={12} md={6}>
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

        {/* Projects */}
        {resume.projects && resume.projects.length > 0 && (
          <SectionContent>
            <SectionTitle variant="h5">Projects</SectionTitle>
            {resume.projects.map((project, index) => (
              <Box key={index} sx={{ mb: 2 }}>
                <Grid container justifyContent="space-between">
                  <Grid item xs={9}>
                    <Typography variant="h6" component="h3" sx={{ fontWeight: 'bold' }}>
                      {project.title}
                      {project.projectUrl && shouldShowIcons ? (
                        <Link 
                          href={project.projectUrl} 
                          target="_blank" 
                          rel="noopener" 
                          sx={{ ml: 1, fontSize: '0.8rem' }}
                        >
                          (Link)
                        </Link>
                      ) : project.projectUrl ? ` (${project.projectUrl})` : ''}
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
                <Typography variant="body1" sx={{ mt: 1, mb: 0.5, whiteSpace: 'pre-line' }}>
                  {project.description}
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

        {/* Certifications */}
        {resume.certifications && resume.certifications.length > 0 && (
          <SectionContent>
            <SectionTitle variant="h5">Certifications</SectionTitle>
            <List sx={{ py: 0 }}>
              {resume.certifications.map((cert, index) => (
                <ListItem key={index} sx={{ px: 0, py: 0.5 }}>
                  <ListItemText
                    primary={
                      <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                        {cert.name} - {cert.organization}
                        {cert.credentialUrl && shouldShowIcons ? (
                          <Link 
                            href={cert.credentialUrl} 
                            target="_blank" 
                            rel="noopener" 
                            sx={{ ml: 1, fontSize: '0.8rem' }}
                          >
                            (Verify)
                          </Link>
                        ) : cert.credentialUrl ? ` (${cert.credentialUrl})` : ''}
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