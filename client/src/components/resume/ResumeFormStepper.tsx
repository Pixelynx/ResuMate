import React from 'react';
import { Box, Typography, Paper, Grid } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PersonIcon from '@mui/icons-material/Person';
import WorkIcon from '@mui/icons-material/Work';
import SchoolIcon from '@mui/icons-material/School';
import ConstructionIcon from '@mui/icons-material/Construction';
import CardMembershipIcon from '@mui/icons-material/CardMembership';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import VisibilityIcon from '@mui/icons-material/Visibility';

interface ResumeFormStepperProps {
  activeStep: number;
  steps: string[];
}

const ResumeFormStepper: React.FC<ResumeFormStepperProps> = ({ activeStep, steps }) => {
  const stepIcons = [
    <PersonIcon />,             // Personal Details
    <WorkIcon />,               // Work Experience
    <SchoolIcon />,             // Education
    <ConstructionIcon />,       // Skills
    <CardMembershipIcon />,     // Certifications
    <AccountTreeIcon />,        // Projects
    <VisibilityIcon />          // Preview
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', mr: 3, width: '250px' }}>
      <Grid container spacing={2} sx={{ mb: 2 }}>
        {steps.map((label, index) => {
          const isCompleted = index < activeStep;
          const isActive = index === activeStep;

          return (
            <Grid item xs={6} key={index}>
              <Paper
                elevation={3}
                sx={{
                  p: 2,
                  height: '100px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: isActive 
                    ? 'linear-gradient(45deg, #6a1b9a 30%, #8e24aa 90%)' 
                    : isCompleted
                    ? 'linear-gradient(45deg, #4a148c 30%, #6a1b9a 90%)'
                    : 'white',
                  color: isActive || isCompleted ? 'white' : 'text.primary',
                  borderRadius: '8px',
                  boxShadow: isActive 
                    ? '0 3px 5px 2px rgba(106, 27, 154, .3)' 
                    : '0 1px 3px rgba(0, 0, 0, 0.12)',
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    boxShadow: '0 5px 8px 2px rgba(142, 36, 170, .4)',
                    transform: 'translateY(-2px)',
                    background: isActive 
                      ? 'linear-gradient(45deg, #6a1b9a 30%, #8e24aa 90%)' 
                      : isCompleted
                      ? 'linear-gradient(45deg, #4a148c 30%, #6a1b9a 90%)'
                      : 'linear-gradient(45deg, #e1e1e1 30%, #f5f5f5 90%)',
                  }
                }}
              >
                <Box sx={{ mb: 1, fontSize: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {isCompleted ? <CheckCircleIcon color="success" /> : stepIcons[index]}
                </Box>
                <Typography 
                  variant="body2" 
                  align="center" 
                  sx={{ 
                    fontWeight: isActive ? 'bold' : 'normal',
                  }}
                >
                  {label}
                </Typography>
              </Paper>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default ResumeFormStepper;
