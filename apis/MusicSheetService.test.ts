import { MusicSheetService } from './MusicSheetService'; // Use default import to get instance, or class if exported
import { collection, addDoc, doc, setDoc, deleteDoc, getDocs, getDoc, Timestamp } from 'firebase/firestore';

// Mock dependencies
jest.mock('@/firebase', () => ({
    db: {},
}));

// Mock helper functions
jest.mock('@/components/util/helper/helper-functions', () => ({
    getFirebaseTimestampNow: jest.fn(() => ({ seconds: 12345, nanoseconds: 0 })),
}));

jest.mock('firebase/firestore', () => {
    const originalModule = jest.requireActual('firebase/firestore');
    return {
        ...originalModule,
        collection: jest.fn(() => ({ type: 'collection' })),
        doc: jest.fn((...args) => ({ type: 'doc', id: args[args.length - 1] })),
        addDoc: jest.fn(),
        setDoc: jest.fn(),
        deleteDoc: jest.fn(),
        getDocs: jest.fn(),
        getDoc: jest.fn(),
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

describe('MusicSheetService', () => {
    let serviceInstance: any;

    beforeEach(() => {
        jest.clearAllMocks();
        // Import fresh module
        serviceInstance = require('./MusicSheetService').default;
    });

    describe('addNewMusicSheet', () => {
        it('should create a new music sheet with timestamps', async () => {
            const mockContainer = {
                key: 'C',
                imageFileContainers: [{ url: 'http://example.com/sheet.jpg' }]
            };

            (addDoc as jest.Mock).mockResolvedValue({ id: 'sheet-1' });

            const result = await serviceInstance.addNewMusicSheet('user-1', 'team-1', 'song-1', mockContainer);

            expect(result).toBe('sheet-1');
            expect(addDoc).toHaveBeenCalledWith(
                expect.objectContaining({ type: 'collection' }),
                expect.objectContaining({
                    song_id: 'song-1',
                    key: 'C',
                    urls: ['http://example.com/sheet.jpg'],
                    created_by: expect.objectContaining({ id: 'user-1' })
                })
            );
        });
    });

    describe('updateMusicSheet', () => {
        it('should update existing sheet', async () => {
            const mockContainer = {
                id: 'sheet-1',
                key: 'D',
                imageFileContainers: [{ url: 'http://example.com/sheet_v2.jpg' }]
            };

            await serviceInstance.updateMusicSheet('user-1', 'team-1', 'song-1', mockContainer);

            expect(setDoc).toHaveBeenCalledWith(
                expect.objectContaining({ type: 'doc', id: 'sheet-1' }),
                expect.objectContaining({
                    key: 'D',
                    urls: ['http://example.com/sheet_v2.jpg'],
                    updated_by: expect.objectContaining({ id: 'user-1' })
                }),
                { merge: true }
            );
        });
    });

    describe('deleteMusicSheet', () => {
        it('should delete sheet document', async () => {
            await serviceInstance.deleteMusicSheet('team-1', 'song-1', 'sheet-1');
            expect(deleteDoc).toHaveBeenCalledWith(
                expect.objectContaining({ type: 'doc', id: 'sheet-1' })
            );
        });
    });
});
