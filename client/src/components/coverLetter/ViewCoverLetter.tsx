import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Button,
  CircularProgress,
  Alert,
  TextField,
  Grid,
  Divider,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Print as PrintIcon,
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { coverLetterService, CoverLetterData } from '../../utils/api';

const ViewCoverLetter: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [coverLetter, setCoverLetter] = useState<CoverLetterData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedContent, setEditedContent] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    if (!id) {
      setError('Cover letter ID is missing');
      setLoading(false);
      return;
    }

    const fetchCoverLetter = async () => {
      try {
        setLoading(true);
        const data = await coverLetterService.getCoverLetterById(id);
        setCoverLetter(data);
        setEditedTitle(data.title);
        setEditedContent(data.content);
        setLoading(false);
      } catch (err) {
        setError('Failed to load cover letter. Please try again.');
        setLoading(false);
      }
    };

    fetchCoverLetter();
  }, [id]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    if (coverLetter) {
      setEditedTitle(coverLetter.title);
      setEditedContent(coverLetter.content);
    }
    setIsEditing(false);
  };

  const handleSaveEdit = async () => {
    if (!id || !coverLetter) return;

    try {
      setLoading(true);
      const updatedCoverLetter: CoverLetterData = {
        ...coverLetter,
        title: editedTitle,
        content: editedContent,
      };

      await coverLetterService.updateCoverLetter(id, updatedCoverLetter);
      setCoverLetter(updatedCoverLetter);
      setIsEditing(false);
      setSuccess('Cover letter updated successfully!');
      setLoading(false);
    } catch (err) {
      setError('Failed to update cover letter. Please try again.');
      setLoading(false);
    }
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!id) return;

    try {
      setLoading(true);
      await coverLetterService.deleteCoverLetter(id);
      setDeleteDialogOpen(false);
      setSuccess('Cover letter deleted successfully!');
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (err) {
      setError('Failed to delete cover letter. Please try again.');
      setLoading(false);
      setDeleteDialogOpen(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading && !coverLetter) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error && !coverLetter) {
    return (
      <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
        <Alert severity="error">{error}</Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/dashboard')}
          sx={{ mt: 2 }}
        >
          Back to Dashboard
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', p: 3 }}>
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/dashboard')}
        >
          Back to Dashboard
        </Button>

        <Box sx={{ display: 'flex', gap: 1 }}>
          {isEditing ? (
            <>
              <Button
                variant="contained"
                color="primary"
                startIcon={<SaveIcon />}
                onClick={handleSaveEdit}
                disabled={loading}
              >
                Save
              </Button>
              <Button
                variant="outlined"
                startIcon={<CancelIcon />}
                onClick={handleCancelEdit}
                disabled={loading}
              >
                Cancel
              </Button>
            </>
          ) : (
            <>
              <IconButton color="primary" onClick={handleEdit} disabled={loading}>
                <EditIcon />
              </IconButton>
              <IconButton color="error" onClick={handleDeleteClick} disabled={loading}>
                <DeleteIcon />
              </IconButton>
              <IconButton color="primary" onClick={handlePrint} disabled={loading}>
                <PrintIcon />
              </IconButton>
            </>
          )}
        </Box>
      </Box>

      <Paper elevation={3} sx={{ p: 4, mb: 4 }} className="print-content">
        {isEditing ? (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Title"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Content"
                multiline
                rows={15}
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                disabled={loading}
              />
            </Grid>
          </Grid>
        ) : (
          <>
            <Typography variant="h4" gutterBottom>
              {coverLetter?.title}
            </Typography>
            
            {coverLetter?.jobTitle && coverLetter?.company && (
              <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                For: {coverLetter.jobTitle} at {coverLetter.company}
              </Typography>
            )}
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="body1" sx={{ whiteSpace: 'pre-line', lineHeight: 1.8 }}>
              {coverLetter?.content}
            </Typography>
          </>
        )}
      </Paper>

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

export default ViewCoverLetter; 