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
      
      // Calculate the scroll position to center the active step
      const scrollLeft = activeElement.offsetLeft - (container.clientWidth / 2) + (activeElement.clientWidth / 2);
      
      // Smooth scroll to the position
      container.scrollTo({
        left: scrollLeft,
        behavior: 'smooth'
      });
    }
  }, [activeStep, isMobile]);

  return (
    <Box 
      ref={scrollContainerRef}
      sx={{ 
        display: 'flex', 
        flexDirection: isMobile ? 'row' : 'column',
        mr: isMobile ? 0 : 3,
        mb: isMobile ? 1 : 0,
        width: isMobile ? '100%' : '250px',
        overflowX: isMobile ? 'auto' : 'visible',
        overflowY: 'hidden',
        py: isMobile ? 1 : 0,
        justifyContent: isMobile ? 'flex-start' : 'flex-start',
        scrollbarWidth: 'none', // Firefox
        '&::-webkit-scrollbar': { // Chrome, Safari
          display: 'none'
        },
        msOverflowStyle: 'none', // IE, Edge
        WebkitOverflowScrolling: 'touch',
        px: isMobile ? 2 : 0,
      }}
    >
      <Grid 
        container 
        spacing={2} 
        wrap="nowrap"
        sx={{ 
          mb: isMobile ? 3 : 2,
          width: isMobile ? 'max-content' : '100%',
          justifyContent: isMobile ? 'flex-start' : 'flex-start',
          gap: isMobile ? 1 : 2,
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
              sx={{
                minWidth: isMobile ? 'auto' : '100%',
                width: isMobile ? 'auto' : '100%'
              }}
            >
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
                    : 'linear-gradient(45deg, #f9f4fa 30%, #f4eaf6 90%)',
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
