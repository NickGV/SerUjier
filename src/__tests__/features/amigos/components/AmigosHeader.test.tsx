import { render, screen } from '@testing-library/react';
import { AmigosHeader } from '@/features/amigos/components/amigos/AmigosHeader';
import { type Amigo } from '@/types/amigos';

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
  {
    id: '3',
    nombre: 'Carlos Ruiz',
    telefono: '987654321',
    notas: 'Visitante',
    fechaRegistro: '2025-03-10T00:00:00.000Z',
    migratedFrom: 'visitas',
  },
];

describe('AmigosHeader', () => {
  it('renders title "Amigos de la Iglesia"', () => {
    render(
      <AmigosHeader totalCount={3} filteredCount={3} amigos={mockAmigos} />
    );

    expect(screen.getByText('Amigos de la Iglesia')).toBeInTheDocument();
  });

  it('displays the filtered count badge', () => {
    render(
      <AmigosHeader totalCount={3} filteredCount={2} amigos={mockAmigos} />
    );

    expect(screen.getByText('2 amigos')).toBeInTheDocument();
  });

  it('displays the correct total count', () => {
    render(
      <AmigosHeader totalCount={3} filteredCount={3} amigos={mockAmigos} />
    );

    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('displays the correct "Con Teléfono" count', () => {
    render(
      <AmigosHeader totalCount={3} filteredCount={3} amigos={mockAmigos} />
    );

    // Two amigos have telefono
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('shows 0 for "Con Teléfono" when no amigos have phone', () => {
    const sinTelefono: Amigo[] = [
      {
        id: '1',
        nombre: 'Juan Perez',
        fechaRegistro: '2025-01-15T00:00:00.000Z',
        migratedFrom: null,
      },
    ];

    render(
      <AmigosHeader totalCount={1} filteredCount={1} amigos={sinTelefono} />
    );

    // There should be one "0" for the Con Teléfono count
    const allZeroElements = screen.getAllByText('0');
    expect(allZeroElements.length).toBeGreaterThanOrEqual(1);
  });

  it('renders the Users icon', () => {
    const { container } = render(
      <AmigosHeader totalCount={0} filteredCount={0} amigos={[]} />
    );

    // The Users icon from lucide-react renders as an SVG
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('displays correct labels for stats', () => {
    render(
      <AmigosHeader totalCount={5} filteredCount={5} amigos={mockAmigos} />
    );

    expect(screen.getByText('Total')).toBeInTheDocument();
    expect(screen.getByText('Con Teléfono')).toBeInTheDocument();
  });

  it('uses emerald theme styling', () => {
    const { container } = render(
      <AmigosHeader totalCount={0} filteredCount={0} amigos={[]} />
    );

    // Check for emerald gradient class in the stats card
    const statsCard = container.querySelector('.from-emerald-600');
    expect(statsCard).toBeInTheDocument();
  });

  it('handles empty amigos array gracefully', () => {
    render(<AmigosHeader totalCount={0} filteredCount={0} amigos={[]} />);

    expect(screen.getByText('Amigos de la Iglesia')).toBeInTheDocument();
    expect(screen.getByText('0 amigos')).toBeInTheDocument();
  });
});
