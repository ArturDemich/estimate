import React, { useState } from "react";
import {
  TouchableOpacity,
  TouchableOpacityProps,
  Vibration,
  Platform,
} from "react-native";

const TouchableVibrate: React.FC<TouchableOpacityProps> = ({
  onPress,
  onLongPress,
  activeOpacity = 0.3,
  ...props
}) => {
    const [pressed, setPressed] = useState(false);

  const handlePressIn = () => {
    setPressed(true);

    if (Platform.OS === "android") {
      Vibration.vibrate(5);
    }
  };

  const handlePressOut = () => {
    setPressed(false);
  };

  const handlePress = (event: any) => {
    // 🔥 Android-only haptic (реально працює)
    if (Platform.OS === "android") {
      Vibration.vibrate(5);
    }

    onPress?.(event);
  };

  const handleLongPress = (event: any) => {
    if (Platform.OS === "android") {
      Vibration.vibrate(20);
    }

    onLongPress?.(event);
  };

  return (
    <TouchableOpacity
      {...props}
      activeOpacity={activeOpacity}  
      delayPressIn={0}  
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      onLongPress={handleLongPress}
      style={[
        props.style,
        {
          transform: [{ scale: pressed ? 0.95 : 1 }]
        },
      ]}
    />
  );
};

export default TouchableVibrate;