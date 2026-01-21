import { ServingService } from './ServingService'; // It's a singleton export default, but we need the class or specific instance construction
import LinkingService from './LinkingService';
import {
    collection,
    doc,
    setDoc,
    getDoc,
    getDocs,
    deleteDoc,
    updateDoc,
    Timestamp,
    writeBatch
} from 'firebase/firestore';

// Mock dependencies
jest.mock('@/firebase', () => ({
    db: {},
}));

jest.mock('./LinkingService', () => ({
    linkWorshipAndServing: jest.fn(),
    cleanupReferencesForServingDeletion: jest.fn(),
}));

jest.mock('firebase/firestore', () => {
    const originalModule = jest.requireActual('firebase/firestore');
    return {
        ...originalModule,
        collection: jest.fn(() => ({ type: 'collection' })),
        doc: jest.fn(() => ({ type: 'doc', id: 'mock-doc-id' })),
        getDoc: jest.fn(),
        getDocs: jest.fn(),
        setDoc: jest.fn(),
        updateDoc: jest.fn(),
        deleteDoc: jest.fn(),
        writeBatch: jest.fn(() => ({
            update: jest.fn(),
            set: jest.fn(),
            commit: jest.fn(),
            delete: jest.fn()
        })),
        query: jest.fn(),
        where: jest.fn(),
        orderBy: jest.fn(),
        limit: jest.fn(),
        increment: jest.fn(),
        arrayUnion: jest.fn(),
        arrayRemove: jest.fn(),
        Timestamp: {
            fromDate: jest.fn((date) => ({
                seconds: date.getTime() / 1000,
                toDate: () => date,
                toMillis: () => date.getTime()
            })),
            now: jest.fn(() => ({ seconds: Date.now() / 1000 })),
        }
    };
});

