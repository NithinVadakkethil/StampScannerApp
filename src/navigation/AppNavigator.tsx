import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SequenceScreen from '../screens/SequenceScreen';
import CameraScreen from '../screens/CameraScreen';
import PreviewScreen from '../screens/PreviewScreen';
import { Stamp } from '../models/Stamp';

export type RootStackParamList = {
    Sequence: undefined;
    Camera: { sequenceNumber: string; isBackCapture?: boolean; existingStamp?: Stamp };
    Preview: { stamp: Stamp };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator
                initialRouteName="Sequence"
                screenOptions={{
                    headerStyle: {
                        backgroundColor: '#fff',
                    },
                    headerTintColor: '#000',
                    headerTitleStyle: {
                        fontWeight: 'bold',
                    },
                }}
            >
                <Stack.Screen
                    name="Sequence"
                    component={SequenceScreen}
                    options={{ title: 'Stamp Scanner' }}
                />
                <Stack.Screen
                    name="Camera"
                    component={CameraScreen}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="Preview"
                    component={PreviewScreen}
                    options={{ title: 'Confirm Stamp' }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default AppNavigator;
