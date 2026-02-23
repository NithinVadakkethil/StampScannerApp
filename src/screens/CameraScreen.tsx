// import React, { useState, useRef, useEffect, useCallback } from 'react';
// import {
//     StyleSheet,
//     View,
//     Text,
//     TouchableOpacity,
//     SafeAreaView,
//     Alert,
//     Dimensions,
// } from 'react-native';
// import {
//     Camera,
//     useCameraDevice,
//     useCameraPermission,
//     PhotoFile,
//     useFrameProcessor,
// } from 'react-native-vision-camera';
// import { NativeStackScreenProps } from '@react-navigation/native-stack';
// import { RootStackParamList } from '../navigation/AppNavigator';
// import Reanimated, {
//     useSharedValue,
//     useAnimatedStyle,
//     withTiming,
//     withRepeat,
//     withSequence
// } from 'react-native-reanimated';

// type Props = NativeStackScreenProps<RootStackParamList, 'Camera'>;

// const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// const CameraScreen: React.FC<Props> = ({ navigation, route }) => {
//     const { sequenceNumber, isBackCapture = false, existingStamp } = route.params;
//     const { hasPermission, requestPermission } = useCameraPermission();
//     const device = useCameraDevice('back');
//     const camera = useRef<Camera>(null);
//     const [isCapturing, setIsCapturing] = useState(false);
//     const [detectionStatus, setDetectionStatus] = useState<'searching' | 'detected' | 'stable'>('searching');
//     const stabilityTimer = useRef<NodeJS.Timeout | null>(null);

//     /* 
//       FRAME PROCESSOR EXAMPLE FOR OPENCV
//       To use this, you need to create a Native Module that bridges OpenCV.
//       The frame processor runs in a worklet.
//     */
//     const frameProcessor = useFrameProcessor((frame) => {
//         'worklet';
//         /**
//          * REAL-WORLD IMPLEMENTATION:
//          * 1. Call native OpenCV bridge: const result = detectStampEdge(frame);
//          * 2. If result.isDetected, update detectionStatus and box coordinates.
//          * 3. Here we simulate detection logic in the UI layer below.
//          */
//     }, []);

//     // Simulate detection logic for "production-ready" feel without native OpenCV
//     useEffect(() => {
//         const interval = setInterval(() => {
//             if (detectionStatus === 'searching') {
//                 // Randomly simulate finding a stamp
//                 if (Math.random() > 0.7) {
//                     setDetectionStatus('detected');
//                 }
//             } else if (detectionStatus === 'detected') {
//                 // Transition to stable
//                 setDetectionStatus('stable');
//             }
//         }, 2000);

//         return () => clearInterval(interval);
//     }, [detectionStatus]);

//     // Animation for the detection box
//     const boxOpacity = useSharedValue(0.5);
//     const boxScale = useSharedValue(1);

//     useEffect(() => {
//         if (!hasPermission) {
//             requestPermission();
//         }
//     }, [hasPermission]);

//     useEffect(() => {
//         // Pulsing animation when searching
//         if (detectionStatus === 'searching') {
//             boxOpacity.value = withRepeat(
//                 withSequence(withTiming(0.3, { duration: 1000 }), withTiming(0.7, { duration: 1000 })),
//                 -1,
//                 true
//             );
//         } else if (detectionStatus === 'stable') {
//             boxOpacity.value = withTiming(1, { duration: 200 });
//             boxScale.value = withTiming(1.05, { duration: 200 });
//         }
//     }, [detectionStatus]);

//     // const takePhoto = useCallback(async () => {
//     //     if (isCapturing || !camera.current) return;

//     //     try {
//     //         setIsCapturing(true);
//     //         const photo = await camera.current.takePhoto({
//     //             qualityPrioritization: 'quality',
//     //             flash: 'auto',
//     //             enableShutterSound: true,
//     //         });

//     //         handlePhotoCaptured(photo);
//     //     } catch (e) {
//     //         console.error('Failed to take photo', e);
//     //         Alert.alert('Error', 'Failed to take photo');
//     //     } finally {
//     //         setIsCapturing(false);
//     //     }
//     // }, [camera, isCapturing]);

//     const takePhoto = useCallback(async () => {
//         if (isCapturing) return;
//         if (!camera.current) {
//           console.log('Camera ref is null');
//           return;
//         }
      
//         try {
//           setIsCapturing(true);
      
//           const photo = await camera.current.takePhoto({
//             qualityPrioritization: 'balanced', // change from 'quality'
//             flash: 'off', // temporarily disable flash
//             enableShutterSound: false,
//           });
      
