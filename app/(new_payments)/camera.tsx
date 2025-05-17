import { Feather } from '@expo/vector-icons';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import { useState } from 'react';
import { Button, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTempStore } from '~/store/tempStore';

export default function Camera() {
    const [facing, setFacing] = useState<CameraType>('back');
     const [scanned, setScanned] = useState(false);
    const [permission, requestPermission] = useCameraPermissions();

    const { setData } = useTempStore();

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

    function handleBarCodeScanned({ type, data }) {
        setScanned(true);
        // alert(`QR Code scanned! Type: ${type}\nData: ${data}`);
        setData(data);
        router.back();
    }

    return (
        <View style={styles.container}>
            <CameraView 
                style={styles.camera} 
                facing={facing} 
                barcodeScannerSettings={{
                    barcodeTypes: ["qr"],
                }}
                onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
            >
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
                            onPress={() => setScanned(false)}
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
