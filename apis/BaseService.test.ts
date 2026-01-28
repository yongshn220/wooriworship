import BaseApi from './BaseService';
import {
    collection,
    getDocs,
    doc,
    getDoc,
    addDoc,
    setDoc,
    deleteDoc
} from 'firebase/firestore';

// 1. Mock the local firebase.ts configuration
jest.mock('@/firebase', () => ({
    db: {}, // Return an empty object or a mock object
}));

// 2. Mock firebase/firestore
jest.mock('firebase/firestore', () => ({
    collection: jest.fn(() => ({ type: 'collection' })), // Return a dummy object
    getDocs: jest.fn(),
    doc: jest.fn(() => ({ type: 'doc' })), // Return a dummy object
    getDoc: jest.fn(),
    addDoc: jest.fn(),
    setDoc: jest.fn(),
    deleteDoc: jest.fn(),
    query: jest.fn(),
    where: jest.fn(),
    orderBy: jest.fn(),
    startAfter: jest.fn(),
    limit: jest.fn(),
    documentId: jest.fn(() => 'documentId'),
}));

describe('BaseService', () => {
    const collectionName = 'test-collection';
    const mockDb = {} as any;
    let service: BaseService;

    beforeEach(() => {
        jest.clearAllMocks();
        service = new BaseService(collectionName, mockDb);
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });

    afterEach(() => {
        (console.error as jest.Mock).mockRestore();
    });

    describe('create', () => {
        it('should create a document and return its id', async () => {
            const mockData = { name: 'Test' };
            const mockId = 'new-id';
            (addDoc as jest.Mock).mockResolvedValueOnce({ id: mockId });

            const result = await service.create(mockData);

            expect(collection).toHaveBeenCalledWith(mockDb, collectionName);
            expect(addDoc).toHaveBeenCalledWith(expect.anything(), mockData);
            expect(result).toBe(mockId);
        });

        it('should return null on error', async () => {
            (addDoc as jest.Mock).mockRejectedValueOnce(new Error('Test error'));
            const result = await service.create({});
            expect(result).toBeNull();
        });
    });

    describe('getById', () => {
        it('should return document data if it exists', async () => {
            const mockId = 'test-id';
            const mockData = { name: 'Test' };
            const mockSnapshot = {
                exists: () => true,
                data: () => mockData,
            };
            (getDoc as jest.Mock).mockResolvedValueOnce(mockSnapshot);

            const result = await service.getById(mockId);

            expect(doc).toHaveBeenCalledWith(mockDb, collectionName, mockId);
            expect(result).toEqual({ id: mockId, ...mockData });
        });

        it('should return null if document does not exist', async () => {
            (getDoc as jest.Mock).mockResolvedValueOnce({ exists: () => false });
            const result = await service.getById('non-existent');
            expect(result).toBeNull();
        });
    });

    describe('update', () => {
        it('should update a document and return true', async () => {
            const mockId = 'test-id';
            const mockData = { name: 'Updated' };
            (setDoc as jest.Mock).mockResolvedValueOnce(undefined);

            const result = await service.update(mockId, mockData);

            expect(doc).toHaveBeenCalledWith(mockDb, collectionName, mockId);
            expect(setDoc).toHaveBeenCalledWith(expect.anything(), mockData, { merge: true });
            expect(result).toBe(true);
        });

        it('should return false on error', async () => {
            (setDoc as jest.Mock).mockRejectedValueOnce(new Error('Test error'));
            const result = await service.update('id', {});
            expect(result).toBe(false);
        });
    });

    describe('delete', () => {
        it('should delete a document and return true', async () => {
            const mockId = 'test-id';
            (deleteDoc as jest.Mock).mockResolvedValueOnce(undefined);

            const result = await service.delete(mockId);

            expect(doc).toHaveBeenCalledWith(mockDb, collectionName, mockId);
            expect(deleteDoc).toHaveBeenCalledWith(expect.anything());
            expect(result).toBe(true);
        });

        it('should return false on error', async () => {
            (deleteDoc as jest.Mock).mockRejectedValueOnce(new Error('Test error'));
            const result = await service.delete('id');
            expect(result).toBe(false);
        });
    });
});
