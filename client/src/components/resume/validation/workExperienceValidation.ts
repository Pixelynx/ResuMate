// src/components/resume/validation/workExperienceValidation.ts
import { validateLocation } from '../../../utils/validation';
import dayjs from 'dayjs';

export const validateWorkExperience = (field: string, value: any) => {
  console.log(`Validating work experience field: ${field}`, value);
  
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
      console.log('Validating start date:', value);
      if (!value) return { isValid: false, message: 'Start date is required' };
      
      // Safeguard against invalid date objects
      try {
        const date = dayjs(value);
        // Check if the date is valid before trying to use methods on it
        if (!date.isValid()) {
          console.log('Invalid start date format');
          return { isValid: false, message: 'Invalid date format' };
        }
        
        const now = dayjs();
        // Compare using timestamps instead of isAfter
        if (date.valueOf() > now.valueOf()) {
          console.log('Start date is in the future');
          return { isValid: false, message: 'Start date cannot be in the future' };
        }
        console.log('Start date is valid');
        return { isValid: true, message: '' };
      } catch (error) {
        console.error('Error validating start date:', error);
        return { isValid: false, message: 'Error validating date' };
      }

    case 'endDate':
      console.log('Validating end date:', value);
      // End date is optional
      if (!value) {
        console.log('No end date provided (valid)');
        return { isValid: true, message: '' };
      }
      
      // Safeguard against invalid date objects
      try {
        const date = dayjs(value);
        if (!date.isValid()) {
          console.log('Invalid end date format');
          return { isValid: false, message: 'Invalid date format' };
        }
        console.log('End date is valid');
        return { isValid: true, message: '' };
      } catch (error) {
        console.error('Error validating end date:', error);
        return { isValid: false, message: 'Error validating date' };
      }

    case 'description':
      if (!value) return { isValid: false, message: 'Job description is required' };
      if (value.length < 10) return { isValid: false, message: 'Please provide a more detailed description' };
      return { isValid: true, message: '' };

    default:
      return { isValid: true, message: '' };
  }
};