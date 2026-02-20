# Stamp Scanner App

A production-ready React Native iOS-focused app for automating stamp photography and cataloging.

## Features

- **Sequence Number Workflow**: Automated tracking and incrementing of stamp sequence numbers.
- **High-Performance Camera**: Built with `react-native-vision-camera` for real-time performance.
- **Smart Detection Overlay**: Visual guides for optimal stamp alignment.
- **Front/Back Logic**: Seamlessly capture both sides of a stamp.
- **Auto-Crop System**: Integration-ready architecture for OpenCV-based perspective correction.
- **Offline Storage**: Temporary local storage using `AsyncStorage`.
- **API Upload**: Robust upload system with progress tracking via `Axios`.

## Tech Stack

- React Native CLI
- TypeScript
- React Navigation
- React Native Vision Camera (v3/v4)
- React Native Reanimated (v3)
- Axios & AsyncStorage

## Troubleshooting Boost Checksum Error

If you encounter a `Verification checksum was incorrect` error for `boost` during `pod install`, run the following commands to clear your CocoaPods cache and retry:

```bash
# 1. Clear CocoaPods cache for boost
pod cache clean boost

# 2. Alternatively, clear all CocoaPods caches (more thorough)
rm -rf ~/Library/Caches/CocoaPods
rm -rf ios/Pods
rm -rf ios/Podfile.lock

# 3. Clean Xcode's derived data
rm -rf ~/Library/Developer/Xcode/DerivedData/*

# 4. Retry pod install
cd ios && pod install
```

## Troubleshooting Android Build Error (SDK 35 / AGP 8.6)

If you encounter a build error regarding `androidx.core:core-ktx:1.16.0` requiring API 35:
1. The project is already configured to use **SDK 35** and **AGP 8.6.0**.
2. Ensure you have the Android SDK 35 installed via Android Studio SDK Manager.
3. Clean the build:
   ```bash
   cd android
   ./gradlew clean
   cd ..
   npm run android
   ```

## Installation

1. **Clone and Install Dependencies**:
   ```bash
   npm install
   # or
   yarn install
   ```

2. **Install iOS Pods**:
   ```bash
   cd ios && pod install && cd ..
   ```

3. **Run on iOS**:
   ```bash
   npx react-native run-ios
   ```

## OpenCV Integration Guide

To enable automatic edge detection and perspective correction, follow these steps:

### 1. Add OpenCV to iOS
- Download OpenCV iOS framework.
- Add `opencv2.framework` to your Xcode project.
- Create a `StampProcessor` Objective-C++ class (`.mm`).

### 2. Implement Edge Detection (Native)
In your `StampProcessor.mm`:
```objectivec
#import <opencv2/opencv.hpp>

// Find largest rectangle contour and return coordinates
- (NSArray*)detectStamp:(UIImage*)image {
    cv::Mat mat;
    UIImageToMat(image, mat);
    // 1. Grayscale & GaussianBlur
    // 2. Canny Edge Detection
    // 3. Find Contours
    // 4. Find largest 4-point polygon
    // 5. Return points to JS
}
```

### 3. Bridge to React Native
Use `react-native-vision-camera` frame processors to call your native code in real-time.
```typescript
const frameProcessor = useFrameProcessor((frame) => {
  'worklet';
  const result = detectStampEdge(frame); // Your native function
  if (result.isDetected) {
    // update shared values for UI overlay
  }
}, []);
```

### 4. Auto-Capture Logic
The app includes a simulation of auto-capture. In production, trigger `takePhoto()` when the frame processor returns a stable bounding box for > 1 second.

### 5. Perspective Correction
Use OpenCV's `getPerspectiveTransform` and `warpPerspective` to crop and "flatten" the stamp image automatically before uploading.

## Project Structure

- `src/screens`: Main application screens (Sequence, Camera, Preview).
- `src/services`: API (Upload) and Storage logic.
- `src/models`: TypeScript interfaces for data consistency.
- `src/utils`: Image processing utilities.
- `src/navigation`: App routing configuration.

## Environment Requirements
- Node.js > 18
- Xcode > 14
- iOS > 13.4
