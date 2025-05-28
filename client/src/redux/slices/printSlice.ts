import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { PrintState } from '../types';

// Initial state
const initialState: PrintState = {
  isPrinting: false,
  printTarget: null,
  printId: null,
  printError: null
};

// Create the print slice
const printSlice = createSlice({
  name: 'print',
  initialState,
  reducers: {
    startPrinting: (state: PrintState, action: PayloadAction<{
      target: 'resume' | 'coverLetter';
      id: string;
    }>) => {
      const { target, id } = action.payload;
      state.isPrinting = true;
      state.printTarget = target;
      state.printId = id;
      state.printError = null;
    },
    printCompleted: (state: PrintState) => {
      state.isPrinting = false;
    },
    printFailed: (state: PrintState, action: PayloadAction<string>) => {
      state.isPrinting = false;
      state.printError = action.payload;
    },
    resetPrintState: () => initialState
  }
});

// Export actions and reducer
export const {
  startPrinting,
  printCompleted,
  printFailed,
  resetPrintState
} = printSlice.actions;

export default printSlice.reducer; 