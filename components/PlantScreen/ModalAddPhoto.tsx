import React, { useEffect, useState } from 'react';
import { Modal, View, Text, StyleSheet, Image, FlatList, ActivityIndicator } from 'react-native';
import TouchableVibrate from '@/components/ui/TouchableVibrate';
import { MaterialIcons, FontAwesome6 } from '@expo/vector-icons';
import { SelectedPhoto } from '@/redux/stateServiceTypes';

interface ModalAddPhotoProps {
  visible: boolean;
  onClose: () => void;
  onGallery: () => void;
  onCamera: () => void;
  photosUrl: SelectedPhoto[] | null;
  onDelete: (selected: SelectedPhoto[]) => void;
  uploading: boolean;
  deleting: boolean;
}

const ModalAddPhoto: React.FC<ModalAddPhotoProps> = ({
  visible,
  onClose,
  onGallery,
  onCamera,
  photosUrl,
  onDelete,
  uploading,
  deleting
}) => {
  const [selected, setSelected] = useState<SelectedPhoto[]>([]);
  const [selectMode, setSelectMode] = useState(false);

  const handleLongPress = (url: SelectedPhoto) => {
    setSelectMode(true);
    setSelected([url]);
  };

  const handleSelect = (url: SelectedPhoto) => {
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

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>Актуальні фото: {photosUrl?.length}</Text>

          <FlatList
            data={photosUrl}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={true}
            style={{ marginVertical: 10, paddingBottom: 10 }}
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
                <PhotoPreview uri={item.url} />
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
                <TouchableVibrate style={styles.deleteBtn} onPress={handleDelete}>
                  {deleting ? <ActivityIndicator size="small" color="#fff" /> :
                  <MaterialIcons name="delete" size={22} color="#fff" />}
                  <Text style={styles.btnText}>Видалити {selected.length}</Text>
                </TouchableVibrate>
                <TouchableVibrate style={[styles.actionBtn, {backgroundColor: 'rgb(70, 70, 70)'}]} onPress={handleSelectAll}>
                  <MaterialIcons name="done-all" size={20} color="#fff" />
                  <Text style={styles.btnText}>Всі</Text>
                </TouchableVibrate>
                <TouchableVibrate style={[styles.actionBtn, {backgroundColor: 'rgba(175, 175, 175, 0.95)'}]} onPress={handleDeselectAll}>
                  <MaterialIcons name="remove-done" size={20} color="#fff" />
                  <Text style={styles.btnText}>Жодне</Text>
                </TouchableVibrate>
              </>
            ) : (
              <>
                <TouchableVibrate style={styles.closeBtn} onPress={handleClose}>
                  <MaterialIcons name="close" size={22} color="#fff" />
                </TouchableVibrate>
                <View style={styles.btnRow}>
                  <TouchableVibrate style={styles.actionBtn} onPress={onGallery}>
                    <MaterialIcons name="photo-library" size={22} color="#fff" />
                    <Text style={styles.btnText}>Галерея</Text>
                  </TouchableVibrate>
                  <TouchableVibrate style={styles.actionBtn} onPress={onCamera}>
                    <MaterialIcons name="photo-camera" size={22} color="#fff" />
                    <Text style={styles.btnText}>Камера</Text>
                  </TouchableVibrate>
                </View>
              </>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const PhotoPreview = ({ uri }: { uri: string }) => {
  const [loading, setLoading] = useState(true);
  return (
    <View style={styles.photoPreviewContainer}>
      {loading && <ActivityIndicator size="large" color='rgba(255, 111, 97, 1)' style={{ position: 'absolute', zIndex: 1 }} />}
        <Image
          source={{ uri }}
          style={styles.image}
          resizeMode="cover"
          onError={(e) => console.log('Image load error:', e.nativeEvent)}
          onLoadEnd={() => setLoading(false)}
        />
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
  image: {
    width: 90,
    height: 90,
    backgroundColor: '#eee',
    borderRadius: 8,
  },
  checkIcon: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(255, 111, 97, 0.8)',
    borderRadius: 12,
    padding: 2,
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
  photoPreviewContainer: {
     width: 90, 
     height: 90, 
     backgroundColor: '#dcdcdcff', 
     borderRadius: 8, 
     overflow: 'hidden', 
     alignItems: 'center', 
     justifyContent: 'center',
     position: 'relative',
  }
});

export default ModalAddPhoto;
