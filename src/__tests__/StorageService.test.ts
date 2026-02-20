import { StorageService } from '../services/StorageService';
import AsyncStorage from '@react-native-async-storage/async-storage';

jest.mock('@react-native-async-storage/async-storage', () => ({
    setItem: jest.fn(),
    getItem: jest.fn(),
}));

jest.mock('react-native-fs', () => ({
    exists: jest.fn().mockResolvedValue(true),
    unlink: jest.fn().mockResolvedValue(undefined),
}));

describe('StorageService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should save a stamp', async () => {
        const stamp = {
            id: '1',
            sequenceNumber: '1001',
            frontImage: 'path/to/front',
            backImage: null,
            timestamp: Date.now(),
            isUploaded: false,
        };

        (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
        await StorageService.saveStamp(stamp);

        expect(AsyncStorage.setItem).toHaveBeenCalledWith(
            '@stamps_list',
            JSON.stringify([stamp])
        );
    });

    it('should get stamps', async () => {
        const stamps = [{ id: '1', sequenceNumber: '1001' }];
        (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(stamps));

        const result = await StorageService.getStamps();
        expect(result).toEqual(stamps);
    });
});
