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
      return true;
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

  it('does NOT show legacy "Simpatizantes" or "Visitas" items', () => {
    mockCanView.mockImplementation(() => true);
    mockUsePermisos.mockReturnValue({
      canView: mockCanView,
      isAdmin: false,
      isLoading: false,
    });

    render(<BottomNavigation currentUser={baseUser} onLogout={jest.fn()} />);

    expect(screen.getByText('Amigos')).toBeInTheDocument();
    expect(screen.queryByText('Simpatizantes')).not.toBeInTheDocument();
    expect(screen.queryByText('Visitas')).not.toBeInTheDocument();
  });
});
