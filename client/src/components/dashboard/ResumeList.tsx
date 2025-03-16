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

dayjs.extend(relativeTime);

interface ResumeListProps {
  resumes: any[];
  onView: (resumeId: string) => void;
  onEdit: (resumeId: string) => void;
  onDelete: (resumeId: string) => void;
  onCreateCoverLetter: (resumeId: string) => void;
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
  
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, resumeId: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedResumeId(resumeId);
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
  const extractSkills = (resume: any) => {
    if (resume.skills && resume.skills.skills_) {
      return resume.skills.skills_.split(',').slice(0, 3).map((skill: string) => skill.trim());
    }
    return [];
  };

  const formatDate = (date: string) => {
    return dayjs(date).fromNow();
  };

  return (
    <Box>
      {resumes.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            You don't have any resumes yet
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={() => onEdit('')}
            sx={{ mt: 2 }}
          >
            Create Your First Resume
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
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
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h6" component="div" noWrap>
                      {resume.personalDetails.firstName} {resume.personalDetails.lastName}
                    </Typography>
                    <IconButton 
                      size="small" 
                      onClick={(e) => handleMenuOpen(e, resume.id)}
                      aria-label="resume options"
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {resume.personalDetails.title || 'No title specified'}
                  </Typography>
                  
                  <Divider sx={{ my: 1.5 }} />
                  
                  <Box sx={{ mb: 1.5 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Skills:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {extractSkills(resume).map((skill: string, index: number) => (
                        <Chip 
                          key={index} 
                          label={skill} 
                          size="small" 
                          sx={{ 
                            backgroundColor: 'rgba(106, 27, 154, 0.1)',
                            color: '#6a1b9a'
                          }} 
                        />
                      ))}
                      {resume.skills && resume.skills.skills_ && 
                       resume.skills.skills_.split(',').length > 3 && (
                        <Chip 
                          label={`+${resume.skills.skills_.split(',').length - 3} more`} 
                          size="small" 
                          variant="outlined"
                          sx={{ color: '#6a1b9a', borderColor: '#6a1b9a' }}
                        />
                      )}
                    </Box>
                  </Box>
                  
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Experience: {resume.workExperience?.length || 0} entries
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Education: {resume.education?.length || 0} entries
                    </Typography>
                  </Box>
                </CardContent>
                
                <Box sx={{ mt: 'auto', p: 1, backgroundColor: 'rgba(106, 27, 154, 0.05)' }}>
                  <Typography variant="caption" color="text.secondary">
                    Last updated: {formatDate(resume.updatedAt)}
                  </Typography>
                </Box>
                
                <CardActions>
                  <Tooltip title="View Resume">
                    <Button 
                      size="small" 
                      startIcon={<VisibilityIcon />}
                      onClick={() => onView(resume.id)}
                    >
                      View
                    </Button>
                  </Tooltip>
                  <Tooltip title="Edit Resume">
                    <Button 
                      size="small" 
                      startIcon={<EditIcon />}
                      onClick={() => onEdit(resume.id)}
                    >
                      Edit
                    </Button>
                  </Tooltip>
                  <Box sx={{ flexGrow: 1 }} />
                  <Tooltip title="Generate Cover Letter">
                    <Button 
                      size="small" 
                      color="secondary"
                      startIcon={<NoteAddIcon />}
                      onClick={() => onCreateCoverLetter(resume.id)}
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
