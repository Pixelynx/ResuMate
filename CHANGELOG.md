# Changelog

## [Unreleased]

### [2025-05-31]
### Added
- Dynamic prompt generation system for cover letters:
  - Intelligent content prioritization and allocation
  - Scenario-based prompting for different candidate profiles
  - Dynamic section ordering based on relevance
  - Strategic gap handling with alternative content suggestions
  - Character limit optimization per section
  - Content quality thresholds and validation

- Content prioritization engine for dynamic cover letters:
  - Intelligent section relevance scoring
  - Content quality assessment with metrics
  - Dynamic content allocation based on relevance
  - Priority-based section ordering
  - Smart transition phrase suggestions
  - Keyword emphasis recommendations
  - Files added:
    - contentAnalysis.js

- Enhanced skills scoring system:
  - Intelligent skill matching with synonyms support
  - Levenshtein distance for fuzzy matching
  - Core vs peripheral skill differentiation
  - Comprehensive skill extraction from job descriptions
  - Cached skill comparisons for performance

- Scalable tone configuration system:
  - Extensible tone architecture for future additions
  - Professional tone configuration with comprehensive attributes
  - Tone-specific vocabulary and content guidelines
  - Dynamic prompt modification based on tone
  - Content filtering and emphasis adjustments
  - Files Added:
    - toneConfigs.js

- Improved code organization and directory structure:
  - Created `/assessment` directory for job fit scoring and analysis:
    - Consolidated scoring logic and algorithms
    - Organized analysis tools and libraries
    - Improved separation of scoring components
  - Created `/generation` directory for content creation:
    - Centralized cover letter generation logic
    - Organized content analysis and prioritization
    - Improved prompt generation architecture
  - Enhanced modularity and maintainability
  - Better separation of concerns
  - Clearer code organization

### Changed
- Refactored AIService to functional architecture:
  - Converted class-based implementation to functional module
  - Enhanced type safety with TypeScript JSDoc
  - Improved error handling and retry logic
  - Added comprehensive logging
  - Optimized caching mechanism

- Consolidated work experience scoring system:
  - Unified all experience scoring into single module
  - Converted class-based implementation to functional
  - Enhanced seniority detection with confidence scoring
  - Improved industry relevance analysis
  - Added comprehensive experience gap detection
  - Optimized date-based calculations
  - Removed duplicate scoring logic
  - Files affected:
    - Removed: workExperienceScoring.js (class-based)
    - Added: experienceScoring.js (functional)

- Consolidated skills scoring system:
  - Merged AdvancedSkillsScorer into skillsCompensation.js
  - Enhanced keyword matching with synonyms
  - Added string similarity calculations
  - Improved skill relevance assessment
  - Files affected:
    - Removed: advancedSkillsScoring.js
    - Modified: skillsCompensation.js

### Improved
- Cover letter generation:
  - Dynamic content prioritization
  - Section-specific transition phrases
  - Emphasis on most relevant content
  - Intelligent keyword highlighting
  - Quality-based content allocation
  - Scenario-based content strategies
  - Gap compensation logic

### [2025-05-29]
### Changed
- Resolved Heroku Postgres SSL connection issues with Sequelize
  - Added expected `url` key in production config to hold full DB connection string with `?sslmode=require`
  - Corrected `dialectOptions` casing in config.js to ensure SSL options are recognized
  - Added `pg-native` dependency and enabled native bindings for improved SSL handling
  - Ensured consistent use of config.js by Sequelize CLI and app runtime for migrations and production
  - Changes fixed `pg_hba.conf` SSL off errors and certificate verification failures, enabling successful migrations and DB connections in production

### [2025-04-03]
### Added

### Changed
- Improved embedding service error handling to prevent fallback to potentially inaccurate keyword matching
- Enhanced JobScore component to properly handle unavailable embedding service with user-friendly warning message 

### Fixed
- Fixed JobFitScore calculation to prevent false scores from being displayed when embedding service fails
- Standardized error messaging for job fit scoring service unavailability

### [2025-04-02]
### Added
- Enhanced JobScore component with modal display, backdrop overlay, and close button
- Improved JobFitScore explanation with 3-7 sentence personalized feedback
- Added component-level scoring for job fit analysis (skills, work experience, education, etc.)

