import { renderHook, waitFor } from '@testing-library/react';
import { RecoilRoot, useRecoilValue, useRecoilValueLoadable } from 'recoil';
import { currentTeamSetlistListAtom, setlistSongListAtom } from './setlist-state';
import { ServiceEventApi } from '@/apis/ServiceEventApi';
import { SetlistApi } from '@/apis/SetlistApi';
import { SongApi } from '@/apis';
import { Setlist } from '@/models/setlist';
import { Song } from '@/models/song';
import { Timestamp } from 'firebase/firestore';

// Mock Services
jest.mock('@/apis', () => ({
    SongService: {
        getById: jest.fn(),
    }
}));
jest.mock('@/apis/ServiceEventService', () => ({
    ServiceEventService: {
        getServiceEvents: jest.fn(),
        getServiceDetails: jest.fn(),
    }
}));
jest.mock('@/apis/SetlistService', () => ({
    SetlistService: {
        getSetlist: jest.fn(),
    }
}));

describe('SetlistState', () => {
    // Helper wrapper for Recoil
    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <RecoilRoot>{children}</RecoilRoot>
    );

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('currentTeamSetlistListAtom', () => {
        it('should fetch and sort setlists by date descending', async () => {
            const teamId = 'team-1';
            const mockServices = [
                { id: 's1', date: Timestamp.fromDate(new Date('2023-01-01')), title: 'Service 1' },
                { id: 's2', date: Timestamp.fromDate(new Date('2023-02-01')), title: 'Service 2' },
            ];

            (ServiceEventApi.getServiceEvents as jest.Mock).mockResolvedValue(mockServices);

            const { result } = renderHook(() => useRecoilValue(currentTeamSetlistListAtom(teamId)), { wrapper });

            await waitFor(() => {
                expect(result.current).toHaveLength(2);
                // Check sorting: s2 (Feb) should come before s1 (Jan)
                expect(result.current[0].id).toBe('s2');
                expect(result.current[1].id).toBe('s1');
            });
        });

        it('should return empty array on fetch failure', async () => {
            const teamId = 'team-error-case';
            (ServiceEventApi.getServiceEvents as jest.Mock).mockRejectedValue(new Error('Fetch failed'));

            const { result } = renderHook(() => useRecoilValueLoadable(currentTeamSetlistListAtom(teamId)), { wrapper });

            await waitFor(() => {
                expect(result.current.state).toBe('hasValue');
                expect(result.current.contents).toEqual([]);
            });
        });
    });

    describe('setlistSongListAtom', () => {
        it('should aggregate songs for a specific setlist', async () => {
            const teamId = 'team-1';
            const setlistId = 's1';

            // Mock Service details
            const mockDetails = {
                event: { id: 's1', title: 'Service 1', date: Timestamp.now() },
                setlist: { songs: [{ id: 'song1' }, { id: 'song2' }] }
            };

            (ServiceEventApi.getServiceDetails as jest.Mock).mockResolvedValue(mockDetails);

            // Mock Song fetch
            (SongApi.getById as jest.Mock).mockImplementation((tid, sid) => {
                if (sid === 'song1') return Promise.resolve({ id: 'song1', title: 'Song A' } as Song);
                if (sid === 'song2') return Promise.resolve({ id: 'song2', title: 'Song B' } as Song);
                return Promise.resolve(null);
            });

            const { result } = renderHook(() => useRecoilValue(setlistSongListAtom({ teamId, setlistId })), { wrapper });

            await waitFor(() => {
                expect(result.current).toHaveLength(2);
                expect(result.current).toEqual([
                    { id: 'song1', title: 'Song A' },
                    { id: 'song2', title: 'Song B' }
                ]);
            });
        });
    });
});
