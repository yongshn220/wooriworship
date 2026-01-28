import { AdminMigrationApi } from './AdminMigrationService';
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
            const mockGet = jest.fn()
                .mockResolvedValueOnce({ empty: true, docs: [] }) // Worships
                .mockResolvedValueOnce({ empty: true, docs: [] }) // Songs
                .mockResolvedValueOnce({ empty: true, docs: [] }) // Sheets
                .mockResolvedValueOnce({ empty: true, docs: [] }) // Comments
                .mockResolvedValueOnce({ empty: false, docs: mockNotices }); // Notices

            mockFirestore.collection.mockImplementation((path) => {
                return { get: mockGet };
            });

            mockFirestore.doc.mockReturnValue({ id: 'newRef' });

            await (service as any).migrateSubCollections();

            // Verification
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

    describe('migrateSubCollections - Music Sheets', () => {
        it('should transform legacy sheet fields (url single string) to new fields (urls array)', async () => {
            // Mock Data
            const mockSongs = [{
                id: 's1',
                data: () => ({ team_id: 'team1', title: 'Song' })
            }];

            const mockSheets = [{
                id: 'sh1',
                data: () => ({
                    song_id: 's1',
                    url: 'http://legacy-url.com',
                })
            }];

            // Mock DB calls sequence
            const mockGet = jest.fn()
                .mockResolvedValueOnce({ empty: true, docs: [] }) // Worships
                .mockResolvedValueOnce({ empty: false, docs: mockSongs }) // Songs
                .mockResolvedValueOnce({ empty: false, docs: mockSheets }) // Sheets
                .mockResolvedValueOnce({ empty: true, docs: [] }) // Comments
                .mockResolvedValueOnce({ empty: true, docs: [] }); // Notices

            mockFirestore.collection.mockImplementation((path) => {
                return { get: mockGet };
            });

            mockFirestore.doc.mockReturnValue({ id: 'newRef' });

            await (service as any).migrateSubCollections();

            expect(mockBatch.set).toHaveBeenCalledWith(
                expect.any(Object),
                expect.objectContaining({
                    urls: ['http://legacy-url.com']
                })
            );
        });
    });

    describe('migrateSubCollections - Comments', () => {
        it('should transform legacy comment fields (content) to new fields (comment)', async () => {
            // Mock Data
            const mockSongs = [{
                id: 's1',
                data: () => ({ team_id: 'team1', title: 'Song' })
            }];

            const mockComments = [{
                id: 'c1',
                data: () => ({
                    song_id: 's1',
                    content: 'Legacy Content',
                })
            }];

            // Mock DB calls sequence
            const mockGet = jest.fn()
                .mockResolvedValueOnce({ empty: true, docs: [] }) // Worships
                .mockResolvedValueOnce({ empty: false, docs: mockSongs }) // Songs
                .mockResolvedValueOnce({ empty: true, docs: [] }) // Sheets
                .mockResolvedValueOnce({ empty: false, docs: mockComments }) // Comments
                .mockResolvedValueOnce({ empty: true, docs: [] }); // Notices

            mockFirestore.collection.mockImplementation((path) => {
                return { get: mockGet };
            });

            mockFirestore.doc.mockReturnValue({ id: 'newRef' });

            await (service as any).migrateSubCollections();

            expect(mockBatch.set).toHaveBeenCalledWith(
                expect.any(Object),
                expect.objectContaining({
                    comment: 'Legacy Content'
                })
            );
        });
    });

    describe('migrateServingSchedules', () => {
        it('should transform legacy serving fields (name -> title) and ensure simple structure', async () => {
            const mockTeams = [{ id: 'team1' }];
            const mockSchedules = [{
                id: 'sch1',
                data: () => ({
                    name: 'Legacy Service Name', // Legacy field
                    title: undefined, // New field missing
                    date: '2024-01-01'
                }),
                ref: { id: 'sch1' } // Mock ref for batch update
            }];

            // Mock DB calls - need detailed structure for this test
            // We use a custom mock function to handle dynamic paths
            const mockCollection = jest.fn();
            const mockDoc = jest.fn();

            // Teams collection with chaining support
            mockCollection.mockImplementation((path) => {
                if (path === 'teams') {
                    return {
                        get: jest.fn().mockResolvedValue({ docs: mockTeams }),
                        doc: jest.fn((docId) => ({
                            collection: jest.fn((subCol) => {
                                if (subCol === 'serving_schedules') {
                                    return { get: jest.fn().mockResolvedValue({ empty: false, docs: mockSchedules }) };
                                }
                                return { get: jest.fn().mockResolvedValue({ empty: true }) };
                            })
                        }))
                    };
                }
                return { get: jest.fn() };
            });

            // Apply mocks to service.db
            (service as any).db = {
                collection: mockCollection,
                doc: mockDoc,
                batch: mockFirestore.batch
            };

            await (service as any).migrateServingSchedules();

            expect(mockBatch.update).toHaveBeenCalledWith(
                expect.any(Object), // ref
                expect.objectContaining({
                    title: 'Legacy Service Name'
                })
            );
        });
    });
});
