import { MigrationService } from './MigrationService';
import {
    collection,
    getDocs,
    writeBatch,
    Timestamp
} from 'firebase/firestore';

// 1. Mock local firebase
jest.mock('@/firebase', () => ({
    db: {},
}));

// 2. Mock firestore
jest.mock('firebase/firestore', () => ({
    collection: jest.fn(() => ({ type: 'collection' })),
    getDocs: jest.fn(),
    doc: jest.fn(() => ({ type: 'doc' })),
    writeBatch: jest.fn(),
    Timestamp: {
        fromDate: jest.fn((date) => ({ seconds: date.getTime() / 1000, toDate: () => date })),
        now: jest.fn(() => ({ seconds: Date.now() / 1000 })),
    },
    runTransaction: jest.fn(),
    query: jest.fn(),
    limit: jest.fn(),
}));

describe('MigrationService', () => {
    let service: MigrationService;
    const mockDb = {} as any;
    const mockBatch = {
        update: jest.fn(),
        commit: jest.fn(),
        set: jest.fn(),
        delete: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
        // Directly instantiate since constructor is now public/accessible for testing
        service = new MigrationService(mockDb);
        (writeBatch as jest.Mock).mockReturnValue(mockBatch);
    });

    describe('normalizeTimestamps', () => {
        it('should normalize string dates to Firestore Timestamps at 12:00', async () => {
            // Mock Teams
            (getDocs as jest.Mock).mockResolvedValueOnce({
                docs: [{ id: 'team1', ref: 'teamRef' }]
            });

            // Mock Serving Schedules with a string date
            (getDocs as jest.Mock).mockResolvedValueOnce({
                docs: [{
                    id: 'schedule1',
                    data: () => ({ date: '2024-01-01' }),
                    ref: 'scheduleRef'
                }]
            });

            // Mock Worships (empty for this test)
            (getDocs as jest.Mock).mockResolvedValueOnce({ docs: [] });

            // Identify the private method to test it - or use the public runner method
            // Ideally we test public methods, but for TDD of core logic, we might target specific logic.
            // normalizeTimestamps is private.
            // We can create a testable subclass or cast to any.
            await (service as any).normalizeTimestamps();

            expect(mockBatch.update).toHaveBeenCalled();
            const updateCall = mockBatch.update.mock.calls[0];
            expect(updateCall[0]).toBe('scheduleRef');

            const updatedDate = updateCall[1].date;
            // 12:00 PM check
            const dateObj = updatedDate.toDate();
            expect(dateObj.getHours()).toBe(12);
            expect(mockBatch.commit).toHaveBeenCalled();
        });

        it('should skip if date is missing', async () => {
            // Mock Teams
            (getDocs as jest.Mock).mockResolvedValueOnce({
                docs: [{ id: 'team1' }]
            });

            // Mock Schedules with NO date
            (getDocs as jest.Mock).mockResolvedValueOnce({
                docs: [{
                    id: 'schedule1',
                    data: () => ({ name: 'No Date' }),
                }]
            });
            (getDocs as jest.Mock).mockResolvedValueOnce({ docs: [] });

            await (service as any).normalizeTimestamps();

            expect(mockBatch.update).not.toHaveBeenCalled();
        });
    });
});
