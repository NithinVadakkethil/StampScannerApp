import axios from 'axios';
import { StampCapture } from '../types/Stamp';

const API_URL = 'https://your-auction-site.com/api/stamps/upload';

export const uploadStampRecord = async (stamp: StampCapture) => {
    const data = new FormData();
    data.append('sequence_number', stamp.sequenceNumber);

    data.append('front_image', {
        uri: stamp.frontImageUri,
        name: `${stamp.sequenceNumber}_front.jpg`,
        type: 'image/jpeg',
    } as any);

    if (stamp.backImageUri) {
        data.append('back_image', {
            uri: stamp.backImageUri,
            name: `${stamp.sequenceNumber}_back.jpg`,
            type: 'image/jpeg',
        } as any);
    }

    return axios.post(API_URL, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 30000,
    });
};