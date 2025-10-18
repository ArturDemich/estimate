import { Label } from "@/redux/stateServiceTypes";
import { RootState } from "@/redux/store";
import React, { useEffect } from "react";
import { Modal, View, StyleSheet } from "react-native";
import { useSelector } from "react-redux";

export const LockScreen = () => {
    const label = useSelector<RootState, Label | null>((state) => state.data.labelData);
    const [visible, setVisible] = React.useState(false);

    useEffect(() => {
        setVisible(!!label);
    }, [label]);
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
    >
      <View style={[styles.overlay]}></View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.1)",
  }
});
