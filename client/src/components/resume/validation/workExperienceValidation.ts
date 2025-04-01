// src/components/resume/validation/workExperienceValidation.ts
import { validateLocation } from '../../../utils/validation';
import dayjs from 'dayjs';

export const validateWorkExperience = (field: string, value: any) => {
  switch (field) {
    case 'companyName':
      if (!value) return { isValid: false, message: 'Company name is required' };
      if (value.length < 2) return { isValid: false, message: 'Company name must be at least 2 characters' };
      return { isValid: true, message: '' };

    case 'jobTitle':
      if (!value) return { isValid: false, message: 'Job title is required' };
      if (value.length < 2) return { isValid: false, message: 'Job title must be at least 2 characters' };
      return { isValid: true, message: '' };

    case 'location':
      const locationError = validateLocation(value);
      return { isValid: !locationError, message: locationError || '' };

    case 'startDate':
      if (!value) return { isValid: false, message: 'Start date is required' };
      const startDayjs = dayjs(value);
      if (!startDayjs.isValid()) return { isValid: false, message: 'Invalid date format' };
      if (startDayjs.isAfter(dayjs())) return { isValid: false, message: 'Start date cannot be in the future' };
      return { isValid: true, message: '' };

    case 'endDate':
      if (!value) return { isValid: true, message: '' };
      const endDayjs = dayjs(value);
      if (!endDayjs.isValid()) return { isValid: false, message: 'Invalid date format' };
      return { isValid: true, message: '' };

    case 'description':
      if (!value) return { isValid: false, message: 'Job description is required' };
      if (value.length < 10) return { isValid: false, message: 'Please provide a more detailed description' };
      return { isValid: true, message: '' };

    default:
      return { isValid: true, message: '' };
  }
};