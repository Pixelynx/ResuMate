// src/components/resume/validation/educationValidation.ts
import { validateLocation } from '../../../utils/validation';
import dayjs from 'dayjs';

export const validateEducation = (field: string, value: any) => {
  switch (field) {
    case 'institutionName':
      if (!value) return { isValid: false, message: 'Institution name is required' };
      if (value.length < 2) return { isValid: false, message: 'Institution name must be at least 2 characters' };
      return { isValid: true, message: '' };

    case 'degree':
      if (!value) return { isValid: false, message: 'Degree is required' };
      if (value.length < 2) return { isValid: false, message: 'Degree must be at least 2 characters' };
      return { isValid: true, message: '' };

    case 'fieldOfStudy':
      if (!value) return { isValid: false, message: 'Field of study is required' };
      if (value.length < 2) return { isValid: false, message: 'Field of study must be at least 2 characters' };
      return { isValid: true, message: '' };

    case 'location':
      const locationError = validateLocation(value);
      return { isValid: !locationError, message: locationError || '' };

    case 'graduationDate':
      if (!value) return { isValid: false, message: 'Graduation date is required' };
      return { isValid: true, message: '' };

    default:
      return { isValid: true, message: '' };
  }
};