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

describe('AmigosListPage - Integration', () => {
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

  it('renders loading state correctly', () => {
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

  it('renders loading state when permissions are loading', () => {
    (useModulePermissions as jest.Mock).mockReturnValue({
      canCreate: false,
      canEdit: false,
      canDelete: false,
      isLoading: true,
    });

    render(<AmigosListPage />);

    expect(screen.getByText('Cargando amigos...')).toBeInTheDocument();
  });

  it('renders error state correctly', () => {
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

  it('renders the amigos list with items', () => {
    render(<AmigosListPage />);

    expect(screen.getByText('Juan Perez')).toBeInTheDocument();
    expect(screen.getByText('Maria Lopez')).toBeInTheDocument();
    expect(screen.getByText('2 amigos')).toBeInTheDocument();
  });

  it('search filtering integrates with useSearch hook', () => {
    const filteredAmigos = [mockAmigos[0]]; // Only Juan Perez
    (useSearch as jest.Mock).mockReturnValue({
      searchTerm: 'Juan',
      setSearchTerm: mockSetSearchTerm,
      filteredItems: filteredAmigos,
      clearSearch: mockClearSearch,
    });

    render(<AmigosListPage />);

    // Should only show the filtered item
    expect(screen.getByText('Juan Perez')).toBeInTheDocument();
    expect(screen.queryByText('Maria Lopez')).not.toBeInTheDocument();
    expect(screen.getByText('1 amigos')).toBeInTheDocument();
  });

  it('form dialog opens on add button click when canCreate is true', () => {
    render(<AmigosListPage />);

    // Verify the add button is present
    expect(screen.getByText('Agregar Nuevo Amigo')).toBeInTheDocument();

    // Click the add button
    fireEvent.click(screen.getByText('Agregar Nuevo Amigo'));

    // The form dialog should open with "Nuevo Amigo" title
    expect(screen.getByText('Nuevo Amigo')).toBeInTheDocument();
  });

  it('form dialog does NOT open if canCreate is false', () => {
    (useModulePermissions as jest.Mock).mockReturnValue({
      canCreate: false,
      canEdit: true,
      canDelete: true,
      isLoading: false,
    });

    render(<AmigosListPage />);

    // When canCreate is false, the add button should not be rendered
    expect(screen.queryByText('Agregar Nuevo Amigo')).not.toBeInTheDocument();
    // The form dialog should not be open
    expect(screen.queryByText('Nuevo Amigo')).not.toBeInTheDocument();
  });

  it('edit flow: clicking edit button opens form dialog in edit mode', () => {
    render(<AmigosListPage />);

    // Find edit icons (EditIcon from lucide mock) and click the first one
    const editIcons = screen.getAllByText('EditIcon');
    expect(editIcons).toHaveLength(2);
    fireEvent.click(editIcons[0]);

    // The form dialog should open with "Editar Amigo" title
    expect(screen.getByText('Editar Amigo')).toBeInTheDocument();
  });

  it('delete flow: clicking delete opens confirmation dialog', () => {
    render(<AmigosListPage />);

    // Find trash icons (TrashIcon from lucide mock) and click the first one
    const deleteIcons = screen.getAllByText('TrashIcon');
    expect(deleteIcons).toHaveLength(2);
    fireEvent.click(deleteIcons[0]);

    // Confirmation dialog should appear
    expect(screen.getByText('¿Eliminar amigo?')).toBeInTheDocument();
  });

  it('shows refresh loading state when refresh button is clicked', async () => {
    // Make refresh take time
    mockRefreshAmigos.mockImplementationOnce(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );

    render(<AmigosListPage />);

    fireEvent.click(screen.getByText('Actualizar Datos'));

    // Should show "Actualizando..." while refreshing
    expect(screen.getByText('Actualizando...')).toBeInTheDocument();

    await waitFor(() => {
      expect(mockRefreshAmigos).toHaveBeenCalled();
    });
  });

  it('shows empty state when no amigos and no search term', () => {
    (useAmigos as jest.Mock).mockReturnValue({
      amigos: [],
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

    (useSearch as jest.Mock).mockReturnValue({
      searchTerm: '',
      setSearchTerm: mockSetSearchTerm,
      filteredItems: [],
      clearSearch: mockClearSearch,
    });

    render(<AmigosListPage />);

    expect(screen.getByText('No se encontraron amigos')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Comienza agregando el primer amigo usando el botón de arriba'
      )
    ).toBeInTheDocument();
  });

  it('shows empty state when search yields no results', () => {
    (useSearch as jest.Mock).mockReturnValue({
      searchTerm: 'zzz',
      setSearchTerm: mockSetSearchTerm,
      filteredItems: [],
      clearSearch: mockClearSearch,
    });

    render(<AmigosListPage />);

    expect(screen.getByText('No se encontraron amigos')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Intenta con un término de búsqueda diferente o más específico'
      )
    ).toBeInTheDocument();
  });
});
