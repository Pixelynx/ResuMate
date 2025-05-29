import React, { useState } from 'react';
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
  ListItemText,
  useTheme,
  useMediaQuery,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Resume } from '../resume/types/resumeTypes';

dayjs.extend(relativeTime);

// Maximum length for title display
const MAX_TITLE_LENGTH = 40;

interface ResumeListProps {
  resumes: Resume[];
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onCreateCoverLetter: (id: string) => void;
}

const ResumeList: React.FC<ResumeListProps> = ({
  resumes,
  onView,
  onEdit,
  onDelete,
  onCreateCoverLetter
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [selectedResumeId, setSelectedResumeId] = React.useState<string | null>(null);
  const [skillsDialogOpen, setSkillsDialogOpen] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  
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

  const handleEdit = () => {
    if (selectedResumeId) {
      onEdit(selectedResumeId);
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
      return resume.skills.skills_.split(',').map((skill: string) => skill.trim());
    }
    return [];
  };

  const formatDate = (date: string | undefined) => {
    return date ? dayjs(date).fromNow() : 'Never';
  };

  const handleShowAllSkills = (skills: string[]) => {
    setSelectedSkills(skills);
    setSkillsDialogOpen(true);
  };

  // Function to truncate text with ellipsis
  const truncateText = (text: string, maxLength: number) => {
    if (!text) return '';
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
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
            sx={{ 
              mt: 1,
              minHeight: '44px', 
              minWidth: '44px',
              px: 2
            }}
          >
            Create Your First Resume
          </Button>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {resumes.map((resume) => {
            const skills = extractSkills(resume);
            const visibleSkills = skills.slice(0, 3);
            const hiddenSkillsCount = skills.length - visibleSkills.length;
            const hasTitle = resume.personalDetails.title && resume.personalDetails.title.trim() !== '';
            const displayTitle = hasTitle ? truncateText(resume.personalDetails.title, MAX_TITLE_LENGTH) : 'No title specified';

            return (
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
                <CardContent sx={{ flexGrow: 1, p: { xs: 2, sm: 2 } }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Typography variant="h6" component="div" sx={{
                      maxWidth: '80%',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {resume.personalDetails.firstname} {resume.personalDetails.lastname}
                    </Typography>
                    <IconButton 
                      size={isMobile ? "medium" : "small"} 
                      onClick={(e) => handleMenuOpen(e, resume.id)}
                      aria-label="resume options"
                      sx={{ 
                        minWidth: '44px', 
                        minHeight: '44px', 
                        ml: 1 
                      }}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </Box>
                  
                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    gutterBottom
                    sx={{ 
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                    title={resume.personalDetails.title || 'No title specified'}
                  >
                    {displayTitle}
                  </Typography>
                  
                  <Divider sx={{ my: 1 }} />
                  
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                    {visibleSkills.map((skill, index) => (
                      <Chip 
                        key={index} 
                        label={skill} 
                        size="small" 
                        variant="outlined"
                        sx={{ fontSize: '0.7rem' }}
                      />
                    ))}
                    {hiddenSkillsCount > 0 && (
                      <Chip
                        label={`+${hiddenSkillsCount} more`}
                        size="small"
                        color="primary"
                        variant="outlined"
                        onClick={() => handleShowAllSkills(skills)}
                        sx={{ 
                          fontSize: '0.7rem',
                          minHeight: '24px',
                          cursor: 'pointer'
                        }}
                      />
                    )}
                  </Box>
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography variant="body2" color="text.secondary">
                      Experience: {resume.workExperience?.length || 0} entries
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Education: {resume.education?.length || 0} entries
                    </Typography>
                  </Box>
                </CardContent>
                <CardActions sx={{ p: 1.5, pt: 0 }}>
                  <Button 
                    size="small" 
                    startIcon={<VisibilityIcon />} 
                    onClick={() => onView(resume.id)}
                    sx={{ 
                      minHeight: '44px',
                      borderRadius: '8px'
                    }}
                  >
                    View
                  </Button>
                  <Button 
                    size="small" 
                    startIcon={<EditIcon />} 
                    onClick={() => onEdit(resume.id)}
                    sx={{ 
                      minHeight: '44px',
                      borderRadius: '8px' 
                    }}
                  >
                    Edit
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          )})}
        </Grid>
      )}

      {/* Menu for resume actions */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            mt: 1,
            '& .MuiMenuItem-root': {
              minHeight: '44px', // Ensure menu items are touchable
            }
          }
        }}
      >
        <MenuItem onClick={handleView}>
          <ListItemIcon>
            <VisibilityIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>View Resume</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleEdit}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit Resume</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleCreateCoverLetter}>
          <ListItemIcon>
            <NoteAddIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Create Cover Letter</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDelete}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText sx={{ color: 'error.main' }}>Delete Resume</ListItemText>
        </MenuItem>
      </Menu>

      {/* Dialog to show all skills */}
      <Dialog 
        open={skillsDialogOpen} 
        onClose={() => setSkillsDialogOpen(false)}
        aria-labelledby="skills-dialog-title"
      >
        <DialogTitle id="skills-dialog-title">All Skills</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, pt: 1 }}>
            {selectedSkills.map((skill, index) => (
              <Chip 
                key={index} 
                label={skill} 
                size={isMobile ? "medium" : "small"} 
                sx={{ 
                  height: isMobile ? '32px' : '24px',
                  fontSize: isMobile ? '0.875rem' : '0.75rem'
                }}
              />
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setSkillsDialogOpen(false)} 
            color="primary"
            sx={{ minHeight: '44px' }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ResumeList;
