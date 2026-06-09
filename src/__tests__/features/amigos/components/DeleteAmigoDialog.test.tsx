import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DeleteAmigoDialog } from '@/features/amigos/components/amigos/DeleteAmigoDialog';
import { type Amigo } from '@/types/amigos';

const mockOnConfirm = jest.fn();
const mockOnClose = jest.fn();

const mockAmigo: Amigo = {
  id: 'amigo-1',
  nombre: 'Juan Perez',
  telefono: '123456789',
  fechaRegistro: '2025-01-15T00:00:00.000Z',
  migratedFrom: null,
};

const defaultProps = {
  isOpen: true,
  onClose: mockOnClose,
  amigo: mockAmigo,
  onConfirm: mockOnConfirm,
  isDeleting: false,
};

describe('DeleteAmigoDialog', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders confirmation title', () => {
    render(<DeleteAmigoDialog {...defaultProps} />);

    expect(screen.getByText('¿Eliminar amigo?')).toBeInTheDocument();
  });

  it('renders amigo name in the confirmation message', () => {
    render(<DeleteAmigoDialog {...defaultProps} />);

    expect(screen.getByText(/Juan Perez/)).toBeInTheDocument();
  });

  it('renders cancel and delete buttons', () => {
    render(<DeleteAmigoDialog {...defaultProps} />);

    expect(screen.getByText('Cancelar')).toBeInTheDocument();
    expect(screen.getByText('Eliminar')).toBeInTheDocument();
  });

  it('calls onConfirm and onClose when delete is confirmed', async () => {
    mockOnConfirm.mockResolvedValueOnce(undefined);

    render(<DeleteAmigoDialog {...defaultProps} />);

    fireEvent.click(screen.getByText('Eliminar'));

    await waitFor(() => {
      expect(mockOnConfirm).toHaveBeenCalled();
    });

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('calls onClose when cancel is clicked', () => {
    render(<DeleteAmigoDialog {...defaultProps} />);

    fireEvent.click(screen.getByText('Cancelar'));

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('shows loading state when isDeleting is true', () => {
    render(<DeleteAmigoDialog {...defaultProps} isDeleting={true} />);

    expect(screen.getByText('Eliminando...')).toBeInTheDocument();
    expect(screen.getByText('Cancelar')).toBeDisabled();
  });

  it('returns null when amigo is null', () => {
    const { container } = render(
      <DeleteAmigoDialog {...defaultProps} amigo={null} />
    );

    expect(container.innerHTML).toBe('');
  });

  it('shows warning about irreversible action', () => {
    render(<DeleteAmigoDialog {...defaultProps} />);

    expect(
      screen.getByText(/Esta acción no se puede deshacer/)
    ).toBeInTheDocument();
  });

  it('disables delete button when isDeleting is true', () => {
    render(<DeleteAmigoDialog {...defaultProps} isDeleting={true} />);

    const deleteButton = screen.getByText('Eliminando...');
    expect(deleteButton.closest('button')).toBeDisabled();
  });
});
