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