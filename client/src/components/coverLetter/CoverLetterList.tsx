import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Grid,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Alert,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { coverLetterService } from '../../utils/api';
import { CoverLetter } from './types/coverLetterTypes';
import styles from '../../styles/CoverLetterList.module.css';

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
        setCoverLetters(Array.isArray(response) ? response : response.data || []);
        setLoading(false);
      } catch (err) {
        setError('Failed to load cover letters. Please try again.');
        setLoading(false);
      }
    };

    fetchCoverLetters();
  }, [propsCoverLetters]);

  const handleViewCoverLetter = (id: string) => navigate(`/cover-letter/${id}`);
  const handleEditCoverLetter = (id: string) => navigate(`/cover-letter/${id}`);

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
      if (onRefresh) onRefresh();
      setDeleteDialogOpen(false);
    } catch (err) {
      setError('Failed to delete cover letter. Please try again.');
    } finally {
      setLoading(false);
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

  if (coverLetters.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 3 }}>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          You don't have any cover letters yet
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Generate a cover letter for a specific job using one of your resumes
        </Typography>
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

      <Grid container spacing={2}>
        {coverLetters.map((coverLetter) => (
          <Grid item xs={12} sm={6} md={4} key={coverLetter.id}>
            <div className={styles.card}>
              <div className={styles.header}>
                <div>
                  <Typography className={styles.title}>
                    {coverLetter.company || 'Unknown Company'}
                  </Typography>
                  <Typography className={styles.subtitle}>
                    {coverLetter.jobtitle || 'Position Not Specified'}
                  </Typography>
                </div>
              </div>

              <div className={styles.content}>
                {coverLetter.resumeid && (
                  <div className={styles.resumeSection}>
                    <span className={styles.resumeLabel}>Resume:</span>
                    <span className={styles.resumeTitle}>
                      {coverLetter.resumeTitle || 'Title Missing'}
                    </span>
                  </div>
                )}
              </div>

              <div className={styles.footer}>
                <Typography className={styles.date}>
                  Created {new Date(coverLetter.createdAt).toLocaleDateString()}
                </Typography>
                <div className={styles.actions}>
                  <Button 
                    size="small"
                    onClick={() => handleViewCoverLetter(coverLetter.id)}
                    className={styles.button}
                    startIcon={<VisibilityIcon />}
                  >
                    <span className={styles.buttonText}>View</span>
                  </Button>
                  <Button 
                    size="small"
                    onClick={() => handleEditCoverLetter(coverLetter.id)}
                    className={styles.button}
                    startIcon={<EditIcon />}
                  >
                    <span className={styles.buttonText}>Edit</span>
                  </Button>
                  <Button 
                    size="small"
                    onClick={() => handleDeleteClick(coverLetter.id)}
                    className={styles.deleteButton}
                    startIcon={<DeleteIcon />}
                  >
                    <span className={styles.buttonText}>Delete</span>
                  </Button>
                </div>
              </div>
            </div>
          </Grid>
        ))}
      </Grid>

      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        className={styles.dialog}
      >
        <DialogTitle>Delete Cover Letter</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this cover letter? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions className={styles.dialogActions}>
          <Button 
            onClick={handleDeleteCancel}
            className={styles.dialogButton}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            className={styles.dialogButton}
            autoFocus
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CoverLetterList; 