import React from 'react';
import { ResumeFormData } from './ResumeForm';
import { 
  Box,
  Typography,
  Divider,
  Grid, Paper,
  List,
  ListItem,
  ListItemText,
  Chip,
  Link
} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import GitHubIcon from '@mui/icons-material/GitHub';
import LanguageIcon from '@mui/icons-material/Language';
import { formatDate } from '../../utils/validation';

const ResumePreview: React.FC<{ formData: ResumeFormData }> = ({ formData }) => {
  const { personalDetails, workExperience, education, skills, certifications, projects } = formData;

    return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: '100%', mx: 'auto' }}>
      {/* Personal Details */}
      <Box sx={{ mb: 3, textAlign: 'center' }}>
        <Typography variant="h3" gutterBottom>
          {personalDetails.firstName} {personalDetails.lastName}
        </Typography>
        
        {personalDetails.title && (
          <Typography variant="h6" color="primary" gutterBottom>
            {personalDetails.title}
          </Typography>
        )}
        
        <Box sx={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 2, mt: 2 }}>
          {personalDetails.email && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <EmailIcon fontSize="small" sx={{ mr: 0.5 }} />
              <Typography variant="body2">{personalDetails.email}</Typography>
            </Box>
          )}
          
          {personalDetails.phone && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <PhoneIcon fontSize="small" sx={{ mr: 0.5 }} />
              <Typography variant="body2">{personalDetails.phone}</Typography>
            </Box>
          )}
          
          {personalDetails.location && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <LocationOnIcon fontSize="small" sx={{ mr: 0.5 }} />
              <Typography variant="body2">{personalDetails.location}</Typography>
            </Box>
          )}
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 2, mt: 1 }}>
          {personalDetails.linkedin && (
            <Link href={personalDetails.linkedin} target="_blank" rel="noopener noreferrer" sx={{ display: 'flex', alignItems: 'center' }}>
              <LinkedInIcon fontSize="small" sx={{ mr: 0.5 }} />
              <Typography variant="body2">LinkedIn</Typography>
            </Link>
          )}
          
          {personalDetails.github && (
            <Link href={personalDetails.github} target="_blank" rel="noopener noreferrer" sx={{ display: 'flex', alignItems: 'center' }}>
              <GitHubIcon fontSize="small" sx={{ mr: 0.5 }} />
              <Typography variant="body2">GitHub</Typography>
            </Link>
          )}
          
          {personalDetails.website && (
            <Link href={personalDetails.website} target="_blank" rel="noopener noreferrer" sx={{ display: 'flex', alignItems: 'center' }}>
              <LanguageIcon fontSize="small" sx={{ mr: 0.5 }} />
              <Typography variant="body2">Website</Typography>
            </Link>
          )}
        </Box>
      </Box>
      
      <Divider sx={{ mb: 3 }} />
      
      {/* Work Experience */}
      {workExperience.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" gutterBottom>
            Work Experience
          </Typography>
          
          {workExperience.map((job, index) => (
            <Box key={index} sx={{ mb: 2 }}>
              <Typography variant="h6">{job.companyName}</Typography>
              <Typography variant="subtitle1" color="primary">{job.jobTitle}</Typography>
              <Typography variant="body2" color="text.secondary">
                {job.location} | {formatDate(job.startDate)} - {formatDate(job.endDate)}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1, whiteSpace: 'pre-line' }}>
                {job.description}
              </Typography>
              {index < workExperience.length - 1 && <Divider sx={{ my: 2 }} />}
            </Box>
          ))}
        </Box>
      )}
      
      {/* Education */}
      {education.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" gutterBottom>
            Education
          </Typography>
          
          {education.map((edu, index) => (
            <Box key={index} sx={{ mb: 2 }}>
              <Typography variant="h6">{edu.institutionName}</Typography>
              <Typography variant="subtitle1">
                {edu.degree}{edu.fieldOfStudy ? `, ${edu.fieldOfStudy}` : ''}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {edu.location} | {edu.graduationDate ? formatDate(edu.graduationDate) : ''}
              </Typography>
              {index < education.length - 1 && <Divider sx={{ my: 2 }} />}
            </Box>
          ))}
        </Box>
      )}
      
      {/* Skills */}
      {(skills.skills_ || skills.languages) && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" gutterBottom>
            Skills
          </Typography>
          
          <Grid container spacing={2}>
            {skills.skills_ && (
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1">Technical Skills</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                  {skills.skills_.split(',').map((skill, index) => (
                    <Chip key={index} label={skill.trim()} size="small" />
                  ))}
                </Box>
              </Grid>
            )}
            
            {skills.languages && (
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1">Languages</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                  {skills.languages.split(',').map((language, index) => (
                    <Chip key={index} label={language.trim()} size="small" />
                  ))}
                </Box>
              </Grid>
            )}
          </Grid>
        </Box>
      )}
      
      {/* Certifications */}
      {certifications.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" gutterBottom>
            Certifications
          </Typography>
          
          <List>
            {certifications.map((cert, index) => (
              <ListItem key={index} alignItems="flex-start" sx={{ px: 0 }}>
                <ListItemText
                  primary={cert.name}
                  secondary={
                    <>
                      <Typography component="span" variant="body2" color="text.primary">
                        {cert.organization}
                      </Typography>
                      {cert.dateObtained && (
                        <Typography component="span" variant="body2">
                          {' | '}{formatDate(cert.dateObtained)}
                          {cert.expirationDate && ` - ${formatDate(cert.expirationDate)}`}
                        </Typography>
                      )}
                      {cert.credentialUrl && (
                        <Box sx={{ mt: 0.5 }}>
                          <Link href={cert.credentialUrl} target="_blank" rel="noopener noreferrer">
                            View Credential
                          </Link>
                        </Box>
                      )}
                    </>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Box>
      )}
      
      {/* Projects */}
      {projects.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" gutterBottom>
            Projects
          </Typography>
          
          {projects.map((project, index) => (
            <Box key={index} sx={{ mb: 2 }}>
              <Typography variant="h6">{project.title}</Typography>
              <Typography variant="subtitle1" color="primary">
                {project.role}{project.duration ? ` | ${project.duration}` : ''}
              </Typography>
              
              {project.technologies && (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, my: 1 }}>
                  {project.technologies.split(',').map((tech, techIndex) => (
                    <Chip key={techIndex} label={tech.trim()} size="small" variant="outlined" />
                  ))}
                </Box>
              )}
              
              <Typography variant="body2" sx={{ mt: 1, whiteSpace: 'pre-line' }}>
                {project.description}
              </Typography>
              
              {project.projectUrl && (
                <Box sx={{ mt: 1 }}>
                  <Link href={project.projectUrl} target="_blank" rel="noopener noreferrer">
                    View Project
                  </Link>
                </Box>
              )}
              
              {index < projects.length - 1 && <Divider sx={{ my: 2 }} />}
            </Box>
          ))}
        </Box>
      )}
    </Paper>
    );
  };
  
  export default ResumePreview;