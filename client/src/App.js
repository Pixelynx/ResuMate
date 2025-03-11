import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Header from './components/layouts/Header';
import Footer from './components/layouts/Footer';
import ResumeForm from './components/resume/ResumeForm';
import { ErrorBoundary } from 'react-error-boundary';

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
  }, []);

  console.log('App component rendering');

  return (
    <div className="App">
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <Router>
          <Header />
          <main style={{ minHeight: 'calc(100vh - 120px)', padding: '20px' }}>
            <Routes>
              <Route path="/builder" element={<ResumeForm />} />
              {/* Default */}
              <Route path="/" element={<Navigate to="/builder" />} />
            </Routes>
          </main>
          <Footer />
        </Router>
      </ErrorBoundary>
    </div>
  );
}

export default App;