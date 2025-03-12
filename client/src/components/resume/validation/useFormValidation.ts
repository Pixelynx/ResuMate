// src/components/resume/validation/useFormValidation.ts
import { useState, useRef, useCallback } from 'react';
import { ValidationState, ValidationError } from '../types/validationTypes';
import { validatePersonalDetails } from './personalDetailsValidation';
import { validateWorkExperience } from './workExperienceValidation';
import { validateEducation } from './educationValidation';
import { validateSkills } from './skillsValidation';
import { validateCertification } from './certificationsValidation';

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