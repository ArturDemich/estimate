import React, { useCallback, useMemo, useState, memo, useEffect, useRef } from "react";
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
  InteractionManager,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import { useFocusEffect } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { EvilIcons, Foundation } from "@expo/vector-icons";
import { FontAwesome6 } from "@expo/vector-icons";
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
import { clearSearchPlantName, setImagesScreenState, clearImagesScreenState } from "@/redux/dataSlice";
import { formatDate, getUkrainianPart } from "@/components/helpers";
import { myToast } from "@/utils/toastConfig";
import ModalAddPhoto from "@/components/PlantScreen/ModalAddPhoto";
import EmptyList from "@/components/ui/EmptyList";
import BarcodeScanner from "@/components/BarcodeScanner";

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
  const imagesScreenState = useSelector((state: RootState) => state.data.imagesScreenState);
  const globalSearchPlantName = useSelector((state: RootState) => state.data.searchPlantName);
  const photoList = useSelector((state: RootState) => state.photos.photoList);
  const allPhotosList = useSelector((state: RootState) => state.photos.allPhotosList);
  const sendViber = useSelector((state: RootState) => state.photos.sendViber);

  // Використовуємо searchPlantName з imagesScreenState якщо є, інакше з загального стейту
  const searchPlantName = imagesScreenState?.searchPlantName ?? globalSearchPlantName;

  // Відновлюємо стейт з Redux або використовуємо дефолтні значення
  const [selectedStorage, setSelectedStorage] = useState<Storages | null>(
    imagesScreenState?.selectedStorage ?? null
  );
  const [storageModalVisible, setStorageModalVisible] = useState(false);
  const [storageExpanded, setStorageExpanded] = useState<string[]>([]);
  const [input, setInput] = useState(imagesScreenState?.input ?? "");
  const [barcode, setBarcode] = useState("");
  const [inStockOnly, setInStockOnly] = useState(imagesScreenState?.inStockOnly ?? true);
  const [expandedProductId, setExpandedProductId] = useState<string | null>(null);
  const [photoModalVisible, setPhotoModalVisible] = useState(false);
  const [selectedPlant, setSelectedPlant] = useState<PlantItemRespons | null>(null);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>("add");
  const [previousTab, setPreviousTab] = useState<TabId>("add");
  const [librarySearchQuery, setLibrarySearchQuery] = useState("");
  const [searchTabQuery, setSearchTabQuery] = useState("");
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [lastSearchParams, setLastSearchParams] = useState<{
    storageId: string | null;
    name: string;
    inStockOnly: boolean;
  }>(imagesScreenState?.lastSearchParams ?? { storageId: null, name: "", inStockOnly: true });
  const [searchLoading, setSearchLoading] = useState(false);
  const [readyToRenderSizes, setReadyToRenderSizes] = useState<string | null>(null);
  const [barcodeScannerVisible, setBarcodeScannerVisible] = useState(false);
  const [librarySelectMode, setLibrarySelectMode] = useState(false);
  const [selectedLibraryPhotos, setSelectedLibraryPhotos] = useState<PhotoItem[]>([]);
  const [libraryDeleting, setLibraryDeleting] = useState(false);

  // Refs для збереження актуальних значень у cleanup функції
  const selectedStorageRef = useRef(selectedStorage);
  const inputRef = useRef(input);
  const inStockOnlyRef = useRef(inStockOnly);
  const lastSearchParamsRef = useRef(lastSearchParams);
  const searchPlantNameRef = useRef(searchPlantName);
  const hasRestoredStateRef = useRef(false);
  const imagesScreenStateRef = useRef(imagesScreenState);

  useEffect(() => {
    imagesScreenStateRef.current = imagesScreenState;
  }, [imagesScreenState]);

  useEffect(() => {
    selectedStorageRef.current = selectedStorage;
    inputRef.current = input;
    inStockOnlyRef.current = inStockOnly;
    lastSearchParamsRef.current = lastSearchParams;
    searchPlantNameRef.current = searchPlantName;
  }, [selectedStorage, input, inStockOnly, lastSearchParams, searchPlantName]);

  // Один useFocusEffect: відновлюємо при фокусі, зберігаємо при blur. Без imagesScreenState в deps — інакше цикл при пошуку.
  useFocusEffect(
    useCallback(() => {
      const savedState = imagesScreenStateRef.current;
      if (savedState && !hasRestoredStateRef.current) {
        hasRestoredStateRef.current = true;
        setSelectedStorage(savedState.selectedStorage);
        setInput(savedState.input);
        setInStockOnly(savedState.inStockOnly);
        setLastSearchParams(savedState.lastSearchParams);
      }

      return () => {
        hasRestoredStateRef.current = false;
        if (selectedStorageRef.current || inputRef.current.trim() || lastSearchParamsRef.current.storageId) {
          dispatch(setImagesScreenState({
            selectedStorage: selectedStorageRef.current,
            input: inputRef.current,
            inStockOnly: inStockOnlyRef.current,
            lastSearchParams: lastSearchParamsRef.current,
            searchPlantName: searchPlantNameRef.current,
          }));
        }
        dispatch(clearSearchPlantName());
      };
    }, [dispatch])
  );

  const toggleProductExpand = useCallback((productId: string) => {
    const newExpandedId = expandedProductId === productId ? null : productId;
    setExpandedProductId(newExpandedId);

    // Відкладаємо рендеринг розмірів до завершення анімації та інтеракцій
    if (newExpandedId) {
      setReadyToRenderSizes(null);
      InteractionManager.runAfterInteractions(() => {
        requestAnimationFrame(() => {
          setReadyToRenderSizes(newExpandedId);
        });
      });
    } else {
      setReadyToRenderSizes(null);
    }
  }, [expandedProductId]);

  const toggleStorageExpand = useCallback((id: string) => {
    setStorageExpanded((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }, []);

  const isNumericBarcode = useCallback((value: string) => /^\d+$/.test(value.trim()), []);

  const handleSearch = useCallback(async () => {
    if (!selectedStorage) return;
    const value = input.trim();
    const newLastSearchParams = {
      storageId: selectedStorage.id,
      name: value,
      inStockOnly,
    };
    setLastSearchParams(newLastSearchParams);
    Keyboard.dismiss();
    dispatch(clearSearchPlantName());
    setSearchLoading(true);
    try {
      const result = await dispatch(
        getPlantsNameThunk({
          storageId: selectedStorage.id,
          name: isNumericBarcode(value) ? undefined : value || undefined,
          barcode: isNumericBarcode(value) ? value : undefined,
          inStockOnly,
        })
      ).unwrap();
      dispatch(setImagesScreenState({
        selectedStorage,
        input,
        inStockOnly,
        lastSearchParams: newLastSearchParams,
        searchPlantName: result,
      }));
      dispatch(fetchAllPhotos());
    } finally {
      setSearchLoading(false);
    }
  }, [selectedStorage, input, inStockOnly, dispatch, isNumericBarcode]);

  const handleBarcodeScanned = useCallback((scannedBarcode: string) => {
    setBarcodeScannerVisible(false);
    setBarcode(scannedBarcode);
    setInput(scannedBarcode);
  }, []);

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

  const filteredLibraryPhotos = useMemo(() => {
    if (activeTab !== "search" || !searchTabQuery.trim()) return groupedLibraryPhotos;
    const q = searchTabQuery.trim().toLowerCase();
    return groupedLibraryPhotos.filter((group) => {
      const nameMatch = group.plantName.toLowerCase().includes(q);
      const sizeMatch = group.sizes.some((size) =>
        size.sizeName.toLowerCase().includes(q)
      );
      return nameMatch || sizeMatch;
    });
  }, [groupedLibraryPhotos, activeTab, searchTabQuery]);

  React.useEffect(() => {
    if (activeTab === "library") {
      dispatch(fetchAllPhotos());
    }
  }, [activeTab, dispatch]);

  // Рендеринг розмірів після розгортання (дані з allPhotosList, без окремого запиту)
  React.useEffect(() => {
    if (expandedProductId) {
      InteractionManager.runAfterInteractions(() => {
        requestAnimationFrame(() => {
          setReadyToRenderSizes(expandedProductId);
        });
      });
    } else {
      setReadyToRenderSizes(null);
    }
  }, [expandedProductId]);

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
        dispatch(fetchAllPhotos());
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
        dispatch(fetchAllPhotos());
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

  const libraryColumns = width >= 420 ? 3 : 2;
  const libraryGap = 8;
  const libraryPadding = 56;
  const libraryItemSize =
    width > 0
      ? Math.floor((width - libraryPadding - libraryGap * (libraryColumns - 1)) / libraryColumns) - 4
      : 100;

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

  const handleLibraryPhotoLongPress = useCallback((photo: PhotoItem) => {
    setLibrarySelectMode(true);
    setSelectedLibraryPhotos([photo]);
  }, []);

  const handleLibraryPhotoPress = useCallback((photo: PhotoItem) => {
    if (!librarySelectMode) return;
    setSelectedLibraryPhotos((prev) =>
      prev.includes(photo) ? prev.filter((p) => p.id !== photo.id) : [...prev, photo]
    );
  }, [librarySelectMode]);

  const handleLibrarySelectAll = useCallback(() => {
    // Якщо на вкладці search з previousTab === "library" і є пошук, виділяємо тільки відфільтровані фото
    if (activeTab === "search" && previousTab === "library" && searchTabQuery.trim()) {
      const filteredPhotos: PhotoItem[] = [];
      filteredLibraryPhotos.forEach((group) => {
        group.sizes.forEach((size) => {
          filteredPhotos.push(...size.photos);
        });
      });
      if (filteredPhotos.length > 0) {
        setSelectedLibraryPhotos(filteredPhotos);
      }
    } else {
      // Інакше виділяємо всі фото
      if (allPhotosList && allPhotosList.length > 0) {
        setSelectedLibraryPhotos(allPhotosList);
      }
    }
  }, [allPhotosList, activeTab, previousTab, searchTabQuery, filteredLibraryPhotos]);

  const handleLibraryDeselectAll = useCallback(() => {
    setSelectedLibraryPhotos([]);
  }, []);

  const handleLibraryDelete = useCallback(() => {
    if (selectedLibraryPhotos.length === 0) return;
    Alert.alert(
      "Видалити фото?",
      `Ви впевнені, що хочете видалити ${selectedLibraryPhotos.length} фото?`,
      [
        { text: "Скасувати", style: "cancel" },
        {
          text: "Видалити",
          style: "destructive",
          onPress: async () => {
            setLibraryDeleting(true);
            try {
              const ids = selectedLibraryPhotos.map((p) => p.id);
              await dispatch(deletePhotoThunk({ ids })).unwrap();
              myToast({
                type: "customToast",
                text1: `Видалено ${selectedLibraryPhotos.length} фото!`,
                visibilityTime: 3000,
              });
              setSelectedLibraryPhotos([]);
              setLibrarySelectMode(false);
              dispatch(fetchAllPhotos());
            } catch (error: any) {
              myToast({
                type: "customError",
                text1: "Помилка видалення фото!",
                text2: error?.message || String(error),
                visibilityTime: 4000,
              });
            } finally {
              setLibraryDeleting(false);
            }
          },
        },
      ]
    );
  }, [selectedLibraryPhotos, dispatch]);

  useEffect(() => {
    if (selectedLibraryPhotos.length === 0) {
      setLibrarySelectMode(false);
    }
  }, [selectedLibraryPhotos]);

  const totalLibraryPhotos = useMemo(() => {
    // Якщо на вкладці search з previousTab === "library" і є пошук, показуємо кількість відфільтрованих фото
    if (activeTab === "search" && previousTab === "library" && searchTabQuery.trim()) {
      let count = 0;
      filteredLibraryPhotos.forEach((group) => {
        group.sizes.forEach((size) => {
          count += size.photos.length;
        });
      });
      return count;
    }
    return allPhotosList?.length ?? 0;
  }, [allPhotosList, activeTab, previousTab, searchTabQuery, filteredLibraryPhotos]);

  const renderLibrarySection = useCallback(
    ({ item }: { item: (typeof groupedLibraryPhotos)[0] }) => (
      <View style={styles.librarySectionContainer}>
        <Text style={styles.librarySectionTitle}>{item.plantName}</Text>
        <View style={styles.libraryDivider} />
        {item.sizes.map((size) => (
          <View key={size.sizeName} style={styles.librarySizeBlock}>
            <Text style={styles.librarySizeName}>{size.sizeName}</Text>
            <View style={styles.libraryPhotosWrap}>
              {size.photos.map((photo) => {
                const viberSent = photo.appProperties.viberSent === '1';
                const isSelected = selectedLibraryPhotos.some((p) => p.id === photo.id);
                return (
                  <TouchableVibrate
                    key={photo.id}
                    onLongPress={() => handleLibraryPhotoLongPress(photo)}
                    onPress={() => handleLibraryPhotoPress(photo)}
                    activeOpacity={0.7}
                  >
                    <View style={[
                      styles.libraryPhotoWrap,
                      { width: libraryItemSize, height: libraryItemSize },
                      librarySelectMode && isSelected && styles.libraryPhotoSelected
                    ]}>
                      <Image
                        source={{ uri: photo.url }}
                        style={styles.libraryPhoto}
                        resizeMode="cover"
                      />
                      {librarySelectMode && isSelected && (
                        <View style={styles.libraryPhotoCheckIcon}>
                          <FontAwesome6 name="check" size={16} color="#fff" />
                        </View>
                      )}
                      {viberSent && (
                        <View style={styles.libraryViberLabel}>
                          <FontAwesome6 name="viber" size={16} color="rgb(142, 73, 169)" />
                        </View>
                      )}
                      <View style={styles.libraryPhotoOverlay}>
                        <Text style={styles.libraryPhotoOverlayText} numberOfLines={1}>
                          {photo.appProperties.storageName}
                        </Text>
                        <Text style={styles.libraryPhotoOverlayText}>
                          {formatDate(photo.appProperties.date)}
                        </Text>
                      </View>
                    </View>
                  </TouchableVibrate>
                );
              })}
            </View>
          </View>
        ))}
      </View>
    ),
    [groupedLibraryPhotos, libraryItemSize, librarySelectMode, selectedLibraryPhotos, handleLibraryPhotoLongPress, handleLibraryPhotoPress]
  );

  // Підрахунок фото для всіх продуктів з allPhotosList (синхронізовано з пошуком та вкладкою Бібліотека)
  const productPhotoCountsMap = useMemo(() => {
    const map = new Map<string, { withPhoto: number; total: number }>();
    const allPhotos = allPhotosList ?? [];
    for (const group of groupedByProduct) {
      const total = group.items.length;
      const productPhotos = allPhotos.filter((p) => p.appProperties.productId === group.productId);
      let withPhoto = 0;
      for (const it of group.items) {
        const hasPhoto = productPhotos.some((p) => p.appProperties.sizeId === it.characteristic.id);
        if (hasPhoto) withPhoto++;
      }
      map.set(group.productId, { withPhoto, total });
    }
    return map;
  }, [groupedByProduct, allPhotosList]);

  const getProductPhotoCounts = useCallback(
    (productId: string) => {
      return productPhotoCountsMap.get(productId) ?? { withPhoto: 0, total: 0 };
    },
    [productPhotoCountsMap]
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
          delayPressIn={0}
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
    [getProductPhotoCounts, toggleProductExpand, expandedProductId]
  );

  // Кількість фото по розмірах розгорнутого продукту з allPhotosList
  const expandedProductPhotosMap = useMemo(() => {
    if (!expandedProductId) return new Map<string, number>();
    const map = new Map<string, number>();
    const allPhotos = allPhotosList ?? [];
    const productPhotos = allPhotos.filter((p) => p.appProperties.productId === expandedProductId);
    const group = groupedByProduct.find((g) => g.productId === expandedProductId);
    if (group) {
      for (const it of group.items) {
        const count = productPhotos.filter((p) => p.appProperties.sizeId === it.characteristic.id).length;
        map.set(it.characteristic.id, count);
      }
    }
    return map;
  }, [expandedProductId, allPhotosList, groupedByProduct]);

  const renderSizeRow = useCallback(
    (item: PlantItemRespons, productId: string) => {
      const count = expandedProductId === productId
        ? (expandedProductPhotosMap.get(item.characteristic.id) ?? 0)
        : 0;
      const hasPhoto = count > 0;
      return (
        <TouchableVibrate
          key={item.characteristic.id}
          style={styles.sizeRow}
          onPress={() => handlePlantPress(item)}
          delayPressIn={0}
        >
          <View style={styles.sizeRowTop}>
            <Text style={styles.sizeName} numberOfLines={1}>
              {item.characteristic.name}
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
    [handlePlantPress, expandedProductId, expandedProductPhotosMap]
  );

  const renderAddItem = useCallback(
    ({ item }: { item: (typeof visibleItemsFiltered)[0] }) => {
      const expanded = expandedProductId === item.productId;
      const productId = item.productId;

      return (
        <View style={styles.productCard}>
          {renderProductHeader(item.productId, item.productName, item.items.length)}
          {expanded && (
            <View style={styles.sizesBlock}>
                <FlatList
                  data={item.items}
                  keyExtractor={(sizeItem) => sizeItem.characteristic.id}
                  renderItem={({ item: sizeItem }) => renderSizeRow(sizeItem, productId)}
                  scrollEnabled={false}
                  removeClippedSubviews={Platform.OS === "android"}
                  windowSize={3}
                  maxToRenderPerBatch={10}
                  initialNumToRender={10}
                />
            </View>
          )}
        </View>
      );
    },
    [expandedProductId, readyToRenderSizes, renderProductHeader, renderSizeRow]
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
                  <TouchableVibrate
                    onPress={() => setBarcodeScannerVisible(true)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <MaterialIcons name="qr-code-2" size={24} color="#333" />
                  </TouchableVibrate>
                ) : null}
              </View>
            </View>
            <View style={[styles.inStockRow, !input.trim() && styles.inStockRowDisabled]}>
              <Foundation name="trees" size={24} color={inStockOnly ? "rgba(106, 159, 53, 0.95)" : "black"} />
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
          windowSize={5}
          maxToRenderPerBatch={5}
          initialNumToRender={11}
          updateCellsBatchingPeriod={50}
        />
      )}

      {activeTab === "library" && (
        <>
          <FlatList
            data={groupedLibraryPhotos}
            keyExtractor={(item) => item.plantName}
            renderItem={renderLibrarySection}
            contentContainerStyle={[
              styles.listContent,
              librarySelectMode && { paddingBottom: 120 }
            ]}
            ListEmptyComponent={<EmptyList text="Немає завантажених фото" />}
            removeClippedSubviews={Platform.OS === "android"}
            windowSize={6}
          />
          {librarySelectMode && (
            <View
              style={[
                styles.librarySelectionBar,
                {
                  paddingBottom: Math.max(insets.bottom, 10),
                  paddingLeft: Math.max(insets.left, 16),
                  paddingRight: Math.max(insets.right, 16),
                },
              ]}
            >
              <View style={styles.librarySelectionPill}>
                <View style={styles.librarySelectionInfo}>
                  <Text style={styles.librarySelectionText}>
                    Обрано: {selectedLibraryPhotos.length} з {totalLibraryPhotos}
                  </Text>
                </View>
                <View style={styles.librarySelectionButtons}>
                  <TouchableVibrate
                    style={[styles.librarySelectionBtn, styles.librarySelectionBtnDanger]}
                    onPress={handleLibraryDelete}
                    disabled={selectedLibraryPhotos.length === 0 || libraryDeleting}
                  >
                    {libraryDeleting ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <>
                        <MaterialIcons name="delete" size={22} color="#fff" />
                        <Text style={styles.librarySelectionBtnTextDanger}>Видалити</Text>
                      </>
                    )}
                  </TouchableVibrate>
                  <TouchableVibrate
                    style={[styles.librarySelectionBtn, styles.librarySelectionBtnSecondary]}
                    onPress={handleLibrarySelectAll}
                    disabled={libraryDeleting}
                  >
                    <MaterialIcons name="done-all" size={20} color="#333" />
                    <Text style={styles.librarySelectionBtnTextSecondary}>Всі</Text>
                  </TouchableVibrate>
                  <TouchableVibrate
                    style={[styles.librarySelectionBtn, styles.librarySelectionBtnSecondary]}
                    onPress={handleLibraryDeselectAll}
                    disabled={libraryDeleting}
                  >
                    <MaterialIcons name="remove-done" size={20} color="#333" />
                    <Text style={styles.librarySelectionBtnTextSecondary}>Очистити</Text>
                  </TouchableVibrate>
                </View>
              </View>
            </View>
          )}
        </>
      )}

      {activeTab === "search" && (
        <>
          {showSearchBar && (
            <View style={[styles.searchBarContainer, { paddingBottom: 8 }]}>
              <View style={styles.searchBarInner}>
                <MaterialIcons name="search" size={22} color="#666" />
                <TextInput
                  style={styles.searchBarInput}
                  placeholder="По назві або розміру..."
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
                <TouchableVibrate
                  onPress={() => {
                    setShowSearchBar(false);
                    setActiveTab(previousTab);
                    setSearchTabQuery("");
                    // Очищаємо виділення і виходимо з режиму виділення
                    setSelectedLibraryPhotos([]);
                    setLibrarySelectMode(false);
                  }}
                >
                  <Text style={styles.searchBarClose}>Закрити</Text>
                </TouchableVibrate>
              </View>
            </View>
          )}
          {previousTab === "library" ? (
            <>
              <FlatList
                data={filteredLibraryPhotos}
                keyExtractor={(item) => item.plantName}
                renderItem={renderLibrarySection}
                contentContainerStyle={[
                  styles.listContent,
                  librarySelectMode && { paddingBottom: 120 }
                ]}
                ListEmptyComponent={<EmptyList text="Немає результатів пошуку" />}
                removeClippedSubviews={Platform.OS === "android"}
                windowSize={6}
              />
              {librarySelectMode && (
                <View
                  style={[
                    styles.librarySelectionBar,
                    {
                      paddingBottom: Math.max(insets.bottom, 10),
                      paddingLeft: Math.max(insets.left, 16),
                      paddingRight: Math.max(insets.right, 16),
                    },
                  ]}
                >
                  <View style={styles.librarySelectionPill}>
                    <View style={styles.librarySelectionInfo}>
                      <Text style={styles.librarySelectionText}>
                        Обрано: {selectedLibraryPhotos.length} з {totalLibraryPhotos}
                      </Text>
                    </View>
                    <View style={styles.librarySelectionButtons}>
                      <TouchableVibrate
                        style={[styles.librarySelectionBtn, styles.librarySelectionBtnDanger]}
                        onPress={handleLibraryDelete}
                        disabled={selectedLibraryPhotos.length === 0 || libraryDeleting}
                      >
                        {libraryDeleting ? (
                          <ActivityIndicator size="small" color="#fff" />
                        ) : (
                          <>
                            <MaterialIcons name="delete" size={22} color="#fff" />
                            <Text style={styles.librarySelectionBtnTextDanger}>Видалити</Text>
                          </>
                        )}
                      </TouchableVibrate>
                      <TouchableVibrate
                        style={[styles.librarySelectionBtn, styles.librarySelectionBtnSecondary]}
                        onPress={handleLibrarySelectAll}
                        disabled={libraryDeleting}
                      >
                        <MaterialIcons name="done-all" size={20} color="#333" />
                        <Text style={styles.librarySelectionBtnTextSecondary}>Всі</Text>
                      </TouchableVibrate>
                      <TouchableVibrate
                        style={[styles.librarySelectionBtn, styles.librarySelectionBtnSecondary]}
                        onPress={handleLibraryDeselectAll}
                        disabled={libraryDeleting}
                      >
                        <MaterialIcons name="remove-done" size={20} color="#333" />
                        <Text style={styles.librarySelectionBtnTextSecondary}>Очистити</Text>
                      </TouchableVibrate>
                    </View>
                  </View>
                </View>
              )}
            </>
          ) : (
            <FlatList
              data={visibleItemsFiltered}
              keyExtractor={(item) => item.productId}
              renderItem={renderAddItem}
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={<EmptyList text="Немає результатів пошуку" />}
              removeClippedSubviews={Platform.OS === "android"}
              windowSize={10}
            />
          )}
        </>
      )}

      {/* Bottom tab bar */}
      {!librarySelectMode && (activeTab !== "search" || !showSearchBar) && (
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
              onPress={() => {
                if (activeTab !== "add") {
                  setPreviousTab(activeTab);
                }
                setActiveTab("add");
              }}
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
              onPress={() => {
                if (activeTab !== "library") {
                  setPreviousTab(activeTab);
                }
                setActiveTab("library");
              }}
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
                if (activeTab !== "search") {
                  setPreviousTab(activeTab);
                }
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
      )}

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
            <View style={styles.btnBlock}>
              <TouchableVibrate
                style={styles.modalCloseBtn}
                onPress={() => setStorageModalVisible(false)}
              >
                <EvilIcons name="close" size={24} color="#fff" style={{ lineHeight: 24 }} />
              </TouchableVibrate>
            </View>
          </View>
        </View>
      </Modal>

      {/* Barcode scanner modal */}
      <Modal
        visible={barcodeScannerVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setBarcodeScannerVisible(false)}
      >
        <View style={styles.barcodeScannerModalOverlay}>
          <View style={styles.barcodeScannerModalContent}>
            <Text style={styles.barcodeScannerTitle}>Скануйте штрихкод</Text>
            <BarcodeScanner
              onScan={handleBarcodeScanned}
              onClose={() => setBarcodeScannerVisible(false)}
            />
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
        plantName={selectedPlant ? getUkrainianPart(selectedPlant.product.name) : undefined}
        plantSize={selectedPlant ? selectedPlant.characteristic.name : undefined}
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
    justifyContent: "center",
    gap: 6,
    flexShrink: 0,
    flex: 0.4,
  },
  inStockRowDisabled: {
    opacity: 0.5,
  },
  listContent: {
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 100,
  },
  productCard: {
    marginBottom: 10,
    backgroundColor: "rgba(255,255,255,0.7)",
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
  sizesBlockPlaceholder: {
    paddingVertical: 20,
    alignItems: "center",
    justifyContent: "center",
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
  libraryViberLabel: {
    position: "absolute",
    bottom: 3,
    right: 3,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 6,
    padding: 4,
    zIndex: 2,
  },
  libraryPhotoSelected: {
    borderWidth: 3,
    borderColor: "rgba(255, 111, 97, 1)",
  },
  libraryPhotoCheckIcon: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "rgba(255, 111, 97, 1)",
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 3,
  },
  librarySelectionBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    paddingTop: 10,
  },
  librarySelectionPill: {
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
    width: "100%",
  },
  librarySelectionInfo: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.06)",
    marginBottom: 4,
  },
  librarySelectionText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  librarySelectionButtons: {
    flexDirection: "row",
    gap: 4,
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  librarySelectionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    flex: 1,
  },
  librarySelectionBtnSecondary: {
    backgroundColor: "rgba(0,0,0,0.05)",
  },
  librarySelectionBtnSecondaryActive: {
    backgroundColor: "rgba(106, 159, 53, 0.1)",
  },
  librarySelectionBtnDanger: {
    backgroundColor: "rgba(255, 111, 97, 1)",
  },
  librarySelectionBtnTextSecondary: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  librarySelectionBtnTextDanger: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
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
  btnBlock: {
    flexDirection: "row",
    width: "100%",
    marginTop: 5,
  },
  modalCloseBtn: {
    borderRadius: 8,
    elevation: 3,
    padding: 4,
    backgroundColor: "rgba(199, 199, 199, 0.99)",
    justifyContent: "center",
    alignItems: 'center',
  },
  barcodeScannerModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.99)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  barcodeScannerModalContent: {
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
  },
  barcodeScannerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 16,
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
