import React from 'react';
import { Typography, Box, Divider } from '@mui/material';
import { MismatchContentProps } from '../../../types/mismatchTypes';
import MismatchSuggestion from './MismatchSuggestion';

/**
 * Component that displays the compatibility assessment content
 * @component
 */
const MismatchContent: React.FC<MismatchContentProps> = ({
  assessment,
  className,
}) => {
  return (
    <Box className={className}>
      <Typography variant="h6" color="error" gutterBottom>
        Compatibility Score: {assessment.compatibilityScore}%
      </Typography>
      
      <Typography variant="body1" paragraph>
        We've detected some mismatches between your resume and the job requirements.
      </Typography>

      <Divider sx={{ my: 2 }} />

      <Typography variant="h6" gutterBottom>
        Key Issues:
      </Typography>

      {assessment.suggestions.map((suggestion, index) => (
        <MismatchSuggestion
          key={`${suggestion.type}-${index}`}
          suggestion={suggestion}
        />
      ))}

      {assessment.metadata.skillsMatch.length > 0 && (
        <>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" gutterBottom>
            Matching Skills:
          </Typography>
          <Typography variant="body1">
            {assessment.metadata.skillsMatch.join(', ')}
          </Typography>
        </>
      )}

      {assessment.metadata.missingCriticalSkills.length > 0 && (
        <>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" gutterBottom color="error">
            Missing Critical Skills:
          </Typography>
          <Typography variant="body1" color="error">
            {assessment.metadata.missingCriticalSkills.join(', ')}
          </Typography>
        </>
      )}
    </Box>
  );
};

export default MismatchContent; 