//           console.log('Photo path:', photo.path);
      
//           handlePhotoCaptured(photo);
      
//         } catch (error) {
//           console.error('Take photo error:', error);
//           Alert.alert('Error', 'Failed to capture photo');
//         } finally {
//           setIsCapturing(false);
//         }
//       }, [isCapturing]);

//     // Auto-capture logic when stable
//     useEffect(() => {
//         if (detectionStatus === 'stable' && !isCapturing) {
//             stabilityTimer.current = setTimeout(() => {
//                 takePhoto();
//             }, 1500); // 1.5 seconds stability
//         } else {
//             if (stabilityTimer.current) {
//                 clearTimeout(stabilityTimer.current);
//             }
//         }

//         return () => {
//             if (stabilityTimer.current) clearTimeout(stabilityTimer.current);
//         };
//     }, [detectionStatus, isCapturing, takePhoto]);

//     const handlePhotoCaptured = (photo: PhotoFile) => {
//         const photoPath = `file://${photo.path}`;
//         console.log(photo)

//         if (!isBackCapture) {
//             // Finished front capture, ask about back
//             Alert.alert(
//                 'Front Captured',
//                 'Does this stamp have a back side?',
//                 [
//                     {
//                         text: 'No',
//                         onPress: () => {
//                             const newStamp = {
//                                 id: Date.now().toString(),
//                                 sequenceNumber,
//                                 frontImage: photoPath,
//                                 backImage: null,
//                                 timestamp: Date.now(),
//                                 isUploaded: false,
//                             };
//                             navigation.navigate('Preview', { stamp: newStamp });
//                         },
//                     },
//                     {
//                         text: 'Yes',
//                         onPress: () => {
//                             // Re-run camera for back
//                             navigation.replace('Camera', {
//                                 sequenceNumber,
//                                 isBackCapture: true,
//                                 existingStamp: {
//                                     id: Date.now().toString(),
//                                     sequenceNumber,
//                                     frontImage: photoPath,
//                                     backImage: null,
//                                     timestamp: Date.now(),
//                                     isUploaded: false,
//                                 }
//                             });
//                         },
//                     },
//                 ]
//             );
//         } else if (existingStamp) {
//             // Finished back capture
//             const updatedStamp = {
//                 ...existingStamp,
//                 backImage: photoPath,
//             };
//             navigation.navigate('Preview', { stamp: updatedStamp });
//         }
//     };

//     const animatedBoxStyle = useAnimatedStyle(() => ({
//         opacity: boxOpacity.value,
//         transform: [{ scale: boxScale.value }],
//         borderColor: detectionStatus === 'stable' ? '#34C759' : '#007AFF',
//     }));

//     if (!device) return <View style={styles.container}><Text>No Camera Device</Text></View>;
//     if (!hasPermission) return <View style={styles.container}><Text>No Camera Permission</Text></View>;

//     return (
//         <View style={styles.container}>
//             <Camera
//                 ref={camera}
//                 style={StyleSheet.absoluteFill}
//                 device={device}
//                 isActive={true}
//                 photo={true}
//                 frameProcessor={frameProcessor}
//             />

//             {/* Overlay Guidelines */}
//             <View style={styles.overlay}>
//                 <SafeAreaView style={styles.topControls}>
//                     <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
//                         <Text style={styles.backButtonText}>Cancel</Text>
//                     </TouchableOpacity>
//                     <View style={styles.infoBadge}>
//                         <Text style={styles.infoText}>
//                             {isBackCapture ? 'BACK' : 'FRONT'} - {sequenceNumber}
//                         </Text>
//                     </View>
//                     <View style={{ width: 60 }} />
//                 </SafeAreaView>

//                 <View style={styles.guideContainer}>
//                     <Reanimated.View style={[styles.detectionBox, animatedBoxStyle]} />
//                     <Text style={styles.guideText}>
//                         {detectionStatus === 'searching'
//                             ? 'Align stamp within frame'
//                             : 'Hold steady...'}
//                     </Text>
//                 </View>

