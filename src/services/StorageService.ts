import AsyncStorage from '@react-native-async-storage/async-storage';
import RNFS from 'react-native-fs';
import { Stamp } from '../models/Stamp';

const STORAGE_KEYS = {
    STAMPS: '@stamps_list',
    LAST_SEQUENCE: '@last_sequence_number',
};

export const StorageService = {
    async saveStamp(stamp: Stamp): Promise<void> {
        try {
            const existingStamps = await this.getStamps();
            const updatedStamps = [...existingStamps, stamp];
            await AsyncStorage.setItem(STORAGE_KEYS.STAMPS, JSON.stringify(updatedStamps));
        } catch (error) {
            console.error('Error saving stamp:', error);
            throw error;
        }
    },

    async getStamps(): Promise<Stamp[]> {
        try {
            const stampsJson = await AsyncStorage.getItem(STORAGE_KEYS.STAMPS);
            return stampsJson ? JSON.parse(stampsJson) : [];
        } catch (error) {
            console.error('Error getting stamps:', error);
            return [];
        }
    },

    async markAsUploaded(stampId: string): Promise<void> {
        try {
            const stamps = await this.getStamps();
            const stamp = stamps.find(s => s.id === stampId);

            const updatedStamps = stamps.map(s =>
                s.id === stampId ? { ...s, isUploaded: true } : s
            );
            await AsyncStorage.setItem(STORAGE_KEYS.STAMPS, JSON.stringify(updatedStamps));

            // Clean up files after successful upload
            if (stamp) {
                await this.deleteStampFiles(stamp);
            }
        } catch (error) {
            console.error('Error marking stamp as uploaded:', error);
        }
    },

    async deleteStampFiles(stamp: Stamp): Promise<void> {
        try {
            if (stamp.frontImage) {
                const path = stamp.frontImage.replace('file://', '');
                if (await RNFS.exists(path)) {
                    await RNFS.unlink(path);
                }
            }
            if (stamp.backImage) {
                const path = stamp.backImage.replace('file://', '');
                if (await RNFS.exists(path)) {
                    await RNFS.unlink(path);
                }
            }
        } catch (error) {
            console.error('Error deleting files:', error);
        }
    },

    async setLastSequence(sequence: string): Promise<void> {
        await AsyncStorage.setItem(STORAGE_KEYS.LAST_SEQUENCE, sequence);
    },

    async getLastSequence(): Promise<string | null> {
        return await AsyncStorage.getItem(STORAGE_KEYS.LAST_SEQUENCE);
    },

    async clearUploadedStamps(): Promise<void> {
        try {
            const stamps = await this.getStamps();
            const remainingStamps = stamps.filter(s => !s.isUploaded);
            await AsyncStorage.setItem(STORAGE_KEYS.STAMPS, JSON.stringify(remainingStamps));
        } catch (error) {
            console.error('Error clearing uploaded stamps:', error);
        }
    }
};
