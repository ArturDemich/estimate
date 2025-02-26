import React, { forwardRef } from "react";
import { Pressable, PressableProps, Vibration, View } from "react-native";

const PressableVibrate = forwardRef<View, PressableProps>(({ onPress, onLongPress, ...props }, ref) => {
    const handlePress = (event: any) => {
        Vibration.vibrate(2);
        if (onPress) onPress(event);
    };

    const handleLongPress = (event: any) => {
        Vibration.vibrate(20);
        if (onLongPress) onLongPress(event);
    };

    return (
        <Pressable 
            ref={ref}
            {...props} 
            onPress={handlePress} 
            onLongPress={handleLongPress} 
        />
    );
});

export default PressableVibrate;
