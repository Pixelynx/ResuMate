import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  IconButton,
  Tooltip,
  Chip,
  Divider,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Resume } from '../resume/types/resumeTypes';

dayjs.extend(relativeTime);

interface ResumeListProps {
  resumes: Resume[];
  onView: (resumeid: string) => void;
  onEdit: (resumeid: string) => void;
  onDelete: (resumeid: string) => void;
  onCreateCoverLetter: (resumeid: string) => void;
}

const ResumeList: React.FC<ResumeListProps> = ({
  resumes,
  onView,
  onEdit,
  onDelete,
  onCreateCoverLetter
}) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [selectedResumeId, setSelectedResumeId] = React.useState<string | null>(null);
  
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, resumeid: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedResumeId(resumeid);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedResumeId(null);
  };

  const handleView = () => {
    if (selectedResumeId) {
      onView(selectedResumeId);
      handleMenuClose();
    }
  };

  const handleDelete = () => {
    if (selectedResumeId) {
      onDelete(selectedResumeId);
      handleMenuClose();
    }
  };

  const handleCreateCoverLetter = () => {
    if (selectedResumeId) {
      onCreateCoverLetter(selectedResumeId);
      handleMenuClose();
    }
  };

  // Extract skills from resume data
  const extractSkills = (resume: Resume) => {
    if (resume.skills && resume.skills.skills_) {
      return resume.skills.skills_.split(',').slice(0, 3).map((skill: string) => skill.trim());
    }
    return [];
  };

  const formatDate = (date: string | undefined) => {
    return date ? dayjs(date).fromNow() : 'Never';
  };

  return (
    <Box>
      {resumes.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 3 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            You don't have any resumes yet
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={() => onEdit('')}
            sx={{ mt: 1 }}
          >
            Create Your First Resume
          </Button>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {resumes.map((resume) => (
            <Grid item xs={12} sm={6} md={4} key={resume.id}>
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
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Typography variant="h6" component="div" noWrap>
                      {resume.personalDetails.title || 'No Title Specified'}
                    </Typography>
                    <IconButton 
                      size="small" 
                      onClick={(e) => handleMenuOpen(e, resume.id)}
                      aria-label="resume options"
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </Box>
                  
                  <Divider sx={{ my: 1 }} />
                  
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                    {extractSkills(resume).map((skill, index) => (
                      <Typography 
                        key={index} 
                        variant='body2'
                        color="text.secondary"
                        sx={{ fontSize: '0.7rem' }}
                      >
                        {skill}
                      </Typography>
                    ))}
                  </Box>
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography variant="body2" color="text.secondary">
                      XP: {resume.workExperience?.length || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      EDU: {resume.education?.length || 0}
                    </Typography>
                  </Box>
                </CardContent>
                
                <Box sx={{ mt: 'auto', p: 0.75, ml: 1.75 }}>
                  <Typography variant="caption" color="text.secondary">
                    Created: {formatDate(resume.updatedAt)}
                  </Typography>
                </Box>
                
                <CardActions sx={{ p: 1 }}>
                  <Tooltip title="View Resume">
                    <Button 
                      size="small" 
                      // startIcon={<VisibilityIcon sx={{ fontSize: '0.9rem' }} />}
                      onClick={() => onView(resume.id)}
                      sx={{ py: 0.5 }}
                    >
                      View
                    </Button>
                  </Tooltip>
                  <Tooltip title="Edit functionality is temporarily disabled">
                    <span>
                      <Button 
                        size="small" 
                        startIcon={<EditIcon sx={{ fontSize: '0.9rem' }} />}
                        disabled={true}
                        sx={{ 
                          py: 0.5,
                          '&.Mui-disabled': {
                            color: (theme) => theme.palette.grey[500]
                          }
                        }}
                      >
                        Edit
                      </Button>
                    </span>
                  </Tooltip>
                  <Box sx={{ flexGrow: 1 }} />
                  <Tooltip title="Generate Cover Letter">
                    <Button 
                      size="small" 
                      color="secondary"
                      startIcon={<NoteAddIcon sx={{ fontSize: '0.9rem' }} />}
                      onClick={() => onCreateCoverLetter(resume.id)}
                      sx={{ py: 0.5 }}
                    >
                      Cover Letter
                    </Button>
                  </Tooltip>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleView}>
          <ListItemIcon>
            <VisibilityIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>View Resume</ListItemText>
        </MenuItem>
        <MenuItem disabled>
          <ListItemIcon>
            <EditIcon fontSize="small" sx={{ color: (theme) => theme.palette.grey[500] }} />
          </ListItemIcon>
          <ListItemText sx={{ color: (theme) => theme.palette.grey[500] }}>
            Edit Resume (Temporarily Disabled)
          </ListItemText>
        </MenuItem>
        <MenuItem onClick={handleCreateCoverLetter}>
          <ListItemIcon>
            <NoteAddIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Generate Cover Letter</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Delete Resume</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default ResumeList;
