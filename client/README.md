# Resumate

## Project Overview
Resumate is a web application that allows users to create, enhance, and evaluate resumes using AI integration. The application features a user-friendly interface for inputting resume details and provides suggestions for improvement.

## Features
- Create and save resumes
- AI-powered resume enhancement and evaluation
- User-friendly form for inputting resume details

## Tech Stack
- Frontend: React
- Backend: Express
- Database: PostgreSQL
- AI Integration: Custom AI models for resume enhancement and evaluation

## Installation Instructions
1. Clone the repository:
   ```bash
   git clone https://github.com/pixelynx/resumate.git
   cd resumate
   ```

2. Set up the server:
   ```bash
   cd server
   npm install
   npm run dev
   ```

3. Set up the client:
   ```bash
   cd client
   npm install
   npm start
   ```

4. Ensure PostgreSQL is running and create the database:
   ```sql
   CREATE DATABASE resumate-db;
   ```

5. Update the database configuration in `backend/config/db.config.js` with your PostgreSQL credentials.

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

## Development Roadmap
- [x] Implement simple resume builder
- [ ] Add form validation for all resume sections
- [ ] Improve the UI/UX of the application
- [ ] Add more AI-powered features for resume enhancement
- [ ] Add support for exporting resumes in different formats (PDF, DOCX)
- [ ] Implement user authentication

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
  
  // Inside the Router component
  <Route path="/builder" element={<ResumeForm />} />
  ```

This component provides a structured way to gather comprehensive resume information from users, with a user-friendly interface and step-by-step guidance.


8.5 HRS 
