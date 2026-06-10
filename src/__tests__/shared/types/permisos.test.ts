import {
  MODULES,
  ALL_PERMISSIONS,
  PERMISSIONS_BY_MODULE,
  MODULE_LABELS,
  isValidPermission,
} from '@/shared/types/permisos';

describe('permisos - amigos module', () => {
  describe('MODULES', () => {
    it('includes "amigos" in the MODULES array', () => {
      expect(MODULES.includes('amigos')).toBe(true);
    });

    it('does NOT include removed "simpatizantes" module', () => {
      expect((MODULES as readonly string[]).includes('simpatizantes')).toBe(
        false
      );
    });

    it('does NOT include removed "visitas" module', () => {
      expect((MODULES as readonly string[]).includes('visitas')).toBe(false);
    });
  });

  describe('ALL_PERMISSIONS', () => {
    it('includes "amigos.view"', () => {
      expect(ALL_PERMISSIONS.includes('amigos.view')).toBe(true);
    });

    it('includes "amigos.create"', () => {
      expect(ALL_PERMISSIONS.includes('amigos.create')).toBe(true);
    });

    it('includes "amigos.edit"', () => {
      expect(ALL_PERMISSIONS.includes('amigos.edit')).toBe(true);
    });

    it('includes "amigos.delete"', () => {
      expect(ALL_PERMISSIONS.includes('amigos.delete')).toBe(true);
    });

    it('recognizes amigos permissions as valid via isValidPermission', () => {
      expect(isValidPermission('amigos.view')).toBe(true);
      expect(isValidPermission('amigos.create')).toBe(true);
      expect(isValidPermission('amigos.edit')).toBe(true);
      expect(isValidPermission('amigos.delete')).toBe(true);
    });

    it('does NOT include removed simpatizantes permissions', () => {
      expect(
        (ALL_PERMISSIONS as readonly string[]).includes('simpatizantes.view')
      ).toBe(false);
      expect(
        (ALL_PERMISSIONS as readonly string[]).includes('simpatizantes.create')
      ).toBe(false);
    });

    it('does NOT include removed visitas permissions', () => {
      expect(
        (ALL_PERMISSIONS as readonly string[]).includes('visitas.view')
      ).toBe(false);
      expect(
        (ALL_PERMISSIONS as readonly string[]).includes('visitas.create')
      ).toBe(false);
    });
  });

  describe('PERMISSIONS_BY_MODULE', () => {
    it('has an "amigos" entry with 4 permissions', () => {
      const amigosPerms = PERMISSIONS_BY_MODULE.amigos;
      expect(amigosPerms).toBeDefined();
      expect(amigosPerms).toHaveLength(4);
    });

    it('maps amigos permissions to Spanish labels', () => {
      const amigosPerms = PERMISSIONS_BY_MODULE.amigos;
      expect(amigosPerms).toEqual(
        expect.arrayContaining([
          { permission: 'amigos.view', label: 'Ver amigos' },
          { permission: 'amigos.create', label: 'Crear amigos' },
          { permission: 'amigos.edit', label: 'Editar amigos' },
          { permission: 'amigos.delete', label: 'Eliminar amigos' },
        ])
      );
    });

    it('does NOT have removed simpatizantes entry', () => {
      expect(
        (PERMISSIONS_BY_MODULE as Record<string, unknown>).simpatizantes
      ).toBeUndefined();
    });

    it('does NOT have removed visitas entry', () => {
      expect(
        (PERMISSIONS_BY_MODULE as Record<string, unknown>).visitas
      ).toBeUndefined();
    });
  });

  describe('MODULE_LABELS', () => {
    it('maps "amigos" to "Amigos"', () => {
      expect(MODULE_LABELS.amigos).toBe('Amigos');
    });

    it('does NOT map removed "simpatizantes"', () => {
      expect(
        (MODULE_LABELS as Record<string, string | undefined>).simpatizantes
      ).toBeUndefined();
    });

    it('does NOT map removed "visitas"', () => {
      expect(
        (MODULE_LABELS as Record<string, string | undefined>).visitas
      ).toBeUndefined();
    });
  });
});
