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

export const fetchJobFitScore = createAsyncThunk(
  'jobFit/fetchJobFitScore',
  async (coverLetterId: string, { rejectWithValue }: { rejectWithValue: (value: string) => any }) => {
    try {
      const response = await axios.get(`/api/job-fit-score/${coverLetterId}`);
      return response.data.data as JobFitScore;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return rejectWithValue(error.response.data.message || 'Failed to fetch job fit score');
      }
      return rejectWithValue((error as Error).message);
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