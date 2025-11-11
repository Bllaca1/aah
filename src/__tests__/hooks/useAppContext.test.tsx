import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useAppContext } from '../../hooks/useAppContext';
import { AppProvider } from '../../context/AppContext';

describe('useAppContext Hook', () => {
  it('should throw error when used outside AppProvider', () => {
    expect(() => {
      renderHook(() => useAppContext());
    }).toThrow();
  });

  it('should return context value when used inside AppProvider', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AppProvider>{children}</AppProvider>
    );

    const { result } = renderHook(() => useAppContext(), { wrapper });

    expect(result.current).toBeDefined();
    expect(result.current).toHaveProperty('user');
    expect(result.current).toHaveProperty('setUser');
  });

  it('should have initial user as null', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AppProvider>{children}</AppProvider>
    );

    const { result } = renderHook(() => useAppContext(), { wrapper });

    expect(result.current.user).toBeNull();
  });

  it('should provide setUser function', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AppProvider>{children}</AppProvider>
    );

    const { result } = renderHook(() => useAppContext(), { wrapper });

    expect(typeof result.current.setUser).toBe('function');
  });
});
