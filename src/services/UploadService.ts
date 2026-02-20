import axios from 'axios';
import { Stamp, StampUploadResponse } from '../models/Stamp';
import { Platform } from 'react-native';

const API_BASE_URL = 'https://your-api-endpoint.com/api'; // Replace with actual API

export const UploadService = {
  async uploadStamp(
    stamp: Stamp,
    onProgress?: (progress: number) => void
  ): Promise<StampUploadResponse> {
    const formData = new FormData();
    formData.append('sequence_number', stamp.sequenceNumber);

    // Prepare images for upload
    const prepareUri = (uri: string) => {
      return Platform.OS === 'ios' ? uri.replace('file://', '') : uri;
    };

    formData.append('front_image', {
      uri: prepareUri(stamp.frontImage),
      name: `${stamp.sequenceNumber}_front.jpg`,
      type: 'image/jpeg',
    } as any);

    if (stamp.backImage) {
      formData.append('back_image', {
        uri: prepareUri(stamp.backImage),
        name: `${stamp.sequenceNumber}_back.jpg`,
        type: 'image/jpeg',
      } as any);
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/stamps/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(progress);
          }
        },
      });

      return {
        success: true,
        message: 'Upload successful',
        id: response.data.id,
      };
    } catch (error: any) {
      console.error('Upload failed:', error);
      return {
        success: false,
        message: error.message || 'Upload failed',
      };
    }
  },
};
