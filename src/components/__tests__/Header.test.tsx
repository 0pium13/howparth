import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../contexts/AuthContext';
import Header from '../Header';

// Mock the auth context
const mockAuthContext = {
  user: null,
  isAuthenticated: false,
  login: jest.fn(),
  logout: jest.fn(),
  signup: jest.fn(),
  updateProfile: jest.fn()
};

jest.mock('../../contexts/AuthContext', () => ({
  ...jest.requireActual('../../contexts/AuthContext'),
  useAuth: () => mockAuthContext
}));

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        {component}
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('Header Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Navigation Structure', () => {
    it('should display exactly 4 main navigation items', () => {
      renderWithRouter(<Header />);
      
      expect(screen.getByText('AI')).toBeInTheDocument();
      expect(screen.getByText('Support')).toBeInTheDocument();
      expect(screen.getByText('Chat')).toBeInTheDocument();
      
      // Profile should be visible as avatar/button
      expect(screen.getByLabelText('User menu')).toBeInTheDocument();
    });

    it('should show AI megamenu with correct sub-items', async () => {
      renderWithRouter(<Header />);
      
      const aiButton = screen.getByText('AI');
      fireEvent.click(aiButton);
      
      await waitFor(() => {
        expect(screen.getByText('Blogs')).toBeInTheDocument();
        expect(screen.getByText('Strategy')).toBeInTheDocument();
        expect(screen.getByText('Quality')).toBeInTheDocument();
      });
    });

    it('should display sub-item descriptions in megamenu', async () => {
      renderWithRouter(<Header />);
      
      const aiButton = screen.getByText('AI');
      fireEvent.click(aiButton);
      
      await waitFor(() => {
        expect(screen.getByText('AI-powered content creation and blog generation')).toBeInTheDocument();
        expect(screen.getByText('Strategic AI planning and optimization')).toBeInTheDocument();
        expect(screen.getByText('Quality assurance and content optimization')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should support keyboard navigation for AI dropdown', async () => {
      renderWithRouter(<Header />);
      
      const aiButton = screen.getByText('AI');
      aiButton.focus();
      
      fireEvent.keyDown(aiButton, { key: 'Enter' });
      
      await waitFor(() => {
        expect(screen.getByText('Blogs')).toBeInTheDocument();
      });
    });

    it('should close dropdown on Escape key', async () => {
      renderWithRouter(<Header />);
      
      const aiButton = screen.getByText('AI');
      fireEvent.click(aiButton);
      
      await waitFor(() => {
        expect(screen.getByText('Blogs')).toBeInTheDocument();
      });
      
      fireEvent.keyDown(document, { key: 'Escape' });
      
      await waitFor(() => {
        expect(screen.queryByText('Blogs')).not.toBeInTheDocument();
      });
    });

    it('should have proper ARIA attributes', () => {
      renderWithRouter(<Header />);
      
      const aiButton = screen.getByText('AI');
      expect(aiButton).toHaveAttribute('aria-expanded', 'false');
      expect(aiButton).toHaveAttribute('aria-haspopup', 'true');
    });
  });

  describe('Mobile Navigation', () => {
    it('should show hamburger menu on mobile', () => {
      renderWithRouter(<Header />);
      
      const hamburgerButton = screen.getByLabelText('Toggle mobile menu');
      expect(hamburgerButton).toBeInTheDocument();
    });

    it('should open mobile menu on hamburger click', async () => {
      renderWithRouter(<Header />);
      
      const hamburgerButton = screen.getByLabelText('Toggle mobile menu');
      fireEvent.click(hamburgerButton);
      
      await waitFor(() => {
        expect(screen.getByText('AI')).toBeInTheDocument();
        expect(screen.getByText('Support')).toBeInTheDocument();
        expect(screen.getByText('Chat')).toBeInTheDocument();
      });
    });

    it('should show AI sub-items in mobile menu', async () => {
      renderWithRouter(<Header />);
      
      const hamburgerButton = screen.getByLabelText('Toggle mobile menu');
      fireEvent.click(hamburgerButton);
      
      await waitFor(() => {
        expect(screen.getByText('Blogs')).toBeInTheDocument();
        expect(screen.getByText('Strategy')).toBeInTheDocument();
        expect(screen.getByText('Quality')).toBeInTheDocument();
      });
    });
  });

  describe('Authentication States', () => {
    it('should show login/signup buttons when not authenticated', () => {
      renderWithRouter(<Header />);
      
      expect(screen.getByText('LOGIN')).toBeInTheDocument();
      expect(screen.getByText('SIGN UP')).toBeInTheDocument();
    });

    it('should show profile dropdown when authenticated', () => {
      mockAuthContext.isAuthenticated = true;
      mockAuthContext.user = { username: 'testuser', email: 'test@example.com' };
      
      renderWithRouter(<Header />);
      
      const profileButton = screen.getByLabelText('User menu');
      expect(profileButton).toBeInTheDocument();
    });

    it('should show user info in profile dropdown', async () => {
      mockAuthContext.isAuthenticated = true;
      mockAuthContext.user = { username: 'testuser', email: 'test@example.com' };
      
      renderWithRouter(<Header />);
      
      const profileButton = screen.getByLabelText('User menu');
      fireEvent.click(profileButton);
      
      await waitFor(() => {
        expect(screen.getByText('testuser')).toBeInTheDocument();
        expect(screen.getByText('test@example.com')).toBeInTheDocument();
      });
    });
  });

  describe('Route Navigation', () => {
    it('should navigate to AI portal when AI is clicked', () => {
      renderWithRouter(<Header />);
      
      const aiButton = screen.getByText('AI');
      fireEvent.click(aiButton);
      
      const blogsLink = screen.getByText('Blogs');
      expect(blogsLink).toHaveAttribute('href', '/ai/blogs');
    });

    it('should navigate to support page when Support is clicked', () => {
      renderWithRouter(<Header />);
      
      const supportLink = screen.getByText('Support');
      expect(supportLink).toHaveAttribute('href', '/support');
    });

    it('should navigate to chat page when Chat is clicked', () => {
      renderWithRouter(<Header />);
      
      const chatLink = screen.getByText('Chat');
      expect(chatLink).toHaveAttribute('href', '/chat');
    });
  });

  describe('Click Outside Behavior', () => {
    it('should close dropdown when clicking outside', async () => {
      renderWithRouter(<Header />);
      
      const aiButton = screen.getByText('AI');
      fireEvent.click(aiButton);
      
      await waitFor(() => {
        expect(screen.getByText('Blogs')).toBeInTheDocument();
      });
      
      fireEvent.mouseDown(document.body);
      
      await waitFor(() => {
        expect(screen.queryByText('Blogs')).not.toBeInTheDocument();
      });
    });
  });
});
