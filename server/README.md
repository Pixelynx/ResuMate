# Backend Integration Documentation

This document provides an overview of the backend integration for the ResuMate application, including API endpoints, request parameters, response formats, and authentication requirements.

## Project Setup

### Installation
To install the necessary dependencies, run:
```bash
npm install
```

### Environment Setup
Create a `.env` file in the `/server` directory with the following variables:
```plaintext
DB_NAME=mydatabase
DB_USER=myuser
DB_PASSWORD=mypassword
DB_HOST=localhost
PORT=5000
```

## Running the Server

### Development Mode
To start the server in development mode, use:
```bash
npm run dev
```

### Production Mode
To start the server in production mode, use:
```bash
npm start
```

## Database Setup
Ensure that PostgreSQL is installed and running. Create the database using:
```bash
psql -U yourusername
CREATE DATABASE mydatabase;
```

## API Documentation

### Base URL
The base URL for all API endpoints is: `http://localhost:5000/api`

### Endpoints

#### 1. Create a Resume
- **Endpoint**: `/resumes`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "name": "Jane Doe",
    "email": "Jane.doe@example.com",
    "phone": "123-456-7890",
    "education": "Bachelor of Science in Computer Science",
    "experience": "5 years of software development",
    "skills": "JavaScript, Node.js, React",
    "certifications": "Certified JavaScript Developer",
    "projects": "Project A, Project B"
  }
  ```
- **Response**:
  - **201 Created**: Returns the created resume object.
  - **500 Internal Server Error**: Returns an error message if creation fails.

#### 2. Get All Resumes
- **Endpoint**: `/resumes`
- **Method**: `GET`
- **Response**:
  - **200 OK**: Returns an array of resume objects.
  - **500 Internal Server Error**: Returns an error message if retrieval fails.

#### 3. Get a Resume by ID
- **Endpoint**: `/resumes/:id`
- **Method**: `GET`
- **Response**:
  - **200 OK**: Returns the resume object with the specified ID.
  - **404 Not Found**: Returns an error message if the resume is not found.
  - **500 Internal Server Error**: Returns an error message if retrieval fails.

#### 4. Update a Resume
- **Endpoint**: `/resumes/:id`
- **Method**: `PUT`
- **Request Body**: Same as the create request body.
- **Response**:
  - **200 OK**: Returns the updated resume object.
  - **404 Not Found**: Returns an error message if the resume is not found.
  - **500 Internal Server Error**: Returns an error message if update fails.

#### 5. Delete a Resume
- **Endpoint**: `/resumes/:id`
- **Method**: `DELETE`
- **Response**:
  - **204 No Content**: Indicates successful deletion.
  - **404 Not Found**: Returns an error message if the resume is not found.
  - **500 Internal Server Error**: Returns an error message if deletion fails.

This documentation provides a comprehensive overview of the API endpoints available in the ResuMate backend. For further details or questions, please refer to the source code or contact the development team.
