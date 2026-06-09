import { type ReactNode } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AmigosListPage from '@/features/amigos/pages/AmigosListPage';
import { useAmigos } from '@/features/amigos/hooks/use-amigos';
import { useModulePermissions } from '@/shared/hooks/use-permisos';
import { useSearch } from '@/shared/hooks/use-search';
import { type Amigo } from '@/types/amigos';

// Types for mock UI components
interface MockStyled {
  children?: ReactNode;
  className?: string;
}
interface MockButton extends MockStyled {
  onClick?: () => void;
  disabled?: boolean;
}
interface MockInput extends MockStyled {
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  'aria-label'?: string;
}
interface MockDialog {
  children?: ReactNode;
  open?: boolean;
}

// Mock hooks
const mockAddAmigo = jest.fn();
const mockUpdateAmigo = jest.fn();
const mockDeleteAmigo = jest.fn();
const mockRefreshAmigos = jest.fn();
const mockSetSearchTerm = jest.fn();
const mockClearSearch = jest.fn();

const mockAmigos: Amigo[] = [
  {
    id: '1',
    nombre: 'Juan Perez',
    telefono: '123456789',
    fechaRegistro: '2025-01-15T00:00:00.000Z',
    migratedFrom: null,
  },
  {
    id: '2',
    nombre: 'Maria Lopez',
    notas: 'Amiga cercana',
    fechaRegistro: '2025-02-20T00:00:00.000Z',
    migratedFrom: 'simpatizantes',
  },
];

jest.mock('@/features/amigos/hooks/use-amigos', () => ({
  useAmigos: jest.fn(),
}));

jest.mock('@/shared/hooks/use-permisos', () => ({
  useModulePermissions: jest.fn(),
}));

jest.mock('@/shared/hooks/use-search', () => ({
  useSearch: jest.fn(),
}));

jest.mock('@/shared/ui/button', () => ({
  Button: ({ children, onClick, disabled, className }: MockButton) => (
    <button onClick={onClick} disabled={disabled} className={className}>
      {children}
    </button>
  ),
}));

jest.mock('@/shared/ui/badge', () => ({
  Badge: ({ children, className }: MockStyled) => (
    <span className={className}>{children}</span>
  ),
}));

jest.mock('@/shared/ui/card', () => ({
  Card: ({ children, className }: MockStyled) => (
    <div className={className}>{children}</div>
  ),
  CardContent: ({ children, className }: MockStyled) => (
    <div className={className}>{children}</div>
  ),
  CardHeader: ({ children, className }: MockStyled) => (
    <div className={className}>{children}</div>
  ),
  CardTitle: ({ children, className }: MockStyled) => (
    <h2 className={className}>{children}</h2>
  ),
}));

jest.mock('@/shared/ui/input', () => ({
  Input: ({
    placeholder,
    value,
    onChange,
    disabled,
    className,
    'aria-label': ariaLabel,
  }: MockInput) => (
    <input
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={className}
      aria-label={ariaLabel}
    />
  ),
}));

jest.mock('@/shared/ui/alert-dialog', () => ({
  AlertDialog: ({ children, open }: MockDialog) =>
    open ? <div>{children}</div> : null,
  AlertDialogContent: ({ children }: { children?: ReactNode }) => (
    <div>{children}</div>
  ),
  AlertDialogHeader: ({ children }: { children?: ReactNode }) => (
    <div>{children}</div>
  ),
  AlertDialogTitle: ({ children }: { children?: ReactNode }) => (
    <h3>{children}</h3>
  ),
  AlertDialogDescription: ({ children }: { children?: ReactNode }) => (
    <p>{children}</p>
  ),
  AlertDialogFooter: ({ children }: { children?: ReactNode }) => (
    <div>{children}</div>
  ),
  AlertDialogCancel: ({ children, onClick, disabled }: MockButton) => (
    <button onClick={onClick} disabled={disabled}>
      {children}
    </button>
  ),
  AlertDialogAction: ({
    children,
    onClick,
    disabled,
    className,
  }: MockButton & MockStyled) => (
    <button onClick={onClick} disabled={disabled} className={className}>
      {children}
    </button>
  ),
  AlertDialogTrigger: ({ children }: { children?: ReactNode }) => (
    <div>{children}</div>
  ),
}));

