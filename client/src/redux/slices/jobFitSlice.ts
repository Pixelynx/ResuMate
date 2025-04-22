import { createSlice, createAsyncThunk, PayloadAction, ActionReducerMapBuilder } from '@reduxjs/toolkit';
import axios from 'axios';

export interface JobFitScore {
  score: number;
  explanation: string;
}

export interface JobFitState {
  score: number | null;
  explanation: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: JobFitState = {
  score: null,
  explanation: null,
  loading: false,
  error: null
};

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const fetchJobFitScore = createAsyncThunk<JobFitScore, string>(
  'jobFit/fetchJobFitScore',
  async (coverLetterId: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/job-fit-score/${coverLetterId}`);
      
      if (response.data && response.data.data) {
        return response.data.data as JobFitScore;
      } else if (response.data) {
        return response.data as JobFitScore;
      } else {
        return rejectWithValue('Invalid response format from server');
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return rejectWithValue(
          error.response.data?.message || 'Failed to fetch job fit score'
        );
      }
      return rejectWithValue('An unexpected error occurred');
    }
  }
);

const jobFitSlice = createSlice({
  name: 'jobFit',
  initialState,
  reducers: {
    resetJobFitScore: (state: JobFitState) => {
      state.score = null;
      state.explanation = null;
      state.error = null;
    }
  },
  extraReducers: (builder: ActionReducerMapBuilder<JobFitState>) => {
    builder
      .addCase(fetchJobFitScore.pending, (state: JobFitState) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchJobFitScore.fulfilled, (state: JobFitState, action: PayloadAction<JobFitScore>) => {
        state.loading = false;
        state.score = action.payload.score;
        state.explanation = action.payload.explanation;
      })
      .addCase(fetchJobFitScore.rejected, (state: JobFitState, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

export const { resetJobFitScore } = jobFitSlice.actions;

export default jobFitSlice.reducer; 