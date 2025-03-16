# Resumate Client

## Project Overview
This is the frontend client for the Resumate application, a web application that allows users to create, enhance, and evaluate resumes using AI integration. The application features a user-friendly interface for inputting resume details and provides suggestions for improvement.

## Features
- Create and save resumes
- AI-powered resume enhancement and evaluation
- User-friendly form for inputting resume details
- Real-time resume preview with professional formatting
- Backend persistence for saving and retrieving resume data

## Tech Stack
- Frontend: React with TypeScript
- UI Components: Material-UI (MUI)
- Form Management: Custom validation with React hooks
- Date Handling: Day.js for consistent date formatting
- API Communication: Axios for HTTP requests

## Project Structure
```
client/
├── public/         # Static files
├── src/            # Source code
│   ├── components/ # React components
│   │   ├── layouts/    # Layout components (Header, Footer)
│   │   ├── resume/     # Resume-related components
│   │   │   ├── types/      # TypeScript type definitions
│   │   │   ├── validation/ # Form validation logic
│   │   │   ├── ResumeForm.tsx    # Main form component
│   │   │   └── PreviewResume.tsx # Resume preview component
│   │   └── ...
│   ├── utils/      # Utility functions and API services
│   │   ├── api.ts       # API service for backend communication
│   │   └── validation.ts # Validation utilities
│   └── ...
└── ...
```

## Installation Instructions
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
- [ ] Refactor validation to better handle single-item sections without requiring index parameters
- [ ] Enhance date validation to check for reasonable date ranges and prevent future dates for past experiences
- [ ] Add form-level validation to ensure overall resume coherence and completeness
- [ ] Improve error message clarity and provide suggestions for fixing validation issues
- [ ] Add validation for file uploads (e.g., profile pictures, attachments)

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
- [x] Implement backend persistence for resume data
- [ ] Add form validation for all resume sections
- [ ] Improve the UI/UX of the application
- [ ] Add more AI-powered features for resume enhancement
- [ ] Add support for exporting resumes in different formats (PDF, DOCX)
- [ ] Implement user authentication
- [ ] Add multiple resume templates
- [ ] Implement ATS optimization suggestions

8.5 HRS 
