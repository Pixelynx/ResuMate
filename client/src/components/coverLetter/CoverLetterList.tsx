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
import { coverLetterService } from '../../utils/api';
import { CoverLetter } from './types/coverLetterTypes';
import { formatDate } from '../../utils/validation';

interface CoverLetterListProps {
  coverLetters?: CoverLetter[];
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
  const [coverLetters, setCoverLetters] = useState<CoverLetter[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCoverLetterId, setSelectedCoverLetterId] = useState<string | null>(null);

  useEffect(() => {
    if (propsCoverLetters) {
      setCoverLetters(propsCoverLetters);
      return;
    }

    const fetchCoverLetters = async () => {
      try {
        setLoading(true);
        const response = await coverLetterService.getAllCoverLetters();
        
        // Handle both response formats
        if (Array.isArray(response)) {
          // Direct array response
          setCoverLetters(response);
        } else if (response.success && response.data) {
          // Wrapped response with success/data properties
          setCoverLetters(response.data);
        } else {
          // Error case
          throw new Error(
            response.message || 'Failed to load cover letters'
          );
        }
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
      
      setCoverLetters(coverLetters.filter(cl => cl.id !== selectedCoverLetterId));
      
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
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {displayError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {displayError}
        </Alert>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" component="h2">
          Cover Letters
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleCreateCoverLetter}
          size="small"
          sx={{ py: 0.75 }}
        >
          Create Cover Letter
        </Button>
      </Box>

      {coverLetters.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 3 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            You don't have any cover letters yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Generate a cover letter for a specific job using one of your resumes
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<AddIcon />}
            onClick={handleCreateCoverLetter}
            sx={{ mt: 1 }}
          >
            Generate Cover Letter
          </Button>
        </Box>
      ) : (
        <Grid container spacing={2}>
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
                <CardContent sx={{ flexGrow: 1, p: { xs: 1.5, sm: 2 } }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Typography variant="h6" component="div" noWrap sx={{ maxWidth: '80%' }}>
                      {coverLetter.title}
                    </Typography>
                    <DescriptionIcon color="primary" fontSize="small" />
                  </Box>
                  
                  {coverLetter.jobTitle && coverLetter.company && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <WorkIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {coverLetter.jobTitle} at {coverLetter.company}
                      </Typography>
                    </Box>
                  )}
                  
                  <Divider sx={{ my: 1 }} />
                  
                  {coverLetter.resumeId && (
                    <Box sx={{ mb: 1 }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Based on:
                      </Typography>
                      <Chip 
                        label="Resume" 
                        size="small" 
                        sx={{ 
                          backgroundColor: 'rgba(106, 27, 154, 0.1)',
                          color: '#6a1b9a',
                          height: '22px',
                          fontSize: '0.75rem'
                        }} 
                      />
                    </Box>
                  )}
                  
                  {coverLetter.createdAt && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Created: {formatDate(new Date(coverLetter.createdAt))}
                    </Typography>
                  )}
                </CardContent>
                
                <CardActions sx={{ p: 1 }}>
                  <Tooltip title="View Cover Letter">
                    <Button 
                      size="small" 
                      startIcon={<VisibilityIcon sx={{ fontSize: '0.9rem' }} />}
                      onClick={() => handleViewCoverLetter(coverLetter.id)}
                      sx={{ py: 0.5 }}
                    >
                      View
                    </Button>
                  </Tooltip>
                  <Tooltip title="Edit Cover Letter">
                    <Button 
                      size="small" 
                      startIcon={<EditIcon sx={{ fontSize: '0.9rem' }} />}
                      onClick={() => handleEditCoverLetter(coverLetter.id)}
                      sx={{ py: 0.5 }}
                    >
                      Edit
                    </Button>
                  </Tooltip>
                  <Box sx={{ flexGrow: 1 }} />
                  <Tooltip title="Delete Cover Letter">
                    <IconButton 
                      size="small" 
                      color="error"
                      onClick={() => handleDeleteClick(coverLetter.id)}
                      sx={{ p: 0.5 }}
                    >
                      <DeleteIcon sx={{ fontSize: '1.2rem' }} />
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
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Delete cover letter?
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete this cover letter? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="primary">
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error" 
            autoFocus
            disabled={isLoading}
          >
            {isLoading ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CoverLetterList; 