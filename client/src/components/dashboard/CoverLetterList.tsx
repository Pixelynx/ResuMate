import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Tooltip,
  Divider,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DescriptionIcon from '@mui/icons-material/Description';
import WorkIcon from '@mui/icons-material/Work';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { coverLetterService, CoverLetterData } from '../../utils/api';
import { formatDate } from '../../utils/validation';

interface CoverLetterListProps {
  coverLetters?: CoverLetterData[];
  loading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
}

const CoverLetterList: React.FC<CoverLetterListProps> = ({ 
  coverLetters: propsCoverLetters,
  loading: propsLoading,
  error: propsError,
  onRefresh 
}) => {
  const navigate = useNavigate();
  const [coverLetters, setCoverLetters] = useState<CoverLetterData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCoverLetterId, setSelectedCoverLetterId] = useState<string | null>(null);

  useEffect(() => {
    // If cover letters are provided as props, use them
    if (propsCoverLetters) {
      setCoverLetters(propsCoverLetters);
      return;
    }

    // Otherwise, fetch them
    const fetchCoverLetters = async () => {
      try {
        setLoading(true);
        const data = await coverLetterService.getAllCoverLetters();
        setCoverLetters(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load cover letters. Please try again.');
        setLoading(false);
      }
    };

    fetchCoverLetters();
  }, [propsCoverLetters]);

  const handleCreateCoverLetter = () => {
    navigate('/cover-letter/new');
  };

  const handleViewCoverLetter = (id: string) => {
    navigate(`/cover-letter/${id}`);
  };

  const handleEditCoverLetter = (id: string) => {
    navigate(`/cover-letter/${id}`);
  };

  const handleDeleteClick = (id: string) => {
    setSelectedCoverLetterId(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedCoverLetterId) return;

    try {
      setLoading(true);
      await coverLetterService.deleteCoverLetter(selectedCoverLetterId);
      
      // Update the local state
      setCoverLetters(coverLetters.filter(cl => cl.id !== selectedCoverLetterId));
      
      // Call the refresh callback if provided
      if (onRefresh) {
        onRefresh();
      }
      
      setDeleteDialogOpen(false);
      setLoading(false);
    } catch (err) {
      setError('Failed to delete cover letter. Please try again.');
      setLoading(false);
      setDeleteDialogOpen(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSelectedCoverLetterId(null);
  };

  const isLoading = propsLoading !== undefined ? propsLoading : loading;
  const displayError = propsError || error;

  if (isLoading && coverLetters.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {displayError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {displayError}
        </Alert>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h2">
          Cover Letters
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleCreateCoverLetter}
        >
          Create Cover Letter
        </Button>
      </Box>

      {coverLetters.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            You don't have any cover letters yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Generate a cover letter for a specific job using one of your resumes
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<AddIcon />}
            onClick={handleCreateCoverLetter}
            sx={{ mt: 2 }}
          >
            Generate Cover Letter
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {coverLetters.map((coverLetter) => (
            <Grid item xs={12} sm={6} md={4} key={coverLetter.id}>
              <Card 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6,
                  }
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h6" component="div" noWrap sx={{ maxWidth: '80%' }}>
                      {coverLetter.title}
                    </Typography>
                    <DescriptionIcon color="primary" />
                  </Box>
                  
                  {coverLetter.jobTitle && coverLetter.company && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <WorkIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {coverLetter.jobTitle} at {coverLetter.company}
                      </Typography>
                    </Box>
                  )}
                  
                  <Divider sx={{ my: 1.5 }} />
                  
                  {coverLetter.resumeId && (
                    <Box sx={{ mb: 1.5 }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Based on:
                      </Typography>
                      <Chip 
                        label="Resume" 
                        size="small" 
                        sx={{ 
                          backgroundColor: 'rgba(106, 27, 154, 0.1)',
                          color: '#6a1b9a'
                        }} 
                      />
                    </Box>
                  )}
                  
                  {coverLetter.createdAt && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                      Created: {formatDate(new Date(coverLetter.createdAt))}
                    </Typography>
                  )}
                </CardContent>
                
                <CardActions>
                  <Tooltip title="View Cover Letter">
                    <Button 
                      size="small" 
                      startIcon={<VisibilityIcon />}
                      onClick={() => handleViewCoverLetter(coverLetter.id!)}
                    >
                      View
                    </Button>
                  </Tooltip>
                  <Tooltip title="Edit Cover Letter">
                    <Button 
                      size="small" 
                      startIcon={<EditIcon />}
                      onClick={() => handleEditCoverLetter(coverLetter.id!)}
                    >
                      Edit
                    </Button>
                  </Tooltip>
                  <Box sx={{ flexGrow: 1 }} />
                  <Tooltip title="Delete">
                    <IconButton 
                      size="small" 
                      color="error"
                      onClick={() => handleDeleteClick(coverLetter.id!)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
      >
        <DialogTitle>Delete Cover Letter</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this cover letter? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CoverLetterList;
