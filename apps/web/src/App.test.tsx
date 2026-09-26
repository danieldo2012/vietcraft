import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { App } from './App';
import React from 'react';

// Mock IntersectionObserver for Framer Motion in JSDOM
class MockIntersectionObserver {
  observe = () => null;
  unobserve = () => null;
  disconnect = () => null;
}
window.IntersectionObserver = MockIntersectionObserver as any;
window.scrollTo = (() => {}) as any;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false }
  }
});

describe('VietCraft Web Application', () => {
  it('renders brand logo and primary navigation links', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </QueryClientProvider>
    );

    // Verify brand presence
    const brandElements = screen.getAllByText(/VietCraft/i);
    expect(brandElements.length).toBeGreaterThan(0);

    // Verify navigation links
    expect(screen.getByRole('link', { name: /^Home$/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /^Discover/i })).toBeDefined();
    expect(screen.getByRole('link', { name: /^Products$/i })).toBeDefined();
    expect(screen.getByRole('link', { name: /^Journal$/i })).toBeDefined();
    expect(screen.getByRole('link', { name: /^About Us$/i })).toBeDefined();
  });
});