//                 <View style={styles.bottomControls}>
//                     <TouchableOpacity
//                         style={[styles.captureButton, isCapturing && styles.captureButtonDisabled]}
//                         onPress={takePhoto}
//                         disabled={isCapturing}
//                     >
//                         <View style={styles.captureButtonInner} />
//                     </TouchableOpacity>
//                 </View>
//             </View>
//         </View>
//     );
// };

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         backgroundColor: '#000',
//     },
//     overlay: {
//         ...StyleSheet.absoluteFillObject,
//         justifyContent: 'space-between',
//     },
//     topControls: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         alignItems: 'center',
//         paddingHorizontal: 20,
//         paddingTop: 20,
//     },
//     backButton: {
//         padding: 10,
//     },
//     backButtonText: {
//         color: '#FFF',
//         fontSize: 16,
//     },
//     infoBadge: {
//         backgroundColor: 'rgba(0,0,0,0.6)',
//         paddingHorizontal: 12,
//         paddingVertical: 6,
//         borderRadius: 20,
//     },
//     infoText: {
//         color: '#FFF',
//         fontWeight: 'bold',
//     },
//     guideContainer: {
//         flex: 1,
//         justifyContent: 'center',
//         alignItems: 'center',
//     },
//     detectionBox: {
//         width: SCREEN_WIDTH * 0.7,
//         height: SCREEN_WIDTH * 0.7 * 1.3, // Typical stamp aspect ratio
//         borderWidth: 2,
//         borderRadius: 12,
//         borderStyle: 'dashed',
//     },
//     guideText: {
//         color: '#FFF',
//         marginTop: 20,
//         fontSize: 16,
//         textShadowColor: 'rgba(0,0,0,0.8)',
//         textShadowOffset: { width: 1, height: 1 },
//         textShadowRadius: 3,
//     },
//     bottomControls: {
//         height: 120,
//         justifyContent: 'center',
//         alignItems: 'center',
//         paddingBottom: 20,
//     },
//     captureButton: {
//         width: 80,
//         height: 80,
//         borderRadius: 40,
//         backgroundColor: 'rgba(255,255,255,0.3)',
//         justifyContent: 'center',
//         alignItems: 'center',
//     },
//     captureButtonInner: {
//         width: 64,
//         height: 64,
//         borderRadius: 32,
//         backgroundColor: '#FFF',
//     },
//     captureButtonDisabled: {
//         opacity: 0.5,
//     },
// });

// export default CameraScreen;

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Dimensions,
} from 'react-native';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  PhotoFile,
  useFrameProcessor,
} from 'react-native-vision-camera';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { ImageProcessor } from '../utils/ImageProcessor';
import Reanimated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence
} from 'react-native-reanimated';

