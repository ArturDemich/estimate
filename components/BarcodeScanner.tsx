import React, { useState, useEffect } from "react";
import { View, Text, Button, StyleSheet, Dimensions, TouchableOpacity } from "react-native";
import { CameraView, Camera } from "expo-camera";

const { width, height } = Dimensions.get("window"); // Get screen dimensions

interface Props {
  onScan: (data: string) => void;
  onClose: () => void;
}

export default function BarcodeScanner({ onScan, onClose }: Props) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  const handleBarcodeScanned = ({ data }: { data: string }) => {
    if (!scanned) {
      setScanned(true);
      onScan(data);
    }
  };

  if (hasPermission === null) {
    return <Text>Requesting camera permission...</Text>;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View style={styles.container}>
      {/* Ensure CameraView has height and width */}
      <CameraView
        onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
        barcodeScannerSettings={{ barcodeTypes: ["qr", "ean13", "upc_a"] }}
        style={styles.camera} // Apply styles here
      />
      <View style={styles.overlay}>
        {scanned && <Button title="Scan Again" onPress={() => setScanned(false)} />}
        <Button title="Close Scanner" onPress={onClose} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  camera: {
    width: width * 0.9, // 90% of screen width
    height: height * 0.3, // 70% of screen height
    borderRadius: 10,
    overflow: "hidden",
  },
  btn: {
    zIndex: 999,
    flex: 1
  },
  overlay: {
    position: "absolute", // Make buttons overlay the camera
    bottom: 20, // Move buttons to the bottom
    width: "100%",
    alignItems: "center",
  },
});


