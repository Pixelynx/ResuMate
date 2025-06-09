import React, { useEffect, useRef } from 'react';
import { Box, Typography, Paper, Grid, useTheme, useMediaQuery } from '@mui/material';
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const activeStepRef = useRef<HTMLDivElement>(null);

  const stepIcons = [
    <PersonIcon />,             // Personal Details
    <WorkIcon />,               // Work Experience
    <SchoolIcon />,             // Education
    <ConstructionIcon />,       // Skills
    <CardMembershipIcon />,     // Certifications
    <AccountTreeIcon />,        // Projects
    <VisibilityIcon />          // Preview
  ];

  // Effect to scroll active step into view
  useEffect(() => {
    if (isMobile && scrollContainerRef.current && activeStepRef.current) {
      const container = scrollContainerRef.current;
      const activeElement = activeStepRef.current;
      
      const scrollLeft = activeElement.offsetLeft - (container.clientWidth / 2) + (activeElement.clientWidth / 2);
      
      container.scrollTo({
        left: scrollLeft,
        behavior: 'smooth'
      });
    }
  }, [activeStep, isMobile]);

  if (isMobile) {
    return (
      <Box 
        ref={scrollContainerRef}
        sx={{ 
          display: 'flex',
          width: '100%',
          overflowX: 'auto',
          overflowY: 'hidden',
          py: 3,
          px: 2,
          scrollbarWidth: 'none',
          '&::-webkit-scrollbar': { display: 'none' },
          WebkitOverflowScrolling: 'touch'
        }}
      >
        <Grid 
          container 
          spacing={2} 
          wrap="nowrap"
          sx={{ 
            width: 'max-content',
            gap: 1
          }}
        >
          {steps.map((label, index) => {
            const isCompleted = index < activeStep;
            const isActive = index === activeStep;

            return (
              <Grid 
                item
                key={index}
                ref={isActive ? activeStepRef : null}
              >
                <Paper
                  elevation={3}
                  sx={{
                    p: 1,
                    height: '64px',
                    width: '64px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: isActive 
                      ? 'linear-gradient(45deg, #6a1b9a 30%, #8e24aa 90%)' 
                      : isCompleted
                      ? 'linear-gradient(45deg, #4a148c 30%, #6a1b9a 90%)'
                      : 'linear-gradient(45deg, #f9f4fa 30%, #f4eaf6 90%)',
                    color: isActive || isCompleted ? 'white' : 'text.primary',
                    borderRadius: '8px',
                    boxShadow: isActive 
                      ? '0 3px 5px 2px rgba(106, 27, 154, .3)' 
                      : '0 1px 3px rgba(0, 0, 0, 0.12)',
                    transition: 'all 0.3s ease-in-out',
                    position: 'relative',
                    mx: 0.5,
                    '&::after': isActive ? {
                      content: '""',
                      position: 'absolute',
                      bottom: '-8px',
                      left: '50%',
                      transform: 'translateX(-50%) rotate(45deg)',
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
                    mb: 0.5,
                    fontSize: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {isCompleted ? <CheckCircleIcon color="success" fontSize="medium" /> : stepIcons[index]}
                  </Box>
                  {isActive && (
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
  }

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
                    : 'linear-gradient(45deg, #f9f4fa 30%, #f4eaf6 90%)',
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
