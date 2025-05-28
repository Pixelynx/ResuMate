# Resumate Server

This document provides detailed information about the backend server implementation for the Resumate application, including API architecture, integrations, and configuration.

## Overview
The Resumate backend is a Node.js/Express server that provides:
- RESTful API endpoints for resume and cover letter management
- AI integrations for job fit scoring and cover letter generation
- Database persistence with PostgreSQL and Sequelize ORM
- Authentication and error handling middleware

## Technical Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL with Sequelize ORM
- **AI Integration**: OpenAI API (text-embedding-ada-002 model, GPT-3.5)
- **Authentication**: JWT-based authentication
- **Validation**: Custom validation middleware

## Core Features

### Resume Management
- Create, read, update, and delete resume documents
- Validation of resume data structure
- Support for complex nested objects (work experience, education, etc.)
- Automatic date handling and formatting

### Cover Letter Generation
- AI-powered cover letter generation based on resume and job details
- Customizable tone and content focus
- Integration with resume data
- Progress tracking during generation

### Job Fit Analysis
- Embedding-based similarity calculation between resumes and job descriptions
- Component-level scoring for different resume sections
- Personalized feedback generation using OpenAI
- Error handling with graceful fallbacks

## Project Structure
```
server/
├── config/             # Configuration files
│   ├── db.config.js    # Database configuration
│   └── auth.config.js  # Authentication configuration
├── controllers/        # Route controllers
│   ├── resume.controller.js      # Resume CRUD operations
│   ├── coverLetter.controller.js # Cover letter operations
│   └── jobFit.controller.js      # Job fit scoring endpoints
├── middleware/         # Express middleware
│   ├── auth.middleware.js   # Authentication middleware
│   └── validate.middleware.js # Request validation
├── migrations/         # Database migrations
├── models/             # Sequelize models
│   ├── index.js             # Model loader
│   ├── resume.models.js     # Resume model definition
│   ├── coverLetter.models.js # Cover letter model definition
│   └── user.models.js       # User model definition
├── routes/             # API route definitions
│   ├── resume.routes.js     # Resume routes
│   ├── coverLetter.routes.js # Cover letter routes
│   └── jobFit.routes.js     # Job fit scoring routes
├── services/           # Business logic services
│   ├── openaiService.js     # OpenAI API integration
│   ├── jobFitService.js     # Job fit scoring logic
│   └── resumeParser.js      # Resume parsing service
├── utils/              # Utility functions
├── .env                # Environment variables (not in repo)
├── server.js           # Main application entry point
└── package.json        # Dependencies and scripts
```

## Environment Setup
Create a `.env` file in the `/server` directory with the following variables:
```
DB_NAME=resumate_db
DB_USER=your_username
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
PORT=5000
JWT_SECRET=your_secret_key
OPENAI_API_KEY=your_openai_api_key
```

## Installation and Development
1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up the database:
   ```bash
   npx sequelize-cli db:create
   npx sequelize-cli db:migrate
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

4. For production:
   ```bash
   npm start
   ```

## API Documentation

### Base URL
The base URL for all API endpoints is: `http://localhost:5000/api`

### Authentication
Most endpoints require authentication using JWT tokens. Include the token in the `Authorization` header:
```
Authorization: Bearer <token>
```

### Resume Endpoints

#### Create Resume
- **URL**: `/resumes`
- **Method**: `POST`
- **Auth Required**: Yes
- **Body**:
  ```json
  {
    "personalDetails": {
      "firstname": "John",
      "lastname": "Doe",
      "email": "john.doe@example.com",
      "phone": "123-456-7890",
      "location": "New York, NY",
      "linkedin": "https://linkedin.com/in/johndoe"
    },
    "workExperience": [
      {
        "companyName": "Example Corp",
        "jobtitle": "Software Engineer",
        "location": "New York, NY",
        "startDate": "2020-01-01",
        "endDate": "2022-01-01",
        "description": "Developed web applications..."
      }
    ],
    "education": [...],
    "skills": {...},
    "certifications": [...],
    "projects": [...]
  }
  ```
- **Success Response**: `201 Created` with the created resume object
- **Error Response**: `400 Bad Request` or `500 Internal Server Error`

#### Get All Resumes
- **URL**: `/resumes`
- **Method**: `GET`
- **Auth Required**: Yes
- **Success Response**: `200 OK` with an array of resume objects
- **Error Response**: `500 Internal Server Error`

#### Get Resume by ID
- **URL**: `/resumes/:id`
- **Method**: `GET`
- **Auth Required**: Yes
- **Success Response**: `200 OK` with the resume object
- **Error Response**: `404 Not Found` or `500 Internal Server Error`