### Changed
- Updated LoadingOverlay color scheme to match application theme (purple)
- Temporarily disabled resume editing functionality in ViewResume component and Dashboard
- Changed ResumeParser button to properly handle disabled state styling
- Updated OpenAI embedding service to work with the v4 API structure

### Fixed
- Improved JobFitScore calculation to more accurately use embedding-based similarity instead of keyword matching
- Fixed critical date validation bug causing "value.isBefore is not a function" error when editing resumes
- Improved error handling throughout the resume creation and editing process

### [2025-04-01]
### Added
- Created new EditCoverLetter component with form validation and a modern UI
- Added support for new cover letter fields in the API and database
- Implemented enhanced job fit scoring with OpenAI embeddings (v2 endpoint)
- Implemented comprehensive job fit scoring system using OpenAI embeddings
- Added weighted scoring for different resume sections (skills, experience, projects, education)
- Created new API endpoint for job fit score calculation
- Added AI-powered feedback generation for job fit scores
- Implemented new JobScore component with animated score display and color-coded feedback

### Changed
- Updated OpenAI service to use v4 API structure for better compatibility
- Improved database schema for cover letters with new fields and relationships
- Updated cover letter controller to handle new fields and resume data integration

### Fixed
- Fixed TypeScript errors in the Redux store configuration
- Resolved issues with the CoverLetterForm component to handle required fields
- Fixed theme handling in the JobScore component
- Improved error handling with fallback strategies for embedding calculations
- Resolved TypeScript errors in PrintController component
- Fixed OpenAI API integration issues in server-side services
- Corrected type definitions in Redux store configuration
- Fixed theme handling in styled components

### [2025-03-31]
### Added
- Implemented Job Fit Score feature to evaluate how well a resume matches a job description
- Created AI-powered scoring system using OpenAI embeddings with weighted evaluation of skills, experience, and education
- Added a scoring component with color-coded feedback (green, orange, red) based on match quality
- Integrated AI-generated explanations that provide personalized feedback on job fit
- Enhanced database schema to store job descriptions and properly relate `Resume` and `CoverLetter` models

### Changed
- Modified `CoverLetter` model to include job description field
- Updated foreign key constraints to set `onDelete: 'CASCADE'` for proper data cleanup when deleting resumes
- Enhanced API structure with a dedicated `/api/job-fit-score` endpoint for embedding-based job matching

### [2025-03-30]
### Added
- Implemented new icon-based stepper components for both resume and cover letter forms.
- Created `ResumeFormStepper` with a 2x3 grid layout for improved visual hierarchy.
- Created `CoverLetterFormStepper` with a 1x3 vertical grid layout.
- Added distinct styling for active, completed, and upcoming steps with hover effects.
- Integrated icon indicators for each step and checkmarks for completed steps.

### Changed
- Relocated form steppers from above the form to the left side.
- Enhanced visual feedback for step navigation with hover states and completion indicators.

### [2025-03-29]
### Added
- Integrated Redux for state management across the application.
- Implemented parsing functionality for resumes, allowing users to upload .docx and .txt files for automatic extraction of resume data. [bugged]
- Added a comprehensive validation system for the resume form, ensuring all required fields are validated before submission.
- Introduced printing functionality for both resumes and cover letters, enabling users to print their documents directly from the application.
- Created a `PrintController` component to manage print actions and handle printing state in Redux.
- Developed a `PrintableResume` and `PrintableCoverLetter` component to render resumes and cover letters in a print-friendly format.

### Fixed
- Fixed issues with the validation state structure to ensure accurate error messages and validation feedback for users.

### [2025-03-xx]
### Added
- Basic project structure
- React application setup with TypeScript
- Material UI integration
- Initial form component structure 
- Multi-step form for resume creation with 6 sections (Personal Details, Work Experience, Education, Skills, Certifications, Projects)
- Dynamic form fields for array-based sections (Work Experience, Education, etc.)
- Ability to add and remove entries in array-based sections
- Comprehensive form validation system:
  - Custom `useFormValidation` hook for managing validation state
  - Field-level validation for all form inputs
  - Real-time validation with visual feedback
  - Date validation to ensure chronological order
  - Required field validation with appropriate error messages
  - URL and email format validation

### Changed


### Fixed
- Fixed validation for date fields to properly handle Dayjs objects
- Resolved TypeScript errors related to validation state structure
