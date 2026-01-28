import { MigrationApi } from './MigrationService';
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

    describe('migrateTeamsAndMembers', () => {
        it('should migrate teams users array to members subcollection', async () => {
            // Mock Teams with legacy 'users' array and 'admins' array
            const mockTeamData = {
                users: ['user1', 'user2'],
                admins: ['user1']
            };
            (getDocs as jest.Mock).mockResolvedValueOnce({
                docs: [{
                    id: 'team1',
                    data: () => mockTeamData,
                    ref: 'teamRef'
                }]
            });

            await (service as any).migrateTeamsAndMembers();

            // Should have called batch.set 2 times (for 2 users)
            expect(mockBatch.set).toHaveBeenCalledTimes(2);

            // Verify User 1 (Admin)
            expect(mockBatch.set).toHaveBeenCalledWith(
                expect.objectContaining({ type: 'doc' }), // memberRef
                expect.objectContaining({
                    uid: 'user1',
                    role: 'admin'
                }),
                { merge: true }
            );

            // Verify User 2 (Member)
            expect(mockBatch.set).toHaveBeenCalledWith(
                expect.objectContaining({ type: 'doc' }), // memberRef
                expect.objectContaining({
                    uid: 'user2',
                    role: 'member'
                }),
                { merge: true }
            );

            expect(mockBatch.commit).toHaveBeenCalled();
        });

        it('should skip if no users array', async () => {
            (getDocs as jest.Mock).mockResolvedValueOnce({
                docs: [{
                    id: 'team1',
                    data: () => ({ name: 'Team without users' }),
                    ref: 'teamRef'
                }]
            });

            await (service as any).migrateTeamsAndMembers();
            expect(mockBatch.set).not.toHaveBeenCalled();
        });
    });

    describe('migrateSubCollections', () => {
        it('should migrate worships, songs, sheets, comments, and notices to team sub-collections', async () => {
            // Mock Data
            const mockWorships = [{ id: 'w1', data: () => ({ team_id: 'team1', title: 'Worship' }) }];
            const mockSongs = [{ id: 's1', data: () => ({ team_id: 'team1', title: 'Song' }) }];
            const mockSheets = [{ id: 'sh1', data: () => ({ song_id: 's1', url: 'http://test.com' }) }];
            const mockComments = [{ id: 'c1', data: () => ({ song_id: 's1', content: 'Nice' }) }];
            const mockNotices = [{ id: 'n1', data: () => ({ team_id: 'team1', title: 'Notice' }) }];

            // Mock getDocs sequence
            (getDocs as jest.Mock)
                .mockResolvedValueOnce({ docs: mockWorships })  // 1. Worships
                .mockResolvedValueOnce({ docs: mockSongs })     // 2. Songs
                .mockResolvedValueOnce({ docs: mockSheets })    // 3. Sheets (Prefetch)
                .mockResolvedValueOnce({ docs: mockComments })  // 4. Comments (Prefetch)
                .mockResolvedValueOnce({ docs: mockNotices });  // 5. Notices

            await (service as any).migrateSubCollections();

            // Verify Worship Migration
            expect(mockBatch.set).toHaveBeenCalledWith(
                expect.objectContaining({ type: 'doc' }), // newRef (teams/team1/worships/w1)
                expect.objectContaining({ team_id: 'team1', title: 'Worship' })
            );

            // Verify Song Migration (Transaction)
            // Transaction logic is inside runTransaction callback, which we need to execute if we want to confirm details.
            // Since we mocked runTransaction, we need to inspect how it was called.
            // But verify batch sets for sub-sub collections (sheets, comments) which are outside transaction in original code?
            // Wait, looking at code: sheets/comments are done via batch AFTER transaction.

            // Verify Sheets Migration
            expect(mockBatch.set).toHaveBeenCalledWith(
                expect.objectContaining({ type: 'doc' }), // newSheetRef
                expect.objectContaining({ url: 'http://test.com' })
            );

            // Verify Notices Migration
            expect(mockBatch.set).toHaveBeenCalledWith(
                expect.objectContaining({ type: 'doc' }), // newNoticeRef
                expect.objectContaining({ team_id: 'team1', title: 'Notice' })
            );

            // Ensure commits called
            // 1 for worships, 1 for sheets, 1 for comments, 1 for notices
            // Note: songs use transaction
            expect(mockBatch.commit).toHaveBeenCalledTimes(4);
        });
    });

    describe('migrateTags', () => {
        it('should migrate tags with split pattern to sub-collection', async () => {
            const mockTags = [
                { id: 'team1-스플릿-Joy', data: () => ({}) },
                { id: 'team1-스플릿-Grace', data: () => ({}) },
                { id: 'invalidTag', data: () => ({}) } // Should be skipped
            ];

            (getDocs as jest.Mock).mockResolvedValueOnce({ docs: mockTags });

            await (service as any).migrateTags();

            expect(mockBatch.set).toHaveBeenCalledTimes(2);

            // Check Tag 1
            expect(mockBatch.set).toHaveBeenCalledWith(
                expect.objectContaining({ type: 'doc' }), // newRef
                expect.objectContaining({
                    name: 'Joy',
                    original_id: 'team1-스플릿-Joy'
                })
            );

            // Check Tag 2
            expect(mockBatch.set).toHaveBeenCalledWith(
                expect.objectContaining({ type: 'doc' }), // newRef
                expect.objectContaining({
                    name: 'Grace',
                    original_id: 'team1-스플릿-Grace'
                })
            );
        });
    });

    describe('cleanupLegacyData', () => {
        it('should delete specified collections in batches', async () => {
            // Mock getDocs to simulate finding docs to delete
            // First call finds docs, second call returns empty (end of loop)
            (getDocs as jest.Mock)
                .mockResolvedValueOnce({
                    empty: false,
                    size: 2,
                    docs: [{ ref: 'ref1' }, { ref: 'ref2' }]
                }) // For first collection 'songs'
                .mockResolvedValueOnce({ empty: true }) // End 'songs' loop
                .mockResolvedValue({ empty: true }); // Default empty for other collections to prevent infinite loops

            const onProgress = jest.fn();

            await (service as any).cleanupLegacyData(onProgress);

            // Verify delete calls
            expect(mockBatch.delete).toHaveBeenCalledWith('ref1');
            expect(mockBatch.delete).toHaveBeenCalledWith('ref2');

            // Verify commit
            expect(mockBatch.commit).toHaveBeenCalled();

            // Verify progress reporting
            expect(onProgress).toHaveBeenCalledWith(expect.stringContaining('Deleting collection: songs'));
            expect(onProgress).toHaveBeenCalledWith(expect.stringContaining('Legacy Data Cleanup Finished'));
        });
    });
});
