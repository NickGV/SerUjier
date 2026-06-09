import { render, screen, fireEvent } from '@testing-library/react';
import { AmigosFilters } from '@/features/amigos/components/amigos/AmigosFilters';

const mockOnSearchChange = jest.fn();
const mockOnClearSearch = jest.fn();

const defaultProps = {
  searchTerm: '',
  onSearchChange: mockOnSearchChange,
  onClearSearch: mockOnClearSearch,
  totalCount: 10,
  filteredCount: 10,
};

describe('AmigosFilters', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders search input with placeholder "Buscar amigo..."', () => {
    render(<AmigosFilters {...defaultProps} />);

    const input = screen.getByPlaceholderText('Buscar amigo...');
    expect(input).toBeInTheDocument();
  });

  it('renders with correct aria-label', () => {
    render(<AmigosFilters {...defaultProps} />);

    expect(screen.getByLabelText('Buscar amigo')).toBeInTheDocument();
  });

  it('calls onSearchChange when typing in the input', () => {
    render(<AmigosFilters {...defaultProps} />);

    const input = screen.getByPlaceholderText('Buscar amigo...');
    fireEvent.change(input, { target: { value: 'Juan' } });

    expect(mockOnSearchChange).toHaveBeenCalledWith('Juan');
  });

  it('does not show clear button when searchTerm is empty', () => {
    render(<AmigosFilters {...defaultProps} />);

    expect(screen.queryByLabelText('Limpiar búsqueda')).not.toBeInTheDocument();
  });

  it('shows clear button when searchTerm is not empty', () => {
    render(<AmigosFilters {...defaultProps} searchTerm="Juan" />);

    expect(screen.getByLabelText('Limpiar búsqueda')).toBeInTheDocument();
  });

  it('calls onClearSearch when clear button is clicked', () => {
    render(<AmigosFilters {...defaultProps} searchTerm="Juan" />);

    fireEvent.click(screen.getByLabelText('Limpiar búsqueda'));

    expect(mockOnClearSearch).toHaveBeenCalled();
  });

  it('shows filtered count info when searching', () => {
    render(
      <AmigosFilters {...defaultProps} searchTerm="Juan" filteredCount={3} />
    );

    expect(screen.getByText('3 de 10 amigos encontrados')).toBeInTheDocument();
  });

  it('does not show count info when searchTerm is empty', () => {
    render(<AmigosFilters {...defaultProps} />);

    expect(screen.queryByText(/amigos encontrados/)).not.toBeInTheDocument();
  });

  it('renders Search icon', () => {
    const { container } = render(<AmigosFilters {...defaultProps} />);

    const searchIcon = container.querySelector('.lucide-search');
    expect(searchIcon).toBeInTheDocument();
  });

  it('renders X icon on clear button when searchTerm exists', () => {
    render(<AmigosFilters {...defaultProps} searchTerm="Test" />);

    const clearButton = screen.getByLabelText('Limpiar búsqueda');
    const xIcon = clearButton.querySelector('.lucide-x');
    expect(xIcon).toBeInTheDocument();
  });
});
