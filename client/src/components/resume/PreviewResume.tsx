import React from 'react';
import { 
  Box,
  Typography,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemText,
  Chip,
  Link,
  Container
} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import GitHubIcon from '@mui/icons-material/GitHub';
import LanguageIcon from '@mui/icons-material/Language';
import { formatDate } from '../../utils/validation';
import { ResumeFormData } from './types/resumeTypes';

const isSectionEmpty = (section: any[] | object): boolean => {
  if (Array.isArray(section)) {
    return section.length === 0;
  }
  
  if (typeof section === 'object' && section !== null) {
    // Check if all values in the object are empty
    return Object.values(section).every(value => {
      if (typeof value === 'string') return value.trim() === '';
      return value === null || value === undefined;
    });
  }
  
  return true;
};

const ResumePreview: React.FC<{ formData: ResumeFormData }> = ({ formData }) => {
  const { personalDetails, workExperience, education, skills, certifications, projects } = formData;

  // Filter out empty sections
  const hasWorkExperience = !isSectionEmpty(workExperience);
  const hasEducation = !isSectionEmpty(education);
  const hasSkills = skills.skills_?.trim() || skills.languages?.trim();
  const hasCertifications = !isSectionEmpty(certifications);
  const hasProjects = !isSectionEmpty(projects);

  return (
    <Container maxWidth="md">
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
      {hasWorkExperience && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" gutterBottom>
            Work Experience
          </Typography>
          
          {workExperience
            .filter(job => job.companyName.trim() || job.jobTitle.trim())
            .map((job, index) => (
              <Box key={index} sx={{ mb: 2 }}>
                <Typography variant="h6">{job.companyName}</Typography>
                {job.jobTitle && (
                  <Typography variant="subtitle1" color="primary">{job.jobTitle}</Typography>
                )}
                <Typography variant="body2" color="text.secondary">
                  {job.location}
                  {job.location && (job.startDate || job.endDate) && " | "}
                  {job.startDate && formatDate(job.startDate)}
                  {job.startDate && job.endDate && " - "}
                  {job.endDate && formatDate(job.endDate)}
                </Typography>
                {job.description && (
                  <Typography variant="body2" sx={{ mt: 1, whiteSpace: 'pre-line' }}>
                    {job.description}
                  </Typography>
                )}
                {index < workExperience.filter(j => j.companyName.trim() || j.jobTitle.trim()).length - 1 && <Divider sx={{ my: 2 }} />}
              </Box>
            ))}
        </Box>
      )}
      
      {/* Education */}
      {hasEducation && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" gutterBottom>
            Education
          </Typography>
          
          {education
            .filter(edu => edu.institutionName.trim() || edu.degree.trim())
            .map((edu, index) => (
              <Box key={index} sx={{ mb: 2 }}>
                <Typography variant="h6">{edu.institutionName}</Typography>
                {(edu.degree || edu.fieldOfStudy) && (
                  <Typography variant="subtitle1">
                    {edu.degree}{edu.degree && edu.fieldOfStudy && ", "}{edu.fieldOfStudy}
                  </Typography>
                )}
                <Typography variant="body2" color="text.secondary">
                  {edu.location}
                  {edu.location && edu.graduationDate && " | "}
                  {edu.graduationDate && formatDate(edu.graduationDate)}
                </Typography>
                {index < education.filter(e => e.institutionName.trim() || e.degree.trim()).length - 1 && <Divider sx={{ my: 2 }} />}
              </Box>
            ))}
        </Box>
      )}
      
      {/* Skills */}
      {hasSkills && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" gutterBottom>
            Skills
          </Typography>
          
          <Grid container spacing={2}>
            {skills.skills_ && (
              <Grid item xs={12} md={skills.languages ? 6 : 12}>
                <Typography variant="subtitle1">Professional Skills</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                  {skills.skills_.split(',').map((skill, index) => (
                    skill.trim() && <Chip key={index} label={skill.trim()} size="small" />
                  ))}
                </Box>
              </Grid>
            )}
            
            {skills.languages && (
              <Grid item xs={12} md={skills.skills_ ? 6 : 12}>
                <Typography variant="subtitle1">Languages</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                  {skills.languages.split(',').map((language, index) => (
                    language.trim() && <Chip key={index} label={language.trim()} size="small" />
                  ))}
                </Box>
              </Grid>
            )}
          </Grid>
        </Box>
      )}
      
      {/* Certifications */}
      {hasCertifications && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" gutterBottom>
            Certifications
          </Typography>
          
          <List>
            {certifications
              .filter(cert => cert.name.trim() || cert.organization.trim())
              .map((cert, index) => (
                <ListItem key={index} alignItems="flex-start" sx={{ px: 0 }}>
                  <ListItemText
                    primary={cert.name}
                    secondary={
                      <>
                        {cert.organization && (
                          <Typography component="span" variant="body2" color="text.primary">
                            {cert.organization}
                          </Typography>
                        )}
                        {cert.organization && cert.dateObtained && (
                          <Typography component="span" variant="body2">
                            {' | '}
                          </Typography>
                        )}
                        {cert.dateObtained && (
                          <Typography component="span" variant="body2">
                            {formatDate(cert.dateObtained)}
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
      {hasProjects && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" gutterBottom>
            Projects
          </Typography>
          
          {projects
            .filter(project => project.title.trim() || project.description.trim())
            .map((project, index) => (
              <Box key={index} sx={{ mb: 2 }}>
                <Typography variant="h6">{project.title}</Typography>
                {(project.role || project.duration) && (
                  <Typography variant="subtitle1" color="primary">
                    {project.role}{project.role && project.duration && " | "}{project.duration}
                  </Typography>
                )}
                
                {project.technologies && project.technologies.trim() && (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, my: 1 }}>
                    {project.technologies.split(',').map((tech, techIndex) => (
                      tech.trim() && <Chip key={techIndex} label={tech.trim()} size="small" variant="outlined" />
                    ))}
                  </Box>
                )}
                
                {project.description && (
                  <Typography variant="body2" sx={{ mt: 1, whiteSpace: 'pre-line' }}>
                    {project.description}
                  </Typography>
                )}
                
                {project.projectUrl && (
                  <Box sx={{ mt: 1 }}>
                    <Link href={project.projectUrl} target="_blank" rel="noopener noreferrer">
                      View Project
                    </Link>
                  </Box>
                )}
                
                {index < projects.filter(p => p.title.trim() || p.description.trim()).length - 1 && <Divider sx={{ my: 2 }} />}
              </Box>
            ))}
        </Box>
      )}
    </Container>
    );
  };
  
  export default ResumePreview;