type Props = NativeStackScreenProps<RootStackParamList, 'Camera'>;

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const CameraScreen: React.FC<Props> = ({ navigation, route }) => {
  const { sequenceNumber, isBackCapture = false, existingStamp } = route.params;
  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice('back');
  const camera = useRef<Camera>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [detectionStatus, setDetectionStatus] = useState<'searching' | 'detected' | 'stable'>('searching');
  const stabilityTimer = useRef<NodeJS.Timeout | null>(null);

  /*
    FRAME PROCESSOR EXAMPLE FOR OPENCV
    To use this, you need to create a Native Module that bridges OpenCV.
    The frame processor runs in a worklet.
  */
  const frameProcessor = useFrameProcessor((frame) => {
    'worklet';
    /**
     * REAL-WORLD IMPLEMENTATION:
     * 1. Call native OpenCV bridge: const result = detectStampEdge(frame);
     * 2. If result.isDetected, update detectionStatus and box coordinates.
     * 3. Here we simulate detection logic in the UI layer below.
     */
  }, []);

  // Simulate detection logic for "production-ready" feel without native OpenCV
  useEffect(() => {
    const interval = setInterval(() => {
      if (detectionStatus === 'searching') {
        // Randomly simulate finding a stamp - made it faster for "QR-like" feel
        if (Math.random() > 0.6) {
          setDetectionStatus('detected');
        }
      } else if (detectionStatus === 'detected') {
        // Transition to stable
        setDetectionStatus('stable');
      }
    }, 1000); // Faster interval

    return () => clearInterval(interval);
  }, [detectionStatus]);

  const takePhoto = useCallback(async () => {
    if (isCapturing || !camera.current) return;

    try {
      setIsCapturing(true);
      const photo = await camera.current.takePhoto({
        qualityPrioritization: 'quality',
        flash: 'auto',
        enableShutterSound: true,
      });

      // Automatically invoke cropper to remove background
      const photoPath = `file://${photo.path}`;
      const croppedPath = await ImageProcessor.manualCrop(photoPath);

      handlePhotoCaptured(croppedPath);
    } catch (e) {
      console.error('Failed to take photo', e);
      Alert.alert('Error', 'Failed to take photo');
    } finally {
      setIsCapturing(false);
    }
  }, [camera, isCapturing]);

  // Auto-capture logic when stable
  useEffect(() => {
    if (detectionStatus === 'stable' && !isCapturing) {
      stabilityTimer.current = setTimeout(() => {
        takePhoto();
      }, 1500); // 1.5 seconds stability
    } else {
      if (stabilityTimer.current) {
        clearTimeout(stabilityTimer.current);
      }
    }

    return () => {
      if (stabilityTimer.current) clearTimeout(stabilityTimer.current);
    };
  }, [detectionStatus, isCapturing, takePhoto]);

  // Animation for the detection box
  const boxOpacity = useSharedValue(0.5);
  const boxScale = useSharedValue(1);

  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission]);

  useEffect(() => {
    // Pulsing animation when searching
    if (detectionStatus === 'searching') {
      boxOpacity.value = withRepeat(
        withSequence(withTiming(0.3, { duration: 1000 }), withTiming(0.7, { duration: 1000 })),
        -1,
        true
      );
    } else if (detectionStatus === 'stable') {
      boxOpacity.value = withTiming(1, { duration: 200 });
      boxScale.value = withTiming(1.05, { duration: 200 });
    }
  }, [detectionStatus]);

  const handlePhotoCaptured = (photoPath: string) => {
    if (!isBackCapture) {
      // Finished front capture, ask about back
      Alert.alert(
        'Front Captured',
        'Does this stamp have a back side?',
        [
          {
            text: 'No',
            onPress: () => {
              const newStamp = {
                id: Date.now().toString(),
                sequenceNumber,
                frontImage: photoPath,
                backImage: null,
                timestamp: Date.now(),
                isUploaded: false,
              };
              navigation.navigate('Preview', { stamp: newStamp });
            },
          },
          {
            text: 'Yes',
            onPress: () => {
              // Re-run camera for back
              navigation.replace('Camera', {
                sequenceNumber,
                isBackCapture: true,
                existingStamp: {
                  id: Date.now().toString(),
                  sequenceNumber,
                  frontImage: photoPath,
                  backImage: null,
                  timestamp: Date.now(),
                  isUploaded: false,
                }
              });
            },
          },
        ]
      );
    } else if (existingStamp) {
      // Finished back capture
      const updatedStamp = {
        ...existingStamp,
        backImage: photoPath,
      };
      navigation.navigate('Preview', { stamp: updatedStamp });
    }
  };

  const animatedBoxStyle = useAnimatedStyle(() => ({
    opacity: boxOpacity.value,
    transform: [{ scale: boxScale.value }],
    borderColor: detectionStatus === 'stable' ? '#34C759' : '#007AFF',
  }));

  if (!device) return <View style={styles.container}><Text>No Camera Device</Text></View>;
  if (!hasPermission) return <View style={styles.container}><Text>No Camera Permission</Text></View>;

  return (
    <View style={styles.container}>
      <Camera
        ref={camera}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        photo={true}
        frameProcessor={frameProcessor}
      />

      {/* Overlay Guidelines */}
      <View style={styles.overlay}>
        <SafeAreaView style={styles.topControls}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>Cancel</Text>
          </TouchableOpacity>
          <View style={styles.infoBadge}>
            <Text style={styles.infoText}>
              {isBackCapture ? 'BACK' : 'FRONT'} - {sequenceNumber}
            </Text>
          </View>
          <View style={{ width: 60 }} />
        </SafeAreaView>

        <View style={styles.guideContainer}>
          <Reanimated.View style={[styles.detectionBox, animatedBoxStyle]} />
          <Text style={styles.guideText}>
            {detectionStatus === 'searching'
              ? 'Align stamp within frame'
              : 'Hold steady...'}
          </Text>
        </View>

        <View style={styles.bottomControls}>
          <TouchableOpacity
            style={[styles.captureButton, isCapturing && styles.captureButtonDisabled]}
            onPress={takePhoto}
            disabled={isCapturing}
          >
            <View style={styles.captureButtonInner} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
  },
  topControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  backButton: {
    padding: 10,
  },
  backButtonText: {
    color: '#FFF',
    fontSize: 16,
  },
  infoBadge: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  infoText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  guideContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detectionBox: {
    width: SCREEN_WIDTH * 0.7,
    height: SCREEN_WIDTH * 0.7 * 1.3, // Typical stamp aspect ratio
    borderWidth: 2,
    borderRadius: 12,
    borderStyle: 'dashed',
  },
  guideText: {
    color: '#FFF',
    marginTop: 20,
    fontSize: 16,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  bottomControls: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 20,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFF',
  },
  captureButtonDisabled: {
    opacity: 0.5,
  },
});

export default CameraScreen;
