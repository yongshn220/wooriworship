import { renderHook, waitFor } from '@testing-library/react';
import { RecoilRoot, useRecoilValue, useRecoilValueLoadable } from 'recoil';
import { currentTeamWorshipListAtom, worshipSongListAtom } from './worship-state';
import { ServiceEventService } from '@/apis/ServiceEventService';
import { SetlistService } from '@/apis/SetlistService';
import { SongService } from '@/apis';
import { Worship } from '@/models/worship';
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

describe('WorshipState', () => {
    // Helper wrapper for Recoil
    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <RecoilRoot>{children}</RecoilRoot>
    );

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('currentTeamWorshipListAtom', () => {
        it('should fetch and sort worships by date descending', async () => {
            const mockServices = [
                { id: 'w1', date: Timestamp.fromDate(new Date('2023-01-01')), title: 'Service 1' },
                { id: 'w2', date: Timestamp.fromDate(new Date('2023-02-01')), title: 'Service 2' },
            ];

            (ServiceEventService.getServiceEvents as jest.Mock).mockResolvedValue(mockServices);

            const { result } = renderHook(() => useRecoilValue(currentTeamWorshipListAtom(teamId)), { wrapper });

            await waitFor(() => {
                expect(result.current).toHaveLength(2);
                // Check sorting: w2 (Feb) should handle before w1 (Jan)
                expect(result.current[0].id).toBe('w2');
                expect(result.current[1].id).toBe('w1');
            });
        });

        it('should return empty array on fetch failure', async () => {
            const teamId = 'team-error-case';
            (ServiceEventService.getServiceEvents as jest.Mock).mockRejectedValue(new Error('Fetch failed'));

            const { result } = renderHook(() => useRecoilValueLoadable(currentTeamWorshipListAtom(teamId)), { wrapper });

            await waitFor(() => {
                expect(result.current.state).toBe('hasValue');
                expect(result.current.contents).toEqual([]);
            });
        });
    });

    describe('worshipSongListAtom', () => {
        it('should aggregate songs for a specific worship', async () => {
            const teamId = 'team-1';
            const worshipId = 'w1';

            // Mock Service details
            const mockDetails = {
                event: { id: 'w1', title: 'Service 1', date: Timestamp.now() },
                setlist: { songs: [{ id: 's1' }, { id: 's2' }] }
            };

            (ServiceEventService.getServiceDetails as jest.Mock).mockResolvedValue(mockDetails);

            // Mock Song fetch
            (SongService.getById as jest.Mock).mockImplementation((tid, sid) => {
                if (sid === 's1') return Promise.resolve({ id: 's1', title: 'Song A' } as Song);
                if (sid === 's2') return Promise.resolve({ id: 's2', title: 'Song B' } as Song);
                return Promise.resolve(null);
            });

            // Note: Recoil atoms often depend on each other. 
            // In worship-state.ts, worshipSongListAtom reads worshipAtom, which calls WorshipService.getById.
            // Then it maps songs and reads songAtom, which calls SongService.getById.

            const { result } = renderHook(() => useRecoilValue(worshipSongListAtom({ teamId, worshipId })), { wrapper });

            await waitFor(() => {
                expect(result.current).toHaveLength(2);
                expect(result.current).toEqual([
                    { id: 's1', title: 'Song A' },
                    { id: 's2', title: 'Song B' }
                ]);
            });
        });
    });
});
