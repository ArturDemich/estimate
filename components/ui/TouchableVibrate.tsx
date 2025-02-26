import React from "react";
import { TouchableOpacity, TouchableOpacityProps, Vibration } from "react-native";

const TouchableVibrate: React.FC<TouchableOpacityProps> = ({ onPress, onLongPress, ...props }) => {
    const handlePress = (event: any) => {
        Vibration.vibrate(5);
        if (onPress) onPress(event);
    };

    const handleLongPress = (event: any) => {
        Vibration.vibrate(20); 
        if (onLongPress) onLongPress(event);
    };

    return <TouchableOpacity {...props} onPress={handlePress}  onLongPress={handleLongPress} />;
};

export default TouchableVibrate;
