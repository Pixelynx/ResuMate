import { createSlice, createAsyncThunk, PayloadAction, ActionReducerMapBuilder } from '@reduxjs/toolkit';
import { ResumeState } from '../types';
import { Resume, ResumeFormData } from '../../components/resume/types/resumeTypes';
import { resumeService } from '../../utils/api';
import { validatePersonalDetails } from '../../components/resume/validation/personalDetailsValidation';
import dayjs from 'dayjs';

// Async thunks
export const fetchResumes = createAsyncThunk<Resume[], void>(
  'resume/fetchResumes',
  async (_: void, { rejectWithValue }) => {
    try {
      const resumes = await resumeService.getAllResumes();
      return resumes;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const fetchResumeById = createAsyncThunk<Resume, string>(
  'resume/fetchResumeById',
  async (id: string, { rejectWithValue }) => {
    try {
      const resume = await resumeService.getResumeById(id);
      return resume;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const createResume = createAsyncThunk<Resume, ResumeFormData>(
  'resume/createResume',
  async (formData: ResumeFormData, { rejectWithValue }) => {
    try {
      const response = await resumeService.createResume(formData);
      return response;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const updateResume = createAsyncThunk<
  Resume, 
  { id: string; formData: ResumeFormData }
>(
  'resume/updateResume',
  async ({ id, formData }, { rejectWithValue, dispatch }) => {
    try {
      console.log('UpdateResume thunk called with id:', id);
      console.log('Form data:', JSON.stringify(formData, null, 2));
      
      // Check date objects before sending to API
      formData.workExperience.forEach((exp, i) => {
        console.log(`Work experience ${i+1} dates before API call:`);
        console.log(`- startDate:`, exp.startDate, typeof exp.startDate);
        console.log(`- endDate:`, exp.endDate, typeof exp.endDate);
        
        // Ensure dates are serializable before sending to API
        if (exp.startDate && typeof exp.startDate === 'object' && exp.startDate.toString) {
          console.log(`- startDate toString():`, exp.startDate.toString());
        }
        if (exp.endDate && typeof exp.endDate === 'object' && exp.endDate.toString) {
          console.log(`- endDate toString():`, exp.endDate.toString());
        }
      });
      
      const response = await resumeService.updateResume(id, formData);
      console.log('API response received:', response);
      
      // If the response contains a resume, return it
      if (response) {
        return response;
      }
      
      // If updateResume doesn't return the resume data, fetch it
      try {
        console.log('Fetching updated resume data');
        const updatedResume = await resumeService.getResumeById(id);
        return updatedResume;
      } catch (fetchError) {
        console.error('Error fetching updated resume:', fetchError);
        // Fall back to formData if we can't fetch the updated resume
        return { 
          id, 
          ...formData, 
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        } as Resume;
      }
    } catch (error) {
      console.error('Error in updateResume thunk:', error);
      return rejectWithValue((error as Error).message);
    }
  }
);

export const deleteResume = createAsyncThunk<string, string>(
  'resume/deleteResume',
  async (id: string, { rejectWithValue }) => {
    try {
      await resumeService.deleteResume(id);
      return id;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

const validatePersonalDetailsSection = (personalDetails: any) => {
  const requiredFields = ['firstname', 'lastname', 'email', 'phone', 'location'];
  const validationResults: Record<string, { error: boolean; message: string; touched: boolean }> = {};
  let isValid = true;

  for (const field of requiredFields) {
    const value = personalDetails[field];
    const result = validatePersonalDetails(field, value);
    validationResults[field] = {
      error: !result.isValid,
      message: result.message,
      touched: true
    };
    if (!result.isValid) {
      isValid = false;
    }
  }

  return { isValid, validationResults };
};

// Initial state
const initialState: ResumeState = {
  resumes: [],
  currentResume: null,
  draftResume: null,
  activeStep: 0,
  loading: false,
  submitting: false,
  error: null,
  savedResumeId: null,
  validationErrors: {},
  parsingStatus: {
    isParsing: false,
    progress: 0,
    error: null
  }
};

// Create the resume slice
const resumeSlice = createSlice({
  name: 'resume',
  initialState,
  reducers: {
    // Form navigation actions
    setActiveStep: (state: ResumeState, action: PayloadAction<number>) => {
      state.activeStep = action.payload;
    },
    nextStep: (state: ResumeState) => {
      if (!state.draftResume) return;

      console.log('nextStep called, current step:', state.activeStep);
      
      if (state.activeStep === 0) {
        // Validate all required personal details fields
        const requiredFields = ['firstname', 'lastname', 'email', 'phone', 'location'];
        const { isValid, validationResults } = validatePersonalDetailsSection(state.draftResume.personalDetails);
        
        // Check if all required fields are valid and have been touched
        const allFieldsValid = requiredFields.every(field => {
          const fieldState = validationResults[field];
          return fieldState && !fieldState.error && fieldState.touched;
        });

        if (!isValid || !allFieldsValid) {
          state.validationErrors = validationResults;
          console.log('Please complete all required fields before proceeding');
          return;
        }
      }

      if (state.activeStep === 1) {
        console.log('Validating work experience data');
        const workExperience = state.draftResume.workExperience;
        
        // Log all work experience entries for debugging
        workExperience.forEach((entry, i) => {
          console.log(`Work exp #${i+1} validation:`, {
            startDate: entry.startDate,
            startDateType: entry.startDate ? typeof entry.startDate : 'undefined',
            endDate: entry.endDate,
            endDateType: entry.endDate ? typeof entry.endDate : 'undefined'
          });
        });
        
        // Create validation results with safe error handling
        let isValid = true;
        const validationResults = workExperience.map(entry => {
          // Initialize with valid states
          let startDateValid = true;
          let endDateValid = true;
          let dateErrorMessage = '';
          
          try {
            const startDate = entry.startDate;
            const endDate = entry.endDate;
            
            if (!startDate) {
              // Start date is required
              startDateValid = false;
              dateErrorMessage = 'Start date is required';
              isValid = false;
              console.log('Validation failed: Start date is required');
            } else if (endDate) {
              // Only validate end date if there is one (it's optional)
              let startDayjs, endDayjs;
              
              try {
                startDayjs = dayjs(startDate);
                endDayjs = dayjs(endDate);
              } catch (err) {
                console.error('Error creating dayjs objects:', err);
              }
              
              if (startDayjs && endDayjs) {
                console.log('Date comparison info:', {
                  startDayjs: startDayjs.isValid() ? startDayjs.format('YYYY-MM-DD') : 'Invalid date',
                  endDayjs: endDayjs.isValid() ? endDayjs.format('YYYY-MM-DD') : 'Invalid date',
                  startValid: startDayjs.isValid(),
                  endValid: endDayjs.isValid()
                });
                
                const startValid = startDayjs.isValid();
                const endValid = endDayjs.isValid();
                
                // Only compare dates if both are valid
                if (startValid && endValid) {
                  // Safe comparison - manually check values to avoid using isBefore
                  try {
                    const startTime = startDayjs.valueOf();
                    const endTime = endDayjs.valueOf();
                    
                    console.log('Comparing timestamps:', { startTime, endTime });
                    
                    if (endTime < startTime) {
                      endDateValid = false;
                      dateErrorMessage = 'End date must be after start date';
                      isValid = false;
                      console.log('Validation failed: End date is before start date');
                    }
                  } catch (compareErr) {
                    console.error('Error comparing date values:', compareErr);
                  }
                } else {
                  // One or both dates are invalid, but we'll let it pass
                  console.log('Invalid date format detected, skipping validation');
                }
              }
            }
          } catch (err) {
            console.error('Unexpected error during date validation:', err);
            // Don't block progression due to errors
          }
          
          return {
            startDateValid,
            endDateValid,
            dateErrorMessage
          };
        });
        
        // Final check, but don't block on validation errors
        if (!isValid) {
          // Update validationErrors for work experience dates
          state.validationErrors.workExperience = validationResults;
          console.log('Please fix date errors before proceeding');
          return;
        } else {
          console.log('All work experience dates are valid');
        }
      }

      console.log('Moving to next step:', state.activeStep + 1);
      state.activeStep += 1;
    },
    prevStep: (state: ResumeState) => {
      state.activeStep = Math.max(0, state.activeStep - 1);
    },
    
    updateDraftResume: (state: ResumeState, action: PayloadAction<Partial<ResumeFormData>>) => {
      state.draftResume = {
        ...state.draftResume as ResumeFormData,
        ...action.payload
      };
    },
    setDraftResume: (state: ResumeState, action: PayloadAction<ResumeFormData>) => {
      state.draftResume = action.payload;
    },
    initNewDraftResume: (state: ResumeState) => {
      state.draftResume = {
        personalDetails: {
          firstname: '',
          lastname: '',
          title: '',
          email: '',
          phone: '',
          location: '',
          linkedin: '',
          website: '',
          github: '',
          instagram: ''
        },
        workExperience: [{
          companyName: '',
          jobtitle: '',
          location: '',
          startDate: null,
          endDate: null,
          description: ''
        }],
        education: [{
          institutionName: '',
          degree: '',
          fieldOfStudy: '',
          location: '',
          graduationDate: null
        }],
        skills: {
          skills_: '',
          languages: ''
        },
        certifications: [{
          name: '',
          organization: '',
          dateObtained: null,
          expirationDate: null,
          credentialUrl: ''
        }],
        projects: [{
          title: '',
          role: '',
          duration: '',
          description: '',
          technologies: '',
          projectUrl: ''
        }]
      };
    },
    
    // Validation actions
    setValidationErrors: (state: ResumeState, action: PayloadAction<Record<string, any>>) => {
      state.validationErrors = action.payload;
    },
    
    // Parsing actions
    startParsing: (state: ResumeState) => {
      state.parsingStatus.isParsing = true;
      state.parsingStatus.progress = 0;
      state.parsingStatus.error = null;
    },
    updateParsingProgress: (state: ResumeState, action: PayloadAction<number>) => {
      state.parsingStatus.progress = action.payload;
    },
    parsingCompleted: (state: ResumeState, action: PayloadAction<ResumeFormData>) => {
      state.draftResume = action.payload;
      state.parsingStatus.isParsing = false;
      state.parsingStatus.progress = 100;
    },
    parsingFailed: (state: ResumeState, action: PayloadAction<string>) => {
      state.parsingStatus.isParsing = false;
      state.parsingStatus.error = action.payload;
    },
    
    // Update specific sections
    updatePersonalDetails: (state: ResumeState, action: PayloadAction<{ field: string; value: any }>) => {
      if (state.draftResume) {
        const { field, value } = action.payload;
        state.draftResume.personalDetails = {
          ...state.draftResume.personalDetails,
          [field]: value
        };
      }
    },
    updateWorkExperience: (state: ResumeState, action: PayloadAction<{ index: number; field: string; value: any }>) => {
      if (state.draftResume) {
        const { index, field, value } = action.payload;
        const updatedWorkExperience = [...state.draftResume.workExperience];
        updatedWorkExperience[index] = {
          ...updatedWorkExperience[index],
          [field]: value
        };
        state.draftResume.workExperience = updatedWorkExperience;
      }
    },
    addWorkExperience: (state: ResumeState) => {
      if (state.draftResume) {
        state.draftResume.workExperience.push({
          companyName: '',
          jobtitle: '',
          location: '',
          startDate: null,
          endDate: null,
          description: ''
        });
      }
    },
    removeWorkExperience: (state: ResumeState, action: PayloadAction<number>) => {
      if (state.draftResume && state.draftResume.workExperience.length > 1) {
        state.draftResume.workExperience = state.draftResume.workExperience.filter((_: any, i: number) => i !== action.payload);
      }
    },
    // Similar actions for education, certifications, and projects
    updateEducation: (state: ResumeState, action: PayloadAction<{ index: number; field: string; value: any }>) => {
      if (state.draftResume) {
        const { index, field, value } = action.payload;
        const updatedEducation = [...state.draftResume.education];
        updatedEducation[index] = {
          ...updatedEducation[index],
          [field]: value
        };
        state.draftResume.education = updatedEducation;
      }
    },
    addEducation: (state: ResumeState) => {
      if (state.draftResume) {
        state.draftResume.education.push({
          institutionName: '',
          degree: '',
          fieldOfStudy: '',
          location: '',
          graduationDate: null
        });
      }
    },
    removeEducation: (state: ResumeState, action: PayloadAction<number>) => {
      if (state.draftResume && state.draftResume.education.length > 1) {
        state.draftResume.education = state.draftResume.education.filter((_: any, i: number) => i !== action.payload);
      }
    },
    updateSkills: (state: ResumeState, action: PayloadAction<{ field: string; value: string }>) => {
      if (state.draftResume) {
        const { field, value } = action.payload;
        state.draftResume.skills = {
          ...state.draftResume.skills,
          [field]: value
        };
      }
    },
    updateCertification: (state: ResumeState, action: PayloadAction<{ index: number; field: string; value: any }>) => {
      if (state.draftResume) {
        const { index, field, value } = action.payload;
        const updatedCertifications = [...state.draftResume.certifications];
        updatedCertifications[index] = {
          ...updatedCertifications[index],
          [field]: value
        };
        state.draftResume.certifications = updatedCertifications;
      }
    },
    addCertification: (state: ResumeState) => {
      if (state.draftResume) {
        state.draftResume.certifications.push({
          name: '',
          organization: '',
          dateObtained: null,
          expirationDate: null,
          credentialUrl: ''
        });
      }
    },
    removeCertification: (state: ResumeState, action: PayloadAction<number>) => {
      if (state.draftResume && state.draftResume.certifications.length > 1) {
        state.draftResume.certifications = state.draftResume.certifications.filter((_: any, i: number) => i !== action.payload);
      }
    },
    updateProject: (state: ResumeState, action: PayloadAction<{ index: number; field: string; value: any }>) => {
      if (state.draftResume) {
        const { index, field, value } = action.payload;
        const updatedProjects = [...state.draftResume.projects];
        updatedProjects[index] = {
          ...updatedProjects[index],
          [field]: value
        };
        state.draftResume.projects = updatedProjects;
      }
    },
    addProject: (state: ResumeState) => {
      if (state.draftResume) {
        state.draftResume.projects.push({
          title: '',
          role: '',
          duration: '',
          description: '',
          technologies: '',
          projectUrl: ''
        });
      }
    },
    removeProject: (state: ResumeState, action: PayloadAction<number>) => {
      if (state.draftResume && state.draftResume.projects.length > 1) {
        state.draftResume.projects = state.draftResume.projects.filter((_: any, i: number) => i !== action.payload);
      }
    },
    
    // Misc actions
    clearError: (state: ResumeState) => {
      state.error = null;
    },
    resetState: () => initialState
  },
  extraReducers: (builder: ActionReducerMapBuilder<ResumeState>) => {
    builder
      // Handle fetchResumes
      .addCase(fetchResumes.pending, (state: ResumeState) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchResumes.fulfilled, (state: ResumeState, action: PayloadAction<Resume[]>) => {
        state.loading = false;
        state.resumes = action.payload;
      })
      .addCase(fetchResumes.rejected, (state: ResumeState, action: any) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Handle fetchResumeById
      .addCase(fetchResumeById.pending, (state: ResumeState) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchResumeById.fulfilled, (state: ResumeState, action: PayloadAction<Resume>) => {
        state.loading = false;
        state.currentResume = action.payload;
        state.draftResume = action.payload;
        state.savedResumeId = action.payload.id;
      })
      .addCase(fetchResumeById.rejected, (state: ResumeState, action: any) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Handle createResume
      .addCase(createResume.pending, (state: ResumeState) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(createResume.fulfilled, (state: ResumeState, action: PayloadAction<Resume>) => {
        state.submitting = false;
        state.resumes.push(action.payload);
        state.currentResume = action.payload;
        state.savedResumeId = action.payload.id;
      })
      .addCase(createResume.rejected, (state: ResumeState, action: any) => {
        state.submitting = false;
        state.error = action.payload as string;
      })
      
      // Handle updateResume
      .addCase(updateResume.pending, (state: ResumeState) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(updateResume.fulfilled, (state: ResumeState, action: PayloadAction<Resume>) => {
        state.submitting = false;
        state.currentResume = action.payload;
        state.savedResumeId = action.payload.id;
      })
      .addCase(updateResume.rejected, (state: ResumeState, action: any) => {
        state.submitting = false;
        state.error = action.payload as string;
      })
      
      // Handle deleteResume
      .addCase(deleteResume.pending, (state: ResumeState) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(deleteResume.fulfilled, (state: ResumeState, action: PayloadAction<string>) => {
        state.submitting = false;
        state.resumes = state.resumes.filter((r: Resume) => r.id !== action.payload);
        // Clear current resume if it was deleted
        if (state.currentResume && state.currentResume.id === action.payload) {
          state.currentResume = null;
        }
      })
      .addCase(deleteResume.rejected, (state: ResumeState, action: any) => {
        state.submitting = false;
        state.error = action.payload as string;
      });
  }
});

export const {
  setActiveStep,
  nextStep,
  prevStep,
  updateDraftResume,
  setDraftResume,
  initNewDraftResume,
  setValidationErrors,
  startParsing,
  updateParsingProgress,
  parsingCompleted,
  parsingFailed,
  updatePersonalDetails,
  updateWorkExperience,
  addWorkExperience,
  removeWorkExperience,
  updateEducation,
  addEducation,
  removeEducation,
  updateSkills,
  updateCertification,
  addCertification,
  removeCertification,
  updateProject,
  addProject,
  removeProject,
  clearError,
  resetState
} = resumeSlice.actions;

export default resumeSlice.reducer; 