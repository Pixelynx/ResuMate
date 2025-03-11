// src/components/resume/validation/certificationsValidation.ts
import { validateUrl } from '../../../utils/validation';
import dayjs from 'dayjs';

export const validateCertification = (field: string, value: any) => {
  switch (field) {
    case 'name':
      if (!value) return { isValid: false, message: 'Certification name is required' };
      if (value.length < 2) return { isValid: false, message: 'Certification name must be at least 2 characters' };
      return { isValid: true, message: '' };

    case 'organization':
      if (!value) return { isValid: false, message: 'Organization name is required' };
      if (value.length < 2) return { isValid: false, message: 'Organization name must be at least 2 characters' };
      return { isValid: true, message: '' };

    case 'dateObtained':
      if (!value) return { isValid: false, message: 'Date obtained is required' };
      if (dayjs(value).isAfter(dayjs())) return { isValid: false, message: 'Date obtained cannot be in the future' };
      return { isValid: true, message: '' };

    case 'credentialUrl':
      const urlError = validateUrl(value);
      return { isValid: !urlError, message: urlError || '' };

    default:
      return { isValid: true, message: '' };
  }
};