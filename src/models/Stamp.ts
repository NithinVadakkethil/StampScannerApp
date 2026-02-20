export interface Stamp {
  id: string;
  sequenceNumber: string;
  frontImage: string;
  backImage: string | null;
  timestamp: number;
  isUploaded: boolean;
}

export interface StampUploadResponse {
  success: boolean;
  message?: string;
  id?: string;
}
