import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Header from './components/layouts/Header';
import Footer from './components/layouts/Footer';
import ResumeForm from './components/resume/ResumeForm';
import ViewResume from './components/resume/ViewResume';
import Dashboard from './components/dashboard/Dashboard';
import CoverLetterForm from './components/coverLetter/CoverLetterForm';
import ViewCoverLetter from './components/coverLetter/ViewCoverLetter';
import EditCoverLetter from './components/coverLetter/EditCoverLetter';
import { ErrorBoundary } from 'react-error-boundary';
import { setupResizeObserverErrorHandler } from './utils/errorHandlers';

function ErrorFallback({ error }) {
  console.error('Error caught by ErrorBoundary:', error);
  return (
    <div style={{ padding: '20px', margin: '20px', border: '1px solid red' }}>
      <h2>Something went wrong:</h2>
      <pre>{error.message}</pre>
      <pre>{error.stack}</pre>
    </div>
  );
}

function App() {
  useEffect(() => {
    console.log('App component mounted');
    // Setup error handler and get cleanup function
    const cleanup = setupResizeObserverErrorHandler();
    // Clean up when component unmounts
    return cleanup;
  }, []);

  console.log('App component rendering');

  return (
    <div
      className="App"
      style={{
        display: 'flex',
        position: 'relative',
        flexDirection: 'column',
        justifyItems: 'center',
        maxHeight: '100vh'
      }}
    >
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <Router>
          <Header />
          <main style={{ height: 'calc(100vh + 50px)', padding: '20px' }}>
            <Routes>
              {/* Resume Routes */}
              <Route path="/resume/builder" element={<ResumeForm />} />
              <Route path="/resume/:id" element={<ViewResume />} />
              
              {/* Dashboard Route */}
              <Route path="/dashboard" element={<Dashboard />} />
              
              {/* Cover Letter Routes */}
              <Route path="/cover-letter/new" element={<CoverLetterForm />} />
              <Route path="/cover-letter/from-resume/:resumeid" element={<CoverLetterForm />} />
              <Route path="/cover-letter/:id" element={<ViewCoverLetter />} />
              <Route path="/cover-letter/edit/:id" element={<EditCoverLetter />} />
              
              {/* Cover Letters Routes (plural) - for compatibility */}
              <Route path="/cover-letter/view/:id" element={<ViewCoverLetter />} />
              <Route path="/cover-letter/edit-legacy/:id" element={<CoverLetterForm />} />
              
              {/* Redirects */}
              <Route path="/builder" element={<Navigate to="/resume/builder" />} />
              <Route path="/" element={<Navigate to="/dashboard" />} />
            </Routes>
          </main>
          <Footer />
        </Router>
      </ErrorBoundary>
    </div>
  );
}

export default App;