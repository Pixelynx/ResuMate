import React from 'react';
import { Button } from '@mui/material';
import { useReactToPrint } from 'react-to-print';
import PrintIcon from '@mui/icons-material/Print';
import { useAppDispatch } from '../../redux/hooks';
import { 
  startPrinting, 
  printCompleted, 
  printFailed 
} from '../../redux/slices/printSlice';

interface PrintControllerProps {
  documentId: string;
  documentType: 'resume' | 'coverLetter';
  contentRef: React.RefObject<HTMLDivElement>;
}

const PrintController: React.FC<PrintControllerProps> = ({ 
  documentId, 
  documentType, 
  contentRef 
}) => {
  const dispatch = useAppDispatch();
  
  // Setup the react-to-print hook with all needed options
  // Using a type assertion to avoid TypeScript errors
  const handlePrint = useReactToPrint({
    // The content function that returns the component to be printed
    content: () => contentRef.current,
    documentTitle: `${documentType === 'resume' ? 'Resume' : 'Cover Letter'} - Print`,
    onBeforePrint: () => {
      dispatch(startPrinting({ 
        target: documentType, 
        id: documentId 
      }));
    },
    onAfterPrint: () => {
      dispatch(printCompleted());
    },
    onPrintError: (error) => {
      console.error('Print error:', error);
      dispatch(printFailed('Failed to print. Please try again.'));
    },
    removeAfterPrint: false,
    pageStyle: `
      @media print {
        @page {
          size: letter;
          margin: 0.5in;
        }
        body {
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
      }
    `,
  });

  return (
    <Button
      variant="contained"
      color="primary"
      startIcon={<PrintIcon />}
      // Use a regular function instead of directly passing handlePrint
      onClick={() => {
        if (handlePrint) {
          // TypeScript doesn't see the correct return type, so we force it
          (handlePrint as () => void)();
        }
      }}
      sx={{
        background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
        borderRadius: '8px',
        boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
        transition: 'all 0.3s ease-in-out',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 5px 8px 2px rgba(33, 203, 243, .4)',
        }
      }}
    >
      Print {documentType === 'resume' ? 'Resume' : 'Cover Letter'}
    </Button>
  );
};

export default PrintController; 