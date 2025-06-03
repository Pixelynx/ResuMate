import React, { forwardRef, useEffect } from 'react';
import { 
  Typography, 
  Box, 
  Paper
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { CoverLetter } from '../coverLetter/types/coverLetterTypes';
import { useAppSelector } from '../../redux/hooks';
import { selectIsPrinting } from '../../redux/selectors/printSelectors';

interface PrintableCoverLetterProps {
  coverLetter: CoverLetter;
}

// Styled components for print-specific styling
const PrintContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  margin: theme.spacing(2),
  boxShadow: 'none',
  border: '1px solid #e0e0e0',
  maxWidth: '800px',
  marginLeft: 'auto',
  marginRight: 'auto',
  '@media print': {
    margin: 0,
    padding: theme.spacing(2),
    boxShadow: 'none',
    border: 'none',
    height: 'auto',
    '& .MuiTypography-h4': {
      fontSize: '22px',
    },
    '& .MuiTypography-h5': {
      fontSize: '18px',
    },
    '& .MuiTypography-body1': {
      fontSize: '12px',
      lineHeight: 1.6,
    },
  }
}));

const CoverLetterContent = styled(Typography)(({ theme }) => ({
  whiteSpace: 'pre-line',
  lineHeight: 1.8,
  '@media print': {
    lineHeight: 1.6,
  }
}));

// Define the component with forwardRef for react-to-print compatibility
const PrintableCoverLetter = forwardRef<HTMLDivElement, PrintableCoverLetterProps>((props, ref) => {
  const { coverLetter } = props;
  const isPrinting = useAppSelector(selectIsPrinting);
  
  // Use specific print styles when printing
  useEffect(() => {
    if (isPrinting) {
      document.title = `Cover Letter - ${coverLetter.jobtitle} at ${coverLetter.company}`;
    }
  }, [isPrinting, coverLetter]);

  if (!coverLetter) return null;

  return (
    <div ref={ref}>
      <PrintContainer>
        <CoverLetterContent variant="body1">
          {coverLetter.content}
        </CoverLetterContent>
      </PrintContainer>
    </div>
  );
});

PrintableCoverLetter.displayName = 'PrintableCoverLetter';

export default PrintableCoverLetter; 