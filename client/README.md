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

## Development Roadmap
- [ ] Implement simple resume builder
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
- [ ] Each step can include validation logic to ensure the data is correctly entered before proceeding to the next step.
- [ ] Validation can be implemented using form libraries like Formik or custom validation logic.

### Usage
- The `ResumeForm` component is used in the `/builder` route of the application.
- To use the component, navigate to the `/builder` path in your application.
  
  // Inside the Router component
  <Route path="/builder" element={<ResumeForm />} />
  ```

This component provides a structured way to gather comprehensive resume information from users, with a user-friendly interface and step-by-step guidance.


8.5 HRS 
