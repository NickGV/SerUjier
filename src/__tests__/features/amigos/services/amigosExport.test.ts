import { exportAmigosToCSV } from '@/features/amigos/services/amigosExport';
import { type Amigo } from '@/types/amigos';

const mockAmigos: Amigo[] = [
  {
    id: '1',
    nombre: 'Juan Perez',
    telefono: '123456789',
    notas: 'Amigo cercano',
    fechaRegistro: '2025-01-15T00:00:00.000Z',
    migratedFrom: null,
  },
  {
    id: '2',
    nombre: 'Maria Lopez',
    fechaRegistro: '2025-02-20T00:00:00.000Z',
    migratedFrom: 'simpatizantes',
  },
  {
    id: '3',
    nombre: 'Carlos Ruiz, Jr.',
    telefono: '987654321',
    notas: 'Nota con "comillas" y saltos\n de línea',
    fechaRegistro: '2025-03-10T00:00:00.000Z',
    migratedFrom: 'visitas',
  },
];

describe('exportAmigosToCSV', () => {
  let clickMock: jest.Mock;
  let appendChildMock: jest.Mock;
  let removeChildMock: jest.Mock;
  let createObjectURLMock: jest.Mock;
  let revokeObjectURLMock: jest.Mock;
  let blobContent: string[];

  beforeEach(() => {
    clickMock = jest.fn();
    createObjectURLMock = jest.fn().mockReturnValue('blob:test');
    revokeObjectURLMock = jest.fn();

    // Mock Blob constructor
    blobContent = [];
    (globalThis as unknown as { Blob: unknown }).Blob = jest
      .fn()
      .mockImplementation((content: unknown[], _options: unknown) => {
        blobContent = content as string[];
        return { size: 100 };
      });

    (globalThis as unknown as { URL: unknown }).URL = {
      createObjectURL: createObjectURLMock,
      revokeObjectURL: revokeObjectURLMock,
    } as unknown as typeof URL;

    // Mock document.createElement for anchor tag
    const originalCreateElement = document.createElement.bind(document);
    jest.spyOn(document, 'createElement').mockImplementation((tagName) => {
      if (tagName === 'a') {
        return {
          click: clickMock,
          href: '',
          setAttribute: jest.fn(),
          style: {},
        } as unknown as HTMLAnchorElement;
      }
      return originalCreateElement(tagName);
    });

    appendChildMock = jest.fn().mockImplementation((el) => el);
    removeChildMock = jest.fn();

    jest
      .spyOn(document.body, 'appendChild')
      .mockImplementation(appendChildMock);
    jest
      .spyOn(document.body, 'removeChild')
      .mockImplementation(removeChildMock);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('creates a Blob with CSV content', () => {
    exportAmigosToCSV(mockAmigos);

    expect(Blob).toHaveBeenCalled();
    const fullContent = blobContent[0] as string;

    // The BOM is prepended, content starts after BOM
    const csvContent = fullContent.slice(1); // Remove BOM

    // Check headers
    expect(csvContent).toContain(
      'Nombre,Teléfono,Notas,Fecha de Registro,Origen'
    );

    // Check data rows
    expect(csvContent).toContain('Juan Perez,123456789,Amigo cercano');
    expect(csvContent).toContain('Maria Lopez,,');
    expect(csvContent).toContain('Directo');
    expect(csvContent).toContain('Simpatizantes');
    expect(csvContent).toContain('Visitas');
  });

  it('creates a downloadable link and triggers click', () => {
    exportAmigosToCSV(mockAmigos);

    expect(createObjectURLMock).toHaveBeenCalled();
    expect(appendChildMock).toHaveBeenCalled();
    expect(clickMock).toHaveBeenCalled();
    expect(removeChildMock).toHaveBeenCalled();
    expect(revokeObjectURLMock).toHaveBeenCalled();
  });

  it('includes BOM for Excel compatibility', () => {
    exportAmigosToCSV(mockAmigos);

    const fullContent = blobContent[0] as string;
    // BOM character \uFEFF should be at the start
    expect(fullContent.charAt(0)).toBe('\uFEFF');
  });

  it('escapes fields with commas by wrapping in quotes', () => {
    exportAmigosToCSV(mockAmigos);

    const fullContent = blobContent[0] as string;
    // Carlos Ruiz, Jr. has a comma in the name
    expect(fullContent).toContain('"Carlos Ruiz, Jr."');
  });

  it('escapes fields with double quotes', () => {
    exportAmigosToCSV(mockAmigos);

    const fullContent = blobContent[0] as string;
    // The notas field has quotes, should be escaped
    expect(fullContent).toContain('"Nota con ""comillas"" y saltos');
  });

  it("sets the download filename with today's date", () => {
    const setAttributeMock = jest.fn();
    jest.spyOn(document, 'createElement').mockImplementation((tagName) => {
      if (tagName === 'a') {
        return {
          click: clickMock,
          href: '',
          setAttribute: setAttributeMock,
          style: {},
        } as unknown as HTMLAnchorElement;
      }
      return document.createElement(tagName);
    });

    exportAmigosToCSV([mockAmigos[0]]);

    expect(setAttributeMock).toHaveBeenCalledWith(
      'download',
      expect.stringMatching(/^amigos_\d{4}-\d{2}-\d{2}\.csv$/)
    );
  });

  it('handles empty amigos array', () => {
    exportAmigosToCSV([]);

    const fullContent = blobContent[0] as string;
    const csvContent = fullContent.slice(1); // Remove BOM

    // Should have headers but no data rows
    const lines = csvContent.split('\n');
    expect(lines[0]).toBe('Nombre,Teléfono,Notas,Fecha de Registro,Origen');
    expect(lines.length).toBe(1); // Only headers, no data rows
  });

  it('shows "N/A" for fechaRegistro when it is undefined', () => {
    const amigoSinFecha: Amigo[] = [
      {
        id: '1',
        nombre: 'Test',
        migratedFrom: null,
      },
    ];

    exportAmigosToCSV(amigoSinFecha);

    const fullContent = blobContent[0] as string;
    expect(fullContent).toContain('N/A');
  });

  it('shows "Directo" for migratedFrom when null', () => {
    exportAmigosToCSV([mockAmigos[0]]);

    const fullContent = blobContent[0] as string;
    expect(fullContent).toContain('Directo');
  });
});
