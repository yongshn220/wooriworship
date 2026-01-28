import { SongApi } from './SongService';
import { MusicSheetApi } from './MusicSheetService';
import { collection, addDoc, doc, setDoc, deleteDoc, getDocs, getDoc, Timestamp, runTransaction } from 'firebase/firestore';

// Mock dependencies
jest.mock('@/firebase', () => ({
    db: {},
}));

jest.mock('@/components/util/helper/helper-functions', () => ({
    getFirebaseTimestampNow: jest.fn(() => ({ seconds: 12345, nanoseconds: 0 })),
    getAllUrlsFromSongMusicSheets: jest.fn(() => []),
}));

// Mock Firestore
jest.mock('firebase/firestore', () => {
    const originalModule = jest.requireActual('firebase/firestore');
    return {
        ...originalModule,
        collection: jest.fn(() => ({ type: 'collection' })),
        doc: jest.fn((...args) => ({ type: 'doc', id: args[args.length - 1] })), // Dynamic ID
        addDoc: jest.fn(() => Promise.resolve({ id: 'default-mock-id' })),
        setDoc: jest.fn(),
        deleteDoc: jest.fn(),
        getDocs: jest.fn(() => Promise.resolve({ docs: [] })),
        getDoc: jest.fn(() => Promise.resolve({ exists: () => false })), // Default to not found
        runTransaction: jest.fn(),
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

// Mock External Services
jest.mock('./SongCommentService', () => ({
    getSongComments: jest.fn(() => Promise.resolve([])),
    deleteSongComment: jest.fn(() => Promise.resolve()),
}));

jest.mock('.', () => ({
    StorageService: {
        deleteFileByUrls: jest.fn(() => Promise.resolve()),
    },
}));

const mockMusicSheetApi = {
    addNewMusicSheet: jest.fn(),
    deleteMusicSheet: jest.fn(),
    getSongMusicSheets: jest.fn(() => Promise.resolve([])),
};

describe('SongService', () => {
    let serviceInstance: any;

    beforeEach(() => {
        jest.clearAllMocks();

        const SongServiceClass = require('./SongService').SongService;
        // Explicitly nullify instance just in case
        SongServiceClass['instance'] = null;

        serviceInstance = SongServiceClass.getInstance(
            {} as any, // Mock DB
            mockMusicSheetApi
        );
    });

    describe('addNewSong', () => {
        it('should create a new song and add music sheets', async () => {
            const mockSong = {
                title: 'New Song',
                music_sheets: [
                    { key: 'C', imageFileContainers: [{ url: 'http://example.com/sheet1.jpg' }] }
                ]
            };

            (addDoc as jest.Mock).mockResolvedValue({ id: 'song-1' });
            (mockMusicSheetApi.addNewMusicSheet as jest.Mock).mockResolvedValue('sheet-1');

            // Correct args: userId, teamId, songInput, musicSheetContainers
            await serviceInstance.addNewSong('user-1', 'team-1', mockSong, mockSong.music_sheets);

            // Verify song creation
            expect(addDoc).toHaveBeenCalledWith(
                expect.objectContaining({ type: 'collection' }),
                expect.objectContaining({
                    title: 'New Song',
                    created_by: expect.objectContaining({ id: 'user-1' })
                })
            );

            // Verify music sheet creation
            expect(mockMusicSheetApi.addNewMusicSheet).toHaveBeenCalledWith(
                'user-1',
                'team-1',
                'song-1', // The ID returned by addDoc
                mockSong.music_sheets![0]
            );
        });
    });

    describe('updateSong', () => {
        it('should update song fields', async () => {
            const mockSong = {
                id: 'song-1',
                title: 'Updated Title'
            };

            // Correct args: userId, teamId, songId, songInput, musicSheetContainers
            await serviceInstance.updateSong('user-1', 'team-1', 'song-1', mockSong, []);

            expect(setDoc).toHaveBeenCalledWith(
                expect.objectContaining({ type: 'doc', id: 'song-1' }),
                expect.objectContaining({
                    title: 'Updated Title',
                    updated_by: expect.objectContaining({ id: 'user-1' })
                }),
                { merge: true }
            );
        });
    });

    describe('deleteSong', () => {
        it('should delete song, its sheets, comments, and files', async () => {
            // Mock getDoc to return existing song
            (getDoc as jest.Mock).mockResolvedValue({
                exists: () => true,
                id: 'song-1',
                data: () => ({ id: 'song-1' })
            });

            // Mock getDocs for subcollections (sheets) (Actually service uses musicSheetService.getSongMusicSheets)
            (mockMusicSheetApi.getSongMusicSheets as jest.Mock).mockResolvedValue([
                { id: 'sheet-1' }
            ]);

            await serviceInstance.deleteSong('team-1', 'song-1');

            // 1. Verify delete song doc
            expect(deleteDoc).toHaveBeenCalledWith(
                expect.objectContaining({ type: 'doc', id: 'song-1' })
            );

            // 2. Verify interactions with dependencies
            // We expect deleteMusicSheet to be called for the retrieved sheet
            expect(mockMusicSheetApi.deleteMusicSheet).toHaveBeenCalledWith(
                'team-1',
                'song-1',
                'sheet-1'
            );
        });
    });
});
