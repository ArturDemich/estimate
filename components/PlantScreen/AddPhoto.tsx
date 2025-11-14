import React from 'react';
import { View, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import * as MediaLibrary from 'expo-media-library';
import TouchableVibrate from '@/components/ui/TouchableVibrate';
import { myToast } from '@/utils/toastConfig';
import { uploadPhotoThunk } from '@/redux/thunks';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/redux/store';

interface AddPhotoProps {
  plantName: string;
  plantSize: string;
  barcode: string;
  productId: string;
  photosUrl: string[] | null;
  sizeId: string;
}

const AddPhoto = ({ plantName, plantSize, barcode, productId, photosUrl, sizeId }: AddPhotoProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const currentStorage = useSelector((state: RootState) => state.data.currentStorage);
  const [photo, setPhoto] = React.useState<string | null>(null);
  const [uploading, setUploading] = React.useState(false);

  const handleAddPhoto = async () => {
    Alert.alert(
      'Додати фото',
      'Оберіть джерело',
      [
        { text: 'Скасувати', style: 'cancel' },
        { text: 'Галерея', onPress: pickFromGallery },
        { text: 'Камера', onPress: takePhoto },
      ],
      { cancelable: true }
    );
  };

  const pickFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return myToast({ 
      type: "customError", 
      text1: `Доступ до галереї заборонено!`, 
      text2: 'Надайте дозвіл додатку у налаштуваннях пристрою.', 
      visibilityTime: 4000 });

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled) optimizeAndUpload(result.assets[0].uri);
  };

  const takePhoto = async () => {
    // 🔹 Дозвіл на камеру
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') return myToast({ 
      type: "customError", 
      text1: `Доступ до камери заборонено!`, 
      text2: 'Надайте дозвіл додатку у налаштуваннях пристрою.', 
      visibilityTime: 4000 });

    // 🔹 Відкрити стандартну камеру телефону
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;

      // 🔹 Попросити дозвіл на збереження в медіатеку
      const { status: libStatus } = await MediaLibrary.requestPermissionsAsync();
      if (libStatus === 'granted') {
        await MediaLibrary.createAssetAsync(uri);
      }

      // 🔹 Далі оптимізуємо і завантажуємо
      optimizeAndUpload(uri);
    }
  };

  const optimizeAndUpload = async (uri: string) => {
    setUploading(true);
    try {
      const optimized = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 1280 } }],
        { compress: 0.8, format: ImageManipulator.SaveFormat.WEBP }
      );

      setPhoto(optimized.uri);

      const formData = new FormData();
      formData.append('file', {
        uri: optimized.uri,
        name: 'photo.webp',
        type: 'image/webp',
      } as any);
      formData.append('plantName', plantName);
      formData.append('plantSize', plantSize);
      formData.append('barcode', barcode);
      formData.append('productId', productId);
      formData.append('sizeId', sizeId);
      formData.append('storageName', currentStorage?.name || '');

      await dispatch(uploadPhotoThunk({ formData })).unwrap();
      setUploading(false);
      myToast({
            type: "customToast",
            text1: "Фото завантажено успішно!",
            visibilityTime: 5000,
        });
    } catch (error: any) {
      console.error('❌ Upload error:', error);
      setUploading(false);
      const message = typeof error === 'string' ? error : error?.message || JSON.stringify(error);
      myToast({ type: "customError", text1: `Помилка завантаження фото!`, text2: message, visibilityTime: 4000 })
    }
  };

  return (
    <View style={styles.addPhotoContainer}>
      <TouchableVibrate style={styles.copyBtn} onPress={handleAddPhoto} disabled={uploading}>
        {uploading ? <ActivityIndicator size="large" color="rgba(255, 111, 97, 1)" /> :
          <MaterialIcons name="add-photo-alternate" size={32} color={photosUrl && photosUrl.length > 0 ? 'rgb(106, 159, 53)' : "rgba(255, 111, 97, 1)"} />
        }
      </TouchableVibrate>

      
    </View>
  );
};

export default AddPhoto;

const styles = StyleSheet.create({
  addPhotoContainer: {
    marginTop: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copyBtn: {
    padding: 3,
    elevation: 5,
    borderWidth: 1,
    borderColor: "rgba(31, 30, 30, 0.11)",
    borderRadius: 5,
    shadowColor: 'rgba(0, 0, 0, 0.9)',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
});
