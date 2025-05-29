import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Button,
  CircularProgress,
  Alert,
  Tooltip,
  useTheme,
  useMediaQuery,
  Fab,
  Zoom,
  Snackbar
} from '@mui/material';
import ResumePreview from './PreviewResume';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import PrintIcon from '@mui/icons-material/Print';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { fetchResumeById } from '../../redux/slices/resumeSlice';
import {
  selectCurrentResume,
  selectResumeLoading,
  selectResumeError
} from '../../redux/selectors/resumeSelectors';
import PrintableResume from '../print/PrintableResume';
import PrintController from '../print/PrintController';

const ViewResume: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const printableRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [refreshing, setRefreshing] = useState(false);
  const [startY, setStartY] = useState(0);
  const [pullDistance, setPullDistance] = useState(0);
  const [showRefreshSnackbar, setShowRefreshSnackbar] = useState(false);
  
  const resume = useAppSelector(selectCurrentResume);
  const loading = useAppSelector(selectResumeLoading);
  const error = useAppSelector(selectResumeError);

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
    if (id) {
      dispatch(fetchResumeById(id));
    }
  }, [dispatch, id]);

  const handleEdit = () => {
    navigate(`/resume/builder?id=${id}`);
  };

  const handleBack = () => {
    navigate('/dashboard');
  };

  const refreshData = () => {
    if (!refreshing && id) {
      setRefreshing(true);
      setShowRefreshSnackbar(true);
      dispatch(fetchResumeById(id)).then(() => {
        setRefreshing(false);
      });
    }
  };

  if (loading && !refreshing) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md">
        <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
        <Button 
          variant="outlined" 
          startIcon={<ArrowBackIcon />} 
          onClick={handleBack}
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

  if (!resume) {
    return (
      <Container maxWidth="md">
        <Alert severity="warning" sx={{ mt: 2 }}>Resume not found</Alert>
        <Button 
          variant="outlined" 
          startIcon={<ArrowBackIcon />} 
          onClick={handleBack}
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
            onClick={handleBack}
            sx={{ 
              minHeight: '48px',
              minWidth: '180px',
              borderRadius: '8px'
            }}
          >
            Back to Dashboard
          </Button>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <PrintController 
              documentId={resume.id} 
              documentType="resume" 
              contentRef={printableRef}
              buttonProps={{
                sx: { 
                  minHeight: '48px',
                  minWidth: '120px',
                  borderRadius: '8px'
                }
              }}
            />
            <Button 
              variant="contained" 
              startIcon={<EditIcon />}
              onClick={handleEdit}
              sx={{ 
                minHeight: '48px',
                minWidth: '120px',
                borderRadius: '8px'
              }}
            >
              Edit Resume
            </Button>
          </Box>
        </Box>
      )}
      
      {/* Mobile floating buttons */}
      {isMobile && (
        <>
          <Zoom in={true}>
            <Fab
              color="default"
              aria-label="back"
              onClick={handleBack}
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
              onClick={handleEdit}
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
        </>
      )}
      
      {/* Regular view with pinch-to-zoom support */}
      <Box 
        sx={{ 
          display: 'block',
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
        <ResumePreview formData={resume} />
      </Box>

      {/* Hidden printable view - only shown during printing */}
      <Box sx={{ display: 'none' }}>
        <PrintableResume ref={printableRef} resume={resume} />
      </Box>
      
      {/* Refresh snackbar */}
      <Snackbar
        open={showRefreshSnackbar}
        autoHideDuration={3000}
        onClose={() => setShowRefreshSnackbar(false)}
        message="Resume refreshed"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Container>
  );
};

export default ViewResume; 