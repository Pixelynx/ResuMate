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
  Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DescriptionIcon from '@mui/icons-material/Description';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import { useNavigate } from 'react-router-dom';
import { resumeService, coverLetterService } from '../../utils/api';
import ResumeList from './ResumeList';
import CoverLetterList from './CoverLetterList';

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
        <Box sx={{ p: 3 }}>
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
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [resumes, setResumes] = useState<any[]>([]);
  const [coverLetters, setCoverLetters] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch resumes
        const resumeData = await resumeService.getAllResumes();
        setResumes(resumeData);
        
        // Fetch cover letters
        try {
          const coverLetterData = await coverLetterService.getAllCoverLetters();
          setCoverLetters(coverLetterData);
        } catch (coverLetterError) {
          console.error('Error fetching cover letters:', coverLetterError);
          // Don't set the main error, just log it and continue with empty cover letters
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

  const handleCreateCoverLetter = (resumeId?: string) => {
    if (resumeId) {
      navigate(`/cover-letter/from-resume/${resumeId}`);
    } else {
      navigate('/cover-letter/new');
    }
  };

  const handleViewResume = (resumeId: string) => {
    navigate(`/resume/${resumeId}`);
  };

  const handleEditResume = (resumeId: string) => {
    navigate(`/resume/builder?id=${resumeId}`);
  };

  const handleDeleteResume = async (resumeId: string) => {
    try {
      await resumeService.deleteResume(resumeId);
      // Update the resumes list after deletion
      setResumes(resumes.filter(resume => resume.id !== resumeId));
      setError(null);
    } catch (error) {
      console.error('Error deleting resume:', error);
      setError('Failed to delete resume. Please try again.');
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper 
        elevation={3} 
        sx={{ 
          p: 3, 
          borderRadius: 2,
          background: 'linear-gradient(to right, rgba(106, 27, 154, 0.05), rgba(142, 36, 170, 0.05))'
        }}
      >
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography variant="h4" component="h1" gutterBottom>
            My Dashboard
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Manage your resumes and cover letters
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Quick Actions */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
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
                  py: 2,
                  background: 'linear-gradient(to right, #6a1b9a, #8e24aa)',
                  '&:hover': {
                    background: 'linear-gradient(to right, #4a148c, #6a1b9a)',
                  }
                }}
              >
                Create New Resume
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                variant="contained"
                fullWidth
                startIcon={<NoteAddIcon />}
                onClick={() => handleCreateCoverLetter()}
                sx={{ 
                  py: 2,
                  background: 'linear-gradient(to right, #6a1b9a, #8e24aa)',
                  '&:hover': {
                    background: 'linear-gradient(to right, #4a148c, #6a1b9a)',
                  }
                }}
              >
                Generate Cover Letter
              </Button>
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Tabs for Resumes and Cover Letters */}
        <Box sx={{ width: '100%' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange} 
              aria-label="dashboard tabs"
              textColor="primary"
              indicatorColor="primary"
            >
              <Tab 
                label="My Resumes" 
                icon={<DescriptionIcon />} 
                iconPosition="start" 
                {...a11yProps(0)} 
              />
              <Tab 
                label="My Cover Letters" 
                icon={<NoteAddIcon />} 
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
