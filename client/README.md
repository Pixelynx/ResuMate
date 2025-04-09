# Resumate Client

## Project Overview
The Resumate client is the frontend application for Resumate, an AI-powered resume and cover letter creation platform. Built with React, TypeScript, and Material UI, it provides a comprehensive user interface for creating professional resumes, generating cover letters, and evaluating job fit with AI assistance.

## Key Features
- **Multi-step Resume Builder**: Intuitive form with comprehensive validation for creating detailed resumes
- **Cover Letter Generator**: AI-powered cover letter creation based on resume data and job preferences
- **Job Fit Analysis**: Visual scoring system showing how well a resume matches a job description
- **Resume Parser**: Extract information from uploaded .docx and .txt files to populate resume forms
- **Document Preview & Printing**: Real-time preview and print-ready formatting of documents
- **Form Validation**: Comprehensive validation system for all inputs with error messaging
- **Responsive Design**: Mobile-friendly UI that works across devices

## Tech Stack
- **Framework**: React with TypeScript
- **UI Components**: Material-UI (MUI)
- **State Management**: Redux with Redux Toolkit
- **Form Management**: Custom validation with React hooks
- **Date Handling**: Day.js for consistent date formatting and manipulation
- **API Communication**: Axios for HTTP requests
- **Document Parsing**: mammoth.js for DOCX parsing
- **Animations**: Emotion for keyframe animations

## Project Structure
```
client/
├── public/         # Static files
├── src/            # Source code
│   ├── components/ # React components
│   │   ├── common/     # Shared components (LoadingOverlay, etc.)
│   │   ├── coverLetter/# Cover letter components
│   │   │   ├── types/      # TypeScript type definitions
│   │   │   ├── CoverLetterForm.tsx   # Cover letter creation form
│   │   │   ├── EditCoverLetter.tsx   # Cover letter editing interface
│   │   │   ├── JobScore.tsx          # Job fit scoring component
│   │   │   └── CoverLetterFormStepper.tsx # Multi-step navigation
│   │   ├── resume/     # Resume-related components
│   │   │   ├── types/      # TypeScript type definitions
│   │   │   ├── validation/ # Form validation logic
│   │   │   ├── ResumeForm.tsx    # Main resume form component
│   │   │   ├── ResumeParser.tsx  # Document parsing component
│   │   │   ├── ResumeFormStepper.tsx # Multi-step navigation
│   │   │   └── PreviewResume.tsx # Resume preview component
│   │   ├── print/      # Print-related components
│   │   │   ├── PrintController.tsx   # Print control interface
│   │   │   ├── PrintableResume.tsx   # Print-formatted resume
│   │   │   └── PrintableCoverLetter.tsx # Print-formatted cover letter
│   │   ├── dashboard/  # Dashboard components
│   │   └── layouts/    # Layout components (Header, Footer)
│   ├── redux/      # Redux state management
│   │   ├── slices/     # Redux slices (resumeSlice, coverLetterSlice, jobFitSlice)
│   │   ├── selectors/  # State selectors
│   │   ├── hooks.ts    # Custom Redux hooks
│   │   ├── store.ts    # Redux store configuration
│   │   └── types.ts    # Redux state type definitions
│   ├── utils/      # Utility functions
│   │   ├── api/        # API service for backend communication
│   │   ├── validation.ts # Validation utilities
│   │   └── formatting.ts # Data formatting utilities
│   ├── App.tsx     # Main application component
│   └── index.tsx   # Application entry point
└── CHANGELOG.md    # Project changelog
```

## Component Features

### Resume Builder
The resume builder is implemented as a multi-step form with the following sections:
1. **Personal Details**: Basic contact and professional information
2. **Work Experience**: Employment history with detailed descriptions
3. **Education**: Academic background and achievements
4. **Skills**: Technical and soft skills categorization
5. **Certifications**: Professional certifications and credentials
6. **Projects**: Portfolio projects with descriptions and technologies
7. **Preview**: Real-time professional preview of the resume

Key features include:
- Dynamic addition/removal of entries in each section
- Date validation to ensure chronological accuracy
- Real-time form validation with error messaging
- Automatic data serialization for Redux storage
- Resume parsing from uploaded documents

### Cover Letter Generator
The cover letter generator provides:
- AI-powered content generation based on resume and job details
- Customizable tone and focus areas
- Real-time progress visualization during generation
- Easy editing of generated content
- Integration with existing resume data

### Job Fit Scoring
The job fit scoring component offers:
- Visual score display with color-coding based on match quality
- AI-generated personalized feedback about the match
- Component-level analysis of different resume sections
- Modal display with animated presentation of results
- User-friendly messaging for service unavailability

## State Management

### Redux Implementation
The application uses Redux with Redux Toolkit for state management:
- **Slices**: Modular state organization by feature (resume, coverLetter, jobFit)
- **Async Thunks**: Handling asynchronous operations with proper loading states
- **Selectors**: Efficient state access with memoized selectors
- **Action Creators**: Typed action creators for predictable state updates

### Form State
Form state is managed through a combination of:
- Redux for persistent form data
- Local component state for UI interactions
- Custom validation hooks for form validation state

