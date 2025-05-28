import { useState, useRef, useCallback, useEffect } from 'react';
import { ValidationState, ValidationError } from '../types/validationTypes';
import { validatePersonalDetails } from './personalDetailsValidation';
import { validateWorkExperience } from './workExperienceValidation';
import { validateEducation } from './educationValidation';
import { validateSkills } from './skillsValidation';
import { validateCertification } from './certificationsValidation';
import dayjs from 'dayjs';
import { useAppSelector } from '../../../redux/hooks';
import { selectActiveStep } from '../../../redux/selectors/resumeSelectors';

interface UseFormValidationProps {
  initialValidationState: ValidationState;
  onValidationChange?: (isValid: boolean) => void;
}

export const useFormValidation = ({ initialValidationState, onValidationChange }: UseFormValidationProps) => {
  const [validationState, setValidationState] = useState<ValidationState>(initialValidationState);
  const fieldRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
  const activeStep = useAppSelector(selectActiveStep);
  const prevStep = useRef(activeStep);

  // Only reset validation state when moving to a new step
  useEffect(() => {
    if (prevStep.current !== activeStep) {
      // Preserve validation state for the current step
      setValidationState(prev => ({
        ...initialValidationState,
        ...(activeStep === 0 ? { personalDetails: prev.personalDetails } :
            activeStep === 1 ? { workExperience: prev.workExperience } :
            activeStep === 2 ? { education: prev.education } :
            activeStep === 3 ? { skills: prev.skills } :
            activeStep === 4 ? { certifications: prev.certifications } :
            activeStep === 5 ? { projects: prev.projects } : {})
      }));
      prevStep.current = activeStep;
    }
  }, [activeStep, initialValidationState]);

  // Cleanup refs when unmounting
  useEffect(() => {
    return () => {
      fieldRefs.current = {};
    };
  }, []);

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
      
      // Safe comparison using timestamps instead of isBefore
      const startTime = startDayjs.valueOf();
      const endTime = endDayjs.valueOf();
      
      console.log('Date range comparison:', { startTime, endTime });
      
      // End date should not be before start date
      const isValid = endTime >= startTime;
      console.log('Date range comparison result:', isValid ? 'Valid' : 'Invalid');
      return isValid;
    } catch (error) {
      console.error('Error in date validation:', error);
      return true; // On error, return valid to avoid blocking user
    }
  };

  const validateWorkExperienceDates = (index: number, startDate: any, endDate: any) => {
    if (!startDate && !endDate) return true;

    const isValid = isValidDateRange(startDate, endDate);
    
    setValidationState(prev => ({
      ...prev,
      workExperience: prev.workExperience.map((exp: any, i: number) => 
        i === index ? {
          ...exp,
          startDateValid: isValid,
          endDateValid: isValid,
          dateErrorMessage: isValid ? '' : 'End date must be after start date'
        } : exp
      )
    }));

    return isValid;
  };

  const handleBlur = useCallback((section: string, index: number, field: string, value: any) => {
    const { isValid, message } = validateField(section, index, field, value);

    setValidationState(prev => {
      // Handle nested validation state based on section
      if (section === 'personalDetails') {
        return {
          ...prev,
          personalDetails: {
            ...prev.personalDetails,
            [field]: {
              error: !isValid,
              message,
              touched: true
            }
          }
        };
      } else if (section === 'workExperience') {
        const updatedWorkExperience = [...(prev.workExperience || [])];
        if (!updatedWorkExperience[index]) {
          updatedWorkExperience[index] = {};
        }
        updatedWorkExperience[index] = {
          ...updatedWorkExperience[index],
          [field]: {
            error: !isValid,
            message,
            touched: true
          }
        };
        return {
          ...prev,
          workExperience: updatedWorkExperience
        };
      } else if (section === 'education') {
        const updatedEducation = [...(prev.education || [])];
        if (!updatedEducation[index]) {
          updatedEducation[index] = {};
        }
        updatedEducation[index] = {
          ...updatedEducation[index],
          [field]: {
            error: !isValid,
            message,
            touched: true
          }
        };
        return {
          ...prev,
          education: updatedEducation
        };
      }
      
      // Default case for other sections
      return {
        ...prev,
        [field]: {
          error: !isValid,
          message,
          touched: true
        }
      };
    });

    if (onValidationChange) {
      // Check validation state for the current section
      const sectionState = validationState[section] as Record<string, { error: boolean; touched: boolean }>;
      const isFormValid = Object.values(sectionState || {}).every(
        (field) => !field.error || !field.touched
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