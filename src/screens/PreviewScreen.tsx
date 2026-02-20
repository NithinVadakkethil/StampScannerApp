import React, { useState } from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    SafeAreaView,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { StorageService } from '../services/StorageService';
import { UploadService } from '../services/UploadService';
import { ImageProcessor } from '../utils/ImageProcessor';

type Props = NativeStackScreenProps<RootStackParamList, 'Preview'>;

const PreviewScreen: React.FC<Props> = ({ navigation, route }) => {
    const { stamp: initialStamp } = route.params;
    const [stamp, setStamp] = useState(initialStamp);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const handleRetakeFront = () => {
        navigation.navigate('Camera', {
            sequenceNumber: stamp.sequenceNumber,
            existingStamp: stamp
        });
    };

    const handleRetakeBack = () => {
        navigation.navigate('Camera', {
            sequenceNumber: stamp.sequenceNumber,
            isBackCapture: true,
            existingStamp: stamp
        });
    };

    const handleCrop = async (type: 'front' | 'back') => {
        const path = type === 'front' ? stamp.frontImage : stamp.backImage;
        if (!path) return;

        const croppedPath = await ImageProcessor.manualCrop(path);
        if (croppedPath !== path) {
            setStamp(prev => ({
                ...prev,
                [type === 'front' ? 'frontImage' : 'backImage']: croppedPath
            }));
        }
    };

    const handleConfirmAndSave = async () => {
        try {
            setIsUploading(true);

            // Save locally first
            await StorageService.saveStamp(stamp);

            // Attempt upload
            const response = await UploadService.uploadStamp(stamp, (progress) => {
                setUploadProgress(progress);
            });

            if (response.success) {
                await StorageService.markAsUploaded(stamp.id);

                // Auto-increment and return to camera (Batch Mode)
                const nextSequence = (parseInt(stamp.sequenceNumber, 10) + 1).toString();
                await StorageService.setLastSequence(nextSequence);

                Alert.alert('Success', 'Stamp uploaded! Moving to next...', [
                    {
                        text: 'Next Stamp',
                        onPress: () => navigation.replace('Camera', { sequenceNumber: nextSequence })
                    },
                    {
                        text: 'Finish',
                        onPress: () => navigation.navigate('Sequence')
                    }
                ]);
            } else {
                Alert.alert('Upload Failed', response.message || 'Stored locally for later upload.', [
                    { text: 'OK', onPress: () => navigation.navigate('Sequence') }
                ]);
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'An unexpected error occurred.');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <Text style={styles.sequenceLabel}>Sequence Number</Text>
                    <Text style={styles.sequenceValue}>#{stamp.sequenceNumber}</Text>
                </View>

                <View style={styles.imageSection}>
                    <Text style={styles.sectionTitle}>Front Side</Text>
                    <Image source={{ uri: stamp.frontImage }} style={styles.previewImage} />
                    <View style={styles.imageActions}>
                        <TouchableOpacity style={styles.actionButton} onPress={handleRetakeFront}>
                            <Text style={styles.actionButtonText}>Retake</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionButton} onPress={() => handleCrop('front')}>
                            <Text style={styles.actionButtonText}>Crop</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.imageSection}>
                    <Text style={styles.sectionTitle}>Back Side</Text>
                    {stamp.backImage ? (
                        <>
                            <Image source={{ uri: stamp.backImage }} style={styles.previewImage} />
                            <View style={styles.imageActions}>
                                <TouchableOpacity style={styles.actionButton} onPress={handleRetakeBack}>
                                    <Text style={styles.actionButtonText}>Retake</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.actionButton} onPress={() => handleCrop('back')}>
                                    <Text style={styles.actionButtonText}>Crop</Text>
                                </TouchableOpacity>
                            </View>
                        </>
                    ) : (
                        <TouchableOpacity style={styles.addBackButton} onPress={handleRetakeBack}>
                            <Text style={styles.addBackButtonText}>+ Add Back Side</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </ScrollView>

            <View style={styles.footer}>
                {isUploading ? (
                    <View style={styles.uploadingContainer}>
                        <ActivityIndicator size="large" color="#007AFF" />
                        <Text style={styles.uploadingText}>Uploading... {uploadProgress}%</Text>
                    </View>
                ) : (
                    <TouchableOpacity style={styles.confirmButton} onPress={handleConfirmAndSave}>
                        <Text style={styles.confirmButtonText}>Confirm & Upload</Text>
                    </TouchableOpacity>
                )}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F2F2F7',
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 120,
    },
    header: {
        alignItems: 'center',
        marginBottom: 30,
        backgroundColor: '#FFF',
        padding: 20,
        borderRadius: 16,
    },
    sequenceLabel: {
        fontSize: 14,
        color: '#8E8E93',
        textTransform: 'uppercase',
        fontWeight: '600',
    },
    sequenceValue: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#007AFF',
    },
    imageSection: {
        marginBottom: 30,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 12,
        color: '#1C1C1E',
    },
    previewImage: {
        width: '100%',
        aspectRatio: 1,
        borderRadius: 12,
        backgroundColor: '#DDD',
    },
    imageActions: {
        flexDirection: 'row',
        marginTop: 10,
        gap: 10,
    },
    actionButton: {
        flex: 1,
        backgroundColor: '#FFF',
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E5E5EA',
    },
    actionButtonText: {
        color: '#007AFF',
        fontWeight: '600',
    },
    addBackButton: {
        width: '100%',
        height: 100,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#C7C7CC',
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFF',
    },
    addBackButtonText: {
        color: '#8E8E93',
        fontSize: 16,
        fontWeight: '600',
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 20,
        paddingBottom: 40,
        backgroundColor: 'rgba(242, 242, 247, 0.9)',
        borderTopWidth: 1,
        borderTopColor: '#C6C6C8',
    },
    confirmButton: {
        backgroundColor: '#34C759',
        height: 56,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
    },
    confirmButtonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    uploadingContainer: {
        alignItems: 'center',
    },
    uploadingText: {
        marginTop: 10,
        color: '#8E8E93',
        fontWeight: '600',
    },
});

export default PreviewScreen;
