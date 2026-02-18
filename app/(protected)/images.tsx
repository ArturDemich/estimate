import React, { useCallback, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  Modal,
  useWindowDimensions,
  Switch,
  Image,
  Platform,
  Keyboard,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { EvilIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import * as MediaLibrary from "expo-media-library";

import TouchableVibrate from "@/components/ui/TouchableVibrate";
import { AppDispatch, RootState } from "@/redux/store";
import {
  Storages,
  PlantItemRespons,
  PhotoItem,
} from "@/redux/stateServiceTypes";
import {
  getPlantsNameThunk,
  fetchPhotosByProductId,
  fetchAllPhotos,
  uploadPhotoThunk,
  deletePhotoThunk,
  toggleSendViber,
} from "@/redux/thunks";
import { clearSearchPlantName } from "@/redux/dataSlice";
import { findPhotoForPlantDetail } from "@/utils/findPhotoUrls";
import { formatDate, getUkrainianPart } from "@/components/helpers";
import { myToast } from "@/utils/toastConfig";
import ModalAddPhoto from "@/components/PlantScreen/ModalAddPhoto";
import EmptyList from "@/components/ui/EmptyList";

type StorageItem = { id: string; id_parent?: string; is_group?: boolean; name: string };

function filterStorages(storages: StorageItem[]) {
  const middleGroups = storages.filter(
    (item) => item.is_group && item.id_parent !== "00000000-0000-0000-0000-000000000000"
  );
  const rootStorages = storages.filter(
    (item) => item.is_group && item.id_parent === "00000000-0000-0000-0000-000000000000"
  );
  const maxRootStorages = rootStorages.filter((root) =>
    middleGroups.some((middle) => middle.id_parent === root.id)
  );
  return [
    ...middleGroups,
    ...rootStorages.filter(
      (root) => !maxRootStorages.some((maxRoot) => maxRoot.id === root.id)
    ),
  ];
}

type TabId = "add" | "library" | "search";

export default function ImagesScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const dispatch = useDispatch<AppDispatch>();
  const storages = useSelector((state: RootState) => state.data.digStorages) as StorageItem[];
  const searchPlantName = useSelector((state: RootState) => state.data.searchPlantName);
  const photoList = useSelector((state: RootState) => state.photos.photoList);
  const allPhotosList = useSelector((state: RootState) => state.photos.allPhotosList);
  const sendViber = useSelector((state: RootState) => state.photos.sendViber);

  const [selectedStorage, setSelectedStorage] = useState<Storages | null>(null);
  const [storageModalVisible, setStorageModalVisible] = useState(false);
  const [storageExpanded, setStorageExpanded] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [barcode, setBarcode] = useState("");
  const [inStockOnly, setInStockOnly] = useState(true);
  const [expandedProductId, setExpandedProductId] = useState<string | null>(null);
  const [photoModalVisible, setPhotoModalVisible] = useState(false);
  const [selectedPlant, setSelectedPlant] = useState<PlantItemRespons | null>(null);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>("add");
  const [librarySearchQuery, setLibrarySearchQuery] = useState("");
  const [searchTabQuery, setSearchTabQuery] = useState("");
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [lastSearchParams, setLastSearchParams] = useState<{
    storageId: string | null;
    name: string;
    inStockOnly: boolean;
  }>({ storageId: null, name: "", inStockOnly: true });
  const [searchLoading, setSearchLoading] = useState(false);

  const toggleProductExpand = useCallback((productId: string) => {
    setExpandedProductId((prev) => (prev === productId ? null : productId));
  }, []);

  const toggleStorageExpand = useCallback((id: string) => {
    setStorageExpanded((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }, []);

  const handleSearch = useCallback(async () => {
    if (!selectedStorage) return;
    const name = input.trim();
    setLastSearchParams({
      storageId: selectedStorage.id,
      name,
      inStockOnly,
    });
    Keyboard.dismiss();
    dispatch(clearSearchPlantName());
    setSearchLoading(true);
    try {
      await dispatch(
        getPlantsNameThunk({
          storageId: selectedStorage.id,
          name: name || undefined,
          inStockOnly,
        })
      ).unwrap();
    } finally {
      setSearchLoading(false);
    }
  }, [selectedStorage, input, inStockOnly, dispatch]);

  // Кнопка «Пошук» disabled, якщо немає складу або жоден параметр не змінився з моменту останнього пошуку
  const searchParamsUnchanged = useMemo(() => {
    if (!selectedStorage) return true;
    return (
      lastSearchParams.storageId === selectedStorage.id &&
      lastSearchParams.name === input.trim() &&
      lastSearchParams.inStockOnly === inStockOnly
    );
  }, [selectedStorage, input, inStockOnly, lastSearchParams]);

  const groupedByProduct = useMemo(() => {
    const map = new Map<string, { productName: string; items: PlantItemRespons[] }>();
    for (const item of searchPlantName) {
      const id = item.product.id;
      if (!map.has(id)) {
        map.set(id, { productName: item.product.name, items: [] });
      }
      map.get(id)!.items.push(item);
    }
    return Array.from(map.entries()).map(([productId, { productName, items }]) => ({
      productId,
      productName,
      items,
    }));
  }, [searchPlantName]);

  const visibleItemsFiltered = useMemo(() => {
    if (activeTab !== "search" || !searchTabQuery.trim()) return groupedByProduct;
    const q = searchTabQuery.trim().toLowerCase();
    return groupedByProduct.filter((g) => {
      const nameMatch = g.productName.toLowerCase().includes(q);
      const sizeMatch = g.items.some((i) =>
        getUkrainianPart(i.characteristic.name).toLowerCase().includes(q)
      );
      return nameMatch || sizeMatch;
    });
  }, [groupedByProduct, activeTab, searchTabQuery]);

  const groupedLibraryPhotos = useMemo(() => {
    if (!allPhotosList || allPhotosList.length === 0) return [];
    const byPlant = new Map<
      string,
      { plantName: string; sizes: { sizeName: string; photos: PhotoItem[] }[] }
    >();
    for (const photo of allPhotosList) {
      const plantName = photo.appProperties.plantName || "—";
      const sizeName = photo.appProperties.plantSize || "—";
      if (!byPlant.has(plantName)) {
        byPlant.set(plantName, { plantName, sizes: [] });
      }
      const entry = byPlant.get(plantName)!;
      let sizeGroup = entry.sizes.find((s) => s.sizeName === sizeName);
      if (!sizeGroup) {
        sizeGroup = { sizeName, photos: [] };
        entry.sizes.push(sizeGroup);
      }
      sizeGroup.photos.push(photo);
    }
    let list = Array.from(byPlant.values());
    if (librarySearchQuery.trim()) {
      const q = librarySearchQuery.trim().toLowerCase();
      list = list.filter(
        (s) =>
          s.plantName.toLowerCase().includes(q) ||
          s.sizes.some((siz) => siz.sizeName.toLowerCase().includes(q))
      );
    }
    return list;
  }, [allPhotosList, librarySearchQuery]);

  React.useEffect(() => {
    if (activeTab === "library") {
      dispatch(fetchAllPhotos());
    }
  }, [activeTab, dispatch]);

  React.useEffect(() => {
    if (expandedProductId) {
      dispatch(fetchPhotosByProductId({ productId: expandedProductId }));
    }
  }, [expandedProductId, dispatch]);

  const handlePlantPress = useCallback(
    (item: PlantItemRespons) => {
      setSelectedPlant(item);
      setPhotoModalVisible(true);
      dispatch(fetchPhotosByProductId({ productId: item.product.id }));
    },
    [dispatch]
  );

  const pickFromGallery = useCallback(async () => {
    if (!selectedPlant) return;
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      myToast({
        type: "customError",
        text1: "Доступ до галереї заборонено!",
        text2: "Надайте дозвіл додатку у налаштуваннях пристрою.",
        visibilityTime: 4000,
      });
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 1,
    });
    if (!result.canceled) optimizeAndUpload(result.assets[0].uri);
  }, [selectedPlant]);

  const takePhoto = useCallback(async () => {
    if (!selectedPlant) return;
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      myToast({
        type: "customError",
        text1: "Доступ до камери заборонено!",
        text2: "Надайте дозвіл додатку у налаштуваннях пристрою.",
        visibilityTime: 4000,
      });
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: false,
      quality: 1,
    });
    if (!result.canceled) {
      const uri = result.assets[0].uri;
      const { status: libStatus } = await MediaLibrary.requestPermissionsAsync();
      if (libStatus === "granted") await MediaLibrary.createAssetAsync(uri);
      optimizeAndUpload(uri);
    }
  }, [selectedPlant]);

  const optimizeAndUpload = useCallback(
    async (uri: string) => {
      if (!selectedPlant) return;
      setUploading(true);
      try {
        const optimized = await ImageManipulator.manipulateAsync(
          uri,
          [{ resize: { width: 1280 } }],
          { compress: 0.8, format: ImageManipulator.SaveFormat.WEBP }
        );
        const formData = new FormData();
        formData.append("file", {
          uri: optimized.uri,
          name: "photo.webp",
          type: "image/webp",
        } as any);
        formData.append("plantName", selectedPlant.product.name);
        formData.append("plantSize", selectedPlant.characteristic.name);
        formData.append("barcode", selectedPlant.barcode ?? "");
        formData.append("productId", selectedPlant.product.id);
        formData.append("viberSend", String(sendViber));
        formData.append("sizeId", selectedPlant.characteristic.id);
        formData.append("storageName", selectedStorage?.name ?? "");
        await dispatch(uploadPhotoThunk({ formData })).unwrap();
        myToast({
          type: "customToast",
          text1: "Фото завантажено успішно!",
          visibilityTime: 5000,
        });
        dispatch(fetchPhotosByProductId({ productId: selectedPlant.product.id }));
      } catch (error: any) {
        const msg =
          typeof error === "string" ? error : error?.message || JSON.stringify(error);
        myToast({
          type: "customError",
          text1: "Помилка завантаження фото!",
          text2: msg,
          visibilityTime: 4000,
        });
      } finally {
        setUploading(false);
      }
    },
    [selectedPlant, selectedStorage, sendViber, dispatch]
  );

  const handleDeletePhotos = useCallback(
    async (selected: PhotoItem[]) => {
      if (!selectedPlant) return;
      setDeleting(true);
      try {
        const ids = selected.map((p) => p.id);
        await dispatch(deletePhotoThunk({ ids })).unwrap();
        myToast({ type: "customToast", text1: "Фото видалено!", visibilityTime: 3000 });
        dispatch(fetchPhotosByProductId({ productId: selectedPlant.product.id }));
      } catch (error: any) {
        myToast({
          type: "customError",
          text1: "Помилка видалення фото!",
          text2: error?.message || String(error),
          visibilityTime: 4000,
        });
      } finally {
        setDeleting(false);
      }
    },
    [selectedPlant, dispatch]
  );

  const photosUrlForModal = useMemo(() => {
    if (!selectedPlant || !photoList) return null;
    return photoList.filter(
      (p) => p.appProperties.sizeId === selectedPlant.characteristic.id
    );
  }, [selectedPlant, photoList]);

  const libraryItemSize = width > 0 ? Math.floor((width - 32) / 3) - 8 : 100;

  const renderStorageItem = useCallback(
    ({ item }: { item: StorageItem }) => {
      const children = storages.filter((c) => c.id_parent === item.id);
      const isExpanded = storageExpanded.includes(item.id);
      
      return (
        <View>
          <TouchableVibrate
            style={styles.storageRow}
            onPress={() => {
              if (!item.is_group) {
                setSelectedStorage({ id: item.id, name: item.name });
                setStorageModalVisible(false);
              } else {
                toggleStorageExpand(item.id);
              }
            }}
          >
            <Text style={styles.storageRowText}>{item.name}</Text>
            {item.is_group &&
              (isExpanded ? (
                <MaterialIcons name="expand-less" size={24} color="#333" />
              ) : (
                <MaterialIcons name="expand-more" size={24} color="#333" />
              ))}
          </TouchableVibrate>

          {isExpanded && children.length > 0 && (
            <FlatList
              data={children}
              keyExtractor={(child) => child.id}
              renderItem={({ item: child }) => (
                <TouchableVibrate
                  style={[styles.storageRow, { marginLeft: 20 }]}
                  onPress={() => {
                    if (!child.is_group) {
                      setSelectedStorage({ id: child.id, name: child.name });
                      setStorageModalVisible(false);
                    } else {
                      toggleStorageExpand(child.id);
                    }
                  }}
                >
                  <Text style={styles.storageRowText}>{child.name}</Text>
                  {child.is_group &&
                    (storageExpanded.includes(child.id) ? (
                      <MaterialIcons name="expand-less" size={24} color="#333" />
                    ) : (
                      <MaterialIcons name="expand-more" size={24} color="#333" />
                    ))}
                </TouchableVibrate>
              )}
              scrollEnabled={false}
            />
          )}
        </View>
      );
    },
    [storages, storageExpanded, toggleStorageExpand]
  );

  const renderLibrarySection = useCallback(
    ({ item }: { item: (typeof groupedLibraryPhotos)[0] }) => (
      <View style={styles.librarySectionContainer}>
        <Text style={styles.librarySectionTitle}>{item.plantName}</Text>
        <View style={styles.libraryDivider} />
        {item.sizes.map((size) => (
          <View key={size.sizeName} style={styles.librarySizeBlock}>
            <Text style={styles.librarySizeName}>{size.sizeName}</Text>
            <View style={styles.libraryPhotosWrap}>
              {size.photos.map((photo) => (
                <View key={photo.id} style={[styles.libraryPhotoWrap, { width: libraryItemSize, height: libraryItemSize }]}>
                  <Image
                    source={{ uri: photo.url }}
                    style={styles.libraryPhoto}
                    resizeMode="cover"
                  />
                  <View style={styles.libraryPhotoOverlay}>
                    <Text style={styles.libraryPhotoOverlayText} numberOfLines={1}>
                      {photo.appProperties.storageName}
                    </Text>
                    <Text style={styles.libraryPhotoOverlayText}>
                      {formatDate(photo.appProperties.date)}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        ))}
      </View>
    ),
    [groupedLibraryPhotos, libraryItemSize]
  );

  const getProductPhotoCounts = useCallback(
    (productId: string) => {
      const total = groupedByProduct.find((g) => g.productId === productId)?.items.length ?? 0;
      if (expandedProductId !== productId || !photoList) return { withPhoto: 0, total };
      let withPhoto = 0;
      const group = groupedByProduct.find((g) => g.productId === productId);
      if (group) {
        for (const it of group.items) {
          const arr = findPhotoForPlantDetail(productId, it.characteristic.id, photoList);
          if (arr && arr.length > 0) withPhoto++;
        }
      }
      return { withPhoto, total };
    },
    [groupedByProduct, expandedProductId, photoList]
  );

  const renderProductHeader = useCallback(
    (productId: string, productName: string, itemCount: number) => {
      const { withPhoto, total } = getProductPhotoCounts(productId);
      const hasAnyPhoto = withPhoto > 0;
      const expanded = expandedProductId === productId;
      return (
        <TouchableVibrate
          style={styles.productHeader}
          onPress={() => toggleProductExpand(productId)}
          delayPressIn={80}
        >
          <Text style={styles.productName} numberOfLines={1}>
            {getUkrainianPart(productName)}
          </Text>
          <View style={styles.productHeaderRight}>
            <MaterialIcons
              name="add-photo-alternate"
              size={24}
              color={hasAnyPhoto ? "rgb(106, 159, 53)" : "rgba(255, 111, 97, 1)"}
            />
            <Text style={styles.productPhotoCount}>
              {withPhoto} з {total}
            </Text>
          </View>
          <MaterialIcons
            name={expanded ? "expand-less" : "expand-more"}
            size={24}
            color="#333"
          />
        </TouchableVibrate>
      );
    },
    [getProductPhotoCounts, toggleProductExpand, expandedProductId, photoList]
  );

  const renderSizeRow = useCallback(
    (item: PlantItemRespons, productId: string) => {
      const photos = findPhotoForPlantDetail(
        productId,
        item.characteristic.id,
        expandedProductId === productId ? photoList : null
      );
      const count = photos?.length ?? 0;
      const hasPhoto = count > 0;
      return (
        <TouchableVibrate
          key={item.characteristic.id}
          style={styles.sizeRow}
          onPress={() => handlePlantPress(item)}
          delayPressIn={80}
        >
          <View style={styles.sizeRowTop}>
            <Text style={styles.sizeName} numberOfLines={1}>
              {getUkrainianPart(item.characteristic.name)}
            </Text>
            <Text style={styles.sizeQty}>{item.qty} шт</Text>
          </View>
          <View style={styles.sizeRowBottom}>
            <View style={styles.photoCountBlock}>
              <MaterialIcons
                name="add-photo-alternate"
                size={22}
                color={hasPhoto ? "rgb(106, 159, 53)" : "rgba(255, 111, 97, 1)"}
              />
              <Text style={[styles.photoCountText, hasPhoto && styles.photoCountGreen]}>
                {count}
              </Text>
            </View>
          </View>
        </TouchableVibrate>
      );
    },
    [handlePlantPress, expandedProductId, photoList]
  );

  const renderAddItem = useCallback(
    ({ item }: { item: (typeof visibleItemsFiltered)[0] }) => {
      const expanded = expandedProductId === item.productId;
      return (
        <View style={styles.productCard}>
          {renderProductHeader(item.productId, item.productName, item.items.length)}
          {expanded && (
            <View style={styles.sizesBlock}>
              {item.items.map((sizeItem) => renderSizeRow(sizeItem, item.productId))}
            </View>
          )}
        </View>
      );
    },
    [expandedProductId, renderProductHeader, renderSizeRow]
  );

  return (
    <View style={styles.container}>
      {/* Top filters — only for Add tab */}
      {activeTab === "add" && (
        <View style={styles.filterBlock}>
          <View style={styles.row1}>
            <TouchableVibrate
              style={styles.storageBtn}
              onPress={() => setStorageModalVisible(true)}
            >
              <MaterialCommunityIcons name="warehouse" size={22} color="#333" />
              <Text style={styles.storageBtnText} numberOfLines={1}>
                {selectedStorage?.name ?? "Склад"}
              </Text>
              <MaterialIcons name="arrow-drop-down" size={24} color="#333" />
            </TouchableVibrate>
            <TouchableVibrate
              style={[
                styles.searchBtn,
                (!selectedStorage || searchParamsUnchanged || searchLoading) && styles.searchBtnDisabled,
              ]}
              onPress={handleSearch}
              disabled={!selectedStorage || searchParamsUnchanged || searchLoading}
            >
              {searchLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.searchBtnText}>Пошук</Text>
              )}
            </TouchableVibrate>
          </View>
          <View style={styles.row2}>
            <View style={[styles.inputWrap, !selectedStorage && styles.inputDisabled]}>
              <TextInput
                style={styles.input}
                placeholder="Назва рослини"
                value={input}
                onChangeText={setInput}
                editable={!!selectedStorage}
                placeholderTextColor="#888"
              />
              <View style={styles.inputRightBtn}>
                {input.length > 0 ? (
                  <TouchableVibrate onPress={() => setInput("")} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <MaterialIcons name="clear" size={22} color="#666" />
                  </TouchableVibrate>
                ) : selectedStorage ? (
                  <TouchableVibrate onPress={() => setBarcode("")} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <MaterialIcons name="qr-code-2" size={24} color="#333" />
                  </TouchableVibrate>
                ) : null}
              </View>
            </View>
            <View style={[styles.inStockRow, !input.trim() && styles.inStockRowDisabled]}>
              <Text style={styles.inStockLabel}>В наявності</Text>
              <Switch
                value={inStockOnly}
                onValueChange={setInStockOnly}
                disabled={!input.trim()}
                trackColor={{ false: "#ccc", true: "rgba(106, 159, 53, 0.6)" }}
                thumbColor={inStockOnly ? "rgb(106, 159, 53)" : "#f4f3f4"}
              />
            </View>
          </View>
        </View>
      )}

      {/* Content by tab */}
      {activeTab === "add" && (
        <FlatList
          data={visibleItemsFiltered}
          keyExtractor={(item) => item.productId}
          renderItem={renderAddItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <EmptyList text="Оберіть склад і натисніть Пошук" />
          }
          removeClippedSubviews={Platform.OS === "android"}
          windowSize={10}
          maxToRenderPerBatch={8}
        />
      )}

      {activeTab === "library" && (
        <FlatList
          data={groupedLibraryPhotos}
          keyExtractor={(item) => item.plantName}
          renderItem={renderLibrarySection}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={<EmptyList text="Немає завантажених фото" />}
          removeClippedSubviews={Platform.OS === "android"}
          windowSize={6}
        />
      )}

      {activeTab === "search" && (
        <>
          {showSearchBar && (
            <View style={[styles.searchBarContainer, { paddingBottom: 8 }]}>
              <View style={styles.searchBarInner}>
                <MaterialIcons name="search" size={22} color="#666" />
                <TextInput
                  style={styles.searchBarInput}
                  placeholder="Фільтр по назві або розміру..."
                  value={searchTabQuery}
                  onChangeText={setSearchTabQuery}
                  placeholderTextColor="#888"
                  autoFocus
                />
                {searchTabQuery.length > 0 && (
                  <TouchableVibrate onPress={() => setSearchTabQuery("")}>
                    <MaterialIcons name="clear" size={22} color="#666" />
                  </TouchableVibrate>
                )}
                <TouchableVibrate onPress={() => setShowSearchBar(false)}>
                  <Text style={styles.searchBarClose}>Закрити</Text>
                </TouchableVibrate>
              </View>
            </View>
          )}
          <FlatList
            data={visibleItemsFiltered}
            keyExtractor={(item) => item.productId}
            renderItem={renderAddItem}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={<EmptyList text="Немає результатів пошуку" />}
            removeClippedSubviews={Platform.OS === "android"}
            windowSize={10}
          />
        </>
      )}

      {/* Bottom tab bar */}
      {activeTab !== "search" || !showSearchBar ? (
        <View
          style={[
            styles.tabBar,
            {
              paddingBottom: Math.max(insets.bottom, 10),
              paddingLeft: Math.max(insets.left, 16),
              paddingRight: Math.max(insets.right, 16),
            },
          ]}
        >
          <View style={styles.tabBarPill}>
            <TouchableVibrate
              style={[styles.tab, activeTab === "add" && styles.tabActive]}
              onPress={() => setActiveTab("add")}
            >
              <MaterialIcons
                name="add-photo-alternate"
                size={22}
                color={activeTab === "add" ? "#fff" : "#333"}
              />
              <Text style={[styles.tabText, activeTab === "add" && styles.tabTextActive]}>
                Фото
              </Text>
            </TouchableVibrate>
            <TouchableVibrate
              style={[styles.tab, activeTab === "library" && styles.tabActive]}
              onPress={() => setActiveTab("library")}
            >
              <MaterialIcons
                name="photo-library"
                size={22}
                color={activeTab === "library" ? "#fff" : "#333"}
              />
              <Text style={[styles.tabText, activeTab === "library" && styles.tabTextActive]}>
                Бібліотека
              </Text>
            </TouchableVibrate>
            <TouchableVibrate
              style={[styles.tab, activeTab === "search" && styles.tabActive]}
              onPress={() => {
                setActiveTab("search");
                setShowSearchBar(true);
              }}
            >
              <MaterialIcons
                name="search"
                size={22}
                color={activeTab === "search" ? "#fff" : "#333"}
              />
              <Text style={[styles.tabText, activeTab === "search" && styles.tabTextActive]}>
                Пошук
              </Text>
            </TouchableVibrate>
          </View>
        </View>
      ) : null}

      {/* Storage picker modal */}
      <Modal
        visible={storageModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setStorageModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Оберіть склад</Text>
            <FlatList
              data={filterStorages(storages)}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderStorageItem}
              style={{ width: '100%' }}
              contentContainerStyle={{ flexGrow: 1 }}
              ListEmptyComponent={<EmptyList text="Склади не завантажено" />}
            />
            <TouchableVibrate
              style={styles.modalCloseBtn}
              onPress={() => setStorageModalVisible(false)}
            >
              <EvilIcons name="close" size={28} color="#fff" />
            </TouchableVibrate>
          </View>
        </View>
      </Modal>

      {/* Photo modal */}
      <ModalAddPhoto
        visible={photoModalVisible}
        onClose={() => {
          setPhotoModalVisible(false);
          setSelectedPlant(null);
        }}
        onGallery={pickFromGallery}
        onCamera={takePhoto}
        photosUrl={photosUrlForModal}
        onDelete={handleDeletePhotos}
        uploading={uploading}
        deleting={deleting}
        sendViber={sendViber}
        setSendViber={() => dispatch(toggleSendViber())}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  filterBlock: {
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: "rgba(255,255,255,0.4)",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.06)",
  },
  row1: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  storageBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
  },
  storageBtnText: {
    flex: 1,
    fontSize: 15,
    color: "#333",
  },
  searchBtn: {
    backgroundColor: "rgba(106, 159, 53, 0.95)",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    minWidth: 100,
  },
  searchBtnDisabled: {
    opacity: 0.5,
  },
  searchBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  row2: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  inputWrap: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    paddingLeft: 12,
    paddingRight: 8,
    fontSize: 15,
    color: "#333",
    backgroundColor: "transparent",
  },
  inputRightBtn: {
    paddingRight: 10,
    paddingVertical: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  inputDisabled: {
    opacity: 0.6,
    backgroundColor: "rgba(240,240,240,0.9)",
  },
  inStockRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexShrink: 0,
  },
  inStockRowDisabled: {
    opacity: 0.5,
  },
  inStockLabel: {
    fontSize: 14,
    color: "#333",
  },
  listContent: {
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 100,
  },
  productCard: {
    marginBottom: 10,
    backgroundColor: "rgba(255,255,255,0.6)",
    borderRadius: 10,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
  },
  productHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 8,
  },
  productName: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    minWidth: 0,
  },
  productHeaderRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flexShrink: 0,
  },
  productPhotoCount: {
    fontSize: 13,
    color: "#666",
    fontWeight: "500",
  },
  sizesBlock: {
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  sizeRow: {
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.06)",
  },
  sizeRowTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sizeName: {
    fontSize: 15,
    color: "#333",
    flex: 1,
  },
  sizeQty: {
    fontSize: 16,
    fontWeight: "600",
    color: "rgb(106, 159, 53)",
  },
  sizeRowBottom: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  photoCountBlock: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  photoCountText: {
    fontSize: 14,
    color: "rgba(255, 111, 97, 1)",
  },
  photoCountGreen: {
    color: "rgb(106, 159, 53)",
  },
  librarySectionContainer: {
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
  },
  librarySectionTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  libraryDivider: {
    height: 1,
    backgroundColor: "rgba(0,0,0,0.1)",
    marginBottom: 10,
  },
  librarySizeBlock: {
    marginBottom: 12,
  },
  librarySizeName: {
    fontSize: 14,
    color: "#666",
    marginBottom: 6,
  },
  libraryPhotosWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  libraryPhotoWrap: {
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#eee",
  },
  libraryPhoto: {
    width: "100%",
    height: "100%",
  },
  libraryPhotoOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  libraryPhotoOverlayText: {
    color: "#fff",
    fontSize: 11,
  },
  searchBarContainer: {
    paddingHorizontal: 12,
    paddingTop: 8,
    backgroundColor: "rgba(255,255,255,0.5)",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.06)",
  },
  searchBarInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
  },
  searchBarInput: {
    flex: 1,
    fontSize: 15,
    color: "#333",
    paddingVertical: 4,
  },
  searchBarClose: {
    fontSize: 15,
    color: "rgba(106, 159, 53, 0.95)",
    fontWeight: "600",
  },
  tabBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    paddingTop: 10,
  },
  tabBarPill: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 24,
    padding: 4,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  tabActive: {
    backgroundColor: "rgba(106, 159, 53, 0.95)",
  },
  tabText: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  tabTextActive: {
    color: "#fff",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    width: "80%",
    height: "70%",
    flexDirection: "column",
    margin: 1,
    backgroundColor: "rgba(255,255,255,0.97)",
    borderRadius: 10,
    paddingLeft: 5,
    paddingRight: 5,
    paddingBottom: 5,
    paddingTop: 5,
    alignItems: "center",
    justifyContent: "flex-start",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    minHeight: "15%",
    maxHeight: "70%",
  },
  modalTitle: {
    fontWeight: "600",
    fontSize: 13,
    marginBottom: 5,
    color: "#333",
  },
  modalList: {
    width: "100%",
    flex: 1,
  },
  modalCloseBtn: {
    marginTop: 10,
    padding: 8,
    backgroundColor: "rgba(140,140,140,0.9)",
    borderRadius: 8,
  },
  storageRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  storageRowText: {
    fontSize: 16,
    color: "#333",
  },
});
