import { useLocalSearchParams } from "expo-router";
import * as React from "react";
import {
    StyleSheet,
    View,
    Text,
    Button,
    TextInput,
    TouchableOpacity,
} from "react-native";
import {
    BLEPrinter,
    NetPrinter,
    USBPrinter,
    IUSBPrinter,
    IBLEPrinter,
    INetPrinter,
} from "react-native-thermal-receipt-printer";

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
    const [selectedPrinter, setSelectedPrinter] = React.useState<SelectedPrinter>(
        {}
    );

    const data = useLocalSearchParams();

    React.useEffect(() => {
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
    }, [selectedValue]);

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
        <View style={{ paddingVertical: 16 }}>
            <View style={styles.rowDirection}>
                <Text>Host: </Text>
                <TextInput
                    placeholder="192.168.100.19"
                    style={styles.input}
                    onChangeText={handleChangeHostAndPort("host")}
                />
            </View>
            <View style={styles.rowDirection}>
                <Text>Port: </Text>
                <TextInput
                    placeholder="9100"
                    style={styles.input}
                    onChangeText={handleChangeHostAndPort("port")}
                />
            </View>
        </View>
    );

    const _renderOther = () => (
        <View style={styles.deviceList}>
            {devices.map((item: any, index) => (
                <TouchableOpacity
                    key={`printer-item-${index}`}
                    style={[
                        styles.deviceButton,
                        selectedPrinter?.device_id === item.device_id &&
                        styles.selectedDeviceButton,
                    ]}
                    onPress={() => setSelectedPrinter(item)}
                >
                    <Text
                        style={
                            selectedPrinter?.device_id === item.device_id
                                ? styles.selectedText
                                : styles.buttonText
                        }
                    >
                        {item.device_name}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.section}>
                <Text>Select printer type:</Text>
                <View style={styles.rowDirection}>
                    {Object.keys(printerList).map((type) => (
                        <TouchableOpacity
                            key={type}
                            style={[
                                styles.button,
                                selectedValue === type && styles.selectedButton,
                            ]}
                            onPress={() =>
                                handleChangePrinterType(type as keyof typeof printerList)
                            }
                        >
                            <Text
                                style={
                                    selectedValue === type
                                        ? styles.selectedText
                                        : styles.buttonText
                                }
                            >
                                {type.toUpperCase()}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <View style={styles.section}>
                <Text>Select printer:</Text>
                {selectedValue === "net" ? _renderNet() : _renderOther()}
            </View>

            <Button
                disabled={!selectedPrinter?.device_name}
                title="Connect"
                onPress={handleConnectSelectedPrinter}
            />
            <Button
                disabled={!selectedPrinter?.device_name}
                title="Print sample"
                onPress={handlePrint}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        padding: 16,
    },
    section: {
        flex: 1,
        marginBottom: 16,
    },
    rowDirection: {
        flexDirection: "row",
        flexWrap: "wrap",
        marginVertical: 8,
    },
    button: {
        borderWidth: 1,
        borderColor: "#ccc",
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 6,
        marginRight: 10,
        marginBottom: 8,
    },
    selectedButton: {
        backgroundColor: "#4CAF50",
        borderColor: "#4CAF50",
    },
    buttonText: {
        color: "#333",
    },
    selectedText: {
        color: "#fff",
        fontWeight: "bold",
    },
    deviceList: {
        flexDirection: "row",
        flexWrap: "wrap",
        marginTop: 10,
    },
    deviceButton: {
        borderWidth: 1,
        borderColor: "#aaa",
        borderRadius: 5,
        padding: 10,
        marginRight: 10,
        marginBottom: 10,
    },
    selectedDeviceButton: {
        backgroundColor: "#4CAF50",
        borderColor: "#4CAF50",
    },
    input: {
        borderBottomWidth: 1,
        borderColor: "#ccc",
        flex: 1,
        marginLeft: 10,
    },
});
