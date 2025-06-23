import { PermissionsAndroid, Platform, Alert, Linking } from "react-native";
import * as ExpoDevice from 'expo-device';

// Permission status type
export type PermissionStatus = 'granted' | 'denied' | 'never_ask_again';

// Permission result interface
export interface PermissionResult {
    granted: boolean;
    status: PermissionStatus;
    missingPermissions: string[];
}

/**
 * Request Android 12+ (API 31+) specific permissions
 */
const requestAndroid31Permissions = async (): Promise<PermissionResult> => {
    const permissions = [
        {
            permission: PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
            title: "Bluetooth Scan Permission",
            message: "This app needs Bluetooth scan permission to discover thermal printers nearby.",
        },
        {
            permission: PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
            title: "Bluetooth Connect Permission", 
            message: "This app needs Bluetooth connect permission to connect to thermal printers.",
        },
        {
            permission: PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            title: "Location Permission",
            message: "Location permission is required for Bluetooth device discovery on Android.",
        }
    ];

    const results: Record<string, string> = {};
    const missingPermissions: string[] = [];

    // Request permissions sequentially to avoid conflicts
    for (const perm of permissions) {
        try {
            const result = await PermissionsAndroid.request(perm.permission, {
                title: perm.title,
                message: perm.message,
                buttonPositive: "Allow",
                buttonNegative: "Deny",
                buttonNeutral: "Ask Me Later",
            });
            
            results[perm.permission] = result;
            
            if (result !== PermissionsAndroid.RESULTS.GRANTED) {
                missingPermissions.push(perm.permission);
            }
        } catch (error) {
            console.error(`Error requesting permission ${perm.permission}:`, error);
            missingPermissions.push(perm.permission);
            results[perm.permission] = PermissionsAndroid.RESULTS.DENIED;
        }
    }

    const allGranted = missingPermissions.length === 0;
    
    return {
        granted: allGranted,
        status: allGranted ? 'granted' : 'denied',
        missingPermissions
    };
};

/**
 * Request Android pre-31 permissions
 */
const requestPreAndroid31Permissions = async (): Promise<PermissionResult> => {
    const permissions = [
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
    ];

    try {
        const results = await PermissionsAndroid.requestMultiple(permissions);
        
        const missingPermissions = permissions.filter(
            perm => results[perm] !== PermissionsAndroid.RESULTS.GRANTED
        );

        const fineLocationGranted = results[PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION] === 
            PermissionsAndroid.RESULTS.GRANTED;

        return {
            granted: fineLocationGranted, // Fine location is the minimum requirement
            status: fineLocationGranted ? 'granted' : 'denied',
            missingPermissions
        };
    } catch (error) {
        console.error('Error requesting pre-Android 31 permissions:', error);
        return {
            granted: false,
            status: 'denied',
            missingPermissions: permissions
        };
    }
};

/**
 * Check if permissions are already granted
 */
