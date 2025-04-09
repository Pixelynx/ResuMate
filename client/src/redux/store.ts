import { configureStore, combineReducers, Action } from '@reduxjs/toolkit';
import { ThunkAction } from 'redux-thunk';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import resumeReducer from './slices/resumeSlice';
import coverLetterReducer from './slices/coverLetterSlice';
import printReducer from './slices/printSlice';
import jobFitReducer from './slices/jobFitSlice';

// Configure persist options
const resumePersistConfig = {
  key: 'resume',
  storage,
  whitelist: [] // Only persist draft and ID
};

const coverLetterPersistConfig = {
  key: 'coverLetter',
  storage,
  whitelist: []
};

const printPersistConfig = {
  key: 'print',
  storage,
  whitelist: []
};

const jobFitPersistConfig = {
  key: 'jobFit',
  storage,
  whitelist: []
};

// Create the root reducer with persisted slices
const rootReducer = combineReducers({
  resume: persistReducer(resumePersistConfig, resumeReducer),
  coverLetter: persistReducer(coverLetterPersistConfig, coverLetterReducer),
  print: persistReducer(printPersistConfig, printReducer),
  jobFit: persistReducer(jobFitPersistConfig, jobFitReducer)
});

// Create the Redux store
export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore non-serializable values like Date objects
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
        ignoredPaths: ['resume.draftResume']
      }
    })
});

// Create the persisted store
export const persistor = persistStore(store);

// Export types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>; 