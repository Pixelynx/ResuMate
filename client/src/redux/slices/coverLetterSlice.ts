import { createSlice, createAsyncThunk, PayloadAction, ActionReducerMapBuilder } from '@reduxjs/toolkit';
import { CoverLetterState } from '../types';
import { CoverLetter, CoverLetterFormData, CoverLetterGenerationRequest } from '../../components/coverLetter/types/coverLetterTypes';
import { coverLetterService } from '../../utils/api';

// Async thunks
export const fetchCoverLetters = createAsyncThunk(
  'coverLetter/fetchCoverLetters',
  async (_: void, { rejectWithValue }: { rejectWithValue: (value: string) => any }) => {
    try {
      const coverLetters = await coverLetterService.getAllCoverLetters();
      return coverLetters;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const fetchCoverLetterById = createAsyncThunk(
  'coverLetter/fetchCoverLetterById',
  async (id: string, { rejectWithValue }: { rejectWithValue: (value: string) => any }) => {
    try {
      const coverLetter = await coverLetterService.getCoverLetter(id);
      return coverLetter;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const createCoverLetter = createAsyncThunk(
  'coverLetter/createCoverLetter',
  async (formData: CoverLetterFormData, { rejectWithValue }: { rejectWithValue: (value: string) => any }) => {
    try {
      const response = await coverLetterService.createCoverLetter(formData);
      return response;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const updateCoverLetter = createAsyncThunk(
  'coverLetter/updateCoverLetter',
  async ({ id, formData }: { id: string; formData: Partial<CoverLetterFormData> }, { rejectWithValue }: { rejectWithValue: (value: string) => any }) => {
    try {
      const response = await coverLetterService.updateCoverLetter(id, formData);
      return response;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const deleteCoverLetter = createAsyncThunk(
  'coverLetter/deleteCoverLetter',
  async (id: string, { rejectWithValue }: { rejectWithValue: (value: string) => any }) => {
    try {
      await coverLetterService.deleteCoverLetter(id);
      return id;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const generateCoverLetter = createAsyncThunk(
  'coverLetter/generateCoverLetter',
  async (request: CoverLetterGenerationRequest, { rejectWithValue }: { rejectWithValue: (value: string) => any }) => {
    try {
      // Create default options if none provided
      const options = request.options || {
        tone: 'professional',
        length: 'medium',
        emphasis: []
      };
      const response = await coverLetterService.generateCoverLetter(request, options);
      return response;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

// Initial state
const initialState: CoverLetterState = {
  coverLetters: [],
  currentCoverLetter: null,
  loading: false,
  submitting: false,
  error: null,
  generationStatus: {
    isGenerating: false,
    error: null,
    progress: 0
  }
};

// Create the cover letter slice
const coverLetterSlice = createSlice({
  name: 'coverLetter',
  initialState,
  reducers: {
    setCurrentCoverLetter: (state: CoverLetterState, action: PayloadAction<CoverLetter | null>) => {
      state.currentCoverLetter = action.payload;
    },
    startGeneration: (state: CoverLetterState) => {
      state.generationStatus.isGenerating = true;
      state.generationStatus.progress = 0;
      state.generationStatus.error = null;
    },
    updateGenerationProgress: (state: CoverLetterState, action: PayloadAction<number>) => {
      state.generationStatus.progress = action.payload;
    },
    generationFailed: (state: CoverLetterState, action: PayloadAction<string>) => {
      state.generationStatus.isGenerating = false;
      state.generationStatus.error = action.payload;
    },
    resetGenerationStatus: (state: CoverLetterState) => {
      state.generationStatus = {
        isGenerating: false,
        error: null,
        progress: 0
      };
    },
    clearError: (state: CoverLetterState) => {
      state.error = null;
    },
    resetState: () => initialState
  },
  extraReducers: (builder: ActionReducerMapBuilder<CoverLetterState>) => {
    builder
      // Handle fetchCoverLetters
      .addCase(fetchCoverLetters.pending, (state: CoverLetterState) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCoverLetters.fulfilled, (state: CoverLetterState, action: PayloadAction<CoverLetter[]>) => {
        state.loading = false;
        state.coverLetters = action.payload;
      })
      .addCase(fetchCoverLetters.rejected, (state: CoverLetterState, action: any) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Handle fetchCoverLetterById
      .addCase(fetchCoverLetterById.pending, (state: CoverLetterState) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCoverLetterById.fulfilled, (state: CoverLetterState, action: PayloadAction<CoverLetter>) => {
        state.loading = false;
        state.currentCoverLetter = action.payload;
      })
      .addCase(fetchCoverLetterById.rejected, (state: CoverLetterState, action: any) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Handle createCoverLetter
      .addCase(createCoverLetter.pending, (state: CoverLetterState) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(createCoverLetter.fulfilled, (state: CoverLetterState, action: PayloadAction<CoverLetter>) => {
        state.submitting = false;
        state.coverLetters.push(action.payload);
        state.currentCoverLetter = action.payload;
      })
      .addCase(createCoverLetter.rejected, (state: CoverLetterState, action: any) => {
        state.submitting = false;
        state.error = action.payload as string;
      })
      
      // Handle updateCoverLetter
      .addCase(updateCoverLetter.pending, (state: CoverLetterState) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(updateCoverLetter.fulfilled, (state: CoverLetterState, action: PayloadAction<CoverLetter>) => {
        state.submitting = false;
        state.currentCoverLetter = action.payload;
        // Update the cover letter in the coverLetters array
        const index = state.coverLetters.findIndex((cl: CoverLetter) => cl.id === action.payload.id);
        if (index >= 0) {
          state.coverLetters[index] = action.payload;
        }
      })
      .addCase(updateCoverLetter.rejected, (state: CoverLetterState, action: any) => {
        state.submitting = false;
        state.error = action.payload as string;
      })
      
      // Handle deleteCoverLetter
      .addCase(deleteCoverLetter.pending, (state: CoverLetterState) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(deleteCoverLetter.fulfilled, (state: CoverLetterState, action: PayloadAction<string>) => {
        state.submitting = false;
        // Remove the cover letter from the coverLetters array
        state.coverLetters = state.coverLetters.filter((cl: CoverLetter) => cl.id !== action.payload);
        // Clear current cover letter if it was deleted
        if (state.currentCoverLetter && state.currentCoverLetter.id === action.payload) {
          state.currentCoverLetter = null;
        }
      })
      .addCase(deleteCoverLetter.rejected, (state: CoverLetterState, action: any) => {
        state.submitting = false;
        state.error = action.payload as string;
      })
      
      // Handle generateCoverLetter
      .addCase(generateCoverLetter.pending, (state: CoverLetterState) => {
        state.generationStatus.isGenerating = true;
        state.generationStatus.progress = 0;
        state.generationStatus.error = null;
        state.error = null;
      })
      .addCase(generateCoverLetter.fulfilled, (state: CoverLetterState, action: PayloadAction<CoverLetter>) => {
        state.generationStatus.isGenerating = false;
        state.generationStatus.progress = 100;
        state.coverLetters.push(action.payload);
        state.currentCoverLetter = action.payload;
      })
      .addCase(generateCoverLetter.rejected, (state: CoverLetterState, action: any) => {
        state.generationStatus.isGenerating = false;
        state.generationStatus.error = action.payload as string;
        state.error = action.payload as string;
      });
  }
});

// Export actions and reducer
export const {
  setCurrentCoverLetter,
  startGeneration,
  updateGenerationProgress,
  generationFailed,
  resetGenerationStatus,
  clearError,
  resetState
} = coverLetterSlice.actions;

export default coverLetterSlice.reducer; 