const checkExistingPermissions = async (): Promise<PermissionResult> => {
    if (Platform.OS !== 'android') {
        return { granted: true, status: 'granted', missingPermissions: [] };
    }

    const apiLevel = ExpoDevice.platformApiLevel ?? -1;
    const missingPermissions: string[] = [];

    try {
        if (apiLevel >= 31) {
            // Check Android 12+ permissions
            const permissions = [
                PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
                PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            ];

            for (const permission of permissions) {
                const hasPermission = await PermissionsAndroid.check(permission);
                if (!hasPermission) {
                    missingPermissions.push(permission);
                }
            }
        } else {
            // Check pre-Android 12 permissions
            const fineLocationGranted = await PermissionsAndroid.check(
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
            );
            
            if (!fineLocationGranted) {
                missingPermissions.push(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
            }
        }

        const allGranted = missingPermissions.length === 0;
        
        return {
            granted: allGranted,
            status: allGranted ? 'granted' : 'denied',
            missingPermissions
        };
    } catch (error) {
        console.error('Error checking existing permissions:', error);
        return { granted: false, status: 'denied', missingPermissions: [] };
    }
};

/**
 * Show permission rationale dialog
 */
const showPermissionRationale = (): Promise<boolean> => {
    return new Promise((resolve) => {
        Alert.alert(
            "Permissions Required",
            "This app needs Bluetooth and Location permissions to connect to thermal printers. Without these permissions, you won't be able to print receipts.",
            [
                {
                    text: "Cancel",
                    style: "cancel",
                    onPress: () => resolve(false),
                },
                {
                    text: "Grant Permissions",
                    style: "default",
                    onPress: () => resolve(true),
                },
            ],
            { cancelable: false }
        );
    });
};

/**
 * Show settings dialog when permissions are permanently denied
 */
const showSettingsDialog = (): Promise<boolean> => {
    return new Promise((resolve) => {
        Alert.alert(
            "Permissions Denied",
            "Bluetooth and Location permissions are required for this app to work. Please enable them in Settings.",
            [
                {
                    text: "Cancel",
                    style: "cancel",
                    onPress: () => resolve(false),
                },
                {
                    text: "Open Settings",
                    style: "default",
                    onPress: () => {
                        Linking.openSettings();
                        resolve(true);
                    },
                },
            ],
            { cancelable: false }
        );
    });
};

/**
 * Main permission request function with improved UX
 */
const requestPermissions = async (showRationale: boolean = true): Promise<PermissionResult> => {
    // iOS doesn't need these permissions
    if (Platform.OS !== 'android') {
        return { granted: true, status: 'granted', missingPermissions: [] };
    }

    // Check if permissions are already granted
    const existingPermissions = await checkExistingPermissions();
    if (existingPermissions.granted) {
        return existingPermissions;
    }

    // Show rationale if requested
    if (showRationale) {
        const shouldRequest = await showPermissionRationale();
        if (!shouldRequest) {
            return { granted: false, status: 'denied', missingPermissions: [] };
        }
    }

    const apiLevel = ExpoDevice.platformApiLevel ?? -1;
    
    try {
        let result: PermissionResult;
        
        if (apiLevel >= 31) {
            result = await requestAndroid31Permissions();
        } else {
            result = await requestPreAndroid31Permissions();
        }

        // If permissions were denied and might be permanently denied, show settings dialog
        if (!result.granted && result.missingPermissions.length > 0) {
            // Check if any permission is permanently denied
            const permanentlyDenied = await Promise.all(
                result.missingPermissions.map(async (perm) => {
                    try {
                        const shouldShow = await PermissionsAndroid.shouldShowRequestPermissionRationale(perm);
                        return !shouldShow; // If shouldn't show rationale, it might be permanently denied
                    } catch {
                        return false;
                    }
                })
            );

            if (permanentlyDenied.some(denied => denied)) {
                await showSettingsDialog();
                return { ...result, status: 'never_ask_again' };
            }
        }

        return result;
    } catch (error) {
        console.error('Error in requestPermissions:', error);
        return { 
            granted: false, 
            status: 'denied', 
            missingPermissions: ['unknown_error'] 
        };
    }
};

/**
 * Request specific permission for network printers (if needed)
 */
const requestNetworkPermissions = async (): Promise<PermissionResult> => {
    if (Platform.OS !== 'android') {
        return { granted: true, status: 'granted', missingPermissions: [] };
    }

    // Network printers typically don't need special permissions on modern Android
    // but you might want to check for INTERNET permission (usually granted by default)
    return { granted: true, status: 'granted', missingPermissions: [] };
};

/**
 * Request USB permissions (for USB printers)
 */
const requestUSBPermissions = async (): Promise<PermissionResult> => {
    // USB permissions are typically handled by the USB printer library
    // and granted through system dialogs when connecting
    return { granted: true, status: 'granted', missingPermissions: [] };
};

/**
 * Get user-friendly permission names
 */
const getPermissionDisplayName = (permission: string): string => {
    const permissionNames: Record<string, string> = {
        [PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN]: 'Bluetooth Scan',
        [PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT]: 'Bluetooth Connect',
        [PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION]: 'Fine Location',
        [PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION]: 'Coarse Location',
    };
    
    return permissionNames[permission] || permission;
};

/**
 * Utility function to check if app can use Bluetooth features
 */
const canUseBluetooth = async (): Promise<boolean> => {
    const result = await checkExistingPermissions();
    return result.granted;
};

export {
    requestPermissions,
    requestAndroid31Permissions,
    requestNetworkPermissions,
    requestUSBPermissions,
    checkExistingPermissions,
    showPermissionRationale,
    showSettingsDialog,
    getPermissionDisplayName,
    canUseBluetooth,
    type PermissionResult,
    type PermissionStatus,
};