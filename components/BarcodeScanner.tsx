import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { CameraView, Camera } from "expo-camera";
import EvilIcons from '@expo/vector-icons/EvilIcons';
import TouchableVibrate from "@/components/ui/TouchableVibrate";

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
      <CameraView
        onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
        barcodeScannerSettings={{ barcodeTypes: ["qr", "ean13", "upc_a"] }}
        style={styles.camera}
      />
      <View style={styles.overlay}>
        <TouchableVibrate onPress={onClose} style={styles.clearButton}>
          <EvilIcons name="close-o" size={30} color="#FFFFFF" />
        </TouchableVibrate>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    bottom: height * 0.22,
    position: 'relative'
  },
  camera: {
    width: width * 0.94, // 90% of screen width
    height: height * 0.3, // 70% of screen height
    borderRadius: 10,
    overflow: "hidden",
    zIndex: 2
  },
  btn: {
    zIndex: 999,
    flex: 1,

  },
  overlay: {
    position: "absolute", // Make buttons overlay the camera
    width: "100%",
    alignItems: "center",
    zIndex: 2
  },
  clearButton: {
    position: "absolute",
    right: 0,
    top: 5,
    backgroundColor: "#A0A0AB",
    borderRadius: 8,
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1
},
});


