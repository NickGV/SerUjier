import {
  downloadBlob,
  formatDate,
  formatDateLong,
  formatDateTime,
  generateDetailFilename,
  generateListFilename,
} from '@/shared/lib/export/utils';

describe('export utils', () => {
  it('formats dates for es-CO with Bogota timezone', () => {
    expect(formatDate('2026-05-27')).toBe('27/5/2026');
    expect(formatDateLong('2026-05-27').toLowerCase()).toContain('miércoles');
    expect(formatDateLong('2026-05-27')).toContain('27');
    expect(formatDateLong('2026-05-27').toLowerCase()).toContain('mayo');
    expect(formatDateLong('2026-05-27')).toContain('2026');
  });

  it('formats date-time strings in Bogota timezone', () => {
    const value = new Date('2026-05-27T15:30:00Z');
    const formatted = formatDateTime(value);

    expect(formatted).toContain('27/05/2026');
    expect(formatted).toContain('10:30');
  });

  it('generates filenames for detail exports', () => {
    expect(
      generateDetailFilename('2026-05-27', 'completa', 'excel')
    ).toBe('informe_2026-05-27_completo.xlsx');
    expect(
      generateDetailFilename('2026-05-27', 'faltantes', 'pdf')
    ).toBe('informe_2026-05-27_faltantes.pdf');
  });

  it('generates filenames for list exports', () => {
    expect(generateListFilename('2026-05-27', 'excel')).toBe(
      'informe_historial_2026-05-27.xlsx'
    );
    expect(generateListFilename('2026-05-27', 'pdf')).toBe(
      'informe_historial_2026-05-27.pdf'
    );
  });

  it('downloads blobs with the expected filename', () => {
    const createObjectURL = jest.fn(() => 'blob:report');
    const revokeObjectURL = jest.fn();
    const click = jest.fn();
    const appendChild = jest.spyOn(document.body, 'appendChild');
    const removeChild = jest.spyOn(document.body, 'removeChild');
    const originalCreate = document.createElement.bind(document);

    Object.defineProperty(URL, 'createObjectURL', {
      value: createObjectURL,
      configurable: true,
    });
    Object.defineProperty(URL, 'revokeObjectURL', {
      value: revokeObjectURL,
      configurable: true,
    });

    jest.spyOn(document, 'createElement').mockImplementation((tag) => {
      const element = originalCreate(tag);
      if (tag === 'a') {
        element.click = click;
      }
      return element;
    });

    downloadBlob(new Blob(['test'], { type: 'text/plain' }), 'reporte.txt');

    expect(createObjectURL).toHaveBeenCalled();
    expect(click).toHaveBeenCalled();
    expect(appendChild).toHaveBeenCalled();
    expect(removeChild).toHaveBeenCalled();
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:report');
  });
});
