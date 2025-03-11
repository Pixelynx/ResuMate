// src/components/resume/validation/personalDetailsValidation.ts
import { validateName, validateEmail, validatePhone, validateUrl, validateLocation } from '../../../utils/validation';

export const validatePersonalDetails = (field: string, value: string) => {
  switch (field) {
    case 'firstName':
    case 'lastName':
      return {
        isValid: !validateName(value, field),
        message: validateName(value, field) || ''
      };
    case 'email':
      return {
        isValid: !validateEmail(value),
        message: validateEmail(value) || ''
      };
    case 'phone':
      return {
        isValid: !validatePhone(value),
        message: validatePhone(value) || ''
      };
    case 'location':
      return {
        isValid: !validateLocation(value),
        message: validateLocation(value) || ''
      };
    case 'linkedin':
    case 'website':
    case 'github':
    case 'instagram':
      return {
        isValid: !validateUrl(value),
        message: validateUrl(value) || ''
      };
    default:
      return { isValid: true, message: '' };
  }
};
// TEST