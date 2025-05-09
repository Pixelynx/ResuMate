// @ts-ignore
import React from 'react';
// @ts-ignore
import { Box, Typography, Paper, Grid, useTheme, useMediaQuery } from '@mui/material';
// @ts-ignore
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
// @ts-ignore
import PersonIcon from '@mui/icons-material/Person';
// @ts-ignore
import WorkIcon from '@mui/icons-material/Work';
// @ts-ignore
import SchoolIcon from '@mui/icons-material/School';
// @ts-ignore
import CodeIcon from '@mui/icons-material/Code';
// @ts-ignore
import LanguageIcon from '@mui/icons-material/Language';
// @ts-ignore
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
// @ts-ignore
import RateReviewIcon from '@mui/icons-material/RateReview';

interface ResumeFormStepperProps {
  activeStep: number;
  steps: string[];
}

const ResumeFormStepper: React.FC<ResumeFormStepperProps> = ({ activeStep, steps }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const stepIcons = [
    <PersonIcon />,             // Personal Details
    <WorkIcon />,               // Work Experience
    <SchoolIcon />,             // Education
    <CodeIcon />,               // Skills
    <LanguageIcon />,           // Certifications
    <EmojiEventsIcon />,        // Projects
    <RateReviewIcon />          // Preview
  ];

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: isMobile ? 'row' : 'column',
      mr: isMobile ? 0 : 3,
      mb: isMobile ? 3 : 0,
      width: isMobile ? '100%' : '250px',
      overflowX: isMobile ? 'auto' : 'visible',
      py: isMobile ? 1 : 0,
      justifyContent: isMobile ? 'center' : 'flex-start'
    }}>
      <Grid 
        container 
        spacing={2} 
        sx={{ 
          mb: isMobile ? 0 : 2,
          flexWrap: isMobile ? 'nowrap' : 'wrap',
          width: isMobile ? 'max-content' : '100%',
          justifyContent: isMobile ? 'center' : 'flex-start'
        }}
      >
        {steps.map((label, index) => {
          const isCompleted = index < activeStep;
          const isActive = index === activeStep;

          return (
            <Grid item xs={isMobile ? 'auto' : 6} key={index}>
              <Paper
                elevation={3}
                sx={{
                  p: isMobile ? 1 : 2,
                  height: isMobile ? '64px' : '100px',
                  width: isMobile ? '64px' : 'auto',
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
                  position: 'relative',
                  mx: isMobile ? 0.5 : 0,
                  '&::after': isActive ? {
                    content: '""',
                    position: 'absolute',
                    bottom: isMobile ? '-8px' : 'auto',
                    right: isMobile ? 'auto' : '-8px',
                    left: isMobile ? '50%' : 'auto',
                    top: isMobile ? 'auto' : '50%',
                    transform: isMobile ? 'translateX(-50%) rotate(45deg)' : 'translateY(-50%) rotate(45deg)',
                    width: '12px',
                    height: '12px',
                    backgroundColor: '#8e24aa',
                    zIndex: -1
                  } : {},
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
                <Box sx={{ 
                  mb: isMobile ? 0.5 : 1, 
                  fontSize: isMobile ? '24px' : '24px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center' 
                }}>
                  {isCompleted ? <CheckCircleIcon color="success" fontSize={isMobile ? "medium" : "inherit"} /> : stepIcons[index]}
                </Box>
                {!isMobile && (
                  <Typography 
                    variant="body2" 
                    align="center" 
                    sx={{ 
                      fontWeight: isActive ? 'bold' : 'normal',
                    }}
                  >
                    {label}
                  </Typography>
                )}
                {isMobile && isActive && (
                  <Typography 
                    variant="caption" 
                    align="center" 
                    sx={{ 
                      fontWeight: 'bold',
                      lineHeight: 1,
                      position: 'absolute',
                      bottom: '-20px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      whiteSpace: 'nowrap',
                      color: 'text.primary',
                      fontSize: '0.65rem'
                    }}
                  >
                    {label}
                  </Typography>
                )}
              </Paper>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default ResumeFormStepper;
