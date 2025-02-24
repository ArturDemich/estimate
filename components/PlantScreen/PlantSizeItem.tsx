import { PlantDetails } from "@/redux/stateServiceTypes";
import { AppDispatch, RootState } from "@/redux/store";
import { getPlantsDetailsDB } from "@/redux/thunks";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";
import { connect, useDispatch, useSelector } from "react-redux";
import RenderPlantDetail from "./RenderPlantDetail";
import { setExistPlantProps } from "@/redux/dataSlice";


 const PlantSizeItem = memo(({existPlantProps}: {existPlantProps: PlantDetails | null}) => {
  //const router = useRouter();
  const params = useLocalSearchParams();
  const dispatch = useDispatch<AppDispatch>();
  const palntDetails = useSelector<RootState, PlantDetails[]>((state) => state.data.dBPlantDetails);
  const flatListRef = useRef<FlatList>(null);
  //const existPlantProps = useSelector<RootState, PlantDetails | null>((state) => state.data.existPlantProps);
  const [highlightedId, setHighlightedId] = useState<string | null>(null); 
  console.log('PlantSizeItem ____P', existPlantProps)

  const handleHighlight = (id: string) => {
    console.log('PlantSizeItem ____id', id)
    setHighlightedId(id); 
  };

  const loadDBDetails = async () => {
    const plantId = params.plantId;
    const docId = params.docId
    const data = await dispatch(getPlantsDetailsDB({ palntId: Number(plantId), docId: Number(docId) }))
    console.log('PlantSizeItem___',  )
  };

  useEffect(() => {
    if (existPlantProps?.characteristic_id && flatListRef.current) {
      console.log('PlantSizeItem___ existPlantProps?',  existPlantProps?.characteristic_id)
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
      <FlatList
        ref={flatListRef}
        data={palntDetails}
        onTouchStart={() => existPlantProps && dispatch(setExistPlantProps(null))}
        //onMomentumScrollBegin={() => existPlantProps && dispatch(setExistPlantProps(null))}
        keyExtractor={(item, index) => item.characteristic_id.toString() + index}
        renderItem={({ item, index }) => <RenderPlantDetail item={item} index={index} />}
        style={{ width: "100%", paddingBottom: 40 }}
        ListEmptyComponent={
          <View>
            <Text>Немає доданих х-ка</Text>
          </View>
        }
        ListFooterComponent={<View></View>}
        ListFooterComponentStyle={{ height: 50 }}
      />
  );
}, (prevProps, nextProps) => {
  console.log('__ PlantSizeItem ___ MEMO_ ', prevProps.existPlantProps?.characteristic_id, nextProps.existPlantProps?.characteristic_id)
return prevProps == nextProps
 //return prevProps.item.characteristic_id === nextProps.item.characteristic_id
})
const mapStateToProps = (state: RootState) => ({
  existPlantProps: state.data.existPlantProps,
})

export default connect(mapStateToProps)(PlantSizeItem);