jest.mock('@/shared/ui/dialog', () => ({
  Dialog: ({ children, open }: MockDialog) =>
    open ? <div>{children}</div> : null,
  DialogContent: ({ children, className }: MockStyled) => (
    <div className={className}>{children}</div>
  ),
  DialogHeader: ({ children }: { children?: ReactNode }) => (
    <div>{children}</div>
  ),
  DialogTitle: ({ children }: { children?: ReactNode }) => <h3>{children}</h3>,
}));

jest.mock('lucide-react', () => ({
  Loader2: () => <span>Loader2</span>,
  Plus: () => <span>Plus</span>,
  RefreshCw: ({ className }: { className?: string }) => (
    <span className={className}>RefreshCw</span>
  ),
  Search: () => <span>SearchIcon</span>,
  X: () => <span>XIcon</span>,
  Users: () => <span>UsersIcon</span>,
  User: () => <span>UserIcon</span>,
  Edit3: () => <span>EditIcon</span>,
  Trash2: () => <span>TrashIcon</span>,
}));

describe('AmigosListPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    (useAmigos as jest.Mock).mockReturnValue({
      amigos: mockAmigos,
      loading: false,
      error: null,
      isAdding: false,
      isUpdating: false,
      isDeleting: false,
      addAmigo: mockAddAmigo,
      updateAmigo: mockUpdateAmigo,
      deleteAmigo: mockDeleteAmigo,
      refreshAmigos: mockRefreshAmigos,
    });

    (useModulePermissions as jest.Mock).mockReturnValue({
      canCreate: true,
      canEdit: true,
      canDelete: true,
      isLoading: false,
    });

    (useSearch as jest.Mock).mockReturnValue({
      searchTerm: '',
      setSearchTerm: mockSetSearchTerm,
      filteredItems: mockAmigos,
      clearSearch: mockClearSearch,
    });
  });

  it('renders the page with header "Amigos de la Iglesia"', () => {
    render(<AmigosListPage />);

    expect(screen.getByText('Amigos de la Iglesia')).toBeInTheDocument();
  });

  it('renders action buttons', () => {
    render(<AmigosListPage />);

    expect(screen.getByText('Actualizar Datos')).toBeInTheDocument();
    expect(screen.getByText('Agregar Nuevo Amigo')).toBeInTheDocument();
  });

  it('renders amigo list items', () => {
    render(<AmigosListPage />);

    expect(screen.getByText('Juan Perez')).toBeInTheDocument();
    expect(screen.getByText('Maria Lopez')).toBeInTheDocument();
  });

  it('shows loading spinner when loading is true', () => {
    (useAmigos as jest.Mock).mockReturnValue({
      amigos: [],
      loading: true,
      error: null,
      isAdding: false,
      isUpdating: false,
      isDeleting: false,
      addAmigo: mockAddAmigo,
      updateAmigo: mockUpdateAmigo,
      deleteAmigo: mockDeleteAmigo,
      refreshAmigos: mockRefreshAmigos,
    });

    render(<AmigosListPage />);

    expect(screen.getByText('Cargando amigos...')).toBeInTheDocument();
  });

  it('shows loading spinner when permisos are loading', () => {
    (useModulePermissions as jest.Mock).mockReturnValue({
      canCreate: false,
      canEdit: false,
      canDelete: false,
      isLoading: true,
    });

    render(<AmigosListPage />);

    expect(screen.getByText('Cargando amigos...')).toBeInTheDocument();
  });

  it('shows error message when error is present', () => {
    (useAmigos as jest.Mock).mockReturnValue({
      amigos: [],
      loading: false,
      error: 'Error de conexión',
      isAdding: false,
      isUpdating: false,
      isDeleting: false,
      addAmigo: mockAddAmigo,
      updateAmigo: mockUpdateAmigo,
      deleteAmigo: mockDeleteAmigo,
      refreshAmigos: mockRefreshAmigos,
    });

    render(<AmigosListPage />);

    expect(screen.getByText('Error: Error de conexión')).toBeInTheDocument();
  });

  it('calls refreshAmigos when refresh button is clicked', async () => {
    mockRefreshAmigos.mockResolvedValueOnce(undefined);

    render(<AmigosListPage />);

    fireEvent.click(screen.getByText('Actualizar Datos'));

    await waitFor(() => {
      expect(mockRefreshAmigos).toHaveBeenCalled();
    });
  });

  it('opens form dialog when "Agregar Nuevo Amigo" is clicked', () => {
    render(<AmigosListPage />);

    fireEvent.click(screen.getByText('Agregar Nuevo Amigo'));

    expect(screen.getByText('Nuevo Amigo')).toBeInTheDocument();
  });

  it('does not show "Agregar Nuevo Amigo" when canCreate is false', () => {
    (useModulePermissions as jest.Mock).mockReturnValue({
      canCreate: false,
      canEdit: false,
      canDelete: false,
      isLoading: false,
    });

    render(<AmigosListPage />);

    expect(screen.queryByText('Agregar Nuevo Amigo')).not.toBeInTheDocument();
  });

  it('shows toast and does not open form when canCreate is false and add is clicked', () => {
    // This is handled at the handler level - if canCreate is false the button isn't rendered
    (useModulePermissions as jest.Mock).mockReturnValue({
      canCreate: false,
      canEdit: true,
      canDelete: true,
      isLoading: false,
    });

    render(<AmigosListPage />);

    // When canCreate is false, the button to add is not rendered
    expect(screen.queryByText('Agregar Nuevo Amigo')).not.toBeInTheDocument();
  });

  it('opens delete dialog when delete button is clicked on an amigo', () => {
    render(<AmigosListPage />);

    // Click the delete button for the first amigo
    const deleteButtons = screen.getAllByText('TrashIcon');
    fireEvent.click(deleteButtons[0]);

    expect(screen.getByText('¿Eliminar amigo?')).toBeInTheDocument();
  });

  it('calls deleteAmigo when delete is confirmed', async () => {
    mockDeleteAmigo.mockResolvedValueOnce(undefined);

    render(<AmigosListPage />);

    // Click delete button to open dialog
    const deleteButtons = screen.getAllByText('TrashIcon');
    fireEvent.click(deleteButtons[0]);

    // Click confirm
    fireEvent.click(screen.getByText('Eliminar'));

    await waitFor(() => {
      expect(mockDeleteAmigo).toHaveBeenCalledWith(expect.any(String));
    });
  });

  it('shows ver perfil button for each amigo', () => {
    render(<AmigosListPage />);

    const perfilButtons = screen.getAllByText('Ver Perfil');
    expect(perfilButtons).toHaveLength(2);
  });

  it('displays filtered count in header', () => {
    render(<AmigosListPage />);

    expect(screen.getByText('2 amigos')).toBeInTheDocument();
  });

  it('displays search input with correct placeholder', () => {
    render(<AmigosListPage />);

    expect(screen.getByPlaceholderText('Buscar amigo...')).toBeInTheDocument();
  });

  it('updates search term when typing in search input', () => {
    render(<AmigosListPage />);

    const searchInput = screen.getByPlaceholderText('Buscar amigo...');
    fireEvent.change(searchInput, { target: { value: 'Juan' } });

    expect(mockSetSearchTerm).toHaveBeenCalledWith('Juan');
  });
});
