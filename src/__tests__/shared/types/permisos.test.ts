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

    it('still includes "simpatizantes" for backward compatibility', () => {
      expect(MODULES.includes('simpatizantes')).toBe(true);
    });

    it('still includes "visitas" for backward compatibility', () => {
      expect(MODULES.includes('visitas')).toBe(true);
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

    it('still includes simpatizantes permissions for backward compat', () => {
      expect(ALL_PERMISSIONS.includes('simpatizantes.view')).toBe(true);
      expect(ALL_PERMISSIONS.includes('simpatizantes.create')).toBe(true);
    });

    it('still includes visitas permissions for backward compat', () => {
      expect(ALL_PERMISSIONS.includes('visitas.view')).toBe(true);
      expect(ALL_PERMISSIONS.includes('visitas.create')).toBe(true);
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

    it('still has simpatizantes entry for backward compat', () => {
      expect(PERMISSIONS_BY_MODULE.simpatizantes).toBeDefined();
    });

    it('still has visitas entry for backward compat', () => {
      expect(PERMISSIONS_BY_MODULE.visitas).toBeDefined();
    });
  });

  describe('MODULE_LABELS', () => {
    it('maps "amigos" to "Amigos"', () => {
      expect(MODULE_LABELS.amigos).toBe('Amigos');
    });

    it('still maps "simpatizantes" for backward compat', () => {
      expect(MODULE_LABELS.simpatizantes).toBe('Simpatizantes');
    });

    it('still maps "visitas" for backward compat', () => {
      expect(MODULE_LABELS.visitas).toBe('Visitas');
    });
  });
});
