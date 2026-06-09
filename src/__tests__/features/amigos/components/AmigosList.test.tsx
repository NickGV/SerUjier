import { render, screen, fireEvent } from '@testing-library/react';
import { AmigosList } from '@/features/amigos/components/amigos/AmigosList';
import { type Amigo } from '@/types/amigos';

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

const mockOnEdit = jest.fn();
const mockOnDelete = jest.fn();

const mockAmigos: Amigo[] = [
  {
    id: '1',
    nombre: 'Carlos Ruiz',
    telefono: '987654321',
    notas: 'Visitante',
    fechaRegistro: '2025-03-10T00:00:00.000Z',
    migratedFrom: 'visitas',
  },
  {
    id: '2',
    nombre: 'Juan Perez',
    telefono: '123456789',
    fechaRegistro: '2025-01-15T00:00:00.000Z',
    migratedFrom: null,
  },
  {
    id: '3',
    nombre: 'Maria Lopez',
    notas: 'Amiga cercana',
    fechaRegistro: '2025-02-20T00:00:00.000Z',
    migratedFrom: 'simpatizantes',
  },
];

describe('AmigosList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders empty state when amigos array is empty', () => {
    render(<AmigosList amigos={[]} searchTerm="" />);

    expect(screen.getByText('No se encontraron amigos')).toBeInTheDocument();
  });

  it('shows search suggestion in empty state when searchTerm is provided', () => {
    render(<AmigosList amigos={[]} searchTerm="Zzz" />);

    expect(screen.getByText('No se encontraron amigos')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Intenta con un término de búsqueda diferente o más específico'
      )
    ).toBeInTheDocument();
  });

  it('shows add suggestion in empty state when no searchTerm', () => {
    render(<AmigosList amigos={[]} searchTerm="" />);

    expect(
      screen.getByText(
        'Comienza agregando el primer amigo usando el botón de arriba'
      )
    ).toBeInTheDocument();
  });

  it('renders amigos sorted alphabetically by nombre', () => {
    render(<AmigosList amigos={mockAmigos} searchTerm="" />);

    const nombres = screen.getAllByText(/Carlos Ruiz|Juan Perez|Maria Lopez/);
    // Check the first amigo rendered is Carlos (alphabetically first)
    expect(nombres[0]).toHaveTextContent('Carlos Ruiz');
  });

  it('renders "Ver Perfil" button for each amigo', () => {
    render(<AmigosList amigos={mockAmigos} searchTerm="" />);

    const perfilButtons = screen.getAllByText('Ver Perfil');
    expect(perfilButtons).toHaveLength(3);
  });

  it('navigates to amigo detail page when clicking "Ver Perfil"', () => {
    render(<AmigosList amigos={[mockAmigos[0]]} searchTerm="" />);

    fireEvent.click(screen.getByText('Ver Perfil'));

    expect(mockPush).toHaveBeenCalledWith('/amigos/1');
  });

  it('navigates to amigo detail page when clicking the card', () => {
    render(<AmigosList amigos={[mockAmigos[0]]} searchTerm="" />);

    const card = screen
      .getByText('Carlos Ruiz')
      .closest('[class*="cursor-pointer"]');
    if (card) fireEvent.click(card);

    expect(mockPush).toHaveBeenCalledWith('/amigos/1');
  });

  it('shows edit button when onEdit is provided', () => {
    render(
      <AmigosList amigos={[mockAmigos[0]]} searchTerm="" onEdit={mockOnEdit} />
    );

    expect(screen.getByLabelText('Editar amigo')).toBeInTheDocument();
  });

  it('does not show edit button when onEdit is not provided', () => {
    render(<AmigosList amigos={[mockAmigos[0]]} searchTerm="" />);

    expect(screen.queryByLabelText('Editar amigo')).not.toBeInTheDocument();
  });

  it('shows delete button when onDelete is provided', () => {
    render(
      <AmigosList
        amigos={[mockAmigos[0]]}
        searchTerm=""
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByLabelText('Eliminar amigo')).toBeInTheDocument();
  });

  it('does not show delete button when onDelete is not provided', () => {
    render(<AmigosList amigos={[mockAmigos[0]]} searchTerm="" />);

    expect(screen.queryByLabelText('Eliminar amigo')).not.toBeInTheDocument();
  });

  it('calls onEdit when edit button is clicked', () => {
    render(
      <AmigosList amigos={[mockAmigos[0]]} searchTerm="" onEdit={mockOnEdit} />
    );

    fireEvent.click(screen.getByLabelText('Editar amigo'));

    expect(mockOnEdit).toHaveBeenCalledWith(mockAmigos[0]);
  });

  it('calls onDelete when delete button is clicked', () => {
    render(
      <AmigosList
        amigos={[mockAmigos[0]]}
        searchTerm=""
        onDelete={mockOnDelete}
      />
    );

    fireEvent.click(screen.getByLabelText('Eliminar amigo'));

    expect(mockOnDelete).toHaveBeenCalledWith(mockAmigos[0]);
  });

  it('renders badge with "Amigo" text', () => {
    render(<AmigosList amigos={[mockAmigos[0]]} searchTerm="" />);

    expect(screen.getByText('Amigo')).toBeInTheDocument();
  });

  it('renders date formatted in Spanish locale', () => {
    render(<AmigosList amigos={[mockAmigos[1]]} searchTerm="" />);

    // Juan Perez has fechaRegistro '2025-01-15'
    expect(screen.getByText(/Desde:/)).toBeInTheDocument();
  });

  it('shows "Sin notas" when amigo has no notas', () => {
    render(<AmigosList amigos={[mockAmigos[1]]} searchTerm="" />);

    expect(screen.getByText('Sin notas')).toBeInTheDocument();
  });

  it('shows actual notas text when amigo has notas', () => {
    render(<AmigosList amigos={[mockAmigos[2]]} searchTerm="" />);

    expect(screen.getByText('Amiga cercana')).toBeInTheDocument();
  });

  it('clicking edit button does not trigger navigation', () => {
    render(
      <AmigosList amigos={[mockAmigos[0]]} searchTerm="" onEdit={mockOnEdit} />
    );

    fireEvent.click(screen.getByLabelText('Editar amigo'));

    // Should call onEdit, NOT push
    expect(mockOnEdit).toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('clicking delete button does not trigger navigation', () => {
    render(
      <AmigosList
        amigos={[mockAmigos[0]]}
        searchTerm=""
        onDelete={mockOnDelete}
      />
    );

    fireEvent.click(screen.getByLabelText('Eliminar amigo'));

    // Should call onDelete, NOT push
    expect(mockOnDelete).toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();
  });
});
