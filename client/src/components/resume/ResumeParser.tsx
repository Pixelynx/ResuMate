import React, { useState, useRef } from 'react';
import { Button, LinearProgress, Typography, Box, Alert, IconButton } from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import CloseIcon from '@mui/icons-material/Close';
import * as mammoth from 'mammoth';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { 
  startParsing, 
  updateParsingProgress, 
  parsingCompleted, 
  parsingFailed 
} from '../../redux/slices/resumeSlice';
import { ResumeFormData } from './types/resumeTypes';
import { selectParsingStatus } from '../../redux/selectors/resumeSelectors';
import { WorkExperience } from './types/resumeTypes';

interface ResumeParserProps {
  className?: string;
}

const ResumeParser: React.FC<ResumeParserProps> = ({ className }) => {
  const dispatch = useAppDispatch();
  const parsingStatus = useAppSelector(selectParsingStatus);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setErrorMessage(null);
      dispatch(startParsing());
      
      // Update progress to indicate we're starting
      dispatch(updateParsingProgress(10));
      
      // Use different parsing strategies based on file type
      let extractedContent = '';
      
      if (file.name.endsWith('.docx')) {
        // Parse DOCX with mammoth
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        extractedContent = result.value;
      console.log("EXTRACTED: ", extractedContent)
      dispatch(updateParsingProgress(50));
      } else if (file.name.endsWith('.txt')) {
        // Parse plain text file
        extractedContent = await file.text();
        dispatch(updateParsingProgress(50));
      } else {
        throw new Error('Unsupported file format. Please upload a .docx or .txt file.');
      }
      
      // Structure the extracted text into resume sections
      const parsedResume = parseResumeText(extractedContent);
      console.log("PARSED: ", parsedResume)
      dispatch(updateParsingProgress(90));
      
      // Complete the parsing process
      dispatch(parsingCompleted(parsedResume));
    } catch (error) {
      console.error('Error parsing resume:', error);
      const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred';
      setErrorMessage(errorMsg);
      dispatch(parsingFailed(errorMsg));
    }
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Very basic parsing function - in a production app, this would be much more sophisticated
  const parseResumeText = (text: string): ResumeFormData => {
    // A very simplistic parsing approach - in a real application, 
    // you would use NLP or more sophisticated techniques
    const sections = text.split(/\n\s*\n/); // Split by empty lines
    
    // Default resume structure
    const resumeData: ResumeFormData = {
      personalDetails: {
        firstName: '',
        lastName: '',
        title: '',
        email: '',
        phone: '',
        location: '',
        linkedin: '',
        website: '',
        github: '',
        instagram: '',
      },
      workExperience: [{ 
        companyName: '', 
        jobTitle: '', 
        location: '', 
        startDate: null, 
        endDate: null, 
        description: '' 
      }],
      education: [{ 
        institutionName: '', 
        degree: '', 
        fieldOfStudy: '', 
        location: '', 
        graduationDate: null 
      }],
      skills: { 
        skills_: '', 
        languages: '' 
      },
      certifications: [{ 
        name: '', 
        organization: '', 
        dateObtained: null, 
        expirationDate: null, 
        credentialUrl: '' 
      }],
      projects: [{ 
        title: '', 
        role: '', 
        duration: '', 
        description: '', 
        technologies: '', 
        projectUrl: '' 
      }],
    };

    // Extract personal details
    const nameMatch = text.match(/^([A-Za-z]+)\s+([A-Za-z]+)/);
    if (nameMatch) {
      resumeData.personalDetails.firstName = nameMatch[1] || '';
      resumeData.personalDetails.lastName = nameMatch[2] || '';
    }
    
    // Look for email
    const emailMatch = text.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);
    if (emailMatch) {
      resumeData.personalDetails.email = emailMatch[0] || '';
    }
    
    // Look for phone
    const phoneMatch = text.match(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/);
    if (phoneMatch) {
      resumeData.personalDetails.phone = phoneMatch[0] || '';
    }

    // Look for location
    const locationMatch = text.match(/([A-Za-z\s]+),\s*([A-Z]{2})/);
    if (locationMatch) {
      resumeData.personalDetails.location = locationMatch[0] || '';
    }
    
    // Look for LinkedIn
    const linkedinMatch = text.match(/linkedin\.com\/in\/([A-Za-z0-9-]+)/);
    if (linkedinMatch) {
      resumeData.personalDetails.linkedin = `https://linkedin.com/in/${linkedinMatch[1]}`;
    }

    // Extract skills (any section that mentions skills/contains bullet points)
    const skillsSection = sections.find(section => 
      section.toLowerCase().includes('skills') || 
      section.match(/\n\s*[•\-\*]\s+/)
    );
    
    if (skillsSection) {
      resumeData.skills.skills_ = skillsSection.replace(/skills:?/i, '').trim();
    }
    
    // Try to extract work experience
    let workExperienceData: WorkExperience[] = [];
    
    sections.forEach(section => {
      // Look for common work experience patterns
      if (section.match(/experience|work|employment|job/i)) {
        const lines = section.split('\n').filter(line => line.trim());
        
        if (lines.length >= 3) {
          // Try to extract company name and job title
          const jobTitle = lines[0].trim();
          const companyLine = lines[1].trim();
          const companyMatch = companyLine.match(/([^|,]+)/);
          const companyName = companyMatch ? companyMatch[1].trim() : companyLine;
          
          // Try to extract dates
          const dateMatch = section.match(/(\w+ \d{4})\s*[-–]\s*(\w+ \d{4}|present)/i);
          
          workExperienceData.push({
            jobTitle,
            companyName,
            location: '', 
            startDate: dateMatch ? new Date(dateMatch[1]) : null,
            endDate: dateMatch && dateMatch[2].toLowerCase() !== 'present' ? new Date(dateMatch[2]) : null,
            description: lines.slice(2).join('\n')
          });
        }
      }
    });
    
    if (workExperienceData.length > 0) {
      resumeData.workExperience = workExperienceData;
    }
    
    // Extract education
    sections.forEach(section => {
      if (section.match(/education|university|college|degree|school/i)) {
        const lines = section.split('\n').filter(line => line.trim());
        
        if (lines.length >= 2) {
          const institutionLine = lines[0].trim();
          const degreeLine = lines[1].trim();
          
          // Extract degree information
          const degreeMatch = degreeLine.match(/(Bachelor|Master|PhD|Doctor|Associate).*?(in|of)\s+([^,]+)/i);
          
          const dateMatch = section.match(/\b(19|20)\d{2}\b/); // Find years
          
          resumeData.education.push({
            institutionName: institutionLine,
            degree: degreeMatch ? degreeMatch[1] : '',
            fieldOfStudy: degreeMatch ? degreeMatch[3] : degreeLine,
            location: '',
            graduationDate: dateMatch ? new Date(dateMatch[0]) : null
          });
        }
      }
    });
    
    return resumeData;
  };

  const dismissError = () => {
    setErrorMessage(null);
  };

  return (
    <Box className={className}>
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileChange}
        accept=".docx,.txt"
      />
      <Button
        variant="contained"
        color="primary"
        startIcon={<UploadFileIcon />}
        onClick={triggerFileInput}
        // disabled={parsingStatus.isParsing}
        disabled={true}
        sx={{
          mb: 2,
          background: 'linear-gradient(to right, #6a1b9a, #8e24aa)',
          borderRadius: '8px',
          height: '2rem',
          boxShadow: '0 3px 5px 2px rgba(106, 27, 154, .3)',
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            boxShadow: '0 5px 8px 2px rgba(142, 36, 170, .4)',
            transform: 'translateY(-2px)',
          }
        }}
      >
        Parse Resume
      </Button>

      {parsingStatus.isParsing && (
        <Box sx={{ mt: 2, mb: 2 }}>
          <LinearProgress variant="determinate" value={parsingStatus.progress} />
          <Typography variant="caption" sx={{ mt: 0.5, display: 'block' }}>
            {parsingStatus.progress < 100 ? 'Parsing document...' : 'Parsing complete!'}
          </Typography>
        </Box>
      )}

      {(errorMessage || parsingStatus.error) && (
        <Alert 
          severity="error" 
          sx={{ mt: 2 }}
          action={
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={dismissError}
            >
              <CloseIcon fontSize="inherit" />
            </IconButton>
          }
        >
          {errorMessage || parsingStatus.error}
        </Alert>
      )}
    </Box>
  );
};

export default ResumeParser; 