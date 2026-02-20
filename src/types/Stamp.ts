export interface StampCapture {
    id: string;
    sequenceNumber: string;
    frontImageUri: string;
    backImageUri?: string;
    status: 'pending' | 'uploading' | 'completed' | 'failed';
    timestamp: number;
}

export type ScannerStep = 'FRONT' | 'BACK' | 'PREVIEW';