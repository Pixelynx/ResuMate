import React from 'react';
import { ResumeFormData } from './ResumeForm';

const ResumePreview: React.FC<{ formData: ResumeFormData }> = ({ formData }) => {
    return (
      <div>
        <h2>{formData.personalDetails.firstName} {formData.personalDetails.lastName}</h2>
        <p>{formData.personalDetails.title}</p>
      </div>
    );
  };
  
  export default ResumePreview;