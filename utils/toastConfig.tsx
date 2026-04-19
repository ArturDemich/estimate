import React from 'react';
import { View, Text, Pressable } from 'react-native';
import Toast, { BaseToast, ErrorToast, ToastPosition, ToastType } from 'react-native-toast-message';

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
  confirmToast: ({ text1, text2, props }: any) => {
    const { onConfirm, onCancel } = props
    return (
      <View
        style={{
          padding: 16,
          backgroundColor: 'rgba(4, 45, 7, 0.95)',
          borderRadius: 12,
          minWidth: 280,
          gap: 12,
        }}
      >
        <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>{text1}</Text>
        {text2 ? (
          <Text style={{ color: '#ddd', fontSize: 14 }}>{text2}</Text>
        ) : null}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
          <Pressable style={{
            paddingHorizontal: 7,
            paddingVertical: 5,
            borderWidth: 1,
            borderRadius: 3,
            shadowColor: 'rgba(168, 168, 168, 0.9)',
            shadowRadius: 1,
            borderColor: "rgba(31, 30, 30, 0.06)",
          }}
            onPress={() => { onCancel?.(); Toast.hide(); }}>
            <Text style={{ color: '#aaa', fontSize: 16 }}>Скасувати</Text>
          </Pressable>
          <Pressable style={{
            paddingHorizontal: 7,
            paddingVertical: 5,
            borderWidth: 1,
            borderRadius: 3,
            shadowColor: 'rgba(168, 168, 168, 0.9)',
            shadowRadius: 1,
            borderColor: "rgba(31, 30, 30, 0.06)",
          }} onPress={() => { onConfirm?.(); Toast.hide(); }}>
            <Text style={{ color: "rgb(238, 1, 1)", fontSize: 16, fontWeight: '600' }}>Видалити</Text>
          </Pressable>
        </View>
      </View>
    );
  },
};

type ToastCustomType = 'customToast' | 'customError' | 'confirmToast' | (string & {});
interface muToastProps {
  type: ToastType | ToastCustomType;
  text1: string;
  text2?: string;
  title?: string;
  position?: ToastPosition;
  visibilityTime?: number;
  topOffset?: number;
  bottomOffset?: number;
  autoHideFalse?: boolean;
  onConfirmFunc?: () => void;
  onCancelFunc?: () => void;
}

export const myToast = ({ type, text1, text2, title, position, visibilityTime, topOffset, bottomOffset, autoHideFalse, onConfirmFunc, onCancelFunc }: muToastProps) => {
  return (
    Toast.show({
      type,  // Can be 'success', 'error', 'info'
      text1: `${text1} ${title ? title : ''}`, //`Підключено прінтер: ${printer.device_name}`,
      text2: text2 ? text2 : undefined,
      position: position ? position : "bottom",
      visibilityTime: visibilityTime ? visibilityTime : 3000,
      bottomOffset: bottomOffset ? bottomOffset : 90,
      topOffset: topOffset ? topOffset : 110,
      autoHide: autoHideFalse ?? true,
      props: {
        onConfirm: async () => onConfirmFunc ? await onConfirmFunc() : {},
        onCancel: async () => onCancelFunc ? await onCancelFunc() : {}
      }
    })
  )

};
