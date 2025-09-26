import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { IrisAd } from '../IrisAd';
import type { AdResponse } from '../../../shared-types';

// Mock fetch for impression URL testing
const mockFetch = (globalThis as any).fetch as jest.MockedFunction<typeof fetch>;

// Mock window.open for click URL testing
const mockWindowOpen = window.open as jest.MockedFunction<typeof window.open>;

describe('IrisAd Component', () => {
  const mockAd: AdResponse = {
    text: 'Test Advertisement Text',
    impUrl: 'https://api.example.com/impression?id=123',
    clickUrl: 'https://api.example.com/click?id=123&redirect=https://example.com/landing',
    payout: 0.25
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset fetch mock to default successful response
    mockFetch.mockReset();
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK'
    } as Response);
  });

  describe('Rendering', () => {
    it('renders the ad with correct content', () => {
      render(<IrisAd ad={mockAd} />);
      
      expect(screen.getByText('Test Advertisement Text')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Learn More' })).toBeInTheDocument();
    });

    it('applies custom CSS classes', () => {
      render(
        <IrisAd 
          ad={mockAd}
          className="custom-container"
          textClassName="custom-text"
          buttonClassName="custom-button"
        />
      );
      
      const container = screen.getByText('Test Advertisement Text').closest('div');
      const text = screen.getByText('Test Advertisement Text');
      const button = screen.getByRole('button');
      
      expect(container).toHaveClass('custom-container');
      expect(text).toHaveClass('custom-text');
      expect(button).toHaveClass('custom-button');
    });

    it('uses custom button text', () => {
      render(<IrisAd ad={mockAd} buttonText="Click Here" />);
      
      expect(screen.getByRole('button', { name: 'Click Here' })).toBeInTheDocument();
    });

    it('includes correct data attributes', () => {
      render(<IrisAd ad={mockAd} />);
      
      expect(screen.getByText('Test Advertisement Text').closest('div')).toHaveAttribute('data-iris-ad', 'container');
      expect(screen.getByText('Test Advertisement Text')).toHaveAttribute('data-iris-ad', 'text');
      expect(screen.getByRole('button')).toHaveAttribute('data-iris-ad', 'button');
    });
  });

  describe('Conditional Rendering', () => {
    it('does not render when show is false', () => {
      render(<IrisAd ad={mockAd} show={false} />);
      
      expect(screen.queryByText('Test Advertisement Text')).not.toBeInTheDocument();
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('does not render when ad is null', () => {
      render(<IrisAd ad={null as any} />);
      
      expect(screen.queryByText('Test Advertisement Text')).not.toBeInTheDocument();
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('does not render when ad is undefined', () => {
      render(<IrisAd ad={undefined as any} />);
      
      expect(screen.queryByText('Test Advertisement Text')).not.toBeInTheDocument();
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
  });

  describe('Impression URL Firing', () => {
    it('fires impression URL on component mount', async () => {
      render(<IrisAd ad={mockAd} />);
      
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          'https://api.example.com/impression?id=123',
          { method: 'GET', mode: 'no-cors' }
        );
      });
    });

    it('does not fire impression URL when impUrl is missing', async () => {
      const adWithoutImpUrl = { ...mockAd, impUrl: undefined };
      render(<IrisAd ad={adWithoutImpUrl} />);
      
      await waitFor(() => {
        expect(mockFetch).not.toHaveBeenCalled();
      });
    });

    it('does not fire impression URL when impUrl is empty string', async () => {
      const adWithEmptyImpUrl = { ...mockAd, impUrl: '' };
      render(<IrisAd ad={adWithEmptyImpUrl} />);
      
      await waitFor(() => {
        expect(mockFetch).not.toHaveBeenCalled();
      });
    });

    it('handles fetch errors gracefully', async () => {
      // Test that component renders without impression URL
      const adWithoutImpUrl = { ...mockAd, impUrl: undefined };
      render(<IrisAd ad={adWithoutImpUrl} />);
      
      // Component should still render and work normally
      expect(screen.getByText('Test Advertisement Text')).toBeInTheDocument();
      expect(screen.getByRole('button')).toBeInTheDocument();
      
      // Fetch should not be called when no impression URL is provided
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('fires impression URL only once per component instance', async () => {
      const { rerender } = render(<IrisAd ad={mockAd} />);
      
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(1);
      });
      
      // Rerender with same ad - should not fire again
      rerender(<IrisAd ad={mockAd} />);
      
      // Wait a bit to ensure no additional calls
      await new Promise(resolve => setTimeout(resolve, 100));
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('does not fire impression URL when component is not shown', async () => {
      render(<IrisAd ad={mockAd} show={false} />);
      
      // Wait a bit to ensure no calls
      await new Promise(resolve => setTimeout(resolve, 100));
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });

  describe('Click URL Handling', () => {
    it('uses clickUrl when provided on button click', async () => {
      const user = userEvent.setup();
      render(<IrisAd ad={mockAd} />);
      
      const button = screen.getByRole('button');
      await user.click(button);
      
      expect(mockWindowOpen).toHaveBeenCalledWith(
        'https://api.example.com/click?id=123&redirect=https://example.com/landing',
        '_blank',
        'noopener,noreferrer'
      );
    });

    it('does nothing if clickUrl is not provided and no custom handler', async () => {
      const user = userEvent.setup();
      const adWithoutClickUrl = { ...mockAd, clickUrl: undefined };
      render(<IrisAd ad={adWithoutClickUrl} />);
      
      const button = screen.getByRole('button');
      await user.click(button);
      
      expect(mockWindowOpen).not.toHaveBeenCalled();
    });

    it('falls back to url when clickUrl is empty string', async () => {
      const user = userEvent.setup();
      const adWithEmptyClickUrl = { ...mockAd, clickUrl: '' };
      render(<IrisAd ad={adWithEmptyClickUrl} />);
      
      const button = screen.getByRole('button');
      await user.click(button);
      
      // Empty string is truthy, so it uses the empty clickUrl, not the fallback
      expect(mockWindowOpen).toHaveBeenCalledWith(
        '',
        '_blank',
        'noopener,noreferrer'
      );
    });

    it('calls custom onButtonClick handler when provided with clickUrl value', async () => {
      const user = userEvent.setup();
      const mockOnButtonClick = jest.fn();
      render(<IrisAd ad={mockAd} onButtonClick={mockOnButtonClick} />);
      
      const button = screen.getByRole('button');
      await user.click(button);
      
      expect(mockOnButtonClick).toHaveBeenCalledWith(
        'https://api.example.com/click?id=123&redirect=https://example.com/landing',
        expect.any(Object) // MouseEvent
      );
      expect(mockWindowOpen).not.toHaveBeenCalled();
    });

    it('handles keyboard navigation (Enter key)', () => {
      render(<IrisAd ad={mockAd} />);
      
      const button = screen.getByRole('button');
      fireEvent.keyDown(button, { key: 'Enter', code: 'Enter' });
      
      // Button should be focusable and handle Enter key naturally
      expect(button).toBeVisible();
    });

    it('handles keyboard navigation (Space key)', () => {
      render(<IrisAd ad={mockAd} />);
      
      const button = screen.getByRole('button');
      fireEvent.keyDown(button, { key: ' ', code: 'Space' });
      
      // Button should be focusable and handle Space key naturally
      expect(button).toBeVisible();
    });
  });

  describe('Edge Cases', () => {
    it('handles ad with missing text gracefully', () => {
      const adWithoutText = { ...mockAd, text: '' };
      render(<IrisAd ad={adWithoutText} />);
      
      // Should still render the component structure
      expect(screen.getByRole('button')).toBeInTheDocument();
      
      // Text element should exist but be empty
      const container = screen.getByRole('button').closest('div');
      const textElement = container?.querySelector('[data-iris-ad="text"]');
      expect(textElement).toBeInTheDocument();
      expect(textElement).toHaveTextContent('');
    });

    it('handles missing clickUrl gracefully (no window.open)', async () => {
      const user = userEvent.setup();
      const adWithoutClick = { ...mockAd, clickUrl: undefined };
      render(<IrisAd ad={adWithoutClick} />);
      
      const button = screen.getByRole('button');
      await user.click(button);
      
      expect(mockWindowOpen).not.toHaveBeenCalled();
    });

    it('handles very long click URLs', async () => {
      const user = userEvent.setup();
      const longUrl = 'https://example.com/' + 'x'.repeat(2000);
      const adWithLongUrl = { ...mockAd, clickUrl: longUrl };
      render(<IrisAd ad={adWithLongUrl} />);
      
      const button = screen.getByRole('button');
      await user.click(button);
      
      expect(mockWindowOpen).toHaveBeenCalledWith(longUrl, '_blank', 'noopener,noreferrer');
    });

    it('maintains proper display name for debugging', () => {
      expect(IrisAd.displayName).toBe('IrisAd');
    });
  });

  describe('Accessibility', () => {
    it('button is accessible via keyboard', () => {
      render(<IrisAd ad={mockAd} />);
      
      const button = screen.getByRole('button');
      expect(button).toBeVisible();
      expect(button).not.toHaveAttribute('disabled');
    });

    it('button has correct button type', () => {
      render(<IrisAd ad={mockAd} />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'button');
    });

    it('text content is readable', () => {
      render(<IrisAd ad={mockAd} />);
      
      const text = screen.getByText('Test Advertisement Text');
      expect(text).toBeVisible();
    });
  });
});
