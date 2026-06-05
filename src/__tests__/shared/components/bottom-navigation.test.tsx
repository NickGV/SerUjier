import { render, screen } from '@testing-library/react';
import { BottomNavigation } from '@/shared/components/bottom-navigation';
import { usePermisos } from '@/shared/hooks/use-permisos';
import { usePathname, useRouter } from 'next/navigation';
import { type User } from '@/shared/types';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
  useRouter: jest.fn(),
}));

const mockCanView = jest.fn();
const mockUsePermisos = usePermisos as jest.Mock;

jest.mock('@/shared/hooks/use-permisos', () => ({
  usePermisos: jest.fn(),
}));

// Mock feature-flags with a getter so we can control per-test
(globalThis as any).__MOCK_AMIGOS_UNIFIED = false;

jest.mock('@/config/feature-flags', () => ({
  featureFlags: {
    get amigosUnified() {
      return (globalThis as any).__MOCK_AMIGOS_UNIFIED;
    },
  },
}));

const baseUser: User = {
  id: 'user-1',
  nombre: 'Test User',
  rol: 'ujier',
  permisos: [],
};

const mockRouter = { push: jest.fn() };

describe('BottomNavigation — amigos nav item', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (globalThis as any).__MOCK_AMIGOS_UNIFIED = false;
    (usePathname as jest.Mock).mockReturnValue('/');
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  it('shows "Amigos" nav item for admin users', () => {
    mockUsePermisos.mockReturnValue({
      canView: mockCanView,
      isAdmin: true,
      isLoading: false,
    });

    render(<BottomNavigation currentUser={baseUser} onLogout={jest.fn()} />);

    expect(screen.getByText('Amigos')).toBeInTheDocument();
  });

  it('shows "Amigos" nav item when canView("amigos") returns true', () => {
    mockCanView.mockImplementation((module: string) => {
      if (module === 'amigos') return true;
      return false;
    });

    mockUsePermisos.mockReturnValue({
      canView: mockCanView,
      isAdmin: false,
      isLoading: false,
    });

    render(<BottomNavigation currentUser={baseUser} onLogout={jest.fn()} />);

    expect(screen.getByText('Amigos')).toBeInTheDocument();
  });

  it('does NOT show "Amigos" nav item when canView("amigos") returns false', () => {
    mockCanView.mockImplementation((module: string) => {
      if (module === 'amigos') return false;
      if (module === 'simpatizantes') return true;
      return false;
    });

    mockUsePermisos.mockReturnValue({
      canView: mockCanView,
      isAdmin: false,
      isLoading: false,
    });

    render(<BottomNavigation currentUser={baseUser} onLogout={jest.fn()} />);

    expect(screen.queryByText('Amigos')).not.toBeInTheDocument();
  });

  it('shows "Amigos" with correct icon and path', () => {
    mockUsePermisos.mockReturnValue({
      canView: mockCanView,
      isAdmin: true,
      isLoading: false,
    });

    render(<BottomNavigation currentUser={baseUser} onLogout={jest.fn()} />);

    const amigosLink = screen.getByText('Amigos').closest('button');
    expect(amigosLink).toHaveAttribute('title', 'Gestionar amigos');
  });

  it('still shows legacy "Simpatizantes" and "Visitas" items alongside Amigos', () => {
    mockCanView.mockImplementation(() => true);
    mockUsePermisos.mockReturnValue({
      canView: mockCanView,
      isAdmin: false,
      isLoading: false,
    });

    render(<BottomNavigation currentUser={baseUser} onLogout={jest.fn()} />);

    expect(screen.getByText('Amigos')).toBeInTheDocument();
    expect(screen.getByText('Simpatizantes')).toBeInTheDocument();
    expect(screen.getByText('Visitas')).toBeInTheDocument();
  });

  describe('amigosUnified feature flag', () => {
    it('hides legacy Simpatizantes and Visitas for admin when flag is true', () => {
      (globalThis as any).__MOCK_AMIGOS_UNIFIED = true;

      mockUsePermisos.mockReturnValue({
        canView: mockCanView,
        isAdmin: true,
        isLoading: false,
      });

      render(<BottomNavigation currentUser={baseUser} onLogout={jest.fn()} />);

      expect(screen.queryByText('Simpatizantes')).not.toBeInTheDocument();
      expect(screen.queryByText('Visitas')).not.toBeInTheDocument();
    });

    it('shows Amigos nav item for admin when flag is true', () => {
      (globalThis as any).__MOCK_AMIGOS_UNIFIED = true;

      mockUsePermisos.mockReturnValue({
        canView: mockCanView,
        isAdmin: true,
        isLoading: false,
      });

      render(<BottomNavigation currentUser={baseUser} onLogout={jest.fn()} />);

      expect(screen.getByText('Amigos')).toBeInTheDocument();
    });

    it('hides legacy items for non-admin with permissions when flag is true', () => {
      (globalThis as any).__MOCK_AMIGOS_UNIFIED = true;
      mockCanView.mockImplementation(() => true);

      mockUsePermisos.mockReturnValue({
        canView: mockCanView,
        isAdmin: false,
        isLoading: false,
      });

      render(<BottomNavigation currentUser={baseUser} onLogout={jest.fn()} />);

      expect(screen.queryByText('Simpatizantes')).not.toBeInTheDocument();
      expect(screen.queryByText('Visitas')).not.toBeInTheDocument();
      expect(screen.getByText('Amigos')).toBeInTheDocument();
    });

    it('shows legacy items when flag is false (default)', () => {
      (globalThis as any).__MOCK_AMIGOS_UNIFIED = false;
      mockCanView.mockImplementation(() => true);

      mockUsePermisos.mockReturnValue({
        canView: mockCanView,
        isAdmin: false,
        isLoading: false,
      });

      render(<BottomNavigation currentUser={baseUser} onLogout={jest.fn()} />);

      expect(screen.getByText('Simpatizantes')).toBeInTheDocument();
      expect(screen.getByText('Visitas')).toBeInTheDocument();
      expect(screen.getByText('Amigos')).toBeInTheDocument();
    });
  });
});
