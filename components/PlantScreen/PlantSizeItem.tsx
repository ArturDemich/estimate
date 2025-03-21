import { PlantDetails } from "@/redux/stateServiceTypes";
import { AppDispatch, RootState } from "@/redux/store";
import { getPlantsDetailsDB } from "@/redux/thunks";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import { memo, useCallback, useEffect, useRef } from "react";
import { FlatList, KeyboardAvoidingView, Platform, SafeAreaView, View } from "react-native";
import { connect, useDispatch, useSelector } from "react-redux";
import RenderPlantDetail from "./RenderPlantDetail";
import { setExistPlantProps } from "@/redux/dataSlice";
import EmptyList from "@/components/ui/EmptyList";


 const PlantSizeItem = memo(({existPlantProps, plantName}: {existPlantProps: PlantDetails | null, plantName: string}) => {
  const dispatch = useDispatch<AppDispatch>();
  const palntDetails = useSelector<RootState, PlantDetails[]>((state) => state.data.dBPlantDetails);
  const docSent = useSelector<RootState, number>((state) => state.data.docSent);
  const params = useLocalSearchParams();
  const docName = Array.isArray(params.docName) ? params.docName[0] : params.docName;
  const flatListRef = useRef<FlatList>(null);
  
  const loadDBDetails = async () => {
    const plantId = params.plantId;
    const docId = params.docId
    const data = await dispatch(getPlantsDetailsDB({ palntId: Number(plantId), docId: Number(docId) }))
  };

  const handleFocus = (index: number) => {
    if (flatListRef.current) {
      flatListRef.current.scrollToIndex({
        index,
        animated: true,
        viewPosition: 0.5,
      });
  }
};
  

  useEffect(() => {
    if (existPlantProps?.characteristic_id && flatListRef.current) {
      const index = palntDetails.findIndex(item => item.characteristic_id === existPlantProps?.characteristic_id);
      if (index !== -1) {
        flatListRef.current.scrollToIndex({ index, animated: true });
      }
    }
  }, [existPlantProps]);

  useFocusEffect(
    useCallback(() => {
      loadDBDetails()
    }, [])
  );

  return (
    <SafeAreaView style={{flex: 1,}}>
    <KeyboardAvoidingView  behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
      <FlatList
        ref={flatListRef}
        data={palntDetails}
        onTouchStart={() => existPlantProps && dispatch(setExistPlantProps(null))}
        keyExtractor={(item, index) => item.characteristic_id.toString() + index}
        renderItem={({ item, index }) => <RenderPlantDetail flatListRef={() => handleFocus(index)} docSent={docSent} plantName={plantName} docName={docName} item={item} numRow={palntDetails.length - index} reloadList={() => loadDBDetails()}/>}
        style={{ width: "100%", paddingBottom: 40, flex: 1 }}
        ListEmptyComponent={<EmptyList text="Немає доданих х-ка" />}
        ListFooterComponent={<View></View>}
        ListFooterComponentStyle={{ height: 150 }}
        scrollEnabled={true}
        getItemLayout={(data, index) => ({
          length: 65, // Approximate item height (adjust if needed)
          offset: 65 * index,
          index,
        })}
        onScrollToIndexFailed={(info) => {
          console.warn("Scroll to index failed: ", info);
          flatListRef.current?.scrollToOffset({ offset: info.averageItemLength * info.index, animated: true });
        }}
      />
      </KeyboardAvoidingView>
      </SafeAreaView>
      
  );
}, (prevProps, nextProps) => {
return prevProps == nextProps
})

const mapStateToProps = (state: RootState) => ({
  existPlantProps: state.data.existPlantProps,
})

export default connect(mapStateToProps)(PlantSizeItem);

