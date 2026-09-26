import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { App } from './App';
import { ImageUploader } from './components/ImageUploader';
import React from 'react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false }
  }
});

describe('VietCraft Admin CMS', () => {
  it('renders admin authentication portal by default for unauthenticated users', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </QueryClientProvider>
    );

    // Verify presence of VietCraft CMS portal
    const titleElements = screen.getAllByText(/VietCraft CMS/i);
    expect(titleElements.length).toBeGreaterThan(0);

    // Verify login inputs
    expect(screen.getByRole('button', { name: /Sign in to Dashboard/i })).toBeDefined();
  });
});

describe('Admin CMS ImageUploader Component', () => {
  it('renders upload dropzone and URL entry trigger when empty', () => {
    const handleChange = vi.fn();
    render(
      <ImageUploader
        value=""
        onChange={handleChange}
        label="Test Image"
      />
    );

    expect(screen.getByText('Test Image')).toBeDefined();
    expect(screen.getByText('Click to upload local image')).toBeDefined();
    expect(screen.getByText(/JPEG, PNG, WEBP/i)).toBeDefined();
    expect(screen.getByRole('button', { name: /Or enter image URL/i })).toBeDefined();
  });

  it('allows entering and applying manual external image URL (e.g. Unsplash or Cloudinary)', () => {
    const handleChange = vi.fn();
    render(
      <ImageUploader
        value=""
        onChange={handleChange}
      />
    );

    // Click "Or enter image URL"
    const toggleBtn = screen.getByRole('button', { name: /Or enter image URL/i });
    fireEvent.click(toggleBtn);

    const input = screen.getByPlaceholderText('https://images.unsplash.com/...');
    expect(input).toBeDefined();

    fireEvent.change(input, {
      target: { value: 'https://images.unsplash.com/photo-1544816155-12df9643f363' }
    });

    const applyBtn = screen.getByRole('button', { name: /Apply/i });
    fireEvent.click(applyBtn);

    expect(handleChange).toHaveBeenCalledWith('https://images.unsplash.com/photo-1544816155-12df9643f363');
  });

  it('displays uploaded image preview and remove button when value is present', () => {
    const handleChange = vi.fn();
    render(
      <ImageUploader
        value="/uploads/artisan-teapot.jpg"
        onChange={handleChange}
      />
    );

    const preview = screen.getByAltText('Uploaded preview') as HTMLImageElement;
    expect(preview).toBeDefined();
    expect(preview.src).toContain('/uploads/artisan-teapot.jpg');

    const removeBtn = screen.getByTitle('Remove image');
    expect(removeBtn).toBeDefined();

    fireEvent.click(removeBtn);
    expect(handleChange).toHaveBeenCalledWith('');
  });
});
