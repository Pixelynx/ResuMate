// src/components/resume/validation/useFormValidation.ts
import { useState, useRef, useCallback } from 'react';
import { ValidationState, ValidationError } from '../types/validationTypes';
import { validatePersonalDetails } from './personalDetailsValidation';
import { validateWorkExperience } from './workExperienceValidation';
import { validateEducation } from './educationValidation';
import { validateSkills } from './skillsValidation';
import { validateCertification } from './certificationsValidation';
import dayjs from 'dayjs';

interface UseFormValidationProps {
  initialValidationState: ValidationState;
  onValidationChange?: (isValid: boolean) => void;
}

export const useFormValidation = ({ initialValidationState, onValidationChange }: UseFormValidationProps) => {
  const [validationState, setValidationState] = useState<ValidationState>(initialValidationState);
  const fieldRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  const validateField = useCallback((section: string, index: number, field: string, value: any) => {
    switch (section) {
      case 'personalDetails':
        return validatePersonalDetails(field, value);
      case 'workExperience':
        return validateWorkExperience(field, value);
      case 'education':
        return validateEducation(field, value);
      case 'skills':
        return validateSkills(field, value);
      case 'certifications':
        return validateCertification(field, value);
      default:
        return { isValid: true, message: '' };
    }
  }, []);

  // Validate if end date is after start date
  const isValidDateRange = (startDate: any, endDate: any): boolean => {
    console.log('Checking date range:', { startDate, endDate });
    
    // If either date is missing, consider it valid
    if (!startDate || !endDate) {
      console.log('Missing date, returning valid');
      return true;
    }
    
    try {
      // Convert to dayjs objects and check validity
      const startDayjs = dayjs(startDate);
      const endDayjs = dayjs(endDate);
      
      console.log('Date objects:', {
        startDayjs: startDayjs.format ? startDayjs.format('YYYY-MM-DD') : 'Invalid date',
        endDayjs: endDayjs.format ? endDayjs.format('YYYY-MM-DD') : 'Invalid date',
        startValid: startDayjs.isValid(),
        endValid: endDayjs.isValid()
      });
      
      // Only compare if both are valid dayjs objects
      if (!startDayjs.isValid() || !endDayjs.isValid()) {
        console.log('Invalid date object detected, returning valid to avoid blocking');
        return true; // Consider invalid dates as valid to avoid blocking progression
      }
      
      // Safe comparison
      const result = !endDayjs.isBefore(startDayjs); // End date should not be before start date
      console.log('Date range comparison result:', result ? 'Valid' : 'Invalid');
      return result;
    } catch (error) {
      console.error('Error in date validation:', error);
      return true; // On error, return valid to avoid blocking user
    }
  };

  const validateWorkExperienceDates = (index: number, startDate: any, endDate: any) => {
    console.log(`Validating work experience dates at index ${index}:`, { startDate, endDate });
    let isValid = true;
    let errorMessage = '';

    if (!startDate) {
      isValid = false;
      errorMessage = 'Start date is required';
      console.log('Validation failed: Start date is required');
    }
    // Check if end date is after start date (if both are provided)
    else if (startDate && endDate) {
      try {
        const validRange = isValidDateRange(startDate, endDate);
        if (!validRange) {
          isValid = false;
          errorMessage = 'End date must be after start date';
          console.log('Validation failed: End date must be after start date');
        }
      } catch (error) {
        console.error('Error during date range validation:', error);
        // Don't mark as invalid on error to prevent blocking the user
      }
    }

    setValidationState(prev => {
      const updatedWorkExperience = [...prev.workExperience];
      if (updatedWorkExperience[index]) {
        updatedWorkExperience[index] = {
          ...updatedWorkExperience[index],
          startDateValid: startDate ? true : false,
          endDateValid: isValid,
          dateErrorMessage: errorMessage
        };
      }
      return {
        ...prev,
        workExperience: updatedWorkExperience
      };
    });

    return isValid;
  };

  const handleBlur = useCallback((section: string, index: number, field: string, value: any) => {
    const { isValid, message } = validateField(section, index, field, value);

    setValidationState(prev => ({
      ...prev,
      [field]: {
        error: !isValid,
        message,
        touched: true
      }
    }));

    if (onValidationChange) {
      const isFormValid = Object.values(validationState).every(
        field => !field.error || !field.touched
      );
      onValidationChange(isFormValid);
    }
  }, [validateField, onValidationChange, validationState]);

  const validateSection = useCallback((section: string, index: number, data: any) => {
    const errors: ValidationError[] = [];
    Object.entries(data).forEach(([field, value]) => {
      const { isValid, message } = validateField(section, index, field, value);
      if (!isValid) {
        errors.push({
          fieldName: field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1'),
          message,
          fieldId: `${section}-${field}`
        });
      }
    });
    return errors;
  }, [validateField]);

  return {
    setValidationState,
    validationState,
    fieldRefs,
    handleBlur,
    validateSection,
    validateWorkExperienceDates,
    getActiveErrors: useCallback((): ValidationError[] => {
      return Object.entries(validationState)
        .filter(([_, state]) => state.error && state.touched)
        .map(([field, state]) => ({
          fieldName: field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1'),
          message: state.message,
          fieldId: field
        }));
    }, [validationState]),
    handleErrorClick: useCallback((fieldId: string) => {
      fieldRefs.current[fieldId]?.focus();
    }, [])
  };
};