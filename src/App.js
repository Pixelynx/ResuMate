import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" />
          <Route path="/dashboard" />
          <Route path="/login" />
          <Route path="/register" />
          <Route path="/builder" />
        </Routes>
      </div>
    </Router>
  );
}

export default App;