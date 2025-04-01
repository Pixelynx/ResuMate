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
  
  // Prepare handler functions separately
  const handleBeforePrint = React.useCallback(async () => {
    dispatch(startPrinting({ 
      target: documentType, 
      id: documentId 
    }));
  }, [dispatch, documentType, documentId]);

  const handleAfterPrint = React.useCallback(() => {
    dispatch(printCompleted());
  }, [dispatch]);

  const handlePrintError = React.useCallback((errorLocation: "onBeforePrint" | "print", error: Error) => {
    console.error(`Print error at ${errorLocation}:`, error);
    dispatch(printFailed('Failed to print. Please try again.'));
  }, [dispatch]);

  // Setup the react-to-print hook
  const handlePrint = useReactToPrint({
    contentRef: () => contentRef.current,
    documentTitle: `${documentType === 'resume' ? 'Resume' : 'Cover Letter'} - Print`,
    onBeforePrint: handleBeforePrint,
    onAfterPrint: handleAfterPrint,
    onPrintError: handlePrintError,
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

  // Wrapper function to handle the print action
  const onPrintButtonClick = React.useCallback(() => {
    if (handlePrint) {
      handlePrint();
    }
  }, [handlePrint]);

  return (
    <Button
      variant="contained"
      color="primary"
      startIcon={<PrintIcon />}
      onClick={onPrintButtonClick}
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