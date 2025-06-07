import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import {
  addWorkExperience,
  removeWorkExperience,
  updateWorkExperience,
  addEducation,
  removeEducation,
  updateEducation,
  addCertification,
  removeCertification,
  updateCertification,
  addProject,
  removeProject,
  updateProject,
  updateSkills
} from '../redux/slices/resumeSlice';
import { selectDraftResume } from '../redux/selectors/resumeSelectors';
import { WorkExperience, Education, Certification, Project, Skills } from '../components/resume/types/resumeTypes';

type SectionType = 'workExperience' | 'education' | 'certifications' | 'projects' | 'skills';

type SectionData<T extends SectionType> = 
  T extends 'workExperience' ? WorkExperience[] :
  T extends 'education' ? Education[] :
  T extends 'certifications' ? Certification[] :
  T extends 'projects' ? Project[] :
  T extends 'skills' ? Skills :
  never;

interface SectionManager<T extends SectionType> {
  data: SectionData<T> | null;
  addItem: () => void;
  removeItem: (index: number) => void;
  updateItem: (index: number, field: string, value: any) => void;
  isEmpty: () => boolean;
}

/**
 * Custom hook for managing resume sections
 * @param sectionType The type of section to manage
 * @returns Object containing section data and management functions
 */
export const useSectionManager = <T extends SectionType>(sectionType: T): SectionManager<T> => {
  const dispatch = useAppDispatch();
  const draftResume = useAppSelector(selectDraftResume);

  const getSectionData = useCallback((): SectionData<T> | null => {
    if (!draftResume) return null;
    return (draftResume[sectionType] as SectionData<T>) || null;
  }, [draftResume, sectionType]);

  const addItem = useCallback(() => {
    if (sectionType === 'skills') return; // Skills section doesn't support adding items
    
    switch (sectionType) {
      case 'workExperience':
        dispatch(addWorkExperience());
        break;
      case 'education':
        dispatch(addEducation());
        break;
      case 'certifications':
        dispatch(addCertification());
        break;
      case 'projects':
        dispatch(addProject());
        break;
    }
  }, [dispatch, sectionType]);

  const removeItem = useCallback((index: number) => {
    if (sectionType === 'skills') return; // Skills section doesn't support removing items
    
    switch (sectionType) {
      case 'workExperience':
        dispatch(removeWorkExperience(index));
        break;
      case 'education':
        dispatch(removeEducation(index));
        break;
      case 'certifications':
        dispatch(removeCertification(index));
        break;
      case 'projects':
        dispatch(removeProject(index));
        break;
    }
  }, [dispatch, sectionType]);

  const updateItem = useCallback((index: number, field: string, value: any) => {
    switch (sectionType) {
      case 'workExperience':
        dispatch(updateWorkExperience({ index, field, value }));
        break;
      case 'education':
        dispatch(updateEducation({ index, field, value }));
        break;
      case 'certifications':
        dispatch(updateCertification({ index, field, value }));
        break;
      case 'projects':
        dispatch(updateProject({ index, field, value }));
        break;
      case 'skills':
        dispatch(updateSkills({ field, value }));
        break;
    }
  }, [dispatch, sectionType]);

  const isEmpty = useCallback(() => {
    const data = getSectionData();
    if (!data) return true;
    
    if (Array.isArray(data)) {
      return data.length === 0;
    }
    
    // For skills section
    if (sectionType === 'skills') {
      return !data.skills_ && !data.languages;
    }
    
    return false;
  }, [getSectionData, sectionType]);

  return {
    data: getSectionData(),
    addItem,
    removeItem,
    updateItem,
    isEmpty
  };
}; 