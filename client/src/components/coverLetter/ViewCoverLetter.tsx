import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Typography,
  Box,
  Container,
  Paper,
  Button,
  Divider,
  Grid,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Alert,
  useTheme,
  useMediaQuery,
  Fab,
  Zoom,
  Snackbar
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PrintIcon from '@mui/icons-material/Print';
import RefreshIcon from '@mui/icons-material/Refresh';
import { coverLetterService } from '../../utils/api';
import { useAppSelector } from '../../redux/hooks';
import { selectIsPrinting } from '../../redux/selectors/printSelectors';
import { CoverLetter } from './types/coverLetterTypes';
import PrintableCoverLetter from '../print/PrintableCoverLetter';
import PrintController from '../print/PrintController';
import JobScore from './JobScore';

const ViewCoverLetter: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const printableRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [coverLetter, setCoverLetter] = useState<CoverLetter | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  const [refreshing, setRefreshing] = useState(false);
  const [startY, setStartY] = useState(0);
  const [pullDistance, setPullDistance] = useState(0);
  const [showRefreshSnackbar, setShowRefreshSnackbar] = useState(false);
  
  const isPrinting = useAppSelector(selectIsPrinting);

  // Set up pull-to-refresh functionality
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !isMobile) return;

    const handleTouchStart = (e: TouchEvent) => {
      if (container.scrollTop === 0) {
        setStartY(e.touches[0].clientY);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (startY > 0) {
        const currentY = e.touches[0].clientY;
        const distance = currentY - startY;
        if (distance > 0) {
          setPullDistance(Math.min(distance, 100));
          e.preventDefault();
        }
      }
    };

    const handleTouchEnd = () => {
      if (pullDistance > 70) {
        refreshData();
      }
      setStartY(0);
      setPullDistance(0);
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isMobile, startY, pullDistance]);

  useEffect(() => {
    const fetchCoverLetter = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const response = await coverLetterService.getCoverLetter(id);
        
        if (response) {
          setCoverLetter(response);
        } else {
          setError('Cover letter not found');
        }
        
        setLoading(false);
      } catch (err) {
        setError('Failed to load cover letter');
        setLoading(false);
      }
    };

    fetchCoverLetter();
  }, [id]);

  const refreshData = () => {
    if (!refreshing && id) {
      setRefreshing(true);
      setShowRefreshSnackbar(true);
      
      coverLetterService.getCoverLetter(id)
        .then(response => {
          if (response) {
            setCoverLetter(response);
          }
          setRefreshing(false);
        })
        .catch(() => {
          setRefreshing(false);
        });
    }
  };

  const handleEdit = () => {
    if (id) {
      navigate(`/cover-letter/edit/${id}`);
    }
  };

  const handleDelete = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      await coverLetterService.deleteCoverLetter(id);
      navigate('/dashboard');
    } catch (err) {
      setError('Failed to delete cover letter');
      setLoading(false);
      setDeleteDialogOpen(false);
    }
  };

  const handleBack = () => {
    navigate('/dashboard');
  };
  
  // Trigger vibration for haptic feedback when buttons are clicked
  const triggerHapticFeedback = () => {
    if (navigator.vibrate && isMobile) {
      navigator.vibrate(50); // Short vibration of 50ms
    }
  };
  
  const handleButtonClick = (callback: () => void) => {
    triggerHapticFeedback();
    callback();
  };

  if (loading && !refreshing) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !coverLetter) {
    return (
      <Container maxWidth="md">
        <Alert severity="error" sx={{ mt: 2 }}>{error || 'Cover letter not found'}</Alert>
        <Button 
          variant="outlined" 
          startIcon={<ArrowBackIcon />} 
          onClick={() => handleButtonClick(handleBack)}
          sx={{ 
            mt: 2,
            minHeight: '48px',
            minWidth: '120px'
          }}
        >
          Back to Dashboard
        </Button>
      </Container>
    );
  }

  return (
    <Container 
      maxWidth="md" 
      sx={{ 
        paddingBottom: '80px', 
        position: 'relative',
        height: '100%'
      }}
      ref={containerRef}
    >
      {/* Pull to refresh indicator */}
      {pullDistance > 0 && (
        <Box 
          sx={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            right: 0, 
            height: `${pullDistance}px`,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 10
          }}
        >
          <Box 
            sx={{ 
              transform: `rotate(${Math.min(pullDistance * 3.6, 360)}deg)`,
              transition: 'transform 0.2s'
            }}
          >
            <RefreshIcon color="primary" />
          </Box>
        </Box>
      )}
      
      {/* Desktop header buttons */}
      {!isMobile && (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          mt: 2, 
          mb: 2,
          gap: 2
        }}>
          <Button 
            variant="outlined" 
            startIcon={<ArrowBackIcon />}
            onClick={() => handleButtonClick(handleBack)}
            sx={{ 
              minHeight: '48px',
              minWidth: '180px',
              borderRadius: '8px'
            }}
          >
            Back to Dashboard
          </Button>
          <PrintController 
            documentId={coverLetter.id} 
            documentType="coverLetter" 
            contentRef={printableRef}
            buttonProps={{
              sx: { 
                minHeight: '48px',
                minWidth: '120px',
                borderRadius: '8px'
              },
              onClick: triggerHapticFeedback
            }}
          />
        </Box>
      )}
      
      {/* Mobile floating buttons */}
      {isMobile && (
        <>
          <Zoom in={true}>
            <Fab
              color="default"
              aria-label="back"
              onClick={() => handleButtonClick(handleBack)}
              sx={{ 
                position: 'fixed',
                bottom: 80,
                left: 16,
                zIndex: 2
              }}
            >
              <ArrowBackIcon />
            </Fab>
          </Zoom>
          
          <Zoom in={true} style={{ transitionDelay: '150ms' }}>
            <Fab
              color="primary"
              aria-label="edit"
              onClick={() => handleButtonClick(handleEdit)}
              sx={{ 
                position: 'fixed',
                bottom: 16,
                right: 16,
                zIndex: 2
              }}
            >
              <EditIcon />
            </Fab>
          </Zoom>
          
          <Zoom in={true} style={{ transitionDelay: '75ms' }}>
            <Fab
              color="secondary"
              aria-label="print"
              onClick={() => {
                triggerHapticFeedback();
                if (printableRef.current) {
                  window.print();
                }
              }}
              sx={{ 
                position: 'fixed',
                bottom: 16,
                right: 88,
                zIndex: 2
              }}
            >
              <PrintIcon />
            </Fab>
          </Zoom>
          
          <Zoom in={true}>
            <Fab
              color="error"
              aria-label="delete"
              onClick={() => handleButtonClick(handleDelete)}
              sx={{ 
                position: 'fixed',
                bottom: 16,
                right: 160,
                zIndex: 2
              }}
            >
              <DeleteIcon />
            </Fab>
          </Zoom>
        </>
      )}
      
      {/* Job Fit Score Component */}
      <JobScore coverLetterId={coverLetter.id} />
      
      {/* Cover letter content with pinch-to-zoom support */}
      <Box 
        sx={{ 
          touchAction: 'manipulation',
          WebkitOverflowScrolling: 'touch'
        }}
        className="pinch-zoom-container"
      >
        <style>{`
          .pinch-zoom-container {
            overflow: auto;
            max-width: 100%;
          }
          @media (hover: none) and (pointer: coarse) {
            .pinch-zoom-container {
              touch-action: pinch-zoom;
            }
          }
        `}</style>
        
        <Paper elevation={3} sx={{ p: { xs: 2, sm: 4 }, mt: 4, mb: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h4" gutterBottom>
                {coverLetter.title}
              </Typography>
              <Typography variant="subtitle1" color="textSecondary" gutterBottom>
                For: {coverLetter.jobtitle} at {coverLetter.company}
              </Typography>
              <Divider sx={{ my: 2 }} />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="body1" style={{ whiteSpace: 'pre-line' }}>
                {coverLetter.content}
              </Typography>
            </Grid>

            {!isMobile && (
              <Grid item xs={12}>
                <Box display="flex" gap={2} mt={3}>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<EditIcon />}
                    onClick={() => handleButtonClick(handleEdit)}
                    disabled={loading}
                    sx={{ 
                      minHeight: '48px',
                      minWidth: '120px',
                      borderRadius: '8px'
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => handleButtonClick(handleDelete)}
                    disabled={loading}
                    sx={{ 
                      minHeight: '48px',
                      minWidth: '120px',
                      borderRadius: '8px'
                    }}
                  >
                    Delete
                  </Button>
                </Box>
              </Grid>
            )}
          </Grid>
        </Paper>
      </Box>
      
      {/* Hidden printable view - only shown during printing */}
      <Box sx={{ display: 'none' }}>
        <PrintableCoverLetter ref={printableRef} coverLetter={coverLetter} />
      </Box>
      
      {/* Delete dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Delete Cover Letter</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete this cover letter? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={() => {
              triggerHapticFeedback();
              setDeleteDialogOpen(false);
            }}
            sx={{ 
              minHeight: '48px',
              minWidth: '88px'
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={() => handleButtonClick(handleDeleteConfirm)} 
            color="error" 
            variant="contained"
            sx={{ 
              minHeight: '48px',
              minWidth: '88px'
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Refresh snackbar */}
      <Snackbar
        open={showRefreshSnackbar}
        autoHideDuration={3000}
        onClose={() => setShowRefreshSnackbar(false)}
        message="Cover letter refreshed"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Container>
  );
};

export default ViewCoverLetter; 