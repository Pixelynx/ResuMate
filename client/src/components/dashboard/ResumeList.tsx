import React from 'react';
import {
  Box,
  Typography,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Button,
  Tooltip
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Resume } from '../resume/types/resumeTypes';
import styles from '../../styles/ResumeList.module.css';

dayjs.extend(relativeTime);

const MAX_VISIBLE_SKILLS = 4;

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

  const extractSkills = (resume: Resume) => {
    if (resume.skills && resume.skills.skills_) {
      return resume.skills.skills_.split(',').map((skill: string) => skill.trim());
    }
    return [];
  };

  const formatDate = (date: string | undefined) => {
    return date ? dayjs(date).fromNow() : 'Never';
  };

  if (resumes.length === 0) {
    return (
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
    );
  }

  return (
    <Grid container spacing={2}>
      {resumes.map((resume) => {
        const skills = extractSkills(resume);
        const visibleSkills = skills.slice(0, MAX_VISIBLE_SKILLS);
        const remainingSkills = skills.length - MAX_VISIBLE_SKILLS;

        const qualifiers = [
          { label: 'XP', value: resume.workExperience?.length || 0 },
          { label: 'EDU', value: resume.education?.length || 0 },
          { label: 'PROJ', value: resume.projects?.length || 0 },
          { label: 'CERT', value: resume.certifications?.length || 0 }
        ];

        return (
          <Grid item xs={12} sm={6} md={4} key={resume.id}>
            <div className={styles.card}>
              <div className={styles.header}>
                <Typography className={styles.title}>
                  {resume.personalDetails.title || 'No Title Specified'}
                </Typography>
                <IconButton 
                  size="small"
                  onClick={(e) => handleMenuOpen(e, resume.id)}
                  className={styles.menuButton}
                >
                  <MoreVertIcon />
                </IconButton>
              </div>

              <div className={styles.content}>
                <div className={styles.sections}>
                  <div className={styles.section}>
                    <div className={styles.qualifiersGrid}>
                      {qualifiers.map(({ label, value }, index) => (
                        <div key={index} className={styles.qualifier}>
                          <Typography variant="body2">{label}</Typography>
                          <Typography variant="body1">{value}</Typography>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className={styles.section}>
                    <div className={styles.skillsContainer}>
                      {visibleSkills.map((skill, index) => (
                        <span key={index} className={styles.skill}>{skill}</span>
                      ))}
                      {remainingSkills > 0 && (
                        <span className={styles.skill}>+{remainingSkills}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.footer}>
                <Typography className={styles.date}>
                  Created {formatDate(resume.updatedAt)}
                </Typography>
                <div className={styles.actions}>
                  <Tooltip title="View Resume">
                    <Button 
                      size="small"
                      onClick={() => onView(resume.id)}
                      className={styles.button}
                      startIcon={<VisibilityIcon />}
                    >
                      <span className={styles.buttonText}>View</span>
                    </Button>
                  </Tooltip>

                  <Tooltip title="Edit functionality is temporarily disabled">
                    <span>
                      <Button 
                        size="small"
                        disabled={true}
                        className={styles.button}
                        startIcon={<EditIcon />}
                      >
                        <span className={styles.buttonText}>Edit</span>
                      </Button>
                    </span>
                  </Tooltip>

                  <Tooltip title="Generate Cover Letter">
                    <Button 
                      size="small"
                      onClick={() => onCreateCoverLetter(resume.id)}
                      className={styles.button}
                      startIcon={<NoteAddIcon />}
                    >
                      <span className={styles.buttonText}>Cover Letter</span>
                    </Button>
                  </Tooltip>
                </div>
              </div>
            </div>
          </Grid>
        );
      })}

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
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit Resume (Temporarily Disabled)</ListItemText>
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
    </Grid>
  );
};

export default ResumeList;
