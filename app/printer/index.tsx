import { useLocalSearchParams } from "expo-router";
import * as React from "react";
import {
    StyleSheet,
    View,
    Text,
    Button,
    TextInput,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    StatusBar,
} from "react-native";
import {
    BLEPrinter,
    NetPrinter,
    USBPrinter,
    IUSBPrinter,
    IBLEPrinter,
    INetPrinter,
} from "react-native-thermal-receipt-printer";
import { requestPermissions } from "~/permissions/bluetooth";

const printerList: Record<string, any> = {
    ble: BLEPrinter,
    net: NetPrinter,
};

interface SelectedPrinter
    extends Partial<IUSBPrinter & IBLEPrinter & INetPrinter> {
    printerType?: keyof typeof printerList;
}

export default function App() {
    const [selectedValue, setSelectedValue] = React.useState<
        keyof typeof printerList
    >("ble");
    const [devices, setDevices] = React.useState([]);
    const [loading, setLoading] = React.useState<boolean>(false);
    const [hasPermission, setHasPermission] = React.useState<boolean>(false);
    const [selectedPrinter, setSelectedPrinter] = React.useState<SelectedPrinter>(
        {}
    );

    const data = useLocalSearchParams();

    React.useEffect(() => {
        requestPermissions().then(({
            granted
        }) => {
            setHasPermission(granted);
        })
    }, [])

    React.useEffect(() => {
        if (!hasPermission) return;

        const getListDevices = async () => {
            const Printer = printerList[selectedValue];
            if (selectedValue === "net") return;
            try {
                setLoading(true);
                await Printer.init();
                const results = await Printer.getDeviceList();
                setDevices(
                    results.map((item: any) => ({ ...item, printerType: selectedValue }))
                );
            } catch (err) {
                console.warn(err);
            } finally {
                setLoading(false);
            }
        };
        getListDevices();
    }, [selectedValue, hasPermission]);

    const handleConnectSelectedPrinter = () => {
        if (!selectedPrinter) return;
        const connect = async () => {
            try {
                setLoading(true);
                switch (selectedPrinter.printerType) {
                    case "ble":
                        await BLEPrinter.connectPrinter(
                            selectedPrinter?.inner_mac_address || ""
                        );
                        break;
                    case "net":
                        await NetPrinter.connectPrinter(
                            selectedPrinter.host || "",
                            Number(selectedPrinter.port) || 9100
                        );
                        break;
                    case "usb":
                        await USBPrinter.connectPrinter(
                            selectedPrinter?.vendor_id || "",
                            selectedPrinter?.product_id || ""
                        );
                        break;
                    default:
                }
            } catch (err) {
                console.warn(err);
            } finally {
                setLoading(false);
            }
        };
        connect();
    };

    const handlePrint = async () => {
        const printableText = `
-----------------------------------
         Payment Receipt       
-----------------------------------
Ref #: ${data.paymentId}
Date: ${data.date}

Payer: ${data.payerName || 'N/A'}
Paid By: ${data.paymentMethod}
Amount: $${data.amount}
Location: ${data.location || 'N/A'}

Description:
${data.description || 'N/A'}

Processed by: ${data.userName || 'N/A'}

-----------------------------------
     Thank you for your payment
-----------------------------------
`;

        try {
            const Printer = printerList[selectedValue];
            await Printer.printText(printableText, {
                encoding: "utf8",
                cut: true,
            });
            await Printer.printRawData(new Uint8Array([0x1b, 0x69])); // Feed paper
            await Printer.disconnectPrinter();
        } catch (err) {
            console.warn(err);
        }
    };

    const handleChangePrinterType = async (type: keyof typeof printerList) => {
        setSelectedValue((prev) => {
            printerList[prev].closeConn();
            return type;
        });
        setSelectedPrinter({});
    };

    const handleChangeHostAndPort = (params: string) => (text: string) =>
        setSelectedPrinter((prev) => ({
            ...prev,
            device_name: "Net Printer",
            [params]: text,
            printerType: "net",
        }));

    const _renderNet = () => (
        <View style={styles.netSection}>
            <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Host Address</Text>
                <TextInput
                    placeholder="192.168.100.19"
                    style={styles.textInput}
                    onChangeText={handleChangeHostAndPort("host")}
                    placeholderTextColor="#999"
                />
            </View>
            <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Port</Text>
                <TextInput
                    placeholder="9100"
                    style={styles.textInput}
                    onChangeText={handleChangeHostAndPort("port")}
                    placeholderTextColor="#999"
                    keyboardType="numeric"
                />
            </View>
        </View>
    );

    const _renderOther = () => (
        <View style={styles.deviceListContainer}>
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#007AFF" />
                    <Text style={styles.loadingText}>Scanning for devices...</Text>
                </View>
            ) : devices.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No devices found</Text>
                </View>
            ) : (
                <View style={styles.deviceGrid}>
                    {devices.map((item: any, index) => (
                        <TouchableOpacity
                            key={`printer-item-${index}`}
                            style={[
                                styles.deviceCard,
                                selectedPrinter?.device_id === item.device_id &&
                                styles.selectedDeviceCard,
                            ]}
                            onPress={() => setSelectedPrinter(item)}
                        >
                            <View style={styles.deviceIcon}>
                                <Text style={styles.deviceIconText}>🖨️</Text>
                            </View>
                            <Text
                                style={[
                                    styles.deviceName,
                                    selectedPrinter?.device_id === item.device_id &&
                                    styles.selectedDeviceName,
                                ]}
                                numberOfLines={2}
                            >
                                {item.device_name}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}
        </View>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />
            
            <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Thermal Printer</Text>
                    <Text style={styles.headerSubtitle}>Select and connect your printer</Text>
                </View>

                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Printer Type</Text>
                    <View style={styles.printerTypeContainer}>
                        {Object.keys(printerList).map((type) => (
                            <TouchableOpacity
                                key={type}
                                style={[
                                    styles.typeButton,
                                    selectedValue === type && styles.selectedTypeButton,
                                ]}
                                onPress={() =>
                                    handleChangePrinterType(type as keyof typeof printerList)
                                }
                            >
                                <Text
                                    style={[
                                        styles.typeButtonText,
                                        selectedValue === type && styles.selectedTypeButtonText,
                                    ]}
                                >
                                    {type.toUpperCase()}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Select Printer</Text>
                    {selectedValue === "net" ? _renderNet() : _renderOther()}
                </View>

                <View style={styles.actionButtons}>
                    <TouchableOpacity
                        disabled={!selectedPrinter?.device_name || loading}
                        style={[
                            styles.primaryButton,
                            (!selectedPrinter?.device_name || loading) && styles.disabledButton,
                        ]}
                        onPress={handleConnectSelectedPrinter}
                    >
                        {loading ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <Text style={styles.primaryButtonText}>Connect Printer</Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        disabled={!selectedPrinter?.device_name || loading}
                        style={[
                            styles.secondaryButton,
                            (!selectedPrinter?.device_name || loading) && styles.disabledSecondaryButton,
                        ]}
                        onPress={handlePrint}
                    >
                        <Text style={[
                            styles.secondaryButtonText,
                            (!selectedPrinter?.device_name || loading) && styles.disabledSecondaryButtonText,
                        ]}>
                            Print Sample
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    scrollContainer: {
        flex: 1,
    },
    header: {
        backgroundColor: '#1a1a1a',
        paddingTop: 60,
        paddingBottom: 30,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        marginBottom: 20,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 5,
    },
    headerSubtitle: {
        fontSize: 16,
        color: '#ccc',
    },
    card: {
        backgroundColor: '#fff',
        marginHorizontal: 16,
        marginBottom: 20,
        borderRadius: 12,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 15,
    },
    printerTypeContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    typeButton: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: '#e0e0e0',
        backgroundColor: '#f9f9f9',
        alignItems: 'center',
    },
    selectedTypeButton: {
        backgroundColor: '#007AFF',
        borderColor: '#007AFF',
    },
    typeButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
    },
    selectedTypeButtonText: {
        color: '#fff',
    },
    netSection: {
        gap: 16,
    },
    inputGroup: {
        gap: 8,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: '#555',
    },
    textInput: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 12,
        fontSize: 16,
        backgroundColor: '#fafafa',
        color: '#333',
    },
    deviceListContainer: {
        minHeight: 120,
    },
    loadingContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 40,
    },
    loadingText: {
        marginTop: 10,
        fontSize: 14,
        color: '#666',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 40,
    },
    emptyText: {
        fontSize: 16,
        color: '#999',
    },
    deviceGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    deviceCard: {
        flex: 1,
        minWidth: '45%',
        backgroundColor: '#f8f9fa',
        borderRadius: 10,
        padding: 16,
        borderWidth: 2,
        borderColor: '#e9ecef',
        alignItems: 'center',
        gap: 8,
    },
    selectedDeviceCard: {
        backgroundColor: '#e3f2fd',
        borderColor: '#007AFF',
    },
    deviceIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    deviceIconText: {
        fontSize: 20,
    },
    deviceName: {
        fontSize: 14,
        fontWeight: '500',
        color: '#333',
        textAlign: 'center',
    },
    selectedDeviceName: {
        color: '#007AFF',
        fontWeight: '600',
    },
    actionButtons: {
        paddingHorizontal: 16,
        paddingBottom: 30,
        gap: 12,
    },
    primaryButton: {
        backgroundColor: '#007AFF',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        shadowColor: '#007AFF',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    disabledButton: {
        backgroundColor: '#ccc',
        shadowOpacity: 0,
        elevation: 0,
    },
    primaryButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
    secondaryButton: {
        backgroundColor: 'transparent',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#007AFF',
    },
    disabledSecondaryButton: {
        borderColor: '#ccc',
    },
    secondaryButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#007AFF',
    },
    disabledSecondaryButtonText: {
        color: '#ccc',
    },
});