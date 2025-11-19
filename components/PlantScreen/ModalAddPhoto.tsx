import React, { useEffect, useMemo, useState } from 'react';
import { Modal, View, Text, StyleSheet, Image, FlatList, ActivityIndicator, Platform } from 'react-native';
import TouchableVibrate from '@/components/ui/TouchableVibrate';
import { MaterialIcons, FontAwesome6 } from '@expo/vector-icons';
import { PhotoItem } from '@/redux/stateServiceTypes';
import { formatDate } from '@/components/helpers';

interface ModalAddPhotoProps {
  visible: boolean;
  onClose: () => void;
  onGallery: () => void;
  onCamera: () => void;
  photosUrl: PhotoItem[] | null;
  onDelete: (selected: PhotoItem[]) => void;
  uploading: boolean;
  deleting: boolean;
  sendViber: boolean;
  setSendViber: () => void;
}

const ModalAddPhoto: React.FC<ModalAddPhotoProps> = ({
  visible,
  onClose,
  onGallery,
  onCamera,
  photosUrl,
  onDelete,
  uploading,
  deleting,
  sendViber,
  setSendViber,
}) => {
  const [selected, setSelected] = useState<PhotoItem[]>([]);
  const [selectMode, setSelectMode] = useState(false);
  const showBtnCameraAndroid14Less = Platform.OS === 'android' && Platform.Version <= 34 ? true : false;

  const handleLongPress = (url: PhotoItem) => {
    setSelectMode(true);
    setSelected([url]);
  };

  const handleSelect = (url: PhotoItem) => {
    if (!selectMode) return;
    setSelected((prev) =>
      prev.includes(url) ? prev.filter((u) => u !== url) : [...prev, url]
    );
  };


  const handleDelete = () => {
    onDelete(selected);
    setSelected([]);
    setSelectMode(false);
  };

  const handleSelectAll = () => {
    if (photosUrl && photosUrl.length > 0) {
      setSelected(photosUrl);
    }
  };

  const handleDeselectAll = () => {
    setSelected([]);
  };

  const handleClose = () => {
    setSelected([]);
    setSelectMode(false);
    onClose();
  };

  useEffect(() => {
    if (selected.length === 0) {
      setSelectMode(false);
    }
  }, [selected]);

  const reversed = useMemo(() => photosUrl && [...photosUrl].reverse(), [photosUrl]);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>Актуальні фото: {photosUrl?.length}</Text>

          <FlatList
            data={reversed}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={true}
            style={{ marginVertical: 1, paddingBottom: 10 }}
            renderItem={({ item }) => (
              <TouchableVibrate
                onLongPress={() => handleLongPress(item)}
                onPress={() => handleSelect(item)}
                activeOpacity={0.7}
                style={[
                  styles.imageWrapper,
                  selectMode && selected.includes(item) && styles.selectedImage,
                ]}
              >
                <PhotoPreview item={item} />
                {selectMode && selected.includes(item) && (
                  <View style={styles.checkIcon}>
                    <FontAwesome6 name="check" size={18} color="#fff" />
                  </View>
                )}
              </TouchableVibrate>
            )}
            ListEmptyComponent={
              uploading ? <ActivityIndicator size="large" color="rgba(255, 111, 97, 1)" /> :
                photosUrl === null ? (
                  <View style={styles.emptyPhoto}>
                    <Text style={{ color: '#FF6F61', fontSize: 16 }}>Помилка завантаження фото</Text>
                  </View>
                ) : (
                  <View style={styles.emptyPhoto}>
                    <Text style={{ color: '#A0A0AB', fontSize: 16 }}>Фото ще не додано</Text>
                  </View>
                )
            }
          />
          <View style={styles.footerRow}>
            {deleting || selectMode && selected.length > 0 ? (
              <>
                <TouchableVibrate style={styles.deleteBtn} onPress={handleDelete} disabled={deleting}>
                  {deleting ? <ActivityIndicator size="small" color="#fff" /> :
                    <MaterialIcons name="delete" size={22} color="#fff" />}
                  <Text style={styles.btnText}>Видалити {selected.length}</Text>
                </TouchableVibrate>
                <TouchableVibrate style={[styles.actionBtn, { backgroundColor: 'rgb(70, 70, 70)' }]} onPress={handleSelectAll}>
                  <MaterialIcons name="done-all" size={20} color="#fff" />
                  <Text style={styles.btnText}>Всі</Text>
                </TouchableVibrate>
                <TouchableVibrate style={[styles.actionBtn, { backgroundColor: 'rgba(175, 175, 175, 0.95)' }]} onPress={handleDeselectAll}>
                  <MaterialIcons name="remove-done" size={20} color="#fff" />
                </TouchableVibrate>
              </>
            ) : (
              <>
                <TouchableVibrate style={styles.closeBtn} onPress={handleClose}>
                  <MaterialIcons name="close" size={22} color="#fff" />
                </TouchableVibrate>
                <View style={styles.btnRow}>
                  <TouchableVibrate style={styles.viberBtn} onPress={() => setSendViber()} >
                    {sendViber ? <FontAwesome6 name="check-square" size={27} color='rgba(168, 80, 249, 0.95)' /> :
                      <FontAwesome6 name="square" size={27} color='black' />}
                    <FontAwesome6 name="viber" size={24} color={sendViber ? 'rgba(168, 80, 249, 0.95)' : 'black'} />
                  </TouchableVibrate>
                  <TouchableVibrate style={styles.actionBtn} onPress={onGallery} disabled={uploading}>
                    {uploading ? <ActivityIndicator size="small" color="#fff" /> :
                      <MaterialIcons name="photo-library" size={22} color="#fff" />}
                    <Text style={styles.btnText}>Галерея</Text>
                  </TouchableVibrate>
                  {showBtnCameraAndroid14Less &&
                    <TouchableVibrate style={styles.actionBtn} onPress={onCamera} disabled={uploading}>
                      {uploading ? <ActivityIndicator size="small" color="#fff" /> :
                        <MaterialIcons name="photo-camera" size={22} color="#fff" />}
                      <Text style={styles.btnText}>Камера</Text>
                    </TouchableVibrate>}
                </View>
              </>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const PhotoPreview = ({ item }: { item: PhotoItem }) => {
  const viberSent = item.appProperties.viberSent;
  const [loading, setLoading] = useState(true);
  console.log('item.appProperties.viberSent', item.appProperties.viberSent)
  return (
    <View style={styles.photoPreviewContainer}>
      {loading && <ActivityIndicator size="large" color='rgba(255, 111, 97, 1)' style={{ position: 'absolute', zIndex: 1 }} />}
      <Image
        source={{ uri: item.url }}
        style={styles.image}
        resizeMode="cover"
        onError={(e) => console.log('Image load error:', e.nativeEvent)}
        onLoadEnd={() => setLoading(false)}
      />
      {(viberSent && viberSent === '1') && (
        <View style={styles.viberSentLabel}>
          <FontAwesome6 name="viber" size={18} color='rgb(142, 73, 169)' />
        </View>
      )}
      <View style={styles.photoPreviewData}>
        <Text style={styles.photoPreviewText}>{formatDate(item.appProperties.date)}</Text>
        <Text style={styles.photoPreviewText}>{item.appProperties.storageName}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 10,
    padding: 5,
    alignItems: 'center',
    elevation: 5,
  },
  title: {
    fontWeight: '600',
    fontSize: 18,
    color: 'rgba(92, 92, 92, 1)',
    marginBottom: 10,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 16,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 111, 97, 1)',
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
    gap: 6,
    elevation: 3,
  },
  viberBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 6,
    paddingHorizontal: 4,
    gap: 6,
  },
  btnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  imageWrapper: {
    marginHorizontal: 4,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'hidden',
    position: 'relative',
  },
  selectedImage: {
    borderColor: 'rgba(255, 111, 97, 1)',
  },
  checkIcon: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(255, 111, 97, 0.8)',
    borderRadius: 12,
    padding: 2,
  },
  viberSentLabel: {
    position: 'absolute',
    bottom: 30,
    right: 4,
    backgroundColor: "rgba(255, 255, 255, 0.63)",
    borderRadius: 6,
    padding: 2
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
  },
  closeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: "rgba(199, 199, 199, 0.99)",
    borderRadius: 8,
    padding: 4,
    gap: 6,
    elevation: 3,
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 111, 97, 1)',
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
    gap: 6,
    elevation: 3,
  },
  emptyPhoto: {
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  image: {
    display: 'flex',
    flex: 1,
    width: 90,
    height: 'auto',
    backgroundColor: '#eee',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  photoPreviewContainer: {
    width: 90,
    height: 110,
    backgroundColor: '#dcdcdcff',
    borderRadius: 8,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  photoPreviewData: {
    width: '100%',
    justifyContent: 'center',
    backgroundColor: 'rgb(242, 242, 242)',
    borderBottomRightRadius: 8,
    paddingRight: 2,
    paddingLeft: 5,
  },
  photoPreviewText: {
    color: 'black',
    fontSize: 9,
    fontWeight: '600',
  }
});

export default ModalAddPhoto;
