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
- [ ] Implement user authentication
- [ ] Add more AI-powered features for resume enhancement
- [ ] Improve the UI/UX of the application
- [ ] Add support for exporting resumes in different formats (PDF, DOCX)


6.5 HRS 