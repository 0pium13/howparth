import React, { Suspense, lazy, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import ErrorBoundary from './components/ErrorBoundary';
import Hero from './components/Hero';
import AnimatedSection from './components/AnimatedSection';
import OutlineTextSection from './components/OutlineTextSection';
import ProcessSection from './components/ProcessSection';
import Contact from './pages/Contact';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import AIPortal from './pages/AIPortal';
// import AdvancedChat from './components/AdvancedChat';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { AdminAuthProvider } from './contexts/AdminAuthContext';
import { ToastManager, useToast } from './components/Toast';
import { WelcomeToast } from './components/WelcomeToast';
// import { serviceWorkerManager } from './utils/serviceWorker';
// import { performanceMonitor } from './utils/performanceMonitor';
import './App.css';

// Lazy load heavy components for better performance
const About = lazy(() => import('./pages/About'));
const Projects = lazy(() => import('./pages/Projects'));
const CommunityHub = lazy(() => import('./pages/CommunityHub'));
const ChatPage = lazy(() => import('./pages/ChatPage'));
const AIContentPortal = lazy(() => import('./pages/AIContentPortal'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));

// Loading component for Suspense fallback
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-primary">
    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-accent"></div>
  </div>
);

function AppContent() {
  const { toasts, removeToast } = useToast();
  const [showWelcomeToast, setShowWelcomeToast] = useState(false);
  const [welcomeUsername, setWelcomeUsername] = useState('');
  const { user, isAuthenticated } = useAuth();

  // Handle welcome toast when user logs in
  useEffect(() => {
    if (isAuthenticated && user) {
      setWelcomeUsername(user.username);
      setShowWelcomeToast(true);
    }
  }, [isAuthenticated, user]);

  const handleWelcomeToastClose = () => {
    setShowWelcomeToast(false);
  };

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
                    <Hero />
                    <AnimatedSection />
                    <ProcessSection />
                    <OutlineTextSection />
                  </>
                </ErrorBoundary>
              } />
              
              {/* AI Portal Routes */}
              <Route path="/ai" element={
                <ErrorBoundary>
                  <AIContentPortal />
                </ErrorBoundary>
              } />
              <Route path="/ai/blogs" element={
                <ErrorBoundary>
                  <AIPortal />
                </ErrorBoundary>
              } />
              <Route path="/ai/content" element={
                <ErrorBoundary>
                  <AIPortal />
                </ErrorBoundary>
              } />
              <Route path="/ai/training" element={
                <ErrorBoundary>
                  <AIPortal />
                </ErrorBoundary>
              } />
              <Route path="/ai/strategy" element={
                <ErrorBoundary>
                  <AIPortal />
                </ErrorBoundary>
              } />
              <Route path="/ai/content-generation" element={
                <ErrorBoundary>
                  <AIContentPortal />
                </ErrorBoundary>
              } />
              <Route path="/ai/quality" element={
                <ErrorBoundary>
                  <AIPortal />
                </ErrorBoundary>
              } />
              
              {/* Community Route */}
              <Route path="/community" element={
                <ErrorBoundary>
                  <Suspense fallback={<LoadingSpinner />}>
                    <CommunityHub />
                  </Suspense>
                </ErrorBoundary>
              } />
              
              {/* Blog Routes */}
              <Route path="/blog" element={
                <ErrorBoundary>
                  <AIPortal />
                </ErrorBoundary>
              } />
              <Route path="/blog/ai-tools" element={
                <ErrorBoundary>
                  <AIPortal />
                </ErrorBoundary>
              } />
              <Route path="/blog/tutorials" element={
                <ErrorBoundary>
                  <AIPortal />
                </ErrorBoundary>
              } />
              
              {/* Support Route */}
              <Route path="/support" element={
                <ErrorBoundary>
                  <Suspense fallback={<LoadingSpinner />}>
                    <About />
                  </Suspense>
                </ErrorBoundary>
              } />
              
              {/* Chat Route */}
              <Route path="/chat" element={
                <ErrorBoundary>
                  <Suspense fallback={<LoadingSpinner />}>
                    <ChatPage />
                  </Suspense>
                </ErrorBoundary>
              } />
              
              {/* Admin Dashboard Route */}
              <Route path="/admin" element={
                <ErrorBoundary>
                  <AdminAuthProvider>
                    <Suspense fallback={<LoadingSpinner />}>
                      <AdminDashboard />
                    </Suspense>
                  </AdminAuthProvider>
                </ErrorBoundary>
              } />
              
              {/* Profile Routes */}
              <Route path="/profile/settings" element={
                <ErrorBoundary>
                  <div className="min-h-screen bg-black text-white pt-20">
                    <div className="max-w-4xl mx-auto px-4 py-12">
                      <h1 className="text-4xl font-bold mb-8">Profile Settings</h1>
                      <p className="text-gray-400">Profile settings page coming soon...</p>
                    </div>
                  </div>
                </ErrorBoundary>
              } />
              <Route path="/profile/billing" element={
                <ErrorBoundary>
                  <div className="min-h-screen bg-black text-white pt-20">
                    <div className="max-w-4xl mx-auto px-4 py-12">
                      <h1 className="text-4xl font-bold mb-8">Billing</h1>
                      <p className="text-gray-400">Billing page coming soon...</p>
                    </div>
                  </div>
                </ErrorBoundary>
              } />
              
              {/* Legacy Routes */}
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
              
              {/* Legacy AI Content Routes - Redirect to new AI portal */}
              <Route path="/ai-content" element={
                <ErrorBoundary>
                  <AIPortal />
                </ErrorBoundary>
              } />
              <Route path="/automation" element={
                <ErrorBoundary>
                  <AIPortal />
                </ErrorBoundary>
              } />
            </Routes>
          </main>
          <ErrorBoundary>
            <Footer />
          </ErrorBoundary>
          <ToastManager toasts={toasts} onClose={removeToast} />
          <WelcomeToast 
            username={welcomeUsername}
            isVisible={showWelcomeToast}
            onClose={handleWelcomeToastClose}
          />
        </div>
      </Router>
    </ErrorBoundary>
  );
}

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
