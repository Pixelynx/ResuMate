import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Tabs, 
  Tab, 
  Paper, 
  Button, 
  Grid,
  CircularProgress,
  Divider,
  Alert,
  useTheme,
  useMediaQuery
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import { useNavigate } from 'react-router-dom';
import { resumeService, coverLetterService } from '../../utils/api';
import { Resume } from '../resume/types/resumeTypes';
import { CoverLetter } from '../coverLetter/types/coverLetterTypes';
import ResumeList from './ResumeList';
import CoverLetterList from '../coverLetter/CoverLetterList';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`dashboard-tabpanel-${index}`}
      aria-labelledby={`dashboard-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 2 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `dashboard-tab-${index}`,
    'aria-controls': `dashboard-tabpanel-${index}`,
  };
}

const Dashboard: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [coverLetters, setCoverLetters] = useState<CoverLetter[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch resumes
        const resumes = await resumeService.getAllResumes();
        setResumes(resumes);
        
        // Fetch cover letters
        try {
          const coverLetterResponse = await coverLetterService.getAllCoverLetters();
          
          // Check if response is an array (direct response) or has data property (wrapped response)
          if (Array.isArray(coverLetterResponse)) {
            setCoverLetters(coverLetterResponse);
          } else if (coverLetterResponse.success && coverLetterResponse.data) {
            setCoverLetters(coverLetterResponse.data);
          } else {
            console.error('Failed to load cover letters:', 
              coverLetterResponse.message || 'Unknown error');
            setCoverLetters([]);
          }
        } catch (coverLetterError) {
          console.error('Error fetching cover letters:', coverLetterError);
          setCoverLetters([]);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [refreshKey]);

  const handleRefresh = () => {
    setRefreshKey(prevKey => prevKey + 1);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleCreateNewResume = () => {
    navigate('/resume/builder');
  };

  const handleCreateCoverLetter = (resumeid?: string) => {
    if (resumeid) {
      navigate(`/cover-letter/from-resume/${resumeid}`);
    } else {
      navigate('/cover-letter/new');
    }
  };

  const handleViewResume = (resumeid: string) => {
    navigate(`/resume/${resumeid}`);
  };

  const handleEditResume = (resumeid: string) => {
    navigate(`/resume/builder?id=${resumeid}`);
  };

  const handleDeleteResume = async (resumeid: string) => {
    try {
      await resumeService.deleteResume(resumeid);
      setResumes(resumes.filter(resume => resume.id !== resumeid));
      setError(null);
    } catch (error) {
      console.error('Error deleting resume:', error);
      setError('Failed to delete resume. Please try again.');
    }
  };

  return (
    <Container 
      maxWidth="lg" 
      sx={{ 
        mt: 2, 
        mb: 10,
        minHeight: 'auto',
        width: { xs: '100%', sm: '85%', md: '75%' },
        minWidth: { xs: '100%', sm: '50vw' },
        background: 'white'
      }}
    >
      <Paper 
        elevation={isMobile ? 0 : 3} 
        sx={{ 
          p: { xs: 2, sm: 3 },
          borderRadius: 2,
          background: isMobile ? 'white' : 'linear-gradient(to right, rgba(106, 27, 154, 0.05), rgba(142, 36, 170, 0.05))',
          boxShadow: isMobile ? 'none' : undefined,
          maxHeight: 'calc(100vh - 160px)',
          overflow: 'auto'
        }}
      >
        <Box sx={{ mb: 2, textAlign: 'center' }}>
          <Typography variant="h4" component="h1" gutterBottom>
            My Dashboard
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Manage your resumes and cover letters
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Quick Actions */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ mb: 1 }}>
            Quick Actions
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                variant="contained"
                fullWidth
                startIcon={<AddIcon />}
                onClick={handleCreateNewResume}
                sx={{ 
                  py: { xs: 1, sm: 1.5 },
                  background: 'linear-gradient(to right, #6a1b9a, #8e24aa)',
                  '&:hover': {
                    background: 'linear-gradient(to right, #4a148c, #6a1b9a)',
                  }
                }}
              >
                Create Resume
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                variant="contained"
                fullWidth
                startIcon={<NoteAddIcon />}
                onClick={() => handleCreateCoverLetter()}
                sx={{ 
                  py: { xs: 1, sm: 1.5 },
                  background: 'linear-gradient(to right, #6a1b9a, #8e24aa)',
                  '&:hover': {
                    background: 'linear-gradient(to right, #4a148c, #6a1b9a)',
                  }
                }}
              >
                Create Cover Letter
              </Button>
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Tabs for Resumes and Cover Letters */}
        <Box sx={{ width: '100%' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange} 
              aria-label="dashboard tabs"
              sx={{
                '& .MuiTab-root': {
                  color: 'rgba(0, 0, 0, 0.6)',
                  '&.Mui-selected': {
                    color: 'rgb(160, 56, 224) !important'
                  }
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: 'rgb(160, 56, 224) !important'
                }
              }}
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab 
                label="My Resumes"
                iconPosition="start" 
                {...a11yProps(0)} 
              />
              <Tab 
                label="My Cover Letters"
                iconPosition="start" 
                {...a11yProps(1)} 
              />
            </Tabs>
          </Box>

          {loading && resumes.length === 0 && coverLetters.length === 0 ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <TabPanel value={tabValue} index={0}>
                <ResumeList 
                  resumes={resumes} 
                  onView={handleViewResume}
                  onEdit={handleEditResume}
                  onDelete={handleDeleteResume}
                  onCreateCoverLetter={handleCreateCoverLetter}
                />
              </TabPanel>
              <TabPanel value={tabValue} index={1}>
                <CoverLetterList 
                  coverLetters={coverLetters}
                  loading={loading}
                  error={null}
                  onRefresh={handleRefresh}
                />
              </TabPanel>
            </>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default Dashboard;
