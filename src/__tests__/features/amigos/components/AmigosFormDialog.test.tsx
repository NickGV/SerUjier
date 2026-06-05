import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AmigosFormDialog } from '@/features/amigos/components/amigos/AmigosFormDialog';
import { type Amigo } from '@/types/amigos';

const mockOnSave = jest.fn();
const mockOnClose = jest.fn();

const defaultProps = {
  isOpen: true,
  onClose: mockOnClose,
  amigo: null as Amigo | null,
  onSave: mockOnSave,
  isSaving: false,
};

const mockAmigo: Amigo = {
  id: 'amigo-1',
  nombre: 'Juan Perez',
  telefono: '123456789',
  notas: 'Amigo de la iglesia',
  fechaRegistro: '2025-01-15T00:00:00.000Z',
  migratedFrom: null,
};

describe('AmigosFormDialog', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with title "Nuevo Amigo" when creating a new amigo', () => {
    render(<AmigosFormDialog {...defaultProps} />);

    expect(screen.getByText('Nuevo Amigo')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Nombre del amigo')).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('Número de teléfono')
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('Notas adicionales')
    ).toBeInTheDocument();
    expect(screen.getByText('Cancelar')).toBeInTheDocument();
    expect(screen.getByText('Agregar')).toBeInTheDocument();
  });

  it('renders with title "Editar Amigo" when editing an existing amigo', () => {
    render(<AmigosFormDialog {...defaultProps} amigo={mockAmigo} />);

    expect(screen.getByText('Editar Amigo')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Juan Perez')).toBeInTheDocument();
    expect(screen.getByDisplayValue('123456789')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Amigo de la iglesia')).toBeInTheDocument();
    expect(screen.getByText('Guardar')).toBeInTheDocument();
  });

  it('disables submit button when nombre is empty', () => {
    render(<AmigosFormDialog {...defaultProps} />);

    const submitButton = screen.getByText('Agregar');
    expect(submitButton).toBeDisabled();
  });

  it('enables submit button when nombre has content', () => {
    render(<AmigosFormDialog {...defaultProps} />);

    const input = screen.getByPlaceholderText('Nombre del amigo');
    fireEvent.change(input, { target: { value: 'Maria Lopez' } });

    const submitButton = screen.getByText('Agregar');
    expect(submitButton).not.toBeDisabled();
  });

  it('calls onSave with clean data and closes on submit', async () => {
    mockOnSave.mockResolvedValueOnce(undefined);

    render(<AmigosFormDialog {...defaultProps} />);

    const nombreInput = screen.getByPlaceholderText('Nombre del amigo');
    const telefonoInput = screen.getByPlaceholderText('Número de teléfono');
    const notasInput = screen.getByPlaceholderText('Notas adicionales');

    fireEvent.change(nombreInput, { target: { value: 'Maria Lopez' } });
    fireEvent.change(telefonoInput, { target: { value: '987654321' } });
    fireEvent.change(notasInput, { target: { value: 'Nuevo amigo' } });

    fireEvent.click(screen.getByText('Agregar'));

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith({
        nombre: 'Maria Lopez',
        telefono: '987654321',
        notas: 'Nuevo amigo',
        migratedFrom: null,
      });
    });

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('skips empty optional fields when calling onSave', async () => {
    mockOnSave.mockResolvedValueOnce(undefined);

    render(<AmigosFormDialog {...defaultProps} />);

    const nombreInput = screen.getByPlaceholderText('Nombre del amigo');
    fireEvent.change(nombreInput, { target: { value: 'Solo Nombre' } });

    fireEvent.click(screen.getByText('Agregar'));

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith({
        nombre: 'Solo Nombre',
        migratedFrom: null,
      });
    });
  });

  it('shows Loader2 icon when isSaving is true', () => {
    render(<AmigosFormDialog {...defaultProps} isSaving={true} />);

    expect(screen.getByText('Agregando...')).toBeInTheDocument();
  });

  it('calls onClose when Cancel is clicked', () => {
    render(<AmigosFormDialog {...defaultProps} />);

    fireEvent.click(screen.getByText('Cancelar'));

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('does not call onClose when isSaving and cancel is clicked', () => {
    render(<AmigosFormDialog {...defaultProps} isSaving={true} />);

    fireEvent.click(screen.getByText('Cancelar'));

    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('resets form data when dialog opens without amigo', () => {
    const { rerender } = render(
      <AmigosFormDialog {...defaultProps} isOpen={false} />
    );

    rerender(<AmigosFormDialog {...defaultProps} isOpen={true} />);

    const nombreInput = screen.getByPlaceholderText(
      'Nombre del amigo'
    ) as HTMLInputElement;
    expect(nombreInput.value).toBe('');
  });

  it('does not submit when nombre is only whitespace', () => {
    render(<AmigosFormDialog {...defaultProps} />);

    const input = screen.getByPlaceholderText('Nombre del amigo');
    fireEvent.change(input, { target: { value: '   ' } });

    const submitButton = screen.getByText('Agregar');
    expect(submitButton).toBeDisabled();
  });

  it('renders label with asterisk for required field "Nombre *"', () => {
    render(<AmigosFormDialog {...defaultProps} />);

    expect(screen.getByText('Nombre *')).toBeInTheDocument();
  });
});
