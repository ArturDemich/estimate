import React from 'react';
import { View, Text } from 'react-native';
import Toast, { BaseToast, ErrorToast, ToastPosition } from 'react-native-toast-message';

export const toastConfig = {
  success: (props: any) => (
    <BaseToast
      {...props}
      style={{
        borderLeftColor: 'green',
        borderRadius: 8,
        backgroundColor: '#e0ffe0', // Light green background
      }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontSize: 16,
        fontWeight: 'bold',
        color: 'green',
      }}
      text2Style={{
        fontSize: 14,
        color: '#555',
      }}
    />
  ),
  error: (props: any) => (
    <ErrorToast
      {...props}
      style={{
        borderLeftColor: 'red',
        borderRadius: 8,
        backgroundColor: '#ffe0e0', // Light red background
      }}
      text1Style={{
        fontSize: 16,
        fontWeight: 'bold',
        color: 'red',
      }}
      text2Style={{
        fontSize: 14,
        color: '#555',
      }}
    />
  ),
  customToast: ({ text1, text2 }: any) => (
    <View style={{
      paddingVertical: 10,
      paddingHorizontal: 15,
      backgroundColor: 'rgba(4, 45, 7, 0.8)',
      borderRadius: 12,
      alignItems: 'center',
      gap: 4,
      zIndex: 999,
    }}>
      <Text style={{ color: 'rgb(223, 222, 222)', fontWeight: 500, fontSize: 16, lineHeight: 16, }}>{text1}</Text>
      {text2 && <Text style={{ color: 'white', fontSize: 14, lineHeight: 14, }}>{text2}</Text>}
    </View>
  ),
  customError: ({ text1, text2 }: any) => (
    <View style={{
      paddingVertical: 10,
      paddingHorizontal: 15,
      backgroundColor: 'rgba(255, 42, 0, 0.95)',
      borderRadius: 12,
      alignItems: 'center',
      gap: 4,
      zIndex: 999,
    }}>
      <Text style={{ color: 'rgb(253, 253, 253)', fontWeight: 500, fontSize: 16, lineHeight: 16, }}>{text1}</Text>
      {text2 && <Text style={{ color: 'white', fontSize: 14, lineHeight: 14, }}>{text2}</Text>}
    </View>
  ),
};

interface muToastProps {
  type: string;
  text1: string;
  text2?: string;
  title?: string;
  position?: ToastPosition;
  visibilityTime?: number;
  topOffset?: number;
  bottomOffset?: number;
}

export const myToast = ({type, text1, text2, title, position, visibilityTime, topOffset, bottomOffset}: muToastProps) => {
  return (
    Toast.show({
      type,  // Can be 'success', 'error', 'info'
      text1: `${text1} ${title ? title : ''}`, //`Підключено прінтер: ${printer.device_name}`,
      text2: text2 ? text2 : undefined,
      position: position ? position : "bottom",
      visibilityTime: visibilityTime ? visibilityTime : 3000,
      bottomOffset: bottomOffset ? bottomOffset : 90,
      topOffset: topOffset ? topOffset : 110,
    })
  )

};