#### Update Resume
- **URL**: `/resumes/:id`
- **Method**: `PUT`
- **Auth Required**: Yes
- **Body**: Same as create resume
- **Success Response**: `200 OK` with the updated resume object
- **Error Response**: `400 Bad Request`, `404 Not Found`, or `500 Internal Server Error`

#### Delete Resume
- **URL**: `/resumes/:id`
- **Method**: `DELETE`
- **Auth Required**: Yes
- **Success Response**: `204 No Content`
- **Error Response**: `404 Not Found` or `500 Internal Server Error`

### Cover Letter Endpoints

#### Create Cover Letter
- **URL**: `/cover-letters`
- **Method**: `POST`
- **Auth Required**: Yes
- **Body**:
  ```json
  {
    "title": "Application for Software Engineer",
    "resumeid": "resume-id-here",
    "content": "Dear Hiring Manager...",
    "jobtitle": "Software Engineer",
    "company": "Tech Company",
    "jobdescription": "We are looking for...",
    "firstname": "John",
    "lastname": "Doe",
    "email": "john.doe@example.com",
    "phone": "123-456-7890"
  }
  ```
- **Success Response**: `201 Created` with the created cover letter object
- **Error Response**: `400 Bad Request` or `500 Internal Server Error`

#### Generate Cover Letter
- **URL**: `/cover-letters/generate`
- **Method**: `POST`
- **Auth Required**: Yes
- **Body**:
  ```json
  {
    "resumeid": "resume-id-here",
    "jobtitle": "Software Engineer",
    "company": "Tech Company",
    "jobdescription": "We are looking for...",
    "options": {
      "tone": "professional",
      "length": "medium",
      "focusPoints": ["technical skills", "leadership"]
    }
  }
  ```
- **Success Response**: `200 OK` with the generated cover letter
- **Error Response**: `400 Bad Request` or `500 Internal Server Error`

### Job Fit Endpoints

#### Calculate Job Fit Score
- **URL**: `/job-fit-score`
- **Method**: `POST`
- **Auth Required**: Yes
- **Body**:
  ```json
  {
    "resumeid": "resume-id-here",
    "coverLetterId": "cover-letter-id-here"
  }
  ```
- **Success Response**: `200 OK` with the job fit score and explanation
- **Error Response**: `400 Bad Request` or `500 Internal Server Error`

## OpenAI Integration

### Embedding Service
The system uses OpenAI's text-embedding-ada-002 model to generate embeddings for resume content and job descriptions. These embeddings are then compared using cosine similarity to calculate a job fit score.

```javascript
async function getEmbedding(text) {
  try {
    const truncatedText = text.substring(0, 8000);
    
    const response = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: truncatedText,
      encoding_format: "float"
    });
    
    if (response && response.data && response.data.length > 0 && response.data[0].embedding) {
      return response.data[0].embedding;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting embedding from OpenAI:', error);
    return null;
  }
}
```

### Error Handling
The system uses proper error handling for OpenAI API calls, with appropriate logging and fallback mechanisms:

```javascript
try {
  // Use OpenAI embeddings for calculation
  const similarity = await calculateEmbeddingSimilarity(resumeContent, jobdescription);
  
  // Process results...
} catch (embeddingError) {
  console.error('Error with embeddings:', embeddingError);
  throw new Error('Unable to calculate job fit score at this time.');
}
```

## Database Models

### Resume Model
The Resume model represents a user's resume with various sections:
- Personal details (name, contact info)
- Work experience (array of positions)
- Education history (array of education)
- Skills
- Certifications (array of certs)
- Projects  (array of projects)

### Cover Letter Model
The Cover Letter model includes:
- Title
- Content
- Job-specific details (company, position)
- Associated resume (foreign key)
- Personal information

## Security Considerations
- API keys stored in environment variables, not in code
- Input validation for all API endpoints
- Error messages do not expose sensitive information
- JWT token expiration and refresh mechanisms
- Database query parameterization to prevent SQL injection

## Performance Optimizations
- Text embeddings cached where appropriate
- Database indexes on frequently queried fields
- Proper error handling to prevent service disruptions
- Optimized database queries with appropriate joins

## Development Roadmap
- [X] Add more AI-powered features for resume enhancement
- [ ] Implement backend persistence for resume data
- [ ] Enhance cover letter generation by implementing cosine similarity between resume and job description
- [ ] Adjust cosine similarity logic for job scoring to ensure more balanced results
- [ ] Implement ATS optimization suggestions