import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import ErrorBoundary from './components/ErrorBoundary';
import Hero from './components/Hero';
import AnimatedSection from './components/AnimatedSection';
import OutlineTextSection from './components/OutlineTextSection';
import ProcessSection from './components/ProcessSection';
import HomepageNav from './components/HomepageNav';
import Contact from './pages/Contact';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import './App.css';

// Lazy load heavy components for better performance
const About = lazy(() => import('./pages/About'));
const Projects = lazy(() => import('./pages/Projects'));

// Loading component for Suspense fallback
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-primary">
    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-accent"></div>
  </div>
);

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <div className="App">
          <ErrorBoundary>
            <Header />
          </ErrorBoundary>
          <main>
            <Routes>
              <Route path="/" element={
                <ErrorBoundary>
                  <>
                    <HomepageNav />
                    <Hero />
                    <AnimatedSection />
                    <ProcessSection />
                    <OutlineTextSection />
                  </>
                </ErrorBoundary>
              } />
              <Route path="/about" element={
                <ErrorBoundary>
                  <Suspense fallback={<LoadingSpinner />}>
                    <About />
                  </Suspense>
                </ErrorBoundary>
              } />
              <Route path="/projects" element={
                <ErrorBoundary>
                  <Suspense fallback={<LoadingSpinner />}>
                    <Projects />
                  </Suspense>
                </ErrorBoundary>
              } />
              <Route path="/contact" element={
                <ErrorBoundary>
                  <Contact />
                </ErrorBoundary>
              } />
              <Route path="/login" element={
                <ErrorBoundary>
                  <LoginPage />
                </ErrorBoundary>
              } />
              <Route path="/signup" element={
                <ErrorBoundary>
                  <SignUpPage />
                </ErrorBoundary>
              } />
            </Routes>
          </main>
          <ErrorBoundary>
            <Footer />
          </ErrorBoundary>
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