## Form Validation System
The custom validation system includes:
- Field-level validation with specific rules for each field type
- Real-time validation feedback as users type
- Cross-field validation (e.g., ensuring end dates come after start dates)
- Blocking form progression when validation fails
- Special handling for nested array fields (e.g., multiple work experiences)
- Date validation that safely handles various date formats and edge cases

## API Integration
API integration is implemented using:
- Service-based architecture for API calls
- Typed request and response interfaces
- Error handling with user-friendly messages
- Loading state management for UI feedback
- Response transformation for consistent data formats

## Installation and Development
1. Ensure you're in the client directory:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Build for production:
   ```bash
   npm run build
   ```

The application will run on `http://localhost:3000` by default and requires the backend server to be running for full functionality.

## Validation
- [ ] Form validation has been implemented for fields using a custom validation system:
   - [x] Personal Details
   - [x] Work Experience
   - [ ] Education
   - [ ] Skills
   - [ ] Certification
   - [ ] Project
- [x] Real-time validation with visual feedback for invalid fields
- [x] Phone number format validation
- [x] Date validation to ensure chronological order (end dates after start dates)
- [x] Required field validation with appropriate error messages
- [x] URL and email format validation

### Validation Implementation
The form uses a custom validation system with the following components:

1. **useFormValidation Hook**: A custom hook that manages validation state and provides validation functions.
2. **Field-Level Validation**: Each field is validated individually with specific rules.
3. **Section-Level Validation**: Sections like Work Experience have their own validation logic.
4. **Date Validation**: Special handling for date fields to ensure chronological order.
5. **Real-Time Feedback**: Users receive immediate feedback when fields are invalid.

### Future Validation Enhancements
- [ ] Enhance date validation to check for reasonable date ranges and prevent future dates for past experiences
- [ ] Improve error message clarity and provide suggestions for fixing validation issues
- [ ] Add validation for file uploads (e.g., attachments)

## Resume Preview Component

### Overview
The `PreviewResume` component provides a real-time, professionally formatted view of the user's resume as they build it. It transforms the form data into a visually appealing resume layout.

### Features
- **Professional Layout**: Clean, modern design with proper spacing and typography
- **Dynamic Content Rendering**: Only displays sections that contain data
- **Responsive Design**: Adapts to different screen sizes
- **Visual Elements**:
  - Material-UI icons for contact information and social media links
  - Chips for displaying skills and technologies
  - Proper date formatting using Day.js
  - Hierarchical typography to emphasize important information

### Component Structure
The component is organized into distinct sections that mirror a professional resume:
- **Header/Personal Details**: Name, title, and contact information
- **Work Experience**: Chronological list of jobs with descriptions
- **Education**: Academic background with degree information
- **Skills**: Technical skills and languages displayed as chips
- **Certifications**: Professional certifications with dates and links
- **Projects**: Portfolio projects with descriptions and technology tags

### Implementation Details
- Uses Material-UI components for consistent styling
- Implements conditional rendering to handle optional fields
- Formats dates consistently using Day.js
- Uses typography variants to create visual hierarchy
- Incorporates icons to enhance readability and visual appeal
- Employs responsive design principles for optimal viewing on different devices

### Usage
The `PreviewResume` component is used as the final step in the multi-step form:

```jsx
<ResumePreview formData={formData} />
```

It receives the complete `formData` object containing all resume sections and renders them in a professional format.

### Data Persistence
- The preview is connected to the backend through the API service
- When users save their resume, the data is persisted to the database
- Users can retrieve and update their resumes, with changes reflected in the preview

## Multi-Step Form Component

### Overview
The `ResumeForm` component is a multi-step form designed to collect user resume information. It is implemented using React, TypeScript, and Material-UI (MUI) components.

### Structure
- **Steps**: The form is divided into several steps, each representing a section of the resume:
  1. Personal Details
  2. Work Experience
  3. Education
  4. Skills
  5. Certifications
  6. Projects
  7. Preview (uses the PreviewResume component)
- **Navigation**: Users can navigate between steps using "Next" and "Back" buttons.
- **State Management**: The form state is managed using React's `useState` hook.

### Validation
- Each step includes validation logic to ensure data is correctly entered before proceeding to the next step
- Validation is implemented using a custom validation system with the `useFormValidation` hook
- Real-time validation provides immediate feedback to users
- Form progression is blocked if the current step contains validation errors
- Special validation for date fields ensures chronological order (e.g., end dates after start dates)
- Required fields are clearly marked and validated

### Usage
- The `ResumeForm` component is used in the `/builder` route of the application.
- To use the component, navigate to the `/builder` path in your application.
  ```jsx
  // Inside the Router component
  <Route path="/builder" element={<ResumeForm />} />
  ```

This component provides a structured way to gather comprehensive resume information from users, with a user-friendly interface and step-by-step guidance.

## Development Roadmap
- [x] Implement simple resume builder
- [x] Add resume preview functionality
- [ ] Add form validation for all resume sections
- [ ] Implement document parsing to automatically extract resume data
- [ ] Improve the UI/UX of the application
- [ ] Add support for exporting resumes in different formats (PDF, DOCX)
- [ ] Add multiple resume templates
