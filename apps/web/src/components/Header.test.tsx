import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

vi.mock('../services/api', () => ({
  api: {
    getHeader: vi.fn(async () => ({
      navigationItems: [
        { id: 'a', label: 'Home', url: '/', type: 'link', order: 0, isActive: true, openInNewTab: false },
        // Old saved settings may still say "dropdown": it must now behave like a normal link.
        { id: 'b', label: 'Discover', url: '/discover', type: 'dropdown', order: 1, isActive: true, openInNewTab: false },
        { id: 'c', label: 'Products', url: '/products', type: 'link', order: 2, isActive: true, openInNewTab: false }
      ]
    })),
    getMaterials: vi.fn(async () => [{ slug: 'rattan-bamboo', name: 'Rattan & Bamboo' }])
  }
}));

import { Header } from './Header';

afterEach(() => cleanup());

const Where = () => <p data-testid="where">{useLocation().pathname}</p>;

const renderHeader = (path = '/') =>
  render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <MemoryRouter initialEntries={[path]}>
        <Header />
        <Routes>
          <Route path="*" element={<Where />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );

describe('Header Discover link', () => {
  it('is a plain link without a dropdown, even if settings still say "dropdown"', async () => {
    renderHeader();
    const discover = await screen.findByRole('link', { name: 'Discover' });
    expect(discover.getAttribute('href')).toBe('/discover');
    expect(screen.queryByRole('button', { name: /Discover/ })).toBeNull();
    expect(discover.getAttribute('aria-haspopup')).toBeNull();
  });

  it('does not open a category menu on hover or click', async () => {
    renderHeader();
    const discover = await screen.findByRole('link', { name: 'Discover' });
    fireEvent.mouseEnter(discover);
    expect(screen.queryByText('Craft Materials')).toBeNull();
    expect(screen.queryByRole('menu')).toBeNull();
    fireEvent.click(discover);
    expect(screen.getByTestId('where').textContent).toBe('/discover');
    expect(screen.queryByRole('menu')).toBeNull();
  });

  it('stays highlighted on a category page', async () => {
    renderHeader('/discover/rattan-bamboo');
    const discover = await screen.findByRole('link', { name: 'Discover' });
    expect(discover.className).toContain('font-semibold');
  });
});
