import { renderHook, waitFor } from '@testing-library/react';
import { RecoilRoot, useRecoilValueLoadable } from 'recoil';
import { userAtom, usersAtom } from './userState';
import { UserApi } from '@/apis';
import { User } from '@/models/user';

// Mock Services
jest.mock('@/apis', () => ({
    UserService: {
        getById: jest.fn(),
        getByIds: jest.fn(),
    }
}));

describe('UserState', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <RecoilRoot>{children}</RecoilRoot>
    );

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('userAtom', () => {
        it('should fetch user by ID', async () => {
            const userId = 'user-1';
            const mockUser = { id: 'user-1', name: 'John Doe' } as User;
            (UserApi.getById as jest.Mock).mockResolvedValue(mockUser);

            const { result } = renderHook(() => useRecoilValueLoadable(userAtom(userId)), { wrapper });

            await waitFor(() => {
                expect(result.current.state).toBe('hasValue');
                expect(result.current.contents).toEqual(mockUser);
            });
        });

        it('should return null on fetch failure', async () => {
            const userId = 'user-error-case';
            (UserApi.getById as jest.Mock).mockRejectedValue(new Error('Fetch failed'));

            const { result } = renderHook(() => useRecoilValueLoadable(userAtom(userId)), { wrapper });

            await waitFor(() => {
                expect(result.current.state).toBe('hasValue');
                expect(result.current.contents).toBeNull();
            });
        });
    });

    describe('usersAtom', () => {
        it('should fetch multiple users by IDs', async () => {
            const userIds = ['u1', 'u2'];
            const mockUsers = [{ id: 'u1' }, { id: 'u2' }] as User[];
            (UserApi.getByIds as jest.Mock).mockResolvedValue(mockUsers);

            const { result } = renderHook(() => useRecoilValueLoadable(usersAtom(userIds)), { wrapper });

            await waitFor(() => {
                expect(result.current.state).toBe('hasValue');
                expect(result.current.contents).toEqual(mockUsers);
            });
        });
    });
});
