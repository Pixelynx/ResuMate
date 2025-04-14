import { RootState } from '../types';

export const selectResumes = (state: RootState) => state.resume.resumes;
export const selectCurrentResume = (state: RootState) => state.resume.currentResume;
export const selectDraftResume = (state: RootState) => state.resume.draftResume;
export const selectActiveStep = (state: RootState) => state.resume.activeStep;
export const selectResumeLoading = (state: RootState) => state.resume.loading;
export const selectResumeSubmitting = (state: RootState) => state.resume.submitting;
export const selectResumeError = (state: RootState) => state.resume.error;
export const selectSavedResumeId = (state: RootState) => state.resume.savedResumeId;
export const selectValidationErrors = (state: RootState) => state.resume.validationErrors;
export const selectParsingStatus = (state: RootState) => state.resume.parsingStatus;

export const selectPersonalDetails = (state: RootState) => 
  state.resume.draftResume ? state.resume.draftResume.personalDetails : null;

export const selectWorkExperience = (state: RootState) => 
  state.resume.draftResume ? state.resume.draftResume.workExperience : [];

export const selectEducation = (state: RootState) => 
  state.resume.draftResume ? state.resume.draftResume.education : [];

export const selectSkills = (state: RootState) => 
  state.resume.draftResume ? state.resume.draftResume.skills : null;

export const selectCertifications = (state: RootState) => 
  state.resume.draftResume ? state.resume.draftResume.certifications : [];

export const selectProjects = (state: RootState) => 
  state.resume.draftResume ? state.resume.draftResume.projects : [];

// Section complete status selectors for form navigation
export const selectPersonalDetailsComplete = (state: RootState) => {
  const personalDetails = selectPersonalDetails(state);
  if (!personalDetails) return false;
  
  return !!(
    personalDetails.firstname &&
    personalDetails.lastname &&
    personalDetails.email &&
    personalDetails.phone &&
    personalDetails.location
  );
};

export const selectWorkExperienceComplete = (state: RootState) => {
  const workExperience = selectWorkExperience(state);
  return workExperience.some(exp => 
    exp.companyName && exp.jobtitle && exp.location && exp.startDate
  );
};

export const selectEducationComplete = (state: RootState) => {
  const education = selectEducation(state);
  return education.some(edu => 
    edu.institutionName && edu.degree && edu.fieldOfStudy
  );
}; 