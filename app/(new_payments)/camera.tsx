import { Feather } from '@expo/vector-icons';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import { useState } from 'react';
import { Button, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function Camera() {
    const [facing, setFacing] = useState<CameraType>('back');
    const [permission, requestPermission] = useCameraPermissions();

    if (!permission) {
        // Camera permissions are still loading.
        return <View />;
    }

    if (!permission.granted) {
        // Camera permissions are not granted yet.
        return (
            <View style={styles.container}>
                <Text style={styles.message}>We need your permission to show the camera</Text>
                <Button onPress={requestPermission} title="grant permission" />
            </View>
        );
    }

    function toggleCameraFacing() {
        setFacing(current => (current === 'back' ? 'front' : 'back'));
    }

    return (
        <View style={styles.container}>
            <CameraView style={styles.camera} facing={facing} barcodeScannerSettings={{
                barcodeTypes: ["qr"],
            }}>
                <View className="flex-1 bg-transparent justify-between">
                    <View className="bg-black/50 p-4">
                        <TouchableOpacity
                            onPress={() => {
                                router.back()
                            }}
                            className="self-start"
                        >
                            <Feather name="x" size={30} color="white" />
                        </TouchableOpacity>
                    </View>

                    <View className="flex-1 justify-center items-center">
                        <View className="w-56 h-56 border-2 border-white/70 rounded-lg" />
                        <Text className="text-white text-lg mt-4">Scan vendor QR code</Text>
                    </View>

                    <View className="bg-black/50 p-4">
                        {/* {scanned && ( */}
                            <TouchableOpacity
                                onPress={() => {}}
                                className="bg-white py-3 rounded-lg items-center"
                            >
                                <Text className="text-primary font-bold">Scan Again</Text>
                            </TouchableOpacity>
                        {/* )} */}
                    </View>
                </View>
            </CameraView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
    },
    message: {
        textAlign: 'center',
        paddingBottom: 10,
    },
    camera: {
        flex: 1,
    },
    buttonContainer: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: 'transparent',
        margin: 64,
    },
    button: {
        flex: 1,
        alignSelf: 'flex-end',
        alignItems: 'center',
    },
    text: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
    },
});
