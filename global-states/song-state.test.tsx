import { renderHook, waitFor } from '@testing-library/react';
import { RecoilRoot, useRecoilValue, useRecoilValueLoadable } from 'recoil';
import { currentTeamSortedSongsAtom } from './song-state';
import { SongService } from '@/apis';
import { Song } from '@/models/song';
import {
    songSearchInputAtom,
    searchSelectedTagsAtom,
    searchSelectedKeysAtom,
    songBoardSelectedSortOptionAtom
} from '@/app/board/_states/board-states';
import { SongBoardSortOption } from '@/components/constants/enums';

// Mock Services
jest.mock('@/apis', () => ({
    SongService: {
        getSong: jest.fn(),
        getSongIds: jest.fn(),
        getById: jest.fn(),
    }
}));

describe('SongState', () => {
    let mockSongs: Song[];

    beforeEach(() => {
        jest.clearAllMocks();
        mockSongs = [
            { id: '1', title: 'Amazing Grace', subtitle: 'How sweet the sound', tags: ['hymn'], keys: ['C'], last_used_time: 100 },
            { id: '2', title: 'Blessed Assurance', tags: ['hymn', 'gospel'], keys: ['D'], last_used_time: 200 },
            { id: '3', title: 'Cornerstone', tags: ['ccm'], keys: ['C'], last_used_time: 50 },
        ] as any;
    });

    const createWrapper = (initializeState?: (snapshot: any) => void) => {
        return ({ children }: { children: React.ReactNode }) => (
            <RecoilRoot initializeState={initializeState}>{children}</RecoilRoot>
        );
    };

    describe('currentTeamSortedSongsAtom', () => {
        it('should return all songs when no filters are active', async () => {
            (SongService.getSong as jest.Mock).mockResolvedValue(mockSongs);

            const { result } = renderHook(() => useRecoilValueLoadable(currentTeamSortedSongsAtom('team-1')), {
                wrapper: createWrapper()
            });

            await waitFor(() => {
                expect(result.current.state).toBe('hasValue');
                expect(result.current.contents).toHaveLength(3);
            });
        });

        it('should filter by search input (title)', async () => {
            (SongService.getSong as jest.Mock).mockResolvedValue(mockSongs);

            const { result } = renderHook(() => useRecoilValueLoadable(currentTeamSortedSongsAtom('team-search')), {
                wrapper: createWrapper(({ set }) => {
                    set(songSearchInputAtom, 'Grace');
                })
            });

            await waitFor(() => {
                expect(result.current.state).toBe('hasValue');
                const songs = result.current.contents as Song[];
                expect(songs).toHaveLength(1);
                expect(songs[0].title).toBe('Amazing Grace');
            });
        });

        it('should filter by tags', async () => {
            (SongService.getSong as jest.Mock).mockResolvedValue(mockSongs);

            const { result } = renderHook(() => useRecoilValueLoadable(currentTeamSortedSongsAtom('team-tags')), {
                wrapper: createWrapper(({ set }) => {
                    set(searchSelectedTagsAtom, ['gospel']);
                })
            });

            await waitFor(() => {
                expect(result.current.state).toBe('hasValue');
                const songs = result.current.contents as Song[];
                expect(songs).toHaveLength(1);
                expect(songs[0].title).toBe('Blessed Assurance');
            });
        });

        it('should sort by last used date descending', async () => {
            (SongService.getSong as jest.Mock).mockResolvedValue(mockSongs);

            const { result } = renderHook(() => useRecoilValueLoadable(currentTeamSortedSongsAtom('team-sort')), {
                wrapper: createWrapper(({ set }) => {
                    set(songBoardSelectedSortOptionAtom, SongBoardSortOption.LAST_USED_DATE_DESCENDING);
                })
            });

            await waitFor(() => {
                expect(result.current.state).toBe('hasValue');
                const songs = result.current.contents as Song[];
                expect(songs[0].id).toBe('2'); // 200
                expect(songs[1].id).toBe('1'); // 100
                expect(songs[2].id).toBe('3'); // 50
            });
        });
    });
});
