import React, { useState, useRef } from 'react';
import { Camera, useCameraDevice, useFrameProcessor } from 'react-native-vision-camera';
import { useRunOnJS } from 'react-native-worklets-core';
import { detectRectangle } from './your-detection-plugin'; // Logic for edge detection

export const CameraScreen = () => {
    const device = useCameraDevice('back');
    const [isStable, setIsStable] = useState(false);
    const stabilityCounter = useRef(0);

    // This function moves the logic from the high-speed CPU thread back to UI thread
    const updateStabilityUI = useRunOnJS((stable: boolean) => {
        setIsStable(stable);
        if (stable) {
            // Logic to auto-trigger capture
            console.log("Stamp detected! Holding steady...");
        }
    });

    const frameProcessor = useFrameProcessor((frame) => {
        'worklet';
        const rectangle = detectRectangle(frame);

        if (rectangle) {
            stabilityCounter.current += 1;
            // If 5 consecutive frames have a rectangle (~1 second at 5fps target)
            if (stabilityCounter.current > 5) {
                updateStabilityUI(true);
            }
        } else {
            stabilityCounter.current = 0;
            updateStabilityUI(false);
        }
    }, []);

    return (
        <Camera
            style={StyleSheet.absoluteFill}
            device={device!}
            isActive={true}
            photo={true}
            frameProcessor={frameProcessor}
        />
    );
};