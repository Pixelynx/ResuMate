# Changelog

## [Unreleased]

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
