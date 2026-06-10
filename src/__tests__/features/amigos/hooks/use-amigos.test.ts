import { renderHook, act } from '@testing-library/react';
import { useAmigos } from '@/features/amigos/hooks/use-amigos';
import { useFirebaseCRUD } from '@/shared/hooks/useFirebaseCRUD';
import { type Amigo } from '@/types/amigos';
import { toast } from 'sonner';

// Mock useFirebaseCRUD
const mockAddItem = jest.fn();
const mockUpdateItem = jest.fn();
const mockDeleteItem = jest.fn();
const mockRefreshItems = jest.fn();

const mockFirebaseCRUDReturn = {
  items: [] as Amigo[],
  loading: false,
  error: null,
  isAdding: false,
  isUpdating: false,
  isDeleting: false,
  addItem: mockAddItem,
  updateItem: mockUpdateItem,
  deleteItem: mockDeleteItem,
  getItemById: jest.fn(),
  refreshItems: mockRefreshItems,
};

jest.mock('@/shared/hooks/useFirebaseCRUD', () => ({
  useFirebaseCRUD: jest.fn(),
}));

// Mock sonner toast
jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

describe('useAmigos', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useFirebaseCRUD as jest.Mock).mockReturnValue(mockFirebaseCRUDReturn);
  });

  it('returns the expected interface shape with default values', () => {
    const { result } = renderHook(() => useAmigos());

    expect(result.current.amigos).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.isAdding).toBe(false);
    expect(result.current.isUpdating).toBe(false);
    expect(result.current.isDeleting).toBe(false);
    expect(typeof result.current.addAmigo).toBe('function');
    expect(typeof result.current.updateAmigo).toBe('function');
    expect(typeof result.current.deleteAmigo).toBe('function');
    expect(typeof result.current.refreshAmigos).toBe('function');
  });

  it('calls useFirebaseCRUD with collectionName "amigos"', () => {
    renderHook(() => useAmigos());

    expect(useFirebaseCRUD).toHaveBeenCalledWith({
      collectionName: 'amigos',
    });
  });

  describe('addAmigo', () => {
    it('adds fechaRegistro before calling addItem', async () => {
      const { result } = renderHook(() => useAmigos());

      const testData = {
        nombre: 'Juan Perez',
        telefono: '123456789',
        migratedFrom: null,
      };
      await act(async () => {
        await result.current.addAmigo(testData);
      });

      expect(mockAddItem).toHaveBeenCalledWith(
        expect.objectContaining({
          nombre: 'Juan Perez',
          telefono: '123456789',
          fechaRegistro: expect.stringMatching(
            /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/
          ),
        })
      );
    });

    it('shows error toast and does NOT call addItem when nombre is empty', async () => {
      const { result } = renderHook(() => useAmigos());

      await act(async () => {
        await result.current.addAmigo({
          nombre: '',
          telefono: '123456789',
          migratedFrom: null,
        });
      });

      expect(toast.error).toHaveBeenCalledWith('El nombre es requerido');
      expect(mockAddItem).not.toHaveBeenCalled();
    });

    it('shows error toast and does NOT call addItem when nombre is only whitespace', async () => {
      const { result } = renderHook(() => useAmigos());

      await act(async () => {
        await result.current.addAmigo({
          nombre: '   ',
          telefono: '123456789',
          migratedFrom: null,
        });
      });

      expect(toast.error).toHaveBeenCalledWith('El nombre es requerido');
      expect(mockAddItem).not.toHaveBeenCalled();
    });

    it('re-throws error when addItem fails', async () => {
      const testError = new Error('Firestore error');
      mockAddItem.mockRejectedValueOnce(testError);

      const { result } = renderHook(() => useAmigos());

      await act(async () => {
        await expect(
          result.current.addAmigo({
            nombre: 'Juan',
            notas: 'test',
            migratedFrom: null,
          })
        ).rejects.toThrow('Firestore error');
      });
    });
  });

  describe('updateAmigo', () => {
    it('calls updateItem with id and data', async () => {
      const { result } = renderHook(() => useAmigos());

      await act(async () => {
        await result.current.updateAmigo('abc123', { nombre: 'Juan Updated' });
      });

      expect(mockUpdateItem).toHaveBeenCalledWith('abc123', {
        nombre: 'Juan Updated',
      });
    });

    it('re-throws error when updateItem fails', async () => {
      const testError = new Error('Update failed');
      mockUpdateItem.mockRejectedValueOnce(testError);

      const { result } = renderHook(() => useAmigos());

      await act(async () => {
        await expect(
          result.current.updateAmigo('abc123', { nombre: 'Fail' })
        ).rejects.toThrow('Update failed');
      });
    });
  });

  describe('deleteAmigo', () => {
    it('calls deleteItem with the given id', async () => {
      const { result } = renderHook(() => useAmigos());

      await act(async () => {
        await result.current.deleteAmigo('abc123');
      });

      expect(mockDeleteItem).toHaveBeenCalledWith('abc123');
    });

    it('re-throws error when deleteItem fails', async () => {
      const testError = new Error('Delete failed');
      mockDeleteItem.mockRejectedValueOnce(testError);

      const { result } = renderHook(() => useAmigos());

      await act(async () => {
        await expect(result.current.deleteAmigo('abc123')).rejects.toThrow(
          'Delete failed'
        );
      });
    });
  });

  describe('refreshAmigos', () => {
    it('calls the underlying refreshItems', async () => {
      const { result } = renderHook(() => useAmigos());

      await act(async () => {
        await result.current.refreshAmigos();
      });

      expect(mockRefreshItems).toHaveBeenCalled();
    });
  });
});
