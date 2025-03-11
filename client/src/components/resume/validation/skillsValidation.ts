// src/components/resume/validation/skillsValidation.ts
export const validateSkills = (field: string, value: string) => {
    switch (field) {
      case 'skills_':
        if (!value) return { isValid: false, message: 'Please list at least one skill' };
        if (value.length < 3) return { isValid: false, message: 'Please provide more detail about your skills' };
        return { isValid: true, message: '' };
  
      case 'languages':
        return { isValid: true, message: '' }; // Optional field
  
      default:
        return { isValid: true, message: '' };
    }
  };