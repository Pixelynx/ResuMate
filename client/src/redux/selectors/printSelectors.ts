import { RootState } from '../types';

export const selectIsPrinting = (state: RootState) => state.print.isPrinting;
export const selectPrintTarget = (state: RootState) => state.print.printTarget;
export const selectPrintId = (state: RootState) => state.print.printId;
export const selectPrintError = (state: RootState) => state.print.printError;

export const selectShouldShowIcons = (state: RootState) => !state.print.isPrinting;
export const selectIsPrintingResume = (state: RootState) => 
  state.print.isPrinting && state.print.printTarget === 'resume';
export const selectIsPrintingCoverLetter = (state: RootState) => 
  state.print.isPrinting && state.print.printTarget === 'coverLetter'; 