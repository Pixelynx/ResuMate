# Resumate

## Project Overview
Resumate is an AI-powered resume and cover letter creation platform designed to help job seekers create professional documents that improve their chances of landing interviews. The application combines traditional document creation with advanced AI capabilities for job fit scoring, customized cover letter generation, and resume optimization.

![Job Score](./demo/resumate-job-score-cropped.png)

## Contents
* [Demo](./client/demo.md)
* [Key Features](#key-features)
* [Technical Implementation](#technical-implementation)
* [Getting Started](#getting-started)
* [Component Architechture](#component-architecture)

## Key Features
- **Resume Builder**: Intuitive multi-step form with comprehensive validation for creating detailed resumes
- **Cover Letter Generator**: AI-powered cover letter creation based on resume data and job details
- **Job Fit Analysis**: Scoring system using OpenAI embeddings to evaluate how well a resume matches a job description
- **Resume Parser**: Automatically extract information from uploaded .docx and .txt files to populate resume forms
- **Document Management**: Save, view, edit, and print resumes and cover letters

## Technical Implementation

### AI Integration
- **Embedding-based Job Scoring**: Utilizes OpenAI's text-embedding-ada-002 model to calculate semantic similarity between resumes and job descriptions
- **Personalized Feedback**: AI-generated explanations for job fit scores with actionable improvement suggestions
- **Cover Letter Generation**: Context-aware cover letter creation with customizable tone, length, and focus areas

### Architecture
- **Frontend**: React with TypeScript and Material UI for a responsive, accessible interface
- **Backend**: Node.js/Express server handling API requests and AI integrations
- **State Management**: Redux for centralized state with slice-based organization
- **Database**: PostgreSQL with Sequelize ORM for data persistence
- **API Communication**: RESTful API design with structured request/response patterns

## Getting Started

### Prerequisites
- Node.js (v14+)
- PostgreSQL database
- OpenAI API key for AI features

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/username/resumate.git
   cd resumate
   ```

2. Install server dependencies:
   ```bash
   cd server
   npm install
   ```

3. Configure environment variables in `server/.env`:
   ```
   DB_NAME=resumate_db
   DB_USER=your_db_user
   DB_PASSWORD=your_db_password
   DB_HOST=localhost
   OPENAI_API_KEY=your_openai_api_key
   PORT=5000
   ```

4. Set up the database:
   ```bash
   npm run migrate
   ```

5. Install client dependencies:
   ```bash
   cd ../client
   npm install
   ```

6. Start the development servers:
   
   Server:
   ```bash
   cd ../server
   npm run dev
   ```
   
   Client:
   ```bash
   cd ../client
   npm start
   ```

## Component Architecture

### Resume Creation Flow
1. Multi-step form with validation at each step
2. Optional resume parsing to extract data from existing documents (Currently Disabled)
3. Real-time preview of the resume being created
4. Form validation ensures data integrity
5. Redux-based state management for consistent data handling

### Job Fit Scoring System
1. Resume content and job descriptions are converted to vector embeddings
2. Semantic similarity calculated using cosine similarity between vectors
3. Component-level scoring for different resume sections
4. AI-generated personalized feedback based on the analysis
5. Color-coded scoring display with detailed explanations

### Cover Letter Generation
1. User inputs job details and selects their resume
2. AI analyzes the resume content and job description
3. Generation process considers tone, length, and focus preferences
4. User can review and edit the generated content
5. Final cover letter can be saved, printed, or further customized

## Technology Stack
- **Frontend**: React, TypeScript, Material UI, Redux Toolkit
- **Backend**: Node.js, Express, Sequelize ORM
- **Database**: PostgreSQL
- **AI Integration**: OpenAI API (GPT-3.5, text-embedding-ada-002)
- **Document Handling**: mammoth.js for DOCX parsing
- **Date Management**: Day.js for consistent date handling
- **Form Management**: Custom validation system with React hooks

# ResuMate Mobile Responsiveness Enhancement

This document outlines the mobile responsiveness enhancements implemented in the ResuMate application to improve the user experience on mobile devices.

## Key Enhancements

### Resume Dashboard Tab
- Added title fields with character limits (40 chars) to prevent overflow issues
- Implemented text truncation with ellipsis for long titles
- Increased touch targets to at least 44×44px for all interactive elements
- Optimized skills display:
  - Limited to 3 most relevant skills on mobile to conserve space
  - Added tappable "+X more" chip to expand the full skills list in a dialog
- Improved menu button positioning with adequate touch area

### Cover Letter Dashboard Tab
- Implemented consistent card height with resume components for visual harmony
- Enhanced visual hierarchy with bold headers and subtle creation dates
- Added proper text truncation for all header elements
- Included visual indicator showing whether a cover letter is linked to a specific resume

### Builder Pages (Resume & Cover Letter)
- Converted steppers to a more mobile-friendly layout:
  - Icon-only squares in mobile view
  - Clear visual indicators for active/completed states
  - Horizontal scrollable layout on mobile
  - Improved touch targets

### Viewer Pages
- Implemented minimum button sizes of 48×48px with proper spacing between interactive elements
- Added pinch-to-zoom functionality for document viewing
- Implemented pull-to-refresh capability to reload documents
- Added floating action buttons (FABs) for mobile views:
  - Positioned in easily accessible locations
  - Provided adequate spacing between buttons
  - Implemented proper visual hierarchy through color and positioning
- Added haptic feedback for button interactions (vibration)

### Technical Improvements
- Added responsive layout adaptations based on viewport size
- Implemented content-aware breakpoints rather than device-specific ones
- Added skeleton loading states during data fetching
- Enhanced touch interaction handling for mobile gestures
- Improved accessibility with proper ARIA attributes
- Created a consistent spacing system across components

## Usage Notes

- **Pinch-to-zoom**: On mobile devices, you can use the standard pinch gesture to zoom in on resume and cover letter content
- **Pull-to-refresh**: Pull down from the top of the screen to refresh content when viewing resumes and cover letters
- **Floating Action Buttons**: On mobile, the primary actions are available as floating buttons at the bottom of the screen
- **Skills Expansion**: Tap the "+X more" chip on resume cards to view all skills in a dialog

## Browser Compatibility

These enhancements have been tested and are compatible with:
- Chrome (latest versions)
- Safari on iOS (latest versions)
- Firefox (latest versions)
- Chrome on Android (latest versions)

## Development Roadmap
- [ ] Implement user authentication