describe('ServingService', () => {
    let service: any; // Type casting for private method access if needed
    const mockDb = {} as any;

    beforeEach(() => {
        jest.clearAllMocks();
        // Access singleton instance and inject mock DB logic if possible, 
        // OR better: since we refactored, we can construct a NEW instance or use getInstance with mock
        // However, getInstance returns the SAME instance if already created.
        // We need to bypass singleton or reset it. 
        // JavaScript allows accessing private static instance via (ServingService as any).instance = null

        // Reset Singleton
        const ServingServiceClass = require('./ServingService').default.constructor;
        // The default export is the INSTANCE. We want the CLASS.
        // Getting the class from the exported instance constructor

        // To properly test, we should modify ServingService to export the class as named export too?
        // Or we can just use the exported instance and hope 'this.db' was set?
        // Wait, getInstance(db) only sets instance if it's null.
        // If we import it, it might be already instantiated with defaultDb.

        // HACK: Resetting the internal instance for testing purpose
        // We need to import the class definition, not just the instance.
        // But the file exports `ServingService` class ONLY internally (it is not exported).
        // It exports `default ServingService.getInstance()`.

        // Ideally we should export the class for testing.
        // Let's assume for now we use the instance, but we can't easily swap DB?
        // Actually, if we use `require` and `jest.resetModules()`, we can re-import.
    });

    // Since we cannot easily import the class (it's not exported), 
    // we will rely on `jest.mock('@/firebase')` which we did above.
    // The `defaultDb` imported by `ServingService` will be our mock object 
    // because we mocked `@/firebase`.
    // So `this.db` will be `{}`, which is our mockDb.

    // We just need to get the instance.
    const serviceInstance = require('./ServingService').default;

    describe('createSchedule', () => {
        it('should create a schedule with normalized 12:00 timestamp', async () => {
            const mockScheduleInput = {
                title: 'Sunday Service',
                date: Timestamp.fromDate(new Date('2024-01-01T09:00:00')),
                worship_id: 'worship-123',
                service_tags: ['tag1']
            };

            // Mock doc() to return a ref with ID
            (doc as jest.Mock).mockReturnValue({ id: 'new-schedule-id', type: 'doc' });

            // Mock LinkingService
            (LinkingService.linkWorshipAndServing as jest.Mock).mockResolvedValue(true);

            // Spy on updateTagStats since it is a method on the service
            const updateStatsSpy = jest.spyOn(serviceInstance, 'updateTagStats').mockResolvedValue(undefined as never);

            // Execute
            const result = await serviceInstance.createSchedule('team-1', mockScheduleInput);

            // Verify
            expect(result.id).toBe('new-schedule-id');
            expect(setDoc).toHaveBeenCalledWith(
                expect.objectContaining({ id: 'new-schedule-id' }),
                expect.objectContaining({
                    title: 'Sunday Service',
                    // Check date normalization
                    date: expect.any(Object) // Timestamp mock
                })
            );

            // Check timestamp normalization
            const savedDate = (setDoc as jest.Mock).mock.calls[0][1].date;
            const dateObj = savedDate.toDate();
            expect(dateObj.getHours()).toBe(12); // Should be 12:00 local

            // Check LinkingService call
            expect(LinkingService.linkWorshipAndServing).toHaveBeenCalledWith(
                'team-1',
                'worship-123',
                'new-schedule-id'
            );

            // Check Tag Stats Update 
            // Since we mocked the updateTagStats method, verify it was called
            expect(updateStatsSpy).toHaveBeenCalledWith(
                'team-1',
                ['tag1'],
                expect.stringMatching(/2024-01-01/),
                'add'
            );
        });
    });

    describe('updateSchedule', () => {
        it('should update stats when tags change', async () => {
            const oldSchedule = { id: 's1', service_tags: ['oldTag'], date: Timestamp.fromDate(new Date('2024-01-01')) };
            const newSchedule = {
                id: 's1',
                service_tags: ['newTag'],
                date: Timestamp.fromDate(new Date('2024-01-01')),
                worship_roles: []
            };

            // Mock getting old doc
            (getDoc as jest.Mock).mockResolvedValue({
                exists: () => true,
                data: () => oldSchedule
            });
            (doc as jest.Mock).mockReturnValue({ id: 's1', type: 'doc' });

            const updateStatsSpy = jest.spyOn(serviceInstance, 'updateTagStats');

            await serviceInstance.updateSchedule('team-1', newSchedule as any);

            expect(setDoc).toHaveBeenCalledWith(
                expect.objectContaining({ type: 'doc' }),
                expect.objectContaining({ service_tags: ['newTag'] }),
                { merge: true }
            );

            // Should remove old stats
            expect(updateStatsSpy).toHaveBeenCalledWith('team-1', ['oldTag'], expect.any(String), 'remove');
            // Should add new stats
            expect(updateStatsSpy).toHaveBeenCalledWith('team-1', ['newTag'], expect.any(String), 'add');
        });
    });

    describe('deleteSchedule', () => {
        it('should cleanup stats and references before deletion', async () => {
            const mockData = { id: 's1', service_tags: ['tag1'], date: Timestamp.fromDate(new Date('2024-01-01')) };

            (getDoc as jest.Mock).mockResolvedValue({
                data: () => mockData
            });

            const updateStatsSpy = jest.spyOn(serviceInstance, 'updateTagStats');

            await serviceInstance.deleteSchedule('team-1', 's1');

            // Check cleanup
            expect(LinkingService.cleanupReferencesForServingDeletion).toHaveBeenCalledWith('team-1', 's1');
            expect(updateStatsSpy).toHaveBeenCalledWith('team-1', ['tag1'], expect.any(String), 'remove');
            expect(deleteDoc).toHaveBeenCalled();
        });
    });

    describe('getSchedules', () => {
        it('should merge results from Timestamp and String date queries', async () => {
            // Mock getDocs to return two snapshots
            const tsDoc = { id: 'ts1', data: () => ({ id: 'ts1', title: 'Timestamp Schedule' }) };
            const strDoc = { id: 'str1', data: () => ({ id: 'str1', title: 'String Schedule' }) };

            (getDocs as jest.Mock)
                .mockResolvedValueOnce({ docs: [tsDoc] })   // First query (Timestamp)
                .mockResolvedValueOnce({ docs: [strDoc] }); // Second query (String)

            const results = await serviceInstance.getSchedules('team-1', '2024-01-01', '2024-01-31');

            expect(results).toHaveLength(2);
            expect(results).toEqual(expect.arrayContaining([
                expect.objectContaining({ id: 'ts1' }),
                expect.objectContaining({ id: 'str1' })
            ]));
        });
    });
});
