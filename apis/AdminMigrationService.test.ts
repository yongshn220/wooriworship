import { AdminMigrationService } from './AdminMigrationService';
import * as admin from 'firebase-admin';

// Mock specific parts of firebase-admin
const mockFirestore = {
    collection: jest.fn(),
    doc: jest.fn(),
    batch: jest.fn(),
    runTransaction: jest.fn(), // Mock transaction
};

const mockBatch = {
    set: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    commit: jest.fn(),
};

jest.mock('firebase-admin', () => ({
    firestore: jest.fn(() => mockFirestore),
    credential: {
        cert: jest.fn(),
    },
    initializeApp: jest.fn(),
    apps: [],
}));

// Mock Timestamp
const Timestamp = {
    fromDate: jest.fn((date) => ({ seconds: date.getTime() / 1000, toDate: () => date })),
    now: jest.fn(() => ({ seconds: Date.now() / 1000 })),
};
(admin.firestore as any).Timestamp = Timestamp;

describe('AdminMigrationService', () => {
    let service: AdminMigrationService;

    beforeEach(() => {
        jest.clearAllMocks();
        mockFirestore.batch.mockReturnValue(mockBatch);
        mockFirestore.collection.mockReturnValue({ get: jest.fn().mockResolvedValue({ empty: true, docs: [] }) }); // Default empty
        service = new AdminMigrationService(mockFirestore as any);
    });

    describe('migrateSubCollections - Notices', () => {
        it('should transform legacy notice fields (subject/content) to new fields (title/body)', async () => {
            // Mock Data
            const mockNotices = [{
                id: 'n1',
                data: () => ({
                    team_id: 'team1',
                    subject: 'Legacy Title',
                    content: 'Legacy Content',
                    created_at: '2024-01-01'
                })
            }];

            // Mock DB calls
            // 1. Worships (Empty)
            // 2. Songs (Empty)
            // 3. Music Sheets (Empty)
            // 4. Comments (Empty)
            // 5. Notices (Mocked)

            const mockGet = jest.fn()
                .mockResolvedValueOnce({ empty: true, docs: [] }) // Worships
                .mockResolvedValueOnce({ empty: true, docs: [] }) // Songs
                .mockResolvedValueOnce({ empty: true, docs: [] }) // Sheets
                .mockResolvedValueOnce({ empty: true, docs: [] }) // Comments
                .mockResolvedValueOnce({ empty: false, docs: mockNotices }); // Notices

            mockFirestore.collection.mockImplementation((path) => {
                return { get: mockGet };
            });

            // Mock doc() for set
            mockFirestore.doc.mockReturnValue({ id: 'newRef' });

            await (service as any).migrateSubCollections();

            // Verification
            // Should call batch.set with transformed data
            expect(mockBatch.set).toHaveBeenCalledWith(
                expect.any(Object), // ref
                expect.objectContaining({
                    team_id: 'team1',
                    title: 'Legacy Title',
                    body: 'Legacy Content'
                })
            );
        });
    });